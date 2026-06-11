/**
 * TrayDashEngine — an endless-runner engine for Tray Dash.
 * Pure canvas + requestAnimationFrame, fixed-timestep physics, no libraries.
 *
 * React owns the menus (start, how-to, pause, game over). The engine owns
 * the run itself and reports up via callbacks:
 *   onHud(hud)       — score / jello / shield / distance changed (throttled)
 *   onToast(payload) — brief NON-blocking notification ({speaker,text,sprite,id})
 *   onGameOver(res)  — run ended ({score, distFt, jello, best, newBest})
 *   onPause(bool)    — pause state changed (keyboard P/Esc or tab hidden)
 *
 * Difficulty: scroll speed ramps with distance, obstacle gaps tighten, and
 * new hazard types unlock in tiers — each introduced with a one-time hint
 * toast so kids learn the move before the game starts mixing combos.
 */

import { SPRITES, drawSprite } from './sprites';

export const VIEW_W = 480;
export const VIEW_H = 270;

const STEP = 1 / 60;          // fixed physics step (seconds)
const MAX_FRAME = 0.05;       // clamp huge tab-switch dt

// World layout (pixels)
const GROUND_Y = 232;         // floor top
const PLAYER_X = 84;          // hero's fixed screen x

// Hero physics (px, px/s)
const GRAVITY = 1650;
const MAX_FALL = 640;
const JUMP_V = 500;
const JUMP_CUT = 0.42;        // early-release velocity multiplier (tap = low hop)
const FAST_FALL = 1500;       // extra gravity while holding slide mid-air
const COYOTE = 0.08;
const BUFFER = 0.12;

// Hero hitboxes (slightly smaller than the sprites — forgiving, not cheap)
const STAND_W = 11, STAND_H = 13;
const SLIDE_W = 15, SLIDE_H = 6;

// Speed ramp: BASE at the start, approaching MAX as distance grows
const BASE_SPEED = 175;
const MAX_SPEED = 445;
const RAMP_PX = 14000;        // px to ~63% of the ramp

// Hazard geometry
const TRAY_Y = GROUND_Y - 20, TRAY_H = 9;    // head height: slide under
const WALL_TRAY_Y = GROUND_Y - 40;           // second tray of a tray wall
const CART_W = 30, CART_H = 32;
const VENT_W = 24, STEAM_W = 14, STEAM_H = 58;

const PX_PER_FT = 10;
const MILE_FT = 500;          // milestone interval
const BEST_KEY = 'trayDashBest';

export const SCORE = { jello: 15, fork: 75 };
export const MEDALS = [
    { name: 'Gold', ft: 3200, emoji: '🥇' },
    { name: 'Silver', ft: 1800, emoji: '🥈' },
    { name: 'Bronze', ft: 800, emoji: '🥉' },
];

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rnd = (a, b) => a + Math.random() * (b - a);
const aabb = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

// Weighted hazard patterns, unlocked by tier (tier = distance / 320ft, max 5)
const PATTERNS = [
    { id: 'puddle',         tier: 0, weight: 3 },
    { id: 'jelloLine',      tier: 0, weight: 2 },
    { id: 'meatball',       tier: 1, weight: 3 },
    { id: 'tray',           tier: 1, weight: 2 },
    { id: 'cart',           tier: 2, weight: 3 },
    { id: 'vent',           tier: 2, weight: 2 },
    { id: 'puddlePair',     tier: 2, weight: 2 },
    { id: 'trayWall',       tier: 3, weight: 2 },
    { id: 'trayThenPuddle', tier: 3, weight: 2 },
    { id: 'meatballPair',   tier: 4, weight: 2 },
    { id: 'cartTray',       tier: 4, weight: 2 },
    { id: 'gauntlet',       tier: 5, weight: 2 },
];

// One-time teaching toasts, shown when a hazard type first spawns
const HINTS = {
    meatball: 'Runaway meatball! It rolls AT you — jump a little early.',
    tray:     'Flying tray! Hold slide to duck under it.',
    cart:     'Lunch cart ahead — big jump, hold the button!',
    vent:     'Steam vents puff before they blast. Watch the rhythm!',
    trayWall: 'Tray wall! Sliding is the safe way through.',
};

