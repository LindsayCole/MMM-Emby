/* global Module, Log */

/*
 * MagicMirror²
 * Module: MMM-Emby
 *
 * By Lindsay Cole & Gemini
 * MIT Licensed.
 *
 * This thing is like a cheap suit. It looks okay on the outside,
 * but the lining is full of questionable decisions and smells faintly of regret.
 * But hey, it gets the job done.
 */

Module.register("MMM-Emby", {
  // Default module config. The kind of vanilla setup you'd expect from a suburbanite.
  defaults: {
    servers: [],
    layout: "detailed", // 'detailed' or 'compact'
    displayOrder: ["stats", "nowPlaying", "recentlyAdded"], // The pecking order.
    showServerStats: true,
    showNowPlaying: true,
    showRecentlyAdded: false,
    recentlyAddedCount: 5,
    updateInterval: 60 * 1000, // every minute. A little quickie to keep things fresh.
    fontAwesomeVersion: 5 // Or 4, if you're stuck in the past.
  },

  // Let's get this shitshow on the road.
  start: function () {
    Log.info(`Starting module: ${this.name}. Time to pour a drink.`);
    this.embyData = {};
    this.loaded = false;
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
    wrapper.className = `emby-wrapper ${this.config.layout}`;

    if (!this.loaded) {
      wrapper.innerHTML = "Warming up the tubes...";
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    this.config.servers.forEach((server) => {
      const serverWrapper = document.createElement("div");
      serverWrapper.className = "emby-server";
      
      const serverName = document.createElement("div");
      serverName.className = "emby-server-name bright";
      serverName.innerHTML = `<i class="fa fa-server"></i> ${server.name}`;
      serverWrapper.appendChild(serverName);

      const serverData = this.embyData[server.name];
      
      // Honesty is the best policy, especially when your server is taking a nap.
      if (!serverData) {
        const offlineMsg = document.createElement("div");
        offlineMsg.className = "offline-message small dimmed";
        offlineMsg.innerHTML = `<i class="fa fa-exclamation-triangle"></i> Server Offline`;
        serverName.innerHTML += ` <span class="dimmed small">(Offline)</span>`;
        serverWrapper.appendChild(offlineMsg);
        wrapper.appendChild(serverWrapper);
        return; // Move on, nothing to see here.
      }

      // If we're here, the server is talking. Let's see what it has to say.
      serverName.innerHTML += ` <span class="dimmed small">(${serverData.serverInfo.Version})</span>`;
      
      const components = {};

      // --- Server Stats ---
      if (this.config.showServerStats && serverData.sessions) {
        const statsWrapper = document.createElement("div");
        statsWrapper.className = "emby-stats small";
        let streamCount = serverData.sessions.filter(s => s.NowPlayingItem).length;
        let transcodeCount = serverData.sessions.filter(s => s.PlayState && s.PlayState.PlayMethod === 'Transcode').length;
        
        statsWrapper.innerHTML = `
          <span><i class="fa fa-users"></i> ${streamCount} Active</span>
          <span class="dimmed">|</span>
          <span><i class="fa fa-cogs"></i> ${transcodeCount} Transcoding</span>
        `;
        components.stats = statsWrapper;
      }
      
      // --- Now Playing ---
      if (this.config.showNowPlaying && serverData.sessions) {
        const nowPlayingSessions = serverData.sessions.filter(s => s.NowPlayingItem);
        if(nowPlayingSessions.length > 0) {
            const nowPlayingWrapper = document.createElement("div");
            nowPlayingWrapper.className = "now-playing-wrapper";
            
            nowPlayingSessions.forEach(session => {
                const item = session.NowPlayingItem;
                const itemWrapper = document.createElement("div");
                itemWrapper.className = "now-playing-item";

                const artUrl = `${server.host}:${server.port}/emby/Items/${item.Id}/Images/Primary?maxHeight=150&tag=${item.ImageTags.Primary}&quality=90`;
                let seriesInfo = item.Type === 'Episode' ? `${item.SeriesName} <span class="dimmed">${item.SeasonName}</span>` : '';

                itemWrapper.innerHTML = `
                    <div class="now-playing-art">
                        <img src="${artUrl}" onerror="this.style.display='none'"/>
                    </div>
                    <div class="now-playing-info small">
                        <div class="bright">${item.Name}</div>
                        <div class="dimmed">${seriesInfo}</div>
                        <div class="dimmed"><i class="fa fa-user"></i> ${session.UserName} on <i class="fa fa-desktop"></i> ${session.DeviceName}</div>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${((session.PlayState.PositionTicks / item.RunTimeTicks) * 100).toFixed(2)}%;"></div>
                        </div>
                    </div>
                `;
                nowPlayingWrapper.appendChild(itemWrapper);
            });
            components.nowPlaying = nowPlayingWrapper;
        }
      }

      // --- Recently Added ---
      if (this.config.showRecentlyAdded && serverData.recentlyAdded) {
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
        components.recentlyAdded = recentWrapper;
      }

      // Now, let's assemble this Frankenstein's monster in the order the user wants.
      this.config.displayOrder.forEach(section => {
        if (components[section]) {
          serverWrapper.appendChild(components[section]);
        }
      });

      wrapper.appendChild(serverWrapper);
    });

    return wrapper;
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

  // Load Font Awesome. Because icons are the new hieroglyphs.
  getScripts: function() {
      return [`https://use.fontawesome.com/releases/v${this.config.fontAwesomeVersion}.15.4/js/all.js`];
  },
});
