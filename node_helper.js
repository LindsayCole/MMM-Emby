/* global Module, Log */

/*
 * MagicMirror²
 * Module: MMM-Emby
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
    console.log(`Starting node_helper for: ${this.name}. The engine is purring.`);
  },

  // The phone rings. It's the front-end, wanting something. Always wanting something.
  socketNotificationReceived: async function (notification, payload) {
    if (notification === "GET_EMBY_DATA") {
      const embyData = {};
      // A for-loop is like a one-night stand. You get in, you get what you need, and you get out.
      for (const server of payload.servers) {
        embyData[server.name] = await this.getEmbyServerData(server, payload);
      }
      this.sendSocketNotification("EMBY_DATA", embyData);
    }
  },

  // The main hustle. Juggling API calls like a carny with too many torches.
  getEmbyServerData: async function (server, config) {
    try {
      const serverData = {};
      const baseUrl = `${server.host}:${server.port}/emby`;
      const apiKey = `api_key=${server.apiKey}`;

      // We're making a list, checking it twice... or just hitting a bunch of endpoints. Whatever.
      const requests = [
        this.fetchData(`${baseUrl}/System/Info?${apiKey}`),
        this.fetchData(`${baseUrl}/Sessions?${apiKey}&IncludeItemTypes=Movie,Episode`),
      ];

      if (config.showRecentlyAdded) {
        requests.push(this.fetchData(`${baseUrl}/Users/Public/Items/Latest?Limit=${config.recentlyAddedCount}&IncludeItemTypes=Movie,Episode&${apiKey}`));
      }

      const [serverInfo, sessions, recentlyAdded] = await Promise.all(requests);

      serverData.serverInfo = serverInfo;
      serverData.sessions = sessions;
      if (config.showRecentlyAdded) {
        serverData.recentlyAdded = recentlyAdded;
      }

      return serverData;
    } catch (error) {
      // Sometimes you swing and miss. That's life. And that's APIs.
      console.error(`[MMM-Emby] Error fetching data for ${server.name}. She's a cruel mistress.`, error);
      return null;
    }
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
