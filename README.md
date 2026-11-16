# TIEP

A browser typing test for words and JavaScript or Python snippets.

[Open TIEP on GitHub Pages](https://cryaothicc.github.io/Tiep/)

## Run locally

Open `index.html` in a desktop browser and start typing. No install or build step is needed. JetBrains Mono loads from Google Fonts with a system monospace fallback.

## Take a test

- Choose a 15-, 30-, or 60-second test.
- **Normal** runs a standard test. **Blind** blurs upcoming text.
- In code mode, the active line is highlighted. ↵ appears when Enter is next, and an indentation hint appears when Tab can fill leading spaces.
- Use the hamburger button to show or hide diagnostics. The keyboard stays below the monitor and replays your keystrokes after the test.
- Review WPM and accuracy, then choose **New test**, **Repeat**, or **Practice weak keys** when available. The speed graph is below the results controls.
- Use **snd** to turn keyboard audio on or off.

| Shortcut | Action |
| --- | --- |
| Tab, then Enter | Start a new test |
| Tab, then R | Repeat the same text |

These shortcuts apply outside code indentation, where Tab fills spaces instead.

TIEP saves per-key statistics, common key substitutions, and the last 50 runs in browser storage. Clear the page’s browser data to reset them.

TIEP is a work in progress and works best with a physical keyboard.

## Keyboard sounds

The default uses unmodified audio files from [My Sound Pack by Chevy](https://mechvibes.com/sound-packs/my-sound-pack-5), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

For a personal pack, download and extract its ZIP, then choose the folder with **Sound pack**. TIEP reads the files in your browser for the current session. Try [Wooting 60HE V2](https://mechvibes.com/sound-packs/wooting-60he-v2), [Akko Matcha Green](https://mechvibes.com/sound-packs/akko-matcha-green-switches), or [Razer Huntsman V3 Pro 8K](https://mechvibes.com/sound-packs/razer-huntsman-v3-pro-8k).