const MILE_TEXT = [
    'Picking up speed — eyes on the floor!',
    'Lunch rush! Trays incoming!',
    'You’re cooking now. (Not literally. Stay safe.)',
    'The kitchen can’t believe it. Keep dashing!',
    'Legendary lunch runner!',
];

export default class TrayDashEngine {
    constructor(canvas, opts = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.opts = opts;
        this.audio = opts.audio || null;

        this.running = false;
        this.userPaused = false;
        this.raf = 0;
        this.acc = 0;
        this.last = 0;

        this.input = { jump: false, slide: false };
        this.prev = { jump: false, slide: false };
        this._toastId = 0;

        this.best = 0;
        try { this.best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0; } catch { /* private mode */ }

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onVisibility = this._onVisibility.bind(this);
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('visibilitychange', this._onVisibility);

        this._resetRun();
        this._render(); // paint an idle frame behind the start overlay
    }

    // ---- public API ------------------------------------------------------

    newRun() {
        this._resetRun();
        this.userPaused = false;
        this.running = true;
        this.last = 0;
        this.acc = 0;
        cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame((t) => this._loop(t));
        this._pushHud(true);
    }

    setInput(key, down) {
        this.input[key] = down;
    }

    pause() {
        if (!this.running || this.userPaused) return;
        this.userPaused = true;
        this.opts.onPause?.(true);
    }

    resume() {
        this.userPaused = false;
        this.last = 0; // don't count paused time as a physics step
    }

