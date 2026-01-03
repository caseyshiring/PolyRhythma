import "./style.css";

type VoiceConfig = {
  id: string;
  label: string;
  key: string;
  subdivision: number;
  noteId: string;
  restPattern: string;
  soundMode: "click" | "note";
};

type TrainerState = {
  tempo: number;
  playing: boolean;
  voices: VoiceConfig[];
  stats: PracticeStats;
};

type PracticeStats = {
  total: number;
  withinWindow: number;
  perVoice: Record<string, { count: number; sumAbs: number }>;
  lastDeltas: Array<{ voiceId: string; delta: number }>;
  hitHistory: Array<{ voiceId: string; time: number; delta: number; offsetIndex: number; cycle: number }>;
};

type Pattern = {
  measureDuration: number;
  offsets: Record<string, number[]>;
  spacing: Record<string, number>;
};

type VoiceRuntime = {
  nextEventTime: number;
  offsetIndex: number;
  cycleIndex: number;
};

type RuntimeState = {
  startTime: number;
  voices: Record<string, VoiceRuntime>;
  schedulerId: number | null;
  rafId: number | null;
  pattern: Pattern;
};

type NoteOption = {
  id: string;
  label: string;
  frequency: number;
};

const NOTE_OPTIONS: NoteOption[] = [
  { id: "C4", label: "C4", frequency: 261.63 },
  { id: "C#4", label: "C#4/Db4", frequency: 277.18 },
  { id: "D4", label: "D4", frequency: 293.66 },
  { id: "D#4", label: "D#4/Eb4", frequency: 311.13 },
  { id: "E4", label: "E4", frequency: 329.63 },
  { id: "F4", label: "F4", frequency: 349.23 },
  { id: "F#4", label: "F#4/Gb4", frequency: 369.99 },
  { id: "G4", label: "G4", frequency: 392.0 },
  { id: "G#4", label: "G#4/Ab4", frequency: 415.3 },
  { id: "A4", label: "A4", frequency: 440.0 },
  { id: "A#4", label: "A#4/Bb4", frequency: 466.16 },
  { id: "B4", label: "B4", frequency: 493.88 },
  { id: "C5", label: "C5", frequency: 523.25 },
];

const DEFAULT_KEYS = ["a", "s", "d", "f", "j", "k", "l", ";"];
const DEFAULT_SUBDIVISIONS = [3, 2, 4, 5, 6, 7, 8, 9];
const DEFAULT_NOTES = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const VOICE_COLORS = [
  "#f0b03f",
  "#d55336",
  "#0f8d6f",
  "#8b5cf6",
  "#3cb0ff",
  "#ff7a9e",
  "#7ad4a1",
  "#ffd166",
];

type PresetConfig = {
  id: string;
  name: string;
  description: string;
  tempo: number;
  voices: Array<Pick<VoiceConfig, "subdivision" | "noteId" | "key" | "restPattern" | "soundMode">>;
};

const PRESET_CONFIGS: PresetConfig[] = [
  {
    id: "hemiola",
    name: "Hemiola 3:2",
    description: "Classic 3 over 2 cross-accent.",
    tempo: 96,
    voices: [
      { subdivision: 3, noteId: "C4", key: "j" },
      { subdivision: 2, noteId: "G4", key: "f" },
    ],
  },
  {
    id: "tresillo",
    name: "Son clave 3-2",
    description: "3-2 clave across two voices.",
    tempo: 100,
    voices: [
      {
        subdivision: 8,
        restPattern: "2, 4, 5, 8",
        noteId: "C4",
        key: "j",
        soundMode: "click",
      },
      {
        subdivision: 8,
        restPattern: "1, 2, 4, 6, 7, 8",
        noteId: "G4",
        key: "f",
        soundMode: "click",
      },
    ],
  },
  {
    id: "quintuple",
    name: "5:4 rubato",
    description: "Gentle 5 over 4.",
    tempo: 84,
    voices: [
      { subdivision: 5, noteId: "D4", key: "j" },
      { subdivision: 4, noteId: "A4", key: "f" },
    ],
  },
  {
    id: "bossa",
    name: "Bossa nova",
    description: "3-3-2 feel with offbeat accents.",
    tempo: 90,
    voices: [
      {
        subdivision: 16,
        restPattern: "2, 3, 6, 7, 10, 11, 14, 15",
        noteId: "C4",
        key: "j",
        soundMode: "click",
      },
      {
        subdivision: 16,
        restPattern: "4, 8, 12, 16",
        noteId: "F4",
        key: "f",
        soundMode: "click",
      },
      {
        subdivision: 16,
        restPattern: "2 3 5 6 8 9 10 12 13 15 16",
        noteId: "G4",
        key: "i",
        soundMode: "note",
      },
    ],
  },
  {
    id: "paradiddle",
    name: "Paradiddle",
    description: "RLRR LRLL split across two keys.",
    tempo: 96,
    voices: [
      { subdivision: 8, restPattern: "2, 5, 7, 8", noteId: "C4", key: "j", soundMode: "click" },
      { subdivision: 8, restPattern: "1, 3, 4, 6", noteId: "G4", key: "f", soundMode: "click" },
    ],
  },
  {
    id: "ladder",
    name: "3:4:5 ladder",
    description: "Stack 3, 4, 5 pulses.",
    tempo: 92,
    voices: [
      { subdivision: 3, noteId: "C4", key: "j", soundMode: "click" },
      { subdivision: 4, noteId: "E4", key: "f", soundMode: "click" },
      { subdivision: 5, noteId: "G4", key: "i", soundMode: "click" },
    ],
  },
  {
    id: "four-stack",
    name: "2:3:4:5 stack",
    description: "Four-voice polyrhythm.",
    tempo: 84,
    voices: [
      { subdivision: 2, noteId: "C4", key: "j", soundMode: "click" },
      { subdivision: 3, noteId: "D4", key: "f", soundMode: "click" },
      { subdivision: 4, noteId: "E4", key: "i", soundMode: "click" },
      { subdivision: 5, noteId: "G4", key: "e", soundMode: "click" },
    ],
  },
];

