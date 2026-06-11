// ===========================================================================
// ABYSS PROTOCOL — a tiny mutable store outside React.
// The simulation (lib/abyss/sim.js) mutates S at 60Hz inside useFrame;
// the DOM HUD subscribes and re-reads at ~10Hz. No deps, Node-testable.
// ===========================================================================

import { BAL, HIGH_KEY } from './constants';

const listeners = new Set();

export const S = {
    phase: 'menu', // menu | intro | playing | paused | gameover | victory
    overReason: '',
    time: 0,
    score: 0,
    high: 0,
    kills: 0,
    pearls: 0,
    soundOn: true,
    reducedMotion: false,
    quality: 1, // 1 = full, 0 = low (auto-degraded)

    input: { f: 0, b: 0, l: 0, r: 0, up: 0, down: 0, fire: false, sonar: false, boost: false },

    player: null,   // built by sim.initRun()
    zoneIndex: 0,
    inArena: false,

    counts: { fragment: 0, cell: 0 },
    gates: [],      // [{y, needs, open}]
    entities: [],   // pickups + hazards, flat list with .kind/.zone
    torpedoes: [],
    bolts: [],      // drone projectiles
    debris: [],
    sonar: { t: 99, x: 0, y: 0, z: 0 },     // t = seconds since last ping
    shake: 0,
    flash: 0,       // red damage vignette 0..1
    inkFactor: 0,   // 0..1 vision penalty
    grabbed: 0,     // seconds remaining of kraken grab

    boss: null,     // built when arena entered
    victoryT: 0,

    // transient UI queues (renderer drains these)
    popups: [],     // {text, id}
    toasts: [],     // {text, id}
    events: [],     // audio/visual cues for the renderer/audio: {type, ...}
};

let uid = 1;
export function popup(text) { S.popups.push({ text, id: uid++ }); if (S.popups.length > 4) S.popups.shift(); emit(); }
export function toast(text) { S.toasts.push({ text, id: uid++ }); if (S.toasts.length > 2) S.toasts.shift(); emit(); }
export function gameEvent(type, data) { S.events.push({ type, ...(data || {}) }); if (S.events.length > 24) S.events.shift(); }
export function drainEvents() { const e = S.events; S.events = []; return e; }

export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function emit() { listeners.forEach((fn) => fn()); }

export function setPhase(phase, reason) {
    S.phase = phase;
    if (reason !== undefined) S.overReason = reason;
    if (phase === 'gameover' || phase === 'victory') saveHigh();
    emit();
}

export function loadHigh() {
    try { S.high = parseInt(localStorage.getItem(HIGH_KEY), 10) || 0; } catch (e) { S.high = 0; }
}
export function saveHigh() {
    if (S.score > S.high) {
        S.high = Math.round(S.score);
        try { localStorage.setItem(HIGH_KEY, String(S.high)); } catch (e) { /* fine */ }
    }
}

export function freshPlayer() {
    return {
        x: 0, y: -16, z: 34,
        vx: 0, vy: 0, vz: 0,
        yaw: Math.PI,            // facing the reef center
        hull: BAL.hullMax, o2: BAL.o2Max, batt: BAL.battMax,
        iframe: 0, boostT: 0, boosting: false,
        sonarCd: 0, fireCd: 0,
        warned: { hull: false, o2: false, batt: false },
    };
}
