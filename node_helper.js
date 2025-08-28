/* global Module, Log */

/*
 * MagicMirror²
 * Module: MMM-Emby
 * Version: 0.50
 *
 * By Lindsay Cole & Gemini
 * MIT Licensed.
 *
 * This is the back alley of the module. It's dark, a little grimy,
 * and you're not entirely sure what's going on, but somehow, you get what you came for.
 * Now with more comments than a bitter film critic.
 */

const NodeHelper = require('node_helper');
const request = require('request');
const Log = require('logger');

module.exports = NodeHelper.create({

    start: function() {
        Log.info('Starting node helper for: ' + this.name);
        this.serverData = [];
        this.pendingRequests = 0;
        this.totalServers = 0;
    },

    socketNotificationReceived: function(notification, payload) {
        Log.info(`[MMM-Emby] Socket notification received: ${notification}`);

        if (notification === 'GET_EMBY_DATA') {
            // Defensive coding: Ensure payload and config exist before using them
            // Because trusting user input is like trusting a politician's promise
            if (!payload || !payload.config) {
                Log.error("[MMM-Emby] Received GET_EMBY_DATA but payload or config is missing!");
                return; // Stop execution if config is not provided
            }
            // Log the received config to ensure it's correct - trust but verify
            Log.info(`[MMM-Emby] Received config for ${payload.config.servers.length} server(s).`);
            this.getData(payload.config);
        }
    },

    /**
     * Main data fetching orchestrator.
     * Like a conductor for a very digital, very nerdy orchestra.
     */
    getData: function(config) {
        var self = this;
        var servers = config.servers;
        
        // Reset data for fresh fetch - clean slate, fresh start
        this.serverData = [];
        this.totalServers = servers.length;
        this.pendingRequests = 0;

        servers.forEach(function(server, index) {
            self.getServerData(server, index);
        });
    },

    /**
     * Fetch data for a single server.
     * This is where we sweet-talk the Emby API into giving us what we want.
     * Sometimes it cooperates, sometimes it doesn't. Such is life.
     */
    getServerData: function(server, index) {
        var self = this;
        var serverInfo = {
            name: server.name,
            host: server.host,
            port: server.port,
            config: server,
            online: false,
            systemInfo: null,
            sessions: [],
            recentlyAdded: [],
            stats: {
                activeUsers: 0,
                transcodingSessions: 0
            }
        };

        // Track requests for this server - because we're responsible adults who clean up after ourselves
        var completedRequests = 0;
        var expectedRequests = 1; // System info is always requested - gotta know if anyone's home

        // Determine how many requests we'll make based on config - no point asking for shit we don't want
        if (server.showNowPlaying !== false) expectedRequests++;
        if (server.showRecentlyAdded === true) expectedRequests++;

        /**
         * Check if we're done with this server.
         * When all requests complete, we move on with our lives.
         */
        function checkComplete() {
            completedRequests++;
            if (completedRequests === expectedRequests) {
                self.serverData[index] = serverInfo;
                self.pendingRequests++;
                
                if (self.pendingRequests === self.totalServers) {
                    Log.info("[MMM-Emby] All servers processed. Sending data to front-end.");
                    self.sendSocketNotification('EMBY_DATA_RESULT', self.serverData);
                }
            }
        }

        // 1. Get System Info - the digital handshake
        var systemUrl = server.host + ':' + server.port + '/emby/System/Info?api_key=' + server.apiKey;
        Log.info(`[MMM-Emby] Fetching system info for server: ${server.name} from URL: ${systemUrl}`);

        request({ url: systemUrl, method: 'GET', timeout: 10000 }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    serverInfo.systemInfo = JSON.parse(body);
                    serverInfo.online = true;
                    Log.info(`[MMM-Emby] Successfully received system info for ${server.name}.`);
                } catch (e) {
                    Log.error(`[MMM-Emby] Error parsing system info JSON for ${server.name}: ${e}`);
                }
            } else {
                Log.error(`[MMM-Emby] ERROR fetching system info for ${server.name}.`);
                if (error) Log.error(`[MMM-Emby] System info error: ${error.message}`);
            }
            checkComplete();
        });

        // 2. Get Sessions (Now Playing) - who's watching what and how
        if (server.showNowPlaying !== false) {
            var sessionsUrl = server.host + ':' + server.port + '/emby/Sessions?api_key=' + server.apiKey;
            Log.info(`[MMM-Emby] Fetching sessions for server: ${server.name}`);

            request({ url: sessionsUrl, method: 'GET', timeout: 10000 }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    try {
                        var sessions = JSON.parse(body);
                        serverInfo.sessions = sessions.filter(function(session) {
                            return session.NowPlayingItem && session.NowPlayingItem.Id;
                        });
                        
                        // Calculate stats - the numbers that matter
                        var activeSessions = sessions.filter(function(session) {
                            return session.NowPlayingItem || session.PlayState;
                        });
                        serverInfo.stats.activeUsers = activeSessions.length;
                        serverInfo.stats.transcodingSessions = sessions.filter(function(session) {
                            return session.TranscodingInfo && session.TranscodingInfo.IsVideoDirect === false;
                        }).length;
                        
                        Log.info(`[MMM-Emby] Successfully received ${serverInfo.sessions.length} now playing, ${serverInfo.stats.activeUsers} total active sessions for ${server.name}.`);
                    } catch (e) {
                        Log.error(`[MMM-Emby] Error parsing sessions JSON for ${server.name}: ${e}`);
                    }
                } else {
                    Log.error(`[MMM-Emby] ERROR fetching sessions for ${server.name}.`);
                    if (error) Log.error(`[MMM-Emby] Sessions error: ${error.message}`);
                }
                checkComplete();
            });
        }

        // 3. Get Recently Added - the fresh meat
        if (server.showRecentlyAdded === true) {
            var recentCount = server.recentlyAddedCount || 5;
            var recentUrl = server.host + ':' + server.port + '/emby/Items/Latest?Limit=' + recentCount + '&api_key=' + server.apiKey;
            Log.info(`[MMM-Emby] Fetching recently added for server: ${server.name}`);

            request({ url: recentUrl, method: 'GET', timeout: 10000 }, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    try {
                        serverInfo.recentlyAdded = JSON.parse(body);
                        Log.info(`[MMM-Emby] Successfully received ${serverInfo.recentlyAdded.length} recently added items for ${server.name}.`);
                    } catch (e) {
                        Log.error(`[MMM-Emby] Error parsing recently added JSON for ${server.name}: ${e}`);
                    }
                } else {
                    Log.error(`[MMM-Emby] ERROR fetching recently added for ${server.name}.`);
                    if (error) Log.error(`[MMM-Emby] Recently added error: ${error.message}`);
                }
                checkComplete();
            });
        }
    }
});