const DEFAULT_STATE: TrainerState = {
  tempo: 96,
  playing: false,
  voices: buildDefaultVoices(),
  stats: createEmptyStats(buildDefaultVoices()),
};

const HIT_TOLERANCE_MS = 55;
const STATS_WINDOW_SEC = 8;
const SCHEDULE_AHEAD_SEC = 0.2;
const SCHEDULER_INTERVAL_MS = 25;

let state: TrainerState = { ...DEFAULT_STATE };
let runtime: RuntimeState | null = null;
let audioCtx: AudioContext | null = null;

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = renderLayout();
  wireControls();
  updatePatternAndMarkers();
  updateStatsDisplay();
}

function renderLayout(): string {
  return `
    <div class="page-shell">
      <header class="hero">
        <div class="hero-copy">
          <h1 class="title-merge">
            <span class="title-pol-rh-box">
              <p class="title-pol">Pol</p>
              <p class="title-rh">Rh</p>
            </span>
            <span class="title-y">y</span>
            <span class="title-orbit" aria-hidden="true">
              <svg viewBox="0 0 80 60" role="img" focusable="false">
                <ellipse cx="40" cy="30" rx="28" ry="14"></ellipse>
                <ellipse cx="48" cy="30" rx="20" ry="10"></ellipse>
                <ellipse cx="56" cy="30" rx="12" ry="6"></ellipse>
              </svg>
            </span>
            <span class="title-thma">thma</span>
          </h1>
          <p class="lede">
            Practice polyrhythms with your keyboard!
          </p>
        </div>
      </header>

      <div class="shortcut-bar" aria-label="Keyboard shortcuts">
        <span class="shortcut-pill"><span class="keycap">Space</span> Start/Stop</span>
        <span class="shortcut-pill"><span class="keycap">↑/↓</span> Tempo ±1</span>
        <span class="shortcut-pill"><span class="keycap">Mapped keys</span> Trigger voices</span>
      </div>

      <div class="config-row">
        <section class="panel controls">
          <div class="panel-header">
            <div>
              <h2>Rhythm Config</h2>
            </div>
            <button class="ghost-button" id="reset-session" type="button">Reset session</button>
          </div>
          <div class="controls-grid">
            <label class="control">
              <div class="control-header">
                <span class="control-label">Tempo (BPM)</span>
              </div>
              <div class="tempo-row">
                <input id="tempo" type="range" min="40" max="180" step="1" value="${state.tempo}" />
                <div class="tempo-input-wrap">
                  <input id="tempo-input" type="number" min="40" max="180" step="1" value="${state.tempo}" aria-label="Tempo BPM" />
                  <span class="tempo-suffix">BPM</span>
                </div>
              </div>
            </label>
          </div>
          <div class="voices-grid" aria-label="Practice voices">
            <div class="voice-header-row">
              <span aria-hidden="true"></span>
              <span class="voice-heading">Key</span>
              <span class="voice-heading">Subdiv.</span>
              <span class="voice-heading">Rests</span>
              <span class="voice-heading">Pitch</span>
              <span class="voice-heading">Sound</span>
              <span aria-hidden="true"></span>
            </div>
            <div class="voice-list" id="voice-list">
              ${renderVoiceEditorList()}
            </div>
            <button class="ghost-button add-voice" id="add-voice" type="button" aria-label="Add voice">
              <img src="/polyrhythm/icons/primary-tab-new.svg" class="add-voice-icon" alt="" aria-hidden="true" />
            </button>
          </div>
        </section>
        <section class="panel preset-panel">
          <div class="panel-header">
            <h2>Presets</h2>
          </div>
          <div class="preset-list">
            ${PRESET_CONFIGS.map(
              (preset) => `
              <button class="preset-button" data-preset="${preset.id}">
                <span class="preset-name">${preset.name}</span>
                <span class="preset-desc">${preset.description}</span>
              </button>`,
            ).join("")}
          </div>
        </section>
      </div>

      <section class="panel timeline">
        <div class="panel-header">
          <div>
            <h2>Polyrhythm Player</h2>
          </div>
          <button class="primary-button" id="start-stop" type="button">Start playback</button>
        </div>
        <div class="timeline-track">
          <div class="timeline-progress" id="timeline-progress"></div>
          <div class="timeline-lanes" id="timeline-lanes" aria-label="Voice timelines"></div>
        </div>
        <p class="timeline-hint">Markers show where each pulse lands inside the shared loop.</p>
      </section>

      <section class="panel stats">
        <div class="panel-header">
          <div>
            <h2>Precision</h2>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat">
            <p class="stat-label">Pocket</p>
            <p class="stat-value" id="overall-accuracy">—</p>
            <p class="stat-sub">Rolling ${STATS_WINDOW_SEC}s · ±${HIT_TOLERANCE_MS}ms</p>
          </div>
          <div class="stat">
            <p class="stat-label">Mean error</p>
            <p class="stat-value" id="mean-avg">—</p>
            <p class="stat-sub">Rolling ${STATS_WINDOW_SEC}s · absolute ms</p>
          </div>
          <div class="stat">
            <p class="stat-label">Consistency</p>
            <div class="per-key-stats" id="per-key-stats">—</div>
            <p class="stat-sub">Std dev of intervals per key</p>
          </div>
        </div>
      </section>

    </div>
  `;
}

