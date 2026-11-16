const TiepSound = (() => {
  const base = "./sounds/chevy/";
  const other = "OtherKeys.ogg";
  const defaults = {
    Backspace: "BackSpace.ogg",
    Digit2: "2.ogg",
    Escape: "Space.ogg",
    Space: "Shift.ogg",
    ShiftLeft: "Shift.ogg",
    ShiftRight: "Shift.ogg",
  };
  const samples = new Map();
  const voices = new Set();
  let currentPack = null;

  function stop(voice) {
    clearTimeout(voice.timer);
    voice.audio.pause();
    voices.delete(voice);
  }

  function mute() {
    voices.forEach(stop);
  }

  function sampleFor(key) {
    const definition = currentPack?.definitions[key];
    if (definition) return definition;
    if (currentPack) return currentPack.fallback;
    return { url: base + (defaults[key] || other), ranges: [[0, null]] };
  }

  function play(key) {
    const sample = sampleFor(key);
    if (!sample) return;
    if (!samples.has(sample.url)) samples.set(sample.url, new Audio(sample.url));
    const audio = samples.get(sample.url).cloneNode();
    const [start, end] = sample.ranges[Math.floor(Math.random() * sample.ranges.length)];
    audio.currentTime = start / 1000;
    audio.volume = 0.45;
    if (voices.size >= 12) stop(voices.values().next().value);
    const voice = { audio, timer: null };
    voices.add(voice);
    if (end !== null) {
      audio.addEventListener("playing", () => {
        voice.timer = setTimeout(() => stop(voice), end - start);
      }, { once: true });
    }
    audio.addEventListener("ended", () => stop(voice), { once: true });
    audio.play().catch(() => stop(voice));
  }

  async function importFolder(files) {
    const configFile = files.find(file => file.name === "config.json");
    if (!configFile) throw new Error("Choose the extracted folder containing config.json.");
    const config = JSON.parse(await configFile.text());
    if (String(config.config_version) !== "2" ||
        (config.soundpack_type && config.soundpack_type !== "Keyboard") ||
        !config.definitions || typeof config.definitions !== "object") {
      throw new Error("Choose a Mechvibes keyboard pack with a version 2 config.");
    }
    const audioFiles = new Map(files.filter(file => /\.(ogg|wav|mp3|flac|m4a)$/i.test(file.name))
      .map(file => [file.name, file]));
    const urls = new Map();
    const definitions = Object.create(null);
    let fallback = null;
    for (const [key, definition] of Object.entries(config.definitions)) {
      const filename = definition?.audio_file || config.audio_file;
      const file = audioFiles.get(filename);
      if (!file) continue;
      const timing = definition?.timing;
      const ranges = Array.isArray(timing) ? timing.filter(pair =>
        Array.isArray(pair) && Number.isFinite(pair[0]) && Number.isFinite(pair[1]) &&
        pair[0] >= 0 && pair[1] > pair[0]) : [[0, null]];
      if (!ranges.length) continue;
      if (!urls.has(filename)) urls.set(filename, URL.createObjectURL(file));
      const sample = { url: urls.get(filename), ranges };
      definitions[key] = sample;
      fallback ??= sample;
    }
    if (!fallback) throw new Error("The folder has no matching audio samples.");
    mute();
    for (const url of currentPack?.urls.values() || []) {
      samples.delete(url);
      URL.revokeObjectURL(url);
    }
    currentPack = { definitions, fallback, urls };
    return typeof config.name === "string" ? config.name : "Local sound pack";
  }

  return { play, mute, importFolder };
})();
