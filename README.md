# MagicMirror² Module: MMM-Emby

A module for [MagicMirror²](https://magicmirror.builders/) to display the status of your Emby servers. Now with more features than you can shake a stick at.

![Screenshot](https://i.imgur.com/your-screenshot.png) <!-- It's probably a good idea to update this screenshot eventually, unless you like false advertising. -->

## Features

* **Monitors multiple Emby servers.** It's a digital harem, and you're the sultan.
* **Detailed "Now Playing" Info.** Shows what's being watched, by whom, on what device, with poster art, progress bar, stream type (`Transcode`, `Direct Play`), and even the damn end time.
* **Per-Server Configuration.** Each server can have its own layout, display order, and settings. Because one size never truly fits all.
* **Visual Flair.** A subtle, pulsing animation on the transcoding icon to draw your eye to the important shit.
* **Smarter TV Art.** An option to show the main series poster for episodes, which usually looks better than a random thumbnail.
* **Honest Error Handling.** If a server goes offline, the module will tell you. No sugarcoating.
* **Highly configurable.** Because commitment is for suckers and your mirror should be as fickle as you are.

## Installation

1.  Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/LindsayCole/MMM-Emby.git`.
2.  Navigate to the new `MMM-Emby` folder and run `npm install`. If you can't handle that, maybe this isn't for you.

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
                displayOrder: ["nowPlaying", "stats", "recentlyAdded"],
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
        fontAwesomeVersion: 5
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

### Compact View Enhancements
The compact layout now features a futuristic active streams indicator with:
- **Stream Counter**: Shows total active streams in a sci-fi style display
- **Transcoding Badge**: A glowing indicator when transcoding is happening
- **Idle State**: Clean display when no streams are active
- **Pulsing Animation**: Because everything looks cooler with a subtle glow

## Dependencies

* [request](https://www.npmjs.com/package/request)

Installed automatically. Don't worry your pretty little head about it.

## Contributing

Sure, why not. Send a pull request. Just make it good.

## Authors

* Lindsay Cole
* Gemini

## License

This project is licensed under the MIT License. Go nuts.