function renderVoiceBindings(): string {
  return state.voices
    .map(
      (voice) => `
    <div class="binding">
      <span class="key-pill">${voice.key.toUpperCase()}</span>
      <span class="binding-label">${voice.label} · ÷${voice.subdivision} · ${voice.noteId}</span>
    </div>`,
    )
    .join("");
}

function renderVoiceEditorList(): string {
  return state.voices
    .map(
      (voice, index) => `
      <div class="voice-row" data-voice-id="${voice.id}">
        <div class="voice-id">${index + 1}</div>
        <label class="voice-field">
          <input class="voice-key-input" type="text" maxlength="1" value="${voice.key}" aria-label="Key for ${
            voice.label
          }" />
        </label>
        <label class="voice-field">
          <input class="voice-ratio-input" type="number" min="1" max="16" value="${
            voice.subdivision
          }" aria-label="Subdivision for ${voice.label}" />
        </label>
        <label class="voice-field">
          <input
            class="voice-rests-input"
            type="text"
            inputmode="numeric"
            pattern="[0-9,\\s]*"
            placeholder="rests"
            value="${voice.restPattern ?? ""}"
            aria-label="Rest positions for ${voice.label}"
          />
        </label>
        <label class="voice-field">
          <select class="voice-note-select" aria-label="Pitch for ${voice.label}">
            ${renderNoteOptions(voice.noteId)}
          </select>
        </label>
        <label class="voice-field">
          <select class="voice-sound-select" aria-label="Sound for ${voice.label}">
            <option value="click" ${voice.soundMode === "click" ? "selected" : ""}>Click</option>
            <option value="note" ${voice.soundMode === "note" ? "selected" : ""}>Note</option>
          </select>
        </label>
        <button class="delete-voice" type="button" aria-label="Remove ${voice.label}" ${
          state.voices.length <= 2 ? "disabled" : ""
        }>
          <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
            <path
              d="M9.5 4a1 1 0 0 0-.94.66L8.1 6H5a1 1 0 1 0 0 2h1.07l.73 10.12A2 2 0 0 0 8.79 20h6.42a2 2 0 0 0 1.99-1.88L17.93 8H19a1 1 0 1 0 0-2h-3.1l-.46-1.34A1 1 0 0 0 14.5 4h-5Zm.73 2h3.54l.2.6H10.03l.2-.6ZM9.12 8h5.76l-.7 9.7a.5.5 0 0 1-.49.45H9.27a.5.5 0 0 1-.49-.45L8.08 8Z"
            />
          </svg>
        </button>
      </div>
    `,
    )
    .join("");
}

function renderNoteOptions(selected: string): string {
  return NOTE_OPTIONS.map(
    (option) =>
      `<option value="${option.id}" ${option.id === selected ? "selected" : ""}>${option.label}</option>`,
  ).join("");
}