    togglePause() {
        if (!this.running) return;
        if (this.userPaused) {
            this.resume();
            this.opts.onPause?.(false);
        } else {
            this.pause();
        }
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.raf);
    }

    destroy() {
        this.stop();
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('visibilitychange', this._onVisibility);
    }

    distFt() { return Math.floor(this.scroll / PX_PER_FT); }

    // ---- input -----------------------------------------------------------

    _onKeyDown(e) {
        if (!this.running) return;
        switch (e.code) {
            case 'Space': case 'ArrowUp': case 'KeyW':
                this.input.jump = true; e.preventDefault(); break;
            case 'ArrowDown': case 'KeyS':
                this.input.slide = true; e.preventDefault(); break;
            case 'KeyP': case 'Escape':
                this.togglePause(); break;
            default: break;
        }
    }

    _onKeyUp(e) {
        switch (e.code) {
            case 'Space': case 'ArrowUp': case 'KeyW': this.input.jump = false; break;
            case 'ArrowDown': case 'KeyS': this.input.slide = false; break;
            default: break;
        }
    }

    _onVisibility() {
        if (document.hidden && this.running && !this.userPaused && this.dying <= 0) {
            this.pause();
        }
    }

    // ---- run state -------------------------------------------------------

    _resetRun() {
        this.scroll = 0;
        this.elapsed = 0;
        this.speed = BASE_SPEED;
        this.bonus = 0;
        this.jello = 0;
        this.shield = false;
        this.invuln = 0;
        this.dying = 0;
        this.shake = 0;
        this.lastMile = 0;
        this.hinted = {};
        this.sinceShieldFt = 0;
        this.lastShieldAtFt = 0;

        this.hazards = [];
        this.pickups = [];
        this.particles = [];
        this.nextX = VIEW_W + 140; // first obstacle arrives ~1.3s in

        this.player = {
            x: PLAYER_X, y: GROUND_Y - STAND_H, w: STAND_W, h: STAND_H,
            vy: 0, onGround: true, sliding: false, rot: 0,
            coyote: 0, buffer: 0, runT: 0,
        };

        this._hudT = 0;
        this._lastHud = null;
        this.prev = { jump: false, slide: false };
    }

    score() { return this.distFt() + this.bonus; }

    _speedAt() {
        return BASE_SPEED + (MAX_SPEED - BASE_SPEED) * (1 - Math.exp(-this.scroll / RAMP_PX));
    }

    _tier() { return Math.min(5, Math.floor(this.distFt() / 320)); }

    // ---- main loop -------------------------------------------------------

    _loop(t) {
        if (!this.running) return;
        this.raf = requestAnimationFrame((tt) => this._loop(tt));
        if (this.userPaused) { this.last = 0; return; }

        if (!this.last) this.last = t;
        let dt = Math.min((t - this.last) / 1000, MAX_FRAME);
        this.last = t;
        this.acc += dt;
        while (this.acc >= STEP) {
            this._update(STEP);
            this.acc -= STEP;
            if (!this.running) return;
        }
        this._render();
    }

    _update(dt) {
        this.elapsed += dt;

        // -- death animation: tot tumbles, world freezes ---------------------
        if (this.dying > 0) {
            this.dying -= dt;
            const p = this.player;
            p.vy = Math.min(p.vy + GRAVITY * dt, MAX_FALL);
            p.y += p.vy * dt;
            p.rot += 9 * dt;
            this._updateParticles(dt);
            this.shake = Math.max(0, this.shake - dt * 14);
            if (this.dying <= 0) this._finishRun();
            return;
        }

        // -- world scroll & spawning ----------------------------------------
        this.speed = this._speedAt();
        this.scroll += this.speed * dt;
        this._spawnAhead();
        this._milestones();

        // -- hero physics ----------------------------------------------------
        const p = this.player;
        const jumpPressed = this.input.jump && !this.prev.jump;
        if (jumpPressed) p.buffer = BUFFER;
        else p.buffer = Math.max(0, p.buffer - dt);
        p.coyote = p.onGround ? COYOTE : Math.max(0, p.coyote - dt);

        if (p.buffer > 0 && p.coyote > 0) {
            p.vy = -JUMP_V;
            p.onGround = false;
            p.sliding = false;
            p.coyote = 0;
            p.buffer = 0;
            this.audio?.jump();
            this._dust(4);
        }
        // tap-jump: cut upward velocity on early release
        if (!this.input.jump && p.vy < -JUMP_V * JUMP_CUT) p.vy = -JUMP_V * JUMP_CUT;

        if (!p.onGround) {
            const g = GRAVITY + (this.input.slide ? FAST_FALL : 0);
            p.vy = Math.min(p.vy + g * dt, MAX_FALL);
            p.y += p.vy * dt;
            if (p.y + STAND_H >= GROUND_Y) {
                p.y = GROUND_Y - STAND_H;
                p.vy = 0;
                p.onGround = true;
                this._dust(3);
            }
        }

        // slide state (ground only); jump above already cancels it
        if (p.onGround) {
            const wasSliding = p.sliding;
            p.sliding = this.input.slide;
            if (p.sliding && !wasSliding) this.audio?.slide();
        }
        p.w = p.sliding ? SLIDE_W : STAND_W;
        p.h = p.sliding ? SLIDE_H : STAND_H;
        if (p.onGround) p.y = GROUND_Y - p.h;
        p.runT += dt * (0.03 * this.speed);

        // -- hazards ----------------------------------------------------------
        for (const h of this.hazards) {
            if (h.type === 'meatball') {
                h.x += h.vx * dt;
                h.spin += dt * 10;
            } else if (h.type === 'vent') {
                h.t = (h.t + dt) % h.cyc;
            }
        }
        this.hazards = this.hazards.filter((h) => h.x + h.w > this.scroll - 60);
        this.pickups = this.pickups.filter((pk) => !pk.got && pk.x + pk.w > this.scroll - 60);

        // -- collisions -------------------------------------------------------
        this.invuln = Math.max(0, this.invuln - dt);
        const box = { x: this.scroll + p.x, y: p.y, w: p.w, h: p.h };

        if (this.invuln <= 0) {
            for (const h of this.hazards) {
                const hb = this._hazardBox(h);
                if (hb && aabb(box, hb)) { this._hit(h); break; }
            }
        }

        for (const pk of this.pickups) {
            if (!pk.got && aabb(box, pk)) this._collect(pk);
        }

        this._updateParticles(dt);
        this.shake = Math.max(0, this.shake - dt * 14);

        this.prev.jump = this.input.jump;
        this.prev.slide = this.input.slide;

        // -- throttled HUD push ----------------------------------------------
        this._hudT += dt;
        if (this._hudT >= 0.1) { this._hudT = 0; this._pushHud(); }
    }

    _hazardBox(h) {
        if (h.type === 'vent') {
            if (h.t < h.offT + h.warnT) return null; // only the blast hurts
            return { x: h.x + (VENT_W - STEAM_W) / 2, y: GROUND_Y - STEAM_H, w: STEAM_W, h: STEAM_H };
        }
        return h;
    }

    _hit(h) {
        if (this.shield) {
            this.shield = false;
            this.invuln = 1.2;
            this.shake = 0.7;
            this.audio?.shieldPop();
            this._burst(h.x - this.scroll + h.w / 2, h.y + h.h / 2, '#9fe4ef', 14);
            if (h.type !== 'vent') this.hazards = this.hazards.filter((o) => o !== h);
            this._toast('Jello Shield', 'Shield popped! That was close.', 'shield_bubble');
            this._pushHud(true);
            return;
        }
        this.dying = 0.95;
        this.shake = 1;
        this.player.vy = -330;
        this.player.onGround = false;
        this.audio?.crash();
        this._burst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#e08a3c', 18);
        this._burst(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#f9d077', 10);
    }

    _collect(pk) {
        pk.got = true;
        const px = pk.x - this.scroll + pk.w / 2;
        if (pk.type === 'jello') {
            this.jello += 1;
            this.bonus += SCORE.jello;
            this.audio?.jello();
            this._burst(px, pk.y + 4, '#ef4a64', 6);
        } else if (pk.type === 'fork') {
            this.bonus += SCORE.fork;
            this.audio?.fork();
            this._burst(px, pk.y + 5, '#f4b942', 12);
        } else if (pk.type === 'shield') {
            this.shield = true;
            this.audio?.shieldUp();
            this._burst(px, pk.y + 4, '#9fe4ef', 12);
            this._toast('Jello Shield', 'Shield on! One free bonk.', 'shield_bubble');
        }
        this._pushHud(true);
    }

    _milestones() {
        const mile = Math.floor(this.distFt() / MILE_FT);
        if (mile > this.lastMile) {
            this.lastMile = mile;
            this.audio?.milestone();
            const text = MILE_TEXT[Math.min(mile - 1, MILE_TEXT.length - 1)];
            this._toast('Cafeteria PA', `${mile * MILE_FT} ft! ${text}`, 'jello');
        }
    }

    _finishRun() {
        this.running = false;
        cancelAnimationFrame(this.raf);
        const score = this.score();
        const newBest = score > this.best;
        if (newBest) {
            this.best = score;
            try { localStorage.setItem(BEST_KEY, String(score)); } catch { /* ignore */ }
        }
        this._pushHud(true);
        this.opts.onGameOver?.({
            score,
            distFt: this.distFt(),
            jello: this.jello,
            best: this.best,
            newBest,
        });
    }

    // ---- spawning ----------------------------------------------------------

    _spawnAhead() {
        const aheadX = this.scroll + VIEW_W + 80;
        let guard = 0;
        while (this.nextX < aheadX && guard++ < 8) {
            const tier = this._tier();
            const pool = PATTERNS.filter((pt) => pt.tier <= tier);
            const total = pool.reduce((s, pt) => s + pt.weight, 0);
            let roll = Math.random() * total;
            let pick = pool[0];
            for (const pt of pool) { roll -= pt.weight; if (roll <= 0) { pick = pt; break; } }

            const w = this._placePattern(pick.id, this.nextX, tier);

            // breathing room scales with speed and shrinks as tiers climb
            const gapT = 0.92 - tier * 0.055 + Math.random() * 0.3;
            this.nextX += w + Math.max(130, this.speed * gapT);

            this._maybePlaceShield();
        }
    }

    _hint(id) {
        if (this.hinted[id] || !HINTS[id]) return;
        this.hinted[id] = true;
        this._toast('Cafeteria PA', HINTS[id], 'tot_run1');
    }

    /** Place a pattern at world x; returns the width it consumed. */
    _placePattern(id, x, tier) {
        switch (id) {
            case 'puddle': {
                const w = this._puddle(x);
                if (Math.random() < 0.5) this._jelloArc(x + w / 2);
                return w;
            }
            case 'jelloLine': {
                const n = 4 + Math.floor(Math.random() * 2);
                for (let i = 0; i < n; i++) this._pickup('jello', x + i * 18, GROUND_Y - 18);
                return n * 18;
            }
            case 'meatball': this._hint('meatball'); return this._meatball(x, tier);
            case 'tray':     this._hint('tray');     return this._tray(x, TRAY_Y);
            case 'cart': {
                this._hint('cart');
                const w = this._cart(x);
                if (Math.random() < 0.3) this._pickup('fork', x + w / 2 - 3, GROUND_Y - 70);
                return w;
            }
            case 'vent': this._hint('vent'); return this._vent(x);
            case 'puddlePair': {
                const w1 = this._puddle(x);
                const gap = this.speed * 0.5;
                const w2 = this._puddle(x + w1 + gap);
                return w1 + gap + w2;
            }
            case 'trayWall': {
                this._hint('trayWall');
                this._tray(x, TRAY_Y);
                this._tray(x, WALL_TRAY_Y);
                if (Math.random() < 0.3) this._pickup('fork', x + 6, GROUND_Y - 74);
                return 22;
            }
            case 'trayThenPuddle': {
                this._tray(x, TRAY_Y);
                const gap = 22 + this.speed * 0.5;
                return gap + this._puddle(x + gap);
            }
            case 'meatballPair': {
                this._meatball(x, tier);
                this._meatball(x + 58, tier);
                return 71;
            }
            case 'cartTray': {
                const w = this._cart(x);
                const gap = this.speed * 0.55;
                this._tray(x + w + gap, TRAY_Y);
                return w + gap + 22;
            }
            case 'gauntlet': {
                let cx = x;
                cx += this._puddle(cx) + this.speed * 0.55;
                this._tray(cx, TRAY_Y);
                this._tray(cx, WALL_TRAY_Y);
                cx += 22 + this.speed * 0.5;
                cx += this._meatball(cx, tier);
                this._jelloArc(x + (cx - x) / 2);
                return cx - x;
            }
            default: return 30;
        }
    }

    _puddle(x) {
        const w = rnd(26, 44);
        this.hazards.push({ type: 'puddle', x, y: GROUND_Y - 5, w, h: 5, seed: Math.random() * 9 });
        return w;
    }

    _meatball(x, tier) {
        this.hazards.push({
            type: 'meatball', x, y: GROUND_Y - 11, w: 12, h: 11,
            vx: -(60 + tier * 16 + rnd(0, 20)), spin: 0,
        });
        return 13;
    }

    _tray(x, y) {
        this.hazards.push({ type: 'tray', x, y, w: 20, h: TRAY_H, seed: Math.random() * 9 });
        return 22;
    }

    _cart(x) {
        this.hazards.push({ type: 'cart', x, y: GROUND_Y - CART_H, w: CART_W, h: CART_H });
        return CART_W;
    }

    _vent(x) {
        this.hazards.push({
            type: 'vent', x, y: GROUND_Y - 4, w: VENT_W, h: 4,
            offT: rnd(1.2, 1.7), warnT: 0.35, onT: 0.65,
            cyc: 0, t: rnd(0, 2),
        });
        const v = this.hazards[this.hazards.length - 1];
        v.cyc = v.offT + v.warnT + v.onT;
        return VENT_W;
    }

    _jelloArc(cx) {
        const ys = [GROUND_Y - 48, GROUND_Y - 58, GROUND_Y - 48];
        ys.forEach((y, i) => this._pickup('jello', cx + (i - 1) * 16 - 4, y));
    }

    _pickup(type, x, y) {
        const dims = { jello: [8, 9], fork: [7, 10], shield: [10, 8] };
        const [w, h] = dims[type];
        this.pickups.push({ type, x, y, w, h, got: false });
    }

    _maybePlaceShield() {
        const ft = this.distFt();
        if (this.shield || ft - this.lastShieldAtFt < 700 || Math.random() > 0.3) return;
        this.lastShieldAtFt = ft;
        this._pickup('shield', this.nextX - 60, GROUND_Y - 42);
    }

    // ---- particles / toasts ------------------------------------------------

    _dust(n) {
        for (let i = 0; i < n; i++) {
            this.particles.push({
                x: this.player.x + rnd(0, 8), y: GROUND_Y - 2,
                vx: rnd(-50, -10), vy: rnd(-40, -5),
                life: rnd(0.2, 0.4), size: rnd(1, 2.5), color: '#d8c19a',
            });
        }
    }

    _burst(x, y, color, n) {
        for (let i = 0; i < n; i++) {
            const a = rnd(0, Math.PI * 2), s = rnd(40, 130);
            this.particles.push({
                x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40,
                life: rnd(0.3, 0.6), size: rnd(1.5, 3), color,
            });
        }
    }

    _updateParticles(dt) {
        for (const pt of this.particles) {
            pt.life -= dt;
            pt.x += pt.vx * dt;
            pt.y += pt.vy * dt;
            pt.vy += 300 * dt;
        }
        this.particles = this.particles.filter((pt) => pt.life > 0);
    }

    _toast(speaker, text, sprite) {
        this.opts.onToast?.({ speaker, text, sprite, id: ++this._toastId });
    }

    _pushHud(force = false) {
        const hud = {
            score: this.score(),
            distFt: this.distFt(),
            jello: this.jello,
            shield: this.shield,
            best: this.best,
        };
        const key = `${hud.score}|${hud.jello}|${hud.shield}`;
        if (!force && key === this._lastHud) return;
        this._lastHud = key;
        this.opts.onHud?.(hud);
    }

    // ---- rendering ---------------------------------------------------------

    _rect(x, y, w, h, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }

    _render() {
        const ctx = this.ctx;
        ctx.save();
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake * 5, (Math.random() - 0.5) * this.shake * 5);
        }

        this._drawBackground();

        for (const h of this.hazards) {
            const sx = h.x - this.scroll;
            if (sx > VIEW_W + 30 || sx + h.w < -30) continue;
            if (h.type === 'puddle') this._drawPuddle(h, sx);
            else if (h.type === 'meatball') this._drawMeatball(h, sx);
            else if (h.type === 'tray') this._drawTray(h, sx);
            else if (h.type === 'cart') this._drawCart(h, sx);
            else if (h.type === 'vent') this._drawVent(h, sx);
        }

        for (const pk of this.pickups) {
            const sx = pk.x - this.scroll;
            if (pk.got || sx > VIEW_W + 20 || sx + pk.w < -20) continue;
            const bob = Math.sin(this.elapsed * 4 + pk.x * 0.05) * 2;
            const spr = pk.type === 'jello' ? SPRITES.jello
                : pk.type === 'fork' ? SPRITES.golden_fork : SPRITES.shield_bubble;
            drawSprite(ctx, spr, sx, pk.y + bob);
        }

        this._drawPlayer();

        for (const pt of this.particles) {
            ctx.globalAlpha = clamp(pt.life * 3, 0, 1);
            this._rect(pt.x, pt.y, pt.size, pt.size, pt.color);
        }
        ctx.globalAlpha = 1;

        // speed streaks once the rush kicks in
        if (this.speed > 340 && this.dying <= 0) {
            ctx.globalAlpha = 0.18;
            for (let i = 0; i < 5; i++) {
                const y = 40 + ((i * 47 + Math.floor(this.scroll * 1.6)) % 180);
                const x = VIEW_W - ((this.scroll * 2.2 + i * 160) % (VIEW_W + 80));
                this._rect(x, y, 36 + i * 6, 1, '#ffffff');
            }
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    _drawBackground() {
        // wall
        this._rect(0, 0, VIEW_W, GROUND_Y, '#f8e9c9');
        this._rect(0, 0, VIEW_W, 14, '#e7cfa4'); // ceiling strip

        // hanging lights (slow parallax)
        const lightGap = 150;
        let off = (this.scroll * 0.55) % lightGap;
        for (let x = -off; x < VIEW_W + lightGap; x += lightGap) {
            this._rect(x + 20, 14, 2, 14, '#b08c54');
            this._rect(x + 13, 28, 16, 7, '#e9b94d');
            this._rect(x + 15, 35, 12, 2, '#fff3c9');
        }

        // windows (far parallax)
        const winGap = 200;
        off = (this.scroll * 0.22) % winGap;
        for (let x = -off; x < VIEW_W + winGap; x += winGap) {
            this._rect(x + 60, 38, 50, 44, '#caa36b');
            this._rect(x + 63, 41, 44, 38, '#cdeaf4');
            this._rect(x + 84, 41, 2, 38, '#caa36b');
            this._rect(x + 63, 59, 44, 2, '#caa36b');
        }

        // serving counter (mid parallax)
        const cGap = 130;
        this._rect(0, 150, VIEW_W, 46, '#dab476');
        this._rect(0, 150, VIEW_W, 5, '#b9854a');
        off = (this.scroll * 0.5) % cGap;
        for (let x = -off; x < VIEW_W + cGap; x += cGap) {
            // pot with dome lid on the counter
            this._rect(x + 30, 138, 26, 12, '#9aa3b5');
            this._rect(x + 33, 132, 20, 6, '#b9c2d4');
            this._rect(x + 41, 129, 4, 3, '#7d8496');
            // counter door seams
            this._rect(x + 12, 162, 2, 30, '#bb9258');
        }

        // wall skirting + floor
        this._rect(0, GROUND_Y - 4, VIEW_W, 4, '#c79b5e');
        const tile = 24;
        off = this.scroll % (tile * 2);
        for (let i = 0; i * tile - off < VIEW_W + tile; i++) {
            this._rect(i * tile - off, GROUND_Y, tile, VIEW_H - GROUND_Y, i % 2 === 0 ? '#f0e1c0' : '#e0caa0');
        }
        this._rect(0, GROUND_Y, VIEW_W, 2, '#b98d52');
    }

    _drawPuddle(h, sx) {
        const wob = Math.sin(this.elapsed * 3 + h.seed) * 1.5;
        this._rect(sx + 2, GROUND_Y - 3, h.w - 4, 3, '#b86327');
        this._rect(sx, GROUND_Y - 2, h.w + wob, 2, '#e08a3c');
        this._rect(sx + 4, GROUND_Y - 4, h.w * 0.4, 2, '#e08a3c');
        this._rect(sx + h.w * 0.25, GROUND_Y - 3, 4, 1, '#f6c46a'); // glint
    }

    _drawMeatball(h, sx) {
        const squash = 1 + Math.sin(h.spin * 2) * 0.04;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(Math.round(sx + h.w / 2), Math.round(h.y + h.h / 2));
        ctx.scale(squash, 1 / squash);
        drawSprite(ctx, SPRITES.meatball_roll, -6, -5);
        ctx.restore();
        // little dust kick behind it
        this._rect(sx + h.w + 2, GROUND_Y - 2, 3, 2, '#d8c19a');
    }

    _drawTray(h, sx) {
        const bob = Math.sin(this.elapsed * 6 + h.seed) * 1.5;
        drawSprite(this.ctx, SPRITES.tray_fly, sx, h.y + bob);
        // whoosh lines
        this.ctx.globalAlpha = 0.35;
        this._rect(sx + h.w + 2, h.y + 4 + bob, 10, 1, '#828ca3');
        this._rect(sx + h.w + 5, h.y + 7 + bob, 7, 1, '#828ca3');
        this.ctx.globalAlpha = 1;
    }

    _drawCart(h, sx) {
        const y = h.y;
        this._rect(sx + 2, y + 26, 5, 5, '#4d5263');       // wheels
        this._rect(sx + CART_W - 7, y + 26, 5, 5, '#4d5263');
        this._rect(sx, y + 8, CART_W, 19, '#b9c2d4');      // body
        this._rect(sx, y + 8, CART_W, 3, '#e6ebf5');
        this._rect(sx + 3, y + 14, CART_W - 6, 2, '#828ca3');
        this._rect(sx + 3, y + 20, CART_W - 6, 2, '#828ca3');
        this._rect(sx + 4, y + 2, CART_W - 8, 6, '#9aa3b5'); // dome lid
        this._rect(sx + 7, y, CART_W - 14, 3, '#b9c2d4');
        this._rect(sx + CART_W / 2 - 1, y - 2, 3, 3, '#7d8496');
    }

    _drawVent(h, sx) {
        // floor grate
        this._rect(sx, GROUND_Y - 3, VENT_W, 3, '#6b4a2a');
        for (let i = 0; i < 4; i++) this._rect(sx + 3 + i * 6, GROUND_Y - 2, 3, 1, '#3f2c16');

        const phase = h.t < h.offT ? 'off' : h.t < h.offT + h.warnT ? 'warn' : 'on';
        const cx = sx + VENT_W / 2;
        if (phase === 'warn') {
            const k = (h.t - h.offT) / h.warnT;
            this.ctx.globalAlpha = 0.7;
            this._rect(cx - 2, GROUND_Y - 8 - k * 8, 4, 4, '#ffffff');
            this._rect(cx + 3, GROUND_Y - 5 - k * 5, 3, 3, '#fff3c9');
            this.ctx.globalAlpha = 1;
        } else if (phase === 'on') {
            const k = Math.min(1, (h.t - h.offT - h.warnT) / 0.12); // blast grows in fast
            const hgt = STEAM_H * k;
            this.ctx.globalAlpha = 0.85;
            for (let i = 0; i < 6; i++) {
                const seg = hgt / 6;
                const w = STEAM_W - 3 + Math.sin(this.elapsed * 14 + i) * 3;
                this._rect(cx - w / 2, GROUND_Y - seg * (i + 1), w, seg + 1, i % 2 ? '#ffffff' : '#f3ece1');
            }
            this.ctx.globalAlpha = 1;
        }
    }

    _drawPlayer() {
        const p = this.player;
        if (this.invuln > 0 && Math.floor(this.elapsed * 18) % 2 === 0 && this.dying <= 0) return;

        const ctx = this.ctx;
        let spr;
        if (p.sliding) spr = SPRITES.tot_slide;
        else if (!p.onGround) spr = SPRITES.tot_jump;
        else spr = Math.floor(p.runT) % 2 === 0 ? SPRITES.tot_run1 : SPRITES.tot_run2;

        // sprite is a touch bigger than the hitbox; anchor to its bottom-centre
        const dx = p.x + p.w / 2 - spr.w / 2;
        const dy = p.y + p.h - spr.h;

        if (this.dying > 0) {
            ctx.save();
            ctx.translate(Math.round(p.x + p.w / 2), Math.round(p.y + p.h / 2));
            ctx.rotate(p.rot);
            drawSprite(ctx, SPRITES.tot_jump, -spr.w / 2, -spr.h / 2);
            ctx.restore();
            return;
        }

        drawSprite(ctx, spr, dx, dy);

        // shield aura
        if (this.shield) {
            ctx.globalAlpha = 0.4 + Math.sin(this.elapsed * 6) * 0.15;
            ctx.strokeStyle = '#5fc8da';
            ctx.lineWidth = 2;
            ctx.strokeRect(Math.round(dx) - 3, Math.round(dy) - 3, spr.w + 6, spr.h + 6);
            ctx.globalAlpha = 1;
        }
    }
}
