# TIEP

A browser typing test for words and JavaScript or Python snippets.

[Open TIEP on GitHub Pages](https://cryaothicc.github.io/Tiep/)

## Run locally

Open `index.html` in a desktop browser and start typing. No install or build step is needed. JetBrains Mono loads from Google Fonts with a system monospace fallback.

## Take a test

- Choose a 15-, 30-, or 60-second test.
- Space advances after you enter the full word’s length. Mistyped letters stay red and can be corrected with Backspace.
- **Normal** runs a standard test. **Blind** blurs upcoming text.
- In code mode, the active line is highlighted. ↵ appears when Enter is next, and an indentation hint appears when Tab can fill leading spaces.
- Use the hamburger button to show or hide diagnostics. The keyboard stays below the monitor and replays your keystrokes after the test.
- Review WPM and accuracy, then choose **New test**, **Repeat**. The speed graph is below the results controls.
- Use **snd** to turn keyboard audio on or off. Open **Sound pack** to set volume from 0–100% and preview it with **Test sound**. Your volume setting is remembered.

| Shortcut | Action |
| --- | --- |
| Tab, then Enter | Start a new test |
| Tab, then R | Repeat the same text |

These shortcuts apply outside code indentation, where Tab fills spaces instead.

TIEP saves per-key statistics, common key substitutions, and the last 50 runs in browser storage. Clear the page’s browser data to reset them.

TIEP is a work in progress and works best with a physical keyboard.

## Keyboard sounds

Four packs are ready to use: **Aula F75 Max** (the default), **Aula F75**, **Clicky First**, and **Chevy**. Audio is bundled locally and retains its original license. See [sound credits and licenses](sounds/CREDITS.md) for the creators, source links, and terms.

Use **Active pack** to switch sounds. The favorite links show three rows at a time; scroll for the rest, including WOB Rainy 75 Pro and Keychron Q3. To add another pack, download and extract its ZIP, then choose **Import folder** and select its extracted folder. Imported files are saved locally in IndexedDB; your selected pack is restored after a refresh. They are not uploaded. **Remove pack** deletes an imported pack. Clearing site data also removes saved packs. If browser storage is unavailable, imports work for the current tab only.

Supported personal packs include [Wooting 60HE V2](https://mechvibes.com/sound-packs/wooting-60he-v2), [Akko Matcha Green](https://mechvibes.com/sound-packs/akko-matcha-green-switches), and [Razer Huntsman V3 Pro 8K](https://mechvibes.com/sound-packs/razer-huntsman-v3-pro-8k). Their downloaded licenses credit **shnaizel9** as the original author of Wooting and Razer, and **harcbinger** for Akko. All three are archived by Mechvibes and marked personal-use only, so their recordings are not bundled with this repository.