function wireControls(): void {
  const startStop = document.querySelector<HTMLButtonElement>("#start-stop");
  const tempo = document.querySelector<HTMLInputElement>("#tempo");
  const tempoInput = document.querySelector<HTMLInputElement>("#tempo-input");
  const resetSession = document.querySelector<HTMLButtonElement>("#reset-session");
  const addVoiceBtn = document.querySelector<HTMLButtonElement>("#add-voice");
  const presetButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".preset-button"));

  startStop?.addEventListener("click", () => {
    togglePlayback();
  });

  tempo?.addEventListener("input", () => {
    setTempo(tempo.valueAsNumber);
  });
  tempoInput?.addEventListener("change", () => {
    setTempo(tempoInput.valueAsNumber);
  });

  resetSession?.addEventListener("click", () => {
    state = { ...state, stats: createEmptyStats(state.voices) };
    updateStatsDisplay();
  });

  addVoiceBtn?.addEventListener("click", () => {
    addVoice();
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const presetId = button.getAttribute("data-preset");
      if (presetId) {
        applyPreset(presetId);
      }
    });
  });

  window.addEventListener("keydown", handlePracticeKey);
  wireVoiceInputs();
}

function handlePracticeKey(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null;
  if (
    target &&
    (target.tagName === "INPUT" || target.tagName === "SELECT" || target.isContentEditable)
  ) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    togglePlayback();
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    setTempo(state.tempo + 1);
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    setTempo(state.tempo - 1);
    return;
  }

  if (!state.playing || !runtime) {
    return;
  }

  const key = event.key.toLowerCase();
  const voice = state.voices.find((v) => v.key.toLowerCase() === key);
  if (voice) {
    registerHit(voice);
  }
}

function registerHit(voice: VoiceConfig): void {
  if (!runtime) {
    return;
  }
  const now = getNowSeconds();
  const pattern = runtime.pattern;
  const measureDuration = pattern.measureDuration;
  const offsets = pattern.offsets[voice.id];
  if (!offsets || offsets.length === 0) {
    return;
  }
  const elapsed = Math.max(0, now - runtime.startTime);
  const cycle = Math.floor(elapsed / measureDuration);
  const withinCycle = elapsed - cycle * measureDuration;
  let closestIndex = 0;
  let closestOffset = offsets[0];
  offsets.forEach((offset, index) => {
    const distance = Math.abs(withinCycle - offset);
    const closestDistance = Math.abs(withinCycle - closestOffset);
    if (distance < closestDistance) {
      closestIndex = index;
      closestOffset = offset;
    }
  });
  const targetTime = runtime.startTime + cycle * measureDuration + closestOffset;
  const deltaMs = (now - targetTime) * 1000;

  const stats = { ...state.stats };
  stats.total += 1;
  if (!stats.perVoice[voice.id]) {
    stats.perVoice[voice.id] = { count: 0, sumAbs: 0 };
  }
  stats.perVoice[voice.id].count += 1;
  stats.perVoice[voice.id].sumAbs += Math.abs(deltaMs);
  if (Math.abs(deltaMs) <= HIT_TOLERANCE_MS) {
    stats.withinWindow += 1;
  }
  stats.lastDeltas = [{ voiceId: voice.id, delta: deltaMs }, ...stats.lastDeltas].slice(0, 8);
  stats.hitHistory = [
    { voiceId: voice.id, time: now, delta: deltaMs, offsetIndex: closestIndex, cycle },
    ...stats.hitHistory,
  ].filter((hit) => now - hit.time <= STATS_WINDOW_SEC);
  state = { ...state, stats };
  updateStatsDisplay();
}

function startPlayback(): void {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  void audioCtx.resume();
  const pattern = buildPattern(state);
  const startTime = getNowSeconds() + 0.05;
  const voicesRuntime: Record<string, VoiceRuntime> = {};
  state.voices.forEach((voice) => {
    const offsets = pattern.offsets[voice.id];
    voicesRuntime[voice.id] = {
      cycleIndex: 0,
      offsetIndex: 0,
      nextEventTime: startTime + (offsets?.[0] ?? 0),
    };
  });
  runtime = {
    startTime,
    voices: voicesRuntime,
    schedulerId: null,
    rafId: null,
    pattern,
  };
  state = { ...state, playing: true };
  updatePlaybackIndicator();
  scheduleLoop();
  tickVisuals();
}

function restartPlayback(): void {
  stopPlayback(false);
  startPlayback();
}

