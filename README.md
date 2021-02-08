![JukeBOX logo](https://raw.githubusercontent.com/HBeserra/JukeBOX/main/juke.png)
## Introduction
The **JukeBOX**  is a  [Spotify Connect](https://www.spotify.com/connect/) player GUI based on the  [Librespot-java](https://github.com/librespot-org/librespot-java) backend in arm64 for Debian package.

The package is pre-configured for work in the `Raspberry Pi` and others dev boards like the `Pine 64`.

## Requirements

You'll need a Spotify **Premium** account in order to use Connect.

## Configuration

`JukeBOX` shouldn't need any change in configuration to work, but the configuration file of Librespot-java is in `/opt/JukeBOX/config.toml` more details can be seen in the [Librespot-java README](https://github.com/librespot-org/librespot-java).


## Troubleshooting

#### No Sound output
Have you tried turning the volume up using the command `alsamixer`?
#### My Raspberry Pi does not use my USB sound card!
Check with  `aplay -l`  as which card your USB device is listed. Let's say it is "card 1", so try to replace the following in the file  `/usr/share/alsa/alsa.conf`:

```
defaults.ctl.card 0
defaults.pcm.card 0

```

with

```
defaults.ctl.card 1
defaults.pcm.card 1
```

#### Setting a default output mixer on Librespot
In the `/opt/JukeBOX/config.toml`  you can set the mixer name with will be used

```
mixerSearchKeywords = ""
```





<!--stackedit_data:
eyJoaXN0b3J5IjpbLTg3MTQwODE1OSwxOTg4NDc2ODI3LC00OD
g3NzI5NDZdfQ==
-->