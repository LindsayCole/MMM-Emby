# MagicMirror² Module: MMM-Emby

A module for [MagicMirror²](https://magicmirror.builders/) to display the status of your Emby servers. Now with more features than you can shake a stick at, and fewer bugs than a roach motel.

![Screenshot](https://i.imgur.com/Mr0zN9f.png) <!-- Update this when you get around to it, or don't. I'm not your mother. -->

## Features

* **Monitors multiple Emby servers.** It's a digital harem, and you're the sultan.
* **Real-time stream tracking.** Shows who's watching what, where, and how hard your server is working for it.
* **Smart session detection.** Only counts streams that are actually playing something, not every device that's breathing on your network.
* **Futuristic stream indicators.** Sci-fi dashboard vibes that would make Blade Runner jealous.
* **Detailed "Now Playing" Info.** Shows what's being watched, by whom, on what device, with poster art, progress bar, stream type (`Transcode`, `Direct Play`), and even the damn end time.
* **Per-Server Configuration.** Each server can have its own layout, display order, and settings. Because one size never truly fits all.
* **Visual Flair.** Subtle animations and a clean design that doesn't look like it was made in 1995.
* **Smarter TV Art.** An option to show the main series poster for episodes, which usually looks better than a random thumbnail.
* **Honest Error Handling.** If a server goes offline, the module will tell you. No sugarcoating, no false hope.
* **Highly configurable.** Because commitment is for suckers and your mirror should be as fickle as you are.

## Installation

1. Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/LindsayCole/MMM-Emby.git`.
2. Navigate to the new `MMM-Emby` folder and run `npm install`. If you can't handle that, maybe this isn't for you.

## Using the module

To use this module, add the following configuration block to the modules array in your `config/config.js` file. This example shows how you can give each server its own personality.

```javascript
{
    module: "MMM-Emby",
    position: "top_left", // or wherever you want to stick it
    config: {
        servers: [
            {
                // This one is the full-blown experience.
                name: "The Mothership",
                host: "http://192.168.1.100",
                port: 8096,
                apiKey: "YOUR_SECRET_HANDSHAKE",
                layout: "detailed", 
                displayOrder: ["stats", "nowPlaying", "recentlyAdded"],
                showServerStats: true,
                showNowPlaying: true,
                showRecentlyAdded: true,
                recentlyAddedCount: 5,
                useSeriesPoster: true
            },
            {
                // This one is just the facts, ma'am.
                name: "The Backup Plan",
                host: "http://192.168.1.101",
                port: 8096,
                apiKey: "ANOTHER_KEY_FOR_ANOTHER_DOOR",
                layout: "compact",
                showNowPlaying: false, // We don't care what's playing here.
                showServerStats: true
            }
        ],
        updateInterval: 60000, // How often to bug the servers
        fontAwesomeVersion: 5,
        layoutDirection: "vertical" // or "horizontal" if you're feeling adventurous
    }
},
```

## Configuration Options

### Global Options

| Option             | Description                                                                              | Default |
| ------------------ | ---------------------------------------------------------------------------------------- | ------- |
| `servers`          | An array of your Emby server objects. This is the main event.                            | `[]`    |
| `updateInterval`   | How often to poke the servers for new info (in milliseconds).                            | `60000` |
| `fontAwesomeVersion` | Set to `4` or `5` depending on your core MagicMirror setup. Mismatching is a bad look. | `5`     |
| `layoutDirection`  | `'vertical'` for stacked servers, `'horizontal'` for side-by-side. Choose your fighter. | `'vertical'` |

### Per-Server Options

These can be set for each server in the `servers` array. If you don't set them, they'll use a reasonable default.

| Option               | Description                                                                                      | Default                                    |
| -------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `name`               | What to call this server. Be creative, or don't.                                                | Required                                   |
| `host`               | Server URL (e.g., `http://192.168.1.100`). Don't forget the http part.                          | Required                                   |
| `port`               | Server port. Usually 8096, but you do you.                                                      | Required                                   |
| `apiKey`             | Your Emby API key. Guard it with your life.                                                     | Required                                   |
| `layout`             | `'detailed'` for the full experience, `'compact'` for a quick glance.                            | `'detailed'`                               |
| `displayOrder`       | An array to set the order of sections. Options: `'stats'`, `'nowPlaying'`, `'recentlyAdded'`.      | `['stats', 'nowPlaying', 'recentlyAdded']` |
| `showServerStats`    | `true` to show active streams and transcode counts.                                              | `true`                                     |
| `showNowPlaying`     | `true` to show the glorious "Now Playing" section.                                               | `true`                                     |
| `showRecentlyAdded`  | `true` to show the list of new arrivals.                                                         | `false`                                    |
| `recentlyAddedCount` | How many new items to show. Don't get greedy.                                                    | `5`                                        |
| `useSeriesPoster`    | For TV episodes, `true` shows the main series art. `false` shows the episode thumbnail.          | `true`                                     |

## Layout Options

### Vertical Layout (Default)
Servers are stacked vertically, one after another. Classic, reliable, like a good bourbon.

### Horizontal Layout
Servers are displayed side-by-side. Perfect for wide screens or when you want to show off multiple servers at once. Set `layoutDirection: 'horizontal'` in your config.

### Compact View Features
The compact layout now features a futuristic active streams indicator with:
- **Stream Counter**: Shows total active streams in a sci-fi style display
- **Transcoding Badge**: A subtle blue indicator when transcoding is happening (no more eye-searing yellow)
- **Online Status**: Clean display when no streams are active but server is online
- **Offline Indicator**: Clear warning when shit hits the fan
- **Centered Layout**: Everything lines up nicely because we're not animals

## Getting Your API Key

1. Log into your Emby server's web interface
2. Go to Settings → Advanced → API Keys
3. Create a new API key
4. Copy it and paste it into your config
5. Don't share it with strangers on the internet

## Dependencies

* [request](https://www.npmjs.com/package/request) - For talking to your Emby servers

Installed automatically when you run `npm install`. Don't worry your pretty little head about it.

## Implementation Status

✅ **All functionality is fully implemented and working:**
- Multi-server monitoring with individual configurations
- Real-time active stream counting (only playing content, not idle connections)
- Transcoding detection and display
- Now playing information with poster art and progress bars
- Recently added content display
- Compact and detailed layout modes
- Horizontal and vertical layout directions
- Proper error handling for offline servers
- Green Emby logo branding
- Subtle transcoding indicators (no more garish colors)
- Centered layouts in compact view

**No mock-ups, no simulations, no placeholder bullshit.** Everything you see in the code actually works.

## Troubleshooting

**Server shows as offline?**
- Check your host, port, and API key
- Make sure your Emby server is actually running
- Verify network connectivity

**No streams showing?**
- The module only shows actively playing content, not paused or idle sessions
- Check that someone is actually watching something

**Transcoding indicator not showing?**
- Only appears when Emby is actually transcoding content
- Direct play streams won't trigger the indicator

## Contributing

Sure, why not. Send a pull request. Just make it good, and don't break anything that already works.

## Authors

* Lindsay Cole
* Gemini (the AI that actually writes decent code)

## License

This project is licensed under the MIT License. Go nuts, but don't blame us if your mirror catches fire.
