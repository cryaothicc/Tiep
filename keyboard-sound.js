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
  const importedPacks = new Map();
  let volume = 0.45;
  try {
    const saved = localStorage.getItem("tiep_sound_volume");
    if (saved !== null && Number.isFinite(Number(saved))) volume = Math.max(0, Math.min(1, Number(saved)));
  } catch {}

  function setVolume(value) {
    if (!Number.isFinite(value)) return;
    volume = Math.max(0, Math.min(1, value));
    voices.forEach(voice => { voice.audio.volume = volume; });
    try { localStorage.setItem("tiep_sound_volume", String(volume)); } catch {}
  }

  let databasePromise;
  function database() {
    if (!databasePromise) databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open("tiep-sounds", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("packs", { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error("Sound storage is busy. Close other TIEP tabs and try again."));
    });
    return databasePromise;
  }

  async function storedPacks() {
    const db = await database();
    return new Promise((resolve, reject) => {
      const request = db.transaction("packs").objectStore("packs").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function writePack(record, remove = false) {
    const db = await database();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("packs", "readwrite");
      const store = transaction.objectStore("packs");
      if (remove) store.delete(record.id); else store.put(record);
      transaction.oncomplete = () => resolve();
      transaction.onabort = transaction.onerror = () => reject(transaction.error || new Error("Sound storage is unavailable."));
    });
  }

  function select(id) {
    mute();
    currentPack = importedPacks.get(id) || null;
    try { localStorage.setItem("tiep_sound_pack", currentPack ? id : "default"); } catch {}
  }

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
    audio.volume = volume;
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

  async function buildPack(files, id) {
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
    const name = typeof config.name === "string" ? config.name : "Local sound pack";
    importedPacks.set(id, { definitions, fallback, urls, name });
    return { id, name, files: [configFile, ...[...urls.keys()].map(filename => audioFiles.get(filename))]
      .map(file => new File([file], file.name, { type: file.type })) };
  }

  async function restore() {
    const packs = [];
    let storageAvailable = true;
    try {
      for (const record of await storedPacks()) {
        try { const pack = await buildPack(record.files, record.id); importedPacks.get(pack.id).saved = true; packs.push({ id: pack.id, name: pack.name }); }
        catch { /* A damaged saved pack does not prevent other packs from loading. */ }
      }
    } catch { storageAvailable = false; }
    let selected = "default";
    try { selected = localStorage.getItem("tiep_sound_pack") || selected; } catch {}
    if (!importedPacks.has(selected)) selected = "default";
    select(selected);
    return { packs, selected, storageAvailable };
  }
  const ready = restore();

  async function importFolder(files) {
    await ready;
    const record = await buildPack(files, crypto.randomUUID());
    let saved = true;
    try { await writePack(record); } catch { saved = false; }
    importedPacks.get(record.id).saved = saved;
    select(record.id);
    return { id: record.id, name: record.name, saved };
  }

  async function remove(id) {
    const pack = importedPacks.get(id);
    if (pack?.saved) await writePack({ id }, true);
    if (currentPack === pack) select("default");
    for (const url of pack?.urls.values() || []) { samples.delete(url); URL.revokeObjectURL(url); }
    importedPacks.delete(id);
  }

  return { play, mute, importFolder, select, ready, remove, setVolume, getVolume: () => volume };
})();