function togglePlayback(): void {
  if (state.playing) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function stopPlayback(updateStateFlag = true): void {
  if (runtime?.schedulerId) {
    window.clearInterval(runtime.schedulerId);
  }
  if (runtime?.rafId) {
    cancelAnimationFrame(runtime.rafId);
  }
  runtime = null;
  const progressEl = document.querySelector<HTMLDivElement>("#timeline-progress");
  if (progressEl) {
    progressEl.style.width = "0%";
  }
  if (updateStateFlag) {
    state = { ...state, playing: false };
    updatePlaybackIndicator();
  }
}

function scheduleLoop(): void {
  if (!runtime || !audioCtx) {
    return;
  }
  const scheduler = () => {
    if (!runtime || !audioCtx) {
      return;
    }
    const horizon = audioCtx.currentTime + SCHEDULE_AHEAD_SEC;
    state.voices.forEach((voice) => scheduleVoice(voice.id, horizon));
  };
  scheduler();
  runtime.schedulerId = window.setInterval(scheduler, SCHEDULER_INTERVAL_MS);
}

function scheduleVoice(voiceId: string, horizon: number): void {
  if (!runtime || !audioCtx) {
    return;
  }
  const { pattern } = runtime;
  const offsets = pattern.offsets[voiceId];
  const runtimeVoice = runtime.voices[voiceId];
  if (!offsets || !runtimeVoice) return;
  while (runtimeVoice.nextEventTime < horizon) {
    playPulse(voiceId, runtimeVoice.nextEventTime);
    advancePointer(voiceId, offsets.length, pattern.measureDuration);
  }
}

function advancePointer(voiceId: string, offsetCount: number, measureDuration: number): void {
  if (!runtime || !audioCtx) {
    return;
  }
  const voiceRuntime = runtime.voices[voiceId];
  if (!voiceRuntime) return;
  voiceRuntime.offsetIndex += 1;
  if (voiceRuntime.offsetIndex >= offsetCount) {
    voiceRuntime.offsetIndex = 0;
    voiceRuntime.cycleIndex += 1;
  }
  const nextOffset = runtime.pattern.offsets[voiceId][voiceRuntime.offsetIndex];
  voiceRuntime.nextEventTime =
    runtime.startTime + voiceRuntime.cycleIndex * measureDuration + nextOffset;
}

function playPulse(voiceId: string, time: number): void {
  if (!audioCtx) {
    return;
  }
  const voiceRuntime = runtime?.voices[voiceId];
  const voice = state.voices.find((v) => v.id === voiceId);
  if (!voiceRuntime || !voice) return;
  const isDownbeat = voiceRuntime.offsetIndex === 0;
  const choice = NOTE_OPTIONS.find((option) => option.id === voice.noteId) ?? NOTE_OPTIONS[0];
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.value = choice.frequency;
  const clickGain = isDownbeat ? 0.45 : 0.28;
  const noteGain = isDownbeat ? 0.32 : 0.2;
  const spacing = runtime?.pattern.spacing[voiceId] ?? 0.5;
  if (voice.soundMode === "note") {
    const gainValue = noteGain;
    const sustainDuration = Math.min(0.25, Math.max(0.05, spacing / 2));
    const attack = 0.01;
    const sustainLevel = gainValue;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(sustainLevel, time + attack);
    gain.gain.setValueAtTime(sustainLevel, time + sustainDuration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + sustainDuration);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + sustainDuration + 0.02);
  } else {
    const gainValue = clickGain;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.08);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(time);
    osc.stop(time + 0.12);
  }
}

function tickVisuals(): void {
  if (!runtime) {
    return;
  }
  const now = getNowSeconds();
  const elapsed = now - runtime.startTime;
  const loopLength = runtime.pattern.measureDuration;
  const progress = ((elapsed % loopLength) / loopLength) * 100;
  const progressEl = document.querySelector<HTMLDivElement>("#timeline-progress");
  if (progressEl) {
    progressEl.style.width = `${progress}%`;
  }
  runtime.rafId = requestAnimationFrame(tickVisuals);
}

function buildPattern(current: TrainerState): Pattern {
  const measureDuration = (60 / current.tempo) * 4;
  const offsets: Record<string, number[]> = {};
  const spacing: Record<string, number> = {};
  current.voices.forEach((voice) => {
    const rests = parseRestPattern(voice.restPattern, voice.subdivision);
    const steps = buildOffsets(voice.subdivision, measureDuration, rests);
    offsets[voice.id] = steps.length ? steps : [0];
    spacing[voice.id] = measureDuration / voice.subdivision;
  });
  return {
    measureDuration,
    offsets,
    spacing,
  };
}

function parseRestPattern(input: string, subdivision: number): number[] {
  if (!input) return [];
  const tokens = input
    .split(/[\s,]+/)
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value) && value >= 1 && value <= subdivision);
  return Array.from(new Set(tokens)).sort((a, b) => a - b);
}

function buildOffsets(count: number, measureDuration: number, rests: number[] = []): number[] {
  const restSet = new Set(rests);
  const offsets: number[] = [];
  for (let index = 0; index < count; index++) {
    const step = index + 1;
    if (restSet.has(step)) continue;
    offsets.push((index * measureDuration) / count);
  }
  return offsets;
}

