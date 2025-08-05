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
 */

const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
    start: function () {
        console.log(`Starting node_helper for: ${this.name} v0.50. The engine is purring.`);
    },

    // The phone rings. It's the front-end, wanting something. Always wanting something.
    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_EMBY_DATA") {
            this.fetchAllServerData(payload.servers);
        }
    },

    // The main hustle. Juggling API calls like a carny with too many torches.
    fetchAllServerData: async function (servers) {
        const embyData = {};
        const promises = servers.map(server => this.getEmbyServerData(server).catch(error => {
            // Sometimes you swing and miss. That's life. And that's APIs.
            console.error(`[MMM-Emby] Error fetching data for ${server.name}. She's a cruel mistress.`, error);
            return { name: server.name, data: null }; // Return null on error so Promise.all doesn't fail completely.
        }));

        const results = await Promise.all(promises);

        results.forEach(result => {
            embyData[result.name] = result.data;
        });

        this.sendSocketNotification("EMBY_DATA", embyData);
    },

    getEmbyServerData: async function (server) {
        const serverData = {};
        const baseUrl = `${server.host}:${server.port}/emby`;
        const apiKey = `api_key=${server.apiKey}`;

        // We're making a list, checking it twice... or just hitting a bunch of endpoints. Whatever.
        const requests = [
            this.fetchData(`${baseUrl}/System/Info?${apiKey}`),
            this.fetchData(`${baseUrl}/Sessions?${apiKey}&IncludeItemTypes=Movie,Episode`),
        ];

        // Only bother fetching recently added if the user actually wants to see it.
        if (server.showRecentlyAdded) {
            requests.push(this.fetchData(`${baseUrl}/Users/Public/Items/Latest?Limit=${server.recentlyAddedCount}&IncludeItemTypes=Movie,Episode&${apiKey}`));
        } else {
            requests.push(Promise.resolve(null)); // Push a resolved promise to keep the array structure.
        }

        const [serverInfo, sessions, recentlyAdded] = await Promise.all(requests);

        serverData.serverInfo = serverInfo;
        serverData.sessions = sessions;
        serverData.recentlyAdded = recentlyAdded;

        return { name: server.name, data: serverData };
    },

    // A simple little function to fetch data. It's not glamorous, but it pays the bills.
    fetchData: async function (url) {
        const response = await fetch(url);
        if (!response.ok) {
            // If the server's not in the mood, you can't force it.
            throw new Error(`HTTP error! status: ${response.status} for URL: ${url}`);
        }
        return await response.json();
    },
});
