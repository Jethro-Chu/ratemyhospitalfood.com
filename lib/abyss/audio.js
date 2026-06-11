// ===========================================================================
// ABYSS PROTOCOL — synthesized deep-sea audio. Web Audio only, no files.
// Everything is guarded; if audio is unavailable the game ships silent.
// ===========================================================================

export default class AbyssAudio {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.master = null;
        this.noiseBuf = null;
        this.droneNodes = null;
        this.lastThud = 0;
    }

    init() {
        if (this.ctx) return;
        try {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return;
            this.ctx = new AC();
            this.master = this.ctx.createGain();
            this.master.gain.value = 0.55;
            this.master.connect(this.ctx.destination);
            // one shared white-noise buffer
            const len = this.ctx.sampleRate;
            this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
            const d = this.noiseBuf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        } catch (e) { this.ctx = null; }
    }

    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
    suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }
    setMuted(m) {
        this.muted = m;
        if (this.master) this.master.gain.value = m ? 0 : 0.55;
    }

    _osc(freq, dur, { type = 'sine', gain = 0.1, slideTo = null, delay = 0 } = {}) {
        if (!this.ctx || this.muted) return;
        const t = this.ctx.currentTime + delay;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, t);
        if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t + dur);
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(this.master);
        o.start(t); o.stop(t + dur + 0.05);
    }

    _noise(dur, { gain = 0.1, freq = 800, q = 1, delay = 0, slideTo = null } = {}) {
        if (!this.ctx || this.muted || !this.noiseBuf) return;
        const t = this.ctx.currentTime + delay;
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        src.loop = true;
        const f = this.ctx.createBiquadFilter();
        f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
        if (slideTo) f.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(f); f.connect(g); g.connect(this.master);
        src.start(t); src.stop(t + dur + 0.05);
    }

    // ---- cues ------------------------------------------------------------
    ping()      { this._osc(1180, 1.4, { gain: 0.07, slideTo: 640 }); this._osc(1180, 0.08, { gain: 0.05 }); }
    pingEcho()  { this._osc(840, 0.9, { gain: 0.025, slideTo: 500, delay: 0.45 }); }
    boost()     { this._noise(0.5, { gain: 0.07, freq: 300, slideTo: 1300, q: 0.8 }); }
    torpedo()   { this._noise(0.45, { gain: 0.09, freq: 900, slideTo: 200, q: 1.4 }); this._osc(160, 0.3, { type: 'square', gain: 0.03, slideTo: 70 }); }
    pickup()    { this._osc(620, 0.14, { type: 'triangle', gain: 0.07, slideTo: 980 }); }
    keyItem()   { [520, 700, 1040].forEach((f, i) => this._osc(f, 0.16, { type: 'triangle', gain: 0.06, delay: i * 0.09 })); }
    hit() {
        const now = performance.now();
        if (now - this.lastThud < 120) return;
        this.lastThud = now;
        this._noise(0.3, { gain: 0.12, freq: 220, slideTo: 80, q: 0.7 });
        this._osc(90, 0.25, { gain: 0.1, slideTo: 45 });
    }
    explosion() { this._noise(0.8, { gain: 0.16, freq: 400, slideTo: 60, q: 0.6 }); this._osc(70, 0.6, { gain: 0.14, slideTo: 30 }); }
    alarm()     { [0, 0.3].forEach((d) => this._osc(740, 0.18, { type: 'square', gain: 0.045, delay: d })); }
    zap()       { this._osc(1400, 0.18, { type: 'sawtooth', gain: 0.05, slideTo: 300 }); this._noise(0.12, { gain: 0.05, freq: 2400, q: 3 }); }
    roar() {
        this._osc(55, 1.8, { type: 'sawtooth', gain: 0.16, slideTo: 32 });
        this._osc(82, 1.6, { type: 'sawtooth', gain: 0.1, slideTo: 40, delay: 0.08 });
        this._noise(1.6, { gain: 0.08, freq: 150, slideTo: 60, q: 0.5 });
    }
    waveCue()   { this._osc(220, 0.7, { type: 'triangle', gain: 0.09, slideTo: 90 }); }
    grab()      { this._noise(0.9, { gain: 0.1, freq: 180, slideTo: 500, q: 0.8 }); }
    doorOpen()  { this._osc(120, 1.1, { type: 'square', gain: 0.05, slideTo: 60 }); this._noise(1.0, { gain: 0.05, freq: 220, slideTo: 90, q: 0.6 }); }
    gameOver()  { this._osc(240, 1.6, { type: 'sawtooth', gain: 0.09, slideTo: 50 }); this._osc(60, 1.2, { gain: 0.1, slideTo: 28, delay: 0.2 }); }
    victory()   { [392, 494, 587, 784, 988].forEach((f, i) => this._osc(f, 0.5, { type: 'triangle', gain: 0.07, delay: i * 0.14 })); }
    uiClick()   { this._osc(560, 0.06, { type: 'square', gain: 0.035, slideTo: 700 }); }
}
