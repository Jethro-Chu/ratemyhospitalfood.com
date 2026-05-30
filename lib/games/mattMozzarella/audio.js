/**
 * Tiny WebAudio sound effects — no files, no libraries.
 * Everything is guarded so it silently no-ops if AudioContext is missing
 * or blocked, and respects a mute toggle.
 */
export default class GameAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.ready = false;
    }

    // Must be called from a user gesture (button tap) to satisfy autoplay rules.
    init() {
        if (this.ready) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.ready = true;
        } catch {
            /* no audio available */
        }
    }

    setMuted(m) { this.muted = m; }

    _blip(freq, dur, type = 'square', gain = 0.08, slideTo = null) {
        if (this.muted || !this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    }

    jump()   { this._blip(440, 0.16, 'square',   0.06, 760); }
    coin()   { this._blip(880, 0.10, 'triangle', 0.06, 1320); }
    petal()  { this._blip(660, 0.22, 'triangle', 0.07, 1180); }
    sauce()  { this._blip(300, 0.12, 'sawtooth', 0.05, 160); }
    stomp()  { this._blip(520, 0.10, 'square',   0.06, 220); }
    hurt()   { this._blip(220, 0.28, 'sawtooth', 0.07, 90); }
    win()    { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this._blip(f, 0.18, 'triangle', 0.07), i * 110)); }
    select() { this._blip(600, 0.07, 'square', 0.05, 720); }
}
