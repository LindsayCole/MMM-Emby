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

Module.register('MMM-Emby', {

    defaults: {
        updateInterval: 1000 * 60, // 1 minute
        initialLoadDelay: 0,
        animationSpeed: 1000,
        servers: [],
        fontAwesomeVersion: 5,
        layoutDirection: 'vertical' // 'vertical' or 'horizontal' - because sometimes you want your servers lined up like a firing squad
    },

    start: function() {
        Log.info('Starting module: ' + this.name);
        this.loaded = false;
        this.serverData = [];
        // Start the data fetching process.
        this.scheduleUpdate();
    },

    getStyles: function() {
        return [this.file('MMM-Emby.css')];
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'EMBY_DATA_RESULT') {
            this.serverData = payload;
            this.loaded = true;
            this.updateDom(this.config.animationSpeed);
        }
    },

    getDom: function() {
        var wrapper = document.createElement('div');
        wrapper.className = 'emby-wrapper';
        
        // Add layout direction class - because presentation matters, even for digital overlords
        if (this.config.layoutDirection === 'horizontal') {
            wrapper.className += ' horizontal-layout';
        }

        if (this.config.servers.length === 0) {
            wrapper.innerHTML = 'No servers configured.';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = 'Warming up the tubes...';
            wrapper.className = 'dimmed light small';
            return wrapper;
        }

        for (var i = 0; i < this.serverData.length; i++) {
            var server = this.serverData[i];
            var serverConfig = server.config || {};
            
            var serverDiv = document.createElement('div');
            serverDiv.className = 'emby-server';
            if (serverConfig.layout === 'compact') {
                serverDiv.className += ' compact';
            }

            // Server offline handling
            if (!server.online) {
                var offlineDiv = document.createElement('div');
                offlineDiv.className = 'offline-message';
                offlineDiv.innerHTML = '<i class="fa fa-exclamation-triangle"></i> ' + server.name + ' is offline';
                serverDiv.appendChild(offlineDiv);
                wrapper.appendChild(serverDiv);
                continue;
            }

            // Get display order
            var displayOrder = serverConfig.displayOrder || ['stats', 'nowPlaying', 'recentlyAdded'];
            
            // Server name
            var nameDiv = document.createElement('div');
            nameDiv.className = 'emby-server-name';
            var iconClass = this.config.fontAwesomeVersion === 4 ? 'fa fa-play-circle' : 'fas fa-play-circle';
            nameDiv.innerHTML = '<i class="' + iconClass + '"></i>' + server.name;
            if (server.systemInfo && server.systemInfo.Version) {
                nameDiv.innerHTML += ' <span class="version">v' + server.systemInfo.Version + '</span>';
            }
            serverDiv.appendChild(nameDiv);

            // Process sections in specified order
            for (var j = 0; j < displayOrder.length; j++) {
                var section = displayOrder[j];
                
                if (section === 'stats' && serverConfig.showServerStats !== false) {
                    this.addStatsSection(serverDiv, server);
                } else if (section === 'nowPlaying' && serverConfig.showNowPlaying !== false) {
                    this.addNowPlayingSection(serverDiv, server);
                } else if (section === 'recentlyAdded' && serverConfig.showRecentlyAdded === true) {
                    this.addRecentlyAddedSection(serverDiv, server);
                }
            }

            wrapper.appendChild(serverDiv);
        }

        return wrapper;
    },

    /**
     * Add the stats section - the digital pulse of your media empire.
     * Shows who's watching what and how hard your server is working.
     * It's like a heart monitor for your entertainment addiction.
     */
    addStatsSection: function(serverDiv, server) {
        var statsDiv = document.createElement('div');
        statsDiv.className = 'emby-stats';
        
        var iconPrefix = this.config.fontAwesomeVersion === 4 ? 'fa' : 'fas';
        var statsHtml = '';
        
        // For compact layout, we're going full sci-fi dashboard
        if (server.config.layout === 'compact') {
            var totalStreams = server.stats.activeUsers;
            var transcodingStreams = server.stats.transcodingSessions;
            
            if (totalStreams > 0) {
                statsHtml += '<div class="compact-stats-container">';
                statsHtml += '<div class="stream-indicator">';
                statsHtml += '<div class="stream-count">' + totalStreams + '</div>';
                statsHtml += '<div class="stream-label">ACTIVE</div>';
                if (transcodingStreams > 0) {
                    statsHtml += '<div class="transcoding-indicator">';
                    statsHtml += '<i class="' + iconPrefix + ' fa-cogs transcoding-icon"></i>';
                    statsHtml += '<span class="transcoding-count">' + transcodingStreams + '</span>';
                    statsHtml += '</div>';
                }
                statsHtml += '</div>';
                statsHtml += '</div>';
            } else if (server.online) {
                statsHtml += '<div class="compact-stats-container">';
                statsHtml += '<div class="stream-indicator idle">';
                statsHtml += '<div class="stream-count">0</div>';
                statsHtml += '<div class="stream-label">IDLE</div>';
                statsHtml += '</div>';
                statsHtml += '</div>';
            }
        } else {
            // Standard detailed view - because sometimes you want the full story
            if (server.stats.activeUsers > 0) {
                statsHtml += '<span><i class="' + iconPrefix + ' fa-users"></i> ' + server.stats.activeUsers + ' active</span>';
            }
            
            if (server.stats.transcodingSessions > 0) {
                statsHtml += '<span class="transcoding"><i class="' + iconPrefix + ' fa-cogs"></i> ' + server.stats.transcodingSessions + ' transcoding</span>';
            }
            
            if (statsHtml === '' && server.online) {
                statsHtml = '<span><i class="' + iconPrefix + ' fa-check-circle"></i> Online</span>';
            }
        }
        
        statsDiv.innerHTML = statsHtml;
        serverDiv.appendChild(statsDiv);
    },

    /**
     * The crown jewel - what's playing right now.
     * This is where we show off like a peacock in mating season.
     * Art, progress bars, user info - the whole nine yards.
     */
    addNowPlayingSection: function(serverDiv, server) {
        if (!server.sessions || server.sessions.length === 0) {
            return;
        }

        for (var i = 0; i < server.sessions.length; i++) {
            var session = server.sessions[i];
            var item = session.NowPlayingItem;
            
            var nowPlayingDiv = document.createElement('div');
            nowPlayingDiv.className = 'now-playing-item';
            
            // Artwork - because a picture is worth a thousand words, and we're not that verbose
            var artDiv = document.createElement('div');
            artDiv.className = 'now-playing-art';
            var artImg = document.createElement('img');
            
            // Determine which image to use - series poster usually looks less like ass
            var imageId = item.Id;
            var imageType = 'Primary';
            
            if (server.config.useSeriesPoster !== false && item.Type === 'Episode' && item.SeriesId) {
                imageId = item.SeriesId;
            }
            
            var imageUrl = server.host + ':' + server.port + '/emby/Items/' + imageId + '/Images/' + imageType + '?api_key=' + server.config.apiKey;
            artImg.src = imageUrl;
            artImg.onerror = function() {
                this.style.display = 'none';
            };
            
            artDiv.appendChild(artImg);
            nowPlayingDiv.appendChild(artDiv);
            
            // Info section - the meat and potatoes
            var infoDiv = document.createElement('div');
            infoDiv.className = 'now-playing-info';
            
            // Title - what the hell are they watching?
            var titleDiv = document.createElement('div');
            titleDiv.className = 'title';
            var title = item.Name;
            if (item.Type === 'Episode' && item.SeriesName) {
                title = item.SeriesName + ' - ' + title;
            }
            titleDiv.innerHTML = title;
            infoDiv.appendChild(titleDiv);
            
            // User and device - who's hogging the bandwidth?
            var userDiv = document.createElement('div');
            userDiv.className = 'user-device';
            var userInfo = session.UserName || 'Unknown User';
            if (session.Client) {
                userInfo += ' on ' + session.Client;
            }
            userDiv.innerHTML = userInfo;
            infoDiv.appendChild(userDiv);
            
            // Stream info - are we transcoding or playing nice?
            var streamDiv = document.createElement('div');
            streamDiv.className = 'stream-info';
            var streamType = 'Direct Play';
            if (session.TranscodingInfo && session.TranscodingInfo.IsVideoDirect === false) {
                streamType = 'Transcode';
            }
            streamDiv.innerHTML = streamType;
            infoDiv.appendChild(streamDiv);
            
            // Progress bar - because we all need to know how much time we're wasting
            if (session.PlayState && typeof session.PlayState.PositionTicks !== 'undefined' && item.RunTimeTicks) {
                var progressContainer = document.createElement('div');
                progressContainer.className = 'progress-bar-container';
                
                var progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                var progress = (session.PlayState.PositionTicks / item.RunTimeTicks) * 100;
                progressBar.style.width = progress + '%';
                
                progressContainer.appendChild(progressBar);
                infoDiv.appendChild(progressContainer);
                
                // Time info - the countdown to your next life decision
                var timeDiv = document.createElement('div');
                timeDiv.className = 'time-info';
                var currentTime = this.ticksToTime(session.PlayState.PositionTicks);
                var totalTime = this.ticksToTime(item.RunTimeTicks);
                timeDiv.innerHTML = currentTime + ' / ' + totalTime;
                infoDiv.appendChild(timeDiv);
            }
            
            nowPlayingDiv.appendChild(infoDiv);
            serverDiv.appendChild(nowPlayingDiv);
        }
    },

    /**
     * Recently added section - the new kids on the block.
     * Fresh content to feed your insatiable appetite for entertainment.
     */
    addRecentlyAddedSection: function(serverDiv, server) {
        if (!server.recentlyAdded || server.recentlyAdded.length === 0) {
            return;
        }

        var recentDiv = document.createElement('div');
        recentDiv.className = 'recently-added-wrapper';
        
        var titleDiv = document.createElement('div');
        titleDiv.innerHTML = 'Recently Added';
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.marginBottom = '5px';
        recentDiv.appendChild(titleDiv);
        
        var listDiv = document.createElement('ul');
        
        for (var i = 0; i < server.recentlyAdded.length; i++) {
            var item = server.recentlyAdded[i];
            var listItem = document.createElement('li');
            
            var itemName = item.Name;
            if (item.Type === 'Episode' && item.SeriesName) {
                itemName = item.SeriesName + ' - ' + itemName;
            }
            
            listItem.innerHTML = itemName;
            listDiv.appendChild(listItem);
        }
        
        recentDiv.appendChild(listDiv);
        serverDiv.appendChild(recentDiv);
    },

    /**
     * Convert Emby's ridiculous tick system to something humans can understand.
     * Because apparently counting in 10,000,000ths of a second made sense to someone.
     */
    ticksToTime: function(ticks) {
        var seconds = Math.floor(ticks / 10000000);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor((seconds % 3600) / 60);
        seconds = seconds % 60;
        
        if (hours > 0) {
            return hours + ':' + (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        } else {
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    },
    
    /**
     * Schedule updates like a responsible adult.
     * No infinite loops here - we're not savages.
     */
    scheduleUpdate: function() {
        var self = this;
        
        // Use setTimeout for the initial fetch after the specified delay
        setTimeout(function() {
            self.getData(); // Fetch data for the first time
            
            // After the first fetch, set up the interval for all subsequent updates
            setInterval(function() {
                self.getData();
            }, self.config.updateInterval); // Use the real update interval from the config
            
        }, this.config.initialLoadDelay);
    },

    /**
     * Get the data from our backend helper.
     * This is where we ask nicely for information and hope the servers cooperate.
     */
    getData: function() {
        Log.info(`[MMM-Emby] Requesting data from helper.`);
        this.sendSocketNotification('GET_EMBY_DATA', { config: this.config });
    }
});