function updatePatternAndMarkers(): void {
  const pattern = buildPattern(state);
  const lanesContainer = document.querySelector<HTMLDivElement>("#timeline-lanes");
  if (lanesContainer) {
    lanesContainer.innerHTML = state.voices
      .map(
        (voice) => `
        <div class="timeline-lane" data-voice-id="${voice.id}">
          <div class="lane-label">${voice.key.toUpperCase()} · ÷${voice.subdivision} · ${voice.noteId}</div>
          <div class="lane-markers" id="lane-${voice.id}"></div>
        </div>
      `,
      )
      .join("");
    state.voices.forEach((voice, idx) => {
      renderMarkers(
        lanesContainer.querySelector(`#lane-${voice.id}`),
        pattern.offsets[voice.id],
        pattern.measureDuration,
        idx,
      );
    });
  }
  if (runtime) {
    runtime.pattern = pattern;
  }
}

function renderMarkers(
  container: Element | null,
  offsets: number[],
  measureDuration: number,
  colorIndex: number,
): void {
  if (!container) {
    return;
  }
  const safeDuration = measureDuration || 1;
  const color = VOICE_COLORS[colorIndex % VOICE_COLORS.length];
  container.innerHTML = offsets
    .map((offset, index) => {
      const percent = (offset / safeDuration) * 100;
      return `<span class="marker ${index === 0 ? "downbeat" : ""}" style="left:${percent}%;background:${color}"></span>`;
    })
    .join("");
}

function updateStatsDisplay(): void {
  const overall = document.querySelector<HTMLParagraphElement>("#overall-accuracy");
  const meanAvg = document.querySelector<HTMLParagraphElement>("#mean-avg");
  if (!overall || !meanAvg) {
    return;
  }
  const stats = state.stats;
  const now = getNowSeconds();
  const windowHits = stats.hitHistory.filter((hit) => now - hit.time <= STATS_WINDOW_SEC);
  const windowTotal = windowHits.length;
  const windowWithin = windowHits.filter((hit) => Math.abs(hit.delta) <= HIT_TOLERANCE_MS).length;

  overall.textContent =
    windowTotal === 0 ? "—" : `${Math.round((windowWithin / windowTotal) * 100)}% locked`;
  const mean =
    windowTotal === 0
      ? null
      : windowHits.reduce((sum, hit) => sum + Math.abs(hit.delta), 0) / windowTotal;
  meanAvg.textContent = mean !== null ? formatMs(mean) : "—";

  const perKey = document.querySelector<HTMLDivElement>("#per-key-stats");
  if (perKey) {
    const pattern = runtime?.pattern ?? buildPattern(state);
    perKey.innerHTML = state.voices
      .map((voice) => {
        const voiceHits = windowHits
          .filter((hit) => hit.voiceId === voice.id)
          .map((hit) => ({ time: hit.time, offsetIndex: hit.offsetIndex, cycle: hit.cycle }));
        const offsetsLength = pattern.offsets[voice.id]?.length ?? 0;
        const consistency = computeConsistencyByVoice(voice.id, voiceHits, offsetsLength);
        const value = consistency === null ? "—" : formatDeviation(consistency);
        return `<span class="per-key-chip">${voice.key.toUpperCase()}: ${value}</span>`;
      })
      .join("");
  }
}

function updatePlaybackIndicator(): void {
  const statusPill = document.querySelector<HTMLDivElement>("#status-pill");
  const startStop = document.querySelector<HTMLButtonElement>("#start-stop");
  const playbackState = document.querySelector<HTMLDivElement>("#playback-state");
  const isPlaying = state.playing;
  if (statusPill) {
    statusPill.textContent = isPlaying
      ? "Running · stay on the grid"
      : "Stopped · press play or Space to hear the guide";
    statusPill.classList.toggle("is-live", isPlaying);
  }
  if (startStop) {
    startStop.textContent = isPlaying ? "Stop playback" : "Start playback";
  }
  if (playbackState) {
    playbackState.textContent = isPlaying ? "Playing" : "Stopped";
    playbackState.classList.toggle("is-live", isPlaying);
  }
}

function updateTempoDisplay(): void {
  const tempoSlider = document.querySelector<HTMLInputElement>("#tempo");
  const tempoInput = document.querySelector<HTMLInputElement>("#tempo-input");
  if (tempoSlider) {
    tempoSlider.value = state.tempo.toString();
  }
  if (tempoInput) {
    tempoInput.value = state.tempo.toString();
  }
}

function updateBarsDisplay(): void {}

