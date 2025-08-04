# MagicMirror² Module: MMM-Emby

A module for [MagicMirror²](https://magicmirror.builders/) to display the status of your Emby servers. Now with more features than you can shake a stick at.

![Screenshot](https://i.imgur.com/your-screenshot.png) <!-- It's probably a good idea to update this screenshot eventually, unless you like false advertising. -->

## Features

* **Monitors multiple Emby servers.** It's a digital harem, and you're the sultan.
* **Now Playing Details.** Shows what's being watched, by whom, on what device, complete with poster art and a progress bar. Because knowing is half the battle.
* **Server Stats.** At-a-glance view of active streams and transcodes for the number-crunchers among us.
* **Recently Added.** See the latest arrivals to your library. The new flesh.
* **Customizable Layouts.** Choose between a `detailed` view for the full monty, or a space-saving `compact` view for a quick peek.
* **Highly configurable.** Because commitment is for suckers and your mirror should be as fickle as you are.

## Installation

1.  Navigate into your MagicMirror's `modules` folder and execute `git clone https://github.com/your-github/MMM-Emby.git`.
2.  Navigate to the new `MMM-Emby` folder and run `npm install`. If you can't handle that, maybe this isn't for you.

## Using the module

To use this module, add the following configuration block to the modules array in your `config/config.js` file. Try not to fuck it up.

```javascript
{
    module: "MMM-Emby",
    position: "top_left", // or wherever you want to stick it
    config: {
        servers: [
            {
                name: "The Mothership",
                host: "[http://192.168.1.100](http://192.168.1.100)",
                port: 8096,
                apiKey: "YOUR_SECRET_HANDSHAKE"
            },
            {
                name: "The Backup Plan",
                host: "[http://192.168.1.101](http://192.168.1.101)",
                port: 8096,
                apiKey: "ANOTHER_KEY_FOR_ANOTHER_DOOR"
            }
        ],
        layout: "detailed", // 'detailed' or 'compact'
        showServerStats: true,
        showNowPlaying: true,
        showRecentlyAdded: true,
        recentlyAddedCount: 5,
        fontAwesomeVersion: 5
    }
},
```

## Configuration Options

| Option                | Description                                                                                              | Default       |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------- |
| `servers`             | An array of your Emby servers. Add as many as you can handle.                                            | `[]`          |
| `servers.name`        | A name for the server. Give it some personality.                                                         | `null`        |
| `servers.host`        | The server's IP address or hostname. The digital address.                                                | `null`        |
| `servers.port`        | The port. Usually `8096`.                                                                                | `8096`        |
| `servers.apiKey`      | The API key. The keys to the kingdom. Don't share it unless you want company.                            | `null`        |
| `layout`              | `'detailed'` for the full experience, `'compact'` for a quick glance.                                    | `'detailed'`  |
| `showServerStats`     | `true` to show active streams and transcode counts.                                                      | `true`        |
| `showNowPlaying`      | `true` to show the glorious "Now Playing" section. This is the main event.                               | `true`        |
| `showRecentlyAdded`   | `true` to show the list of new arrivals.                                                                 | `false`       |
| `recentlyAddedCount`  | How many new items to show. Don't get greedy.                                                            | `5`           |
| `fontAwesomeVersion`  | Set to `4` or `5` depending on your core MagicMirror setup. Mismatching is a bad look.                   | `5`           |
| `updateInterval`      | How often to poke the server for new info (in milliseconds).                                             | `60000`       |


## Dependencies

* [node-fetch](https://www.npmjs.com/package/node-fetch)

Installed automatically. Don't worry your pretty little head about it.

## Contributing

Sure, why not. Send a pull request. Just make it good.

## Authors

* Lindsay Cole
* Gemini

## License

This project is licensed under the MIT License. Go nuts.
