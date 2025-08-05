/* global Module, Log, moment */

/*
 * MagicMirror²
 * Module: MMM-Emby
 * Version: 0.50
 *
 * By Lindsay Cole & Gemini
 * MIT Licensed.
 *

 * This thing is like a cheap suit. It looks okay on the outside,
 * but the lining is full of questionable decisions and smells faintly of regret.
 * But hey, it gets the job done.
 */

Module.register("MMM-Emby", {
    // Default module config. A baseline for the chaos.
    defaults: {
        servers: [],
        updateInterval: 60 * 1000,
        fontAwesomeVersion: 5
    },

    // Default server config. Merged with each server's specific config.
    // Keeps you from repeating yourself, which is a writer's cardinal sin.
    serverDefaults: {
        layout: "detailed",
        displayOrder: ["nowPlaying", "stats", "recentlyAdded"],
        showServerStats: true,
        showNowPlaying: true,
        showRecentlyAdded: false,
        recentlyAddedCount: 5,
        useSeriesPoster: true, // New: Use the series poster for TV shows.
    },

    // Let's get this shitshow on the road.
    start: function () {
        Log.info(`Starting module: ${this.name} v0.50. Time to pour a drink.`);
        this.embyData = {};
        this.loaded = false;

        // Merge the defaults. Because nobody likes a naked config.
        this.config.servers.forEach(server => {
            for (let key in this.serverDefaults) {
                if (!server.hasOwnProperty(key)) {
                    server[key] = this.serverDefaults[key];
                }
            }
        });

        this.sendSocketNotification("GET_EMBY_DATA", this.config);
        this.scheduleUpdate();
    },

    // A little birdy (or a socket) told me something. Let's see what it is.
    socketNotificationReceived: function (notification, payload) {
        if (notification === "EMBY_DATA") {
            this.embyData = payload;
            this.loaded = true;
            this.updateDom(500); // A little fade-in, like a good buzz.
        }
    },

    // Here's where we paint the pretty picture. Or, you know, slap some data on the screen.
    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "emby-wrapper";

        if (!this.loaded) {
            wrapper.innerHTML = "Warming up the tubes...";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        this.config.servers.forEach((server) => {
            const serverConfig = server; // Use the merged server config.
            const serverWrapper = document.createElement("div");
            serverWrapper.className = `emby-server ${serverConfig.layout}`;

            const serverName = document.createElement("div");
            serverName.className = "emby-server-name bright";
            serverName.innerHTML = `<i class="fa fa-server"></i> ${server.name}`;
            serverWrapper.appendChild(serverName);

            const serverData = this.embyData[server.name];

            if (!serverData) {
                const offlineMsg = document.createElement("div");
                offlineMsg.className = "offline-message small dimmed";
                offlineMsg.innerHTML = `<i class="fa fa-exclamation-triangle"></i> Server Offline`;
                serverName.innerHTML += ` <span class="dimmed small">(Offline)</span>`;
                serverWrapper.appendChild(offlineMsg);
                wrapper.appendChild(serverWrapper);
                return;
            }

            serverName.innerHTML += ` <span class="dimmed small">(${serverData.serverInfo.Version})</span>`;

            const components = {};

            // --- Server Stats ---
            if (serverConfig.showServerStats && serverData.sessions) {
                components.stats = this.createServerStats(serverData);
            }

            // --- Now Playing ---
            if (serverConfig.showNowPlaying && serverData.sessions) {
                components.nowPlaying = this.createNowPlaying(serverData, serverConfig);
            }

            // --- Recently Added ---
            if (serverConfig.showRecentlyAdded && serverData.recentlyAdded) {
                components.recentlyAdded = this.createRecentlyAdded(serverData);
            }

            // Assemble this Frankenstein's monster in the order the user wants.
            serverConfig.displayOrder.forEach(section => {
                if (components[section]) {
                    serverWrapper.appendChild(components[section]);
                }
            });

            wrapper.appendChild(serverWrapper);
        });

        return wrapper;
    },

    // --- Component Builders ---
    // Breaking things down into smaller pieces. It's how you write a novel, and it's how you write code.

    createServerStats: function(serverData) {
        const statsWrapper = document.createElement("div");
        statsWrapper.className = "emby-stats small";
        let streamCount = serverData.sessions.filter(s => s.NowPlayingItem).length;
        let transcodeCount = serverData.sessions.filter(s => s.PlayState && s.PlayState.PlayMethod === 'Transcode').length;
        const transcodeClass = transcodeCount > 0 ? 'transcoding' : '';

        statsWrapper.innerHTML = `
            <span><i class="fa fa-users"></i> ${streamCount} Active</span>
            <span class="dimmed">|</span>
            <span class="${transcodeClass}"><i class="fa fa-cogs"></i> ${transcodeCount} Transcoding</span>
        `;
        return statsWrapper;
    },

    createNowPlaying: function(serverData, serverConfig) {
        const nowPlayingSessions = serverData.sessions.filter(s => s.NowPlayingItem);
        if (nowPlayingSessions.length === 0) return null;

        const nowPlayingWrapper = document.createElement("div");
        nowPlayingWrapper.className = "now-playing-wrapper";

        nowPlayingSessions.forEach(session => {
            const item = session.NowPlayingItem;
            const itemWrapper = document.createElement("div");
            itemWrapper.className = "now-playing-item";

            const artId = (item.Type === 'Episode' && serverConfig.useSeriesPoster) ? item.SeriesId : item.Id;
            const artUrl = `${serverConfig.host}:${serverConfig.port}/emby/Items/${artId}/Images/Primary?maxHeight=150&tag=${item.ImageTags.Primary}&quality=90`;
            
            const seriesInfo = item.Type === 'Episode' ? `${item.SeriesName} <span class="dimmed">${item.SeasonName}</span>` : '';
            const playMethod = session.PlayState.PlayMethod;
            const runtime = item.RunTimeTicks;
            const position = session.PlayState.PositionTicks;
            const remainingTicks = runtime - position;
            const endTime = moment().add(remainingTicks / 10000, 'milliseconds').format('h:mm A');

            itemWrapper.innerHTML = `
                <div class="now-playing-art">
                    <img src="${artUrl}" onerror="this.style.display='none'"/>
                </div>
                <div class="now-playing-info small">
                    <div class="bright">${item.Name}</div>
                    <div class="dimmed">${seriesInfo}</div>
                    <div class="dimmed"><i class="fa fa-user"></i> ${session.UserName} on <i class="fa fa-desktop"></i> ${session.DeviceName}</div>
                    <div class="dimmed"><i class="fa fa-forward"></i> ${playMethod} &bull; Ends at ${endTime}</div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${((position / runtime) * 100).toFixed(2)}%;"></div>
                    </div>
                </div>
            `;
            nowPlayingWrapper.appendChild(itemWrapper);
        });
        return nowPlayingWrapper;
    },

    createRecentlyAdded: function(serverData) {
        const recentWrapper = document.createElement("div");
        recentWrapper.className = "recently-added-wrapper small";

        const list = document.createElement("ul");
        list.className = "fa-ul";
        serverData.recentlyAdded.forEach(item => {
            const listItem = document.createElement("li");
            const icon = item.Type === 'Movie' ? 'fa-film' : 'fa-tv';
            listItem.innerHTML = `<i class="fa-li fa ${icon}"></i> ${item.Name}`;
            list.appendChild(listItem);
        });
        recentWrapper.appendChild(list);
        return recentWrapper;
    },


    // Gotta keep things moving. Like a shark, or a writer with a deadline.
    scheduleUpdate: function () {
        setInterval(() => {
            this.sendSocketNotification("GET_EMBY_DATA", this.config);
        }, this.config.updateInterval);
    },

    // Load the CSS. Can't look like a slob.
    getStyles: function () {
        return ["MMM-Emby.css", "font-awesome.css"];
    },

    // Load Font Awesome and Moment.js. Because icons are the new hieroglyphs and time is a flat circle.
    getScripts: function() {
        return [
            `https://use.fontawesome.com/releases/v${this.config.fontAwesomeVersion}.15.4/js/all.js`,
            "moment.js"

        ];
    },
});

          // This thing is like a well-aged whiskey now. Still packs a punch,
          // but with a smoother finish. It's got layers.