function clampInput(value: number, min: number, max: number, fallback: number): number {
  if (Number.isNaN(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function setTempo(nextTempo: number): void {
  const clamped = clampInput(nextTempo, 40, 180, state.tempo);
  if (clamped === state.tempo) {
    updateTempoDisplay();
    return;
  }
  state = { ...state, tempo: clamped };
  updateTempoDisplay();
  updatePatternAndMarkers();
  if (state.playing) {
    restartPlayback();
  }
}

function formatMs(value: number): string {
  return `${value >= 0 ? "+" : "–"}${Math.abs(value).toFixed(0)}ms`;
}

function formatDeviation(value: number): string {
  return `±${value.toFixed(0)}ms`;
}

function calculateStdDev(values: number[]): number | null {
  if (!values.length) {
    return null;
  }
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function computeConsistencyByVoice(
  voiceId: string,
  hits: Array<{ time: number; offsetIndex: number; cycle: number }>,
  offsetsLength: number,
): number | null {
  if (offsetsLength <= 0 || hits.length < 2) {
    return null;
  }
  const sorted = [...hits].sort((a, b) => a.time - b.time);
  const groupStdDevs: number[] = [];
  let groupIntervals: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const expectedNext = (prev.offsetIndex + 1) % offsetsLength;
    const wraps = expectedNext === 0;
    const isNextInSequence =
      curr.offsetIndex === expectedNext && (wraps ? curr.cycle === prev.cycle + 1 : curr.cycle === prev.cycle);
    if (!isNextInSequence) {
      if (groupIntervals.length) {
        const stdDev = calculateStdDev(groupIntervals);
        if (stdDev !== null) groupStdDevs.push(stdDev);
      }
      groupIntervals = [];
      continue;
    }
    groupIntervals.push((curr.time - prev.time) * 1000);
  }
  if (groupIntervals.length) {
    const stdDev = calculateStdDev(groupIntervals);
    if (stdDev !== null) groupStdDevs.push(stdDev);
  }
  if (!groupStdDevs.length) {
    return null;
  }
  return groupStdDevs.reduce((sum, v) => sum + v, 0) / groupStdDevs.length;
}

function createEmptyStats(voices: VoiceConfig[]): PracticeStats {
  const perVoice: Record<string, { count: number; sumAbs: number }> = {};
  voices.forEach((voice) => {
    perVoice[voice.id] = { count: 0, sumAbs: 0 };
  });
  return {
    total: 0,
    withinWindow: 0,
    perVoice,
    lastDeltas: [],
    hitHistory: [],
  };
}

function getNowSeconds(): number {
  if (audioCtx) {
    return audioCtx.currentTime;
  }
  return performance.now() / 1000;
}

function buildDefaultVoices(): VoiceConfig[] {
  const initialCount = 4;
  return DEFAULT_KEYS.slice(0, initialCount).map((key, index) => ({
    id: `voice-${index + 1}`,
    label: `Voice ${index + 1}`,
    key,
    subdivision: DEFAULT_SUBDIVISIONS[index] ?? 2,
    noteId: DEFAULT_NOTES[index] ?? "C4",
    restPattern: "",
    soundMode: "click",
  }));
}

function addVoice(): void {
  if (state.voices.length >= 8) {
    return;
  }
  const nextIndex = state.voices.length;
  const nextKey = DEFAULT_KEYS[nextIndex] ?? String.fromCharCode(97 + nextIndex);
  const nextSubdivision = DEFAULT_SUBDIVISIONS[nextIndex] ?? 2;
  const noteFallback = NOTE_OPTIONS[nextIndex % NOTE_OPTIONS.length]?.id ?? "C4";
  const newVoice: VoiceConfig = {
    id: `voice-${Date.now()}-${nextIndex}`,
    label: `Voice ${nextIndex + 1}`,
    key: nextKey,
    subdivision: nextSubdivision,
    noteId: DEFAULT_NOTES[nextIndex] ?? noteFallback,
    restPattern: "",
    soundMode: "click",
  };
  const voices = normalizeVoiceLabels([...state.voices, newVoice]);
  state = { ...state, voices, stats: createEmptyStats(voices) };
  refreshVoiceEditor();
  renderVoiceBindingCard();
  updatePatternAndMarkers();
  updateStatsDisplay();
  if (state.playing) restartPlayback();
}

function removeVoice(id: string): void {
  if (state.voices.length <= 2) {
    return;
  }
  const voices = normalizeVoiceLabels(state.voices.filter((v) => v.id !== id));
  state = { ...state, voices, stats: createEmptyStats(voices) };
  refreshVoiceEditor();
  renderVoiceBindingCard();
  updatePatternAndMarkers();
  updateStatsDisplay();
  if (state.playing) restartPlayback();
}

function normalizeVoiceLabels(voices: VoiceConfig[]): VoiceConfig[] {
  return voices.map((voice, idx) => ({ ...voice, label: `Voice ${idx + 1}` }));
}

function normalizeKeyInput(value: string): string {
  return (value || "").slice(0, 1).toLowerCase() || " ";
}

function normalizeRestPatternInput(input: string, subdivision: number): string {
  const rests = parseRestPattern(input, subdivision);
  return rests.length ? rests.join(", ") : "";
}

function normalizeVoiceConfig(voice: VoiceConfig): VoiceConfig {
  const subdivision = clampInput(voice.subdivision, 1, 16, 2);
  const noteId = NOTE_OPTIONS.some((option) => option.id === voice.noteId)
    ? voice.noteId
    : NOTE_OPTIONS[0].id;
  return {
    ...voice,
    key: normalizeKeyInput(voice.key),
    subdivision,
    restPattern: normalizeRestPatternInput(voice.restPattern, subdivision),
    noteId,
    soundMode: voice.soundMode === "note" ? "note" : "click",
  };
}

function applyPreset(presetId: string): void {
  const preset = PRESET_CONFIGS.find((p) => p.id === presetId);
  if (!preset) return;
  const voices = normalizeVoiceLabels(
    preset.voices.map((config, index) =>
      normalizeVoiceConfig({
        id: `voice-${Date.now()}-${index}`,
        label: `Voice ${index + 1}`,
        key: config.key,
        subdivision: config.subdivision,
        noteId: config.noteId,
        restPattern: config.restPattern ?? "",
        soundMode: config.soundMode ?? "click",
      }),
    ),
  );
  state = {
    ...state,
    tempo: preset.tempo,
    voices,
    stats: createEmptyStats(voices),
  };
  refreshVoiceEditor();
  renderVoiceBindingCard();
  updateTempoDisplay();
  updatePatternAndMarkers();
  updateStatsDisplay();
  if (state.playing) restartPlayback();
}

function wireVoiceInputs(): void {
  const rows = Array.from(document.querySelectorAll<HTMLDivElement>(".voice-row"));
  rows.forEach((row) => {
    const id = row.getAttribute("data-voice-id");
    const keyInput = row.querySelector<HTMLInputElement>(".voice-key-input");
    const ratioInput = row.querySelector<HTMLInputElement>(".voice-ratio-input");
    const restsInput = row.querySelector<HTMLInputElement>(".voice-rests-input");
    const noteSelect = row.querySelector<HTMLSelectElement>(".voice-note-select");
    const soundSelect = row.querySelector<HTMLSelectElement>(".voice-sound-select");
    const deleteBtn = row.querySelector<HTMLButtonElement>(".delete-voice");
    if (!id || !keyInput || !ratioInput || !noteSelect) {
      return;
    }
    keyInput.addEventListener("input", () => {
      const value = (keyInput.value || "").slice(0, 1).toLowerCase();
      keyInput.value = value;
      updateVoiceConfig(id, { key: value || " " });
    });
    ratioInput.addEventListener("change", () => {
      const value = clampInput(ratioInput.valueAsNumber, 1, 16, 2);
      ratioInput.value = value.toString();
      updateVoiceConfig(id, { subdivision: value });
      updatePatternAndMarkers();
      if (state.playing) restartPlayback();
    });
    restsInput?.addEventListener("change", () => {
      const tokens = (restsInput.value || "")
        .split(/[\s,]+/)
        .map((value) => Number.parseInt(value, 10))
        .filter((value) => Number.isFinite(value) && value > 0);
      const cleaned = Array.from(new Set(tokens)).sort((a, b) => a - b);
      const normalized = cleaned.join(", ");
      restsInput.value = normalized;
      updateVoiceConfig(id, { restPattern: normalized });
      updatePatternAndMarkers();
      if (state.playing) restartPlayback();
    });
    noteSelect.addEventListener("change", () => {
      updateVoiceConfig(id, { noteId: noteSelect.value });
    });
    soundSelect?.addEventListener("change", () => {
      const value = soundSelect.value === "note" ? "note" : "click";
      updateVoiceConfig(id, { soundMode: value });
    });
    deleteBtn?.addEventListener("click", () => {
      removeVoice(id);
    });
  });
}

function updateVoiceConfig(
  id: string,
  partial: Partial<
    Pick<VoiceConfig, "key" | "subdivision" | "noteId" | "restPattern" | "soundMode">
  >,
): void {
  const updated = state.voices.map((voice) => (voice.id === id ? { ...voice, ...partial } : voice));
  const normalized = normalizeVoiceLabels(updated);
  state = { ...state, voices: normalized, stats: createEmptyStats(normalized) };
  refreshVoiceEditor();
  renderVoiceBindingCard();
  updatePatternAndMarkers();
  updateStatsDisplay();
}

function renderVoiceBindingCard(): void {
  const bindingList = document.querySelector<HTMLDivElement>(".binding-list");
  if (bindingList) {
    bindingList.innerHTML = renderVoiceBindings();
  }
}

function refreshVoiceEditor(): void {
  const list = document.querySelector<HTMLDivElement>("#voice-list");
  if (!list) return;
  list.innerHTML = renderVoiceEditorList();
  wireVoiceInputs();
}
