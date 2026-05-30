/**
 * GameEngine — a compact 2D platformer engine for Matt Mozzarella.
 * Pure canvas + requestAnimationFrame, fixed-timestep physics, no libraries.
 *
 * React owns the high-level screens (start, intro, pause menu, level complete,
 * cutscenes). The engine owns the playable world and reports up via callbacks:
 *   onHud(hud)         — hearts / score / crumbs / level name changed
 *   onToast(payload)   — show a brief, NON-blocking notification
 *                        ({speaker,text,sprite,id}); gameplay never pauses.
 *   onReachGoal()      — Matt touched the level goal (play end cutscene)
 *   onGameOver()       — hearts hit 0
 *   onPause(bool)      — pause state changed (keyboard P/Esc)
 */

import { SPRITES, drawSprite } from './sprites';
import { GROUND_Y, SCORE } from './levels';

const VIEW_W = 480;
const VIEW_H = 270;
const STEP = 1 / 60;          // fixed physics step (seconds)
const MAX_FRAME = 0.05;       // clamp huge tab-switch dt

// Tunables (pixels, velocities in px/sec where noted)
const GRAVITY = 1400;
const MAX_FALL = 520;
const MOVE_ACCEL = 1500;
const MAX_RUN = 150;
const GROUND_FRICTION = 1200;
const JUMP_V = 455;
const STOMP_BOUNCE = 300;
const MUSH_BOUNCE = 560;
const PAD_BOUNCE = 520;
const SAUCE_SPEED = 300;
const SAUCE_COOLDOWN = 0.32;
const INVULN_TIME = 1.4;
const PIT_Y = 340;
const LAUNCH_V = 600;          // sauce launcher pop
const WIND_MAX = MAX_RUN * 1.7; // wider speed cap while inside a gust
const BOSS_ROLL = [42, 66, 94]; // boss roll speed per phase (px/s)
const BOSS_HITS = [3, 3, 3];    // sauce hits to end each phase

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const aabb = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export default class GameEngine {
    constructor(canvas, opts = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.opts = opts;
        this.audio = opts.audio || null;

        this.running = false;
        this.userPaused = false;  // pause menu (the only thing that freezes the sim)
        this.raf = 0;
        this.acc = 0;
        this.last = 0;
        this.elapsed = 0;

        this.input = { left: false, right: false, jump: false, sauce: false };
        this.prev = { jump: false, sauce: false };

        this.goalReached = false;
        this._toastId = 0;

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    // ---- public API ------------------------------------------------------

    loadLevel(level) {
        this.level = level;
        this.theme = level.theme || {};
        this.elapsed = 0;
        this.goalReached = false;
        this.score = 0;
        this.hearts = 3;
        this.crumbs = 0;
        this.totalCrumbs = (level.petals || []).length;
        this.lastCheckpoint = { ...level.spawn };

        // Clone mutable level objects so retries reset cleanly
        this.platforms = (level.platforms || []).map((p) => ({ ...p, broken: false }));
        this.mushrooms = (level.mushrooms || []).map((m) => ({ ...m, w: 36, h: 12, squish: 0 }));
        this.geysers = (level.geysers || []).map((g) => ({ ...g, curH: 0, on: false }));
        this.enemies = (level.enemies || []).map((e) => ({
            ...e, w: 16,
            h: e.type === 'meatball' ? 16 : (e.type === 'pickle' ? 17 : 14),
            dir: -1, alive: true, poof: 0,
            shootCd: 1.2 + Math.random() * 1.3,
        }));
        this.coins = (level.coins || []).map((c) => ({ ...c, w: 8, h: 8, got: false }));
        this.petals = (level.petals || []).map((p) => ({ ...p, w: 7, h: 6, got: false }));
        this.cookie = level.cookie ? { ...level.cookie, w: 9, h: 9, got: false } : null;
        this.triggers = (level.triggers || []).map((t) => ({ ...t, fired: false }));
        this.projectiles = [];
        this.particles = [];

        // Level 2 systems (all optional — absent on Level 1)
        this.winds = (level.winds || []).map((w) => ({ ...w }));
        this.pipes = (level.pipes || []).map((pp) => ({ ...pp }));
        this.enemyShots = [];
        this.warpCd = 0;
        this.shake = 0;
        this.boss = level.miniBoss ? this._makeBoss(level.miniBoss) : null;

        this.player = {
            x: level.spawn.x, y: level.spawn.y, w: 13, h: 18,
            vx: 0, vy: 0, onGround: false, facing: 1,
            invuln: 0, sauceCd: 0, jumpHeld: false, anim: 0, hasCookie: false,
        };

        this.cam = { x: 0, y: 0 };
        this._emitHud();
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.last = performance.now();
        this.acc = 0;
        this.raf = requestAnimationFrame(this._loop.bind(this));
    }

    stop() {
        this.running = false;
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = 0;
    }

    destroy() {
        this.stop();
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    setInput(key, val) {
        if (key in this.input) this.input[key] = val;
    }

    togglePause() {
        if (this.goalReached) return;
        this.userPaused = !this.userPaused;
        this.opts.onPause?.(this.userPaused);
    }
    pause() { this.userPaused = true; }
    resume() { this.userPaused = false; }

    // Non-blocking notification — surfaces flavor/tutorial/story text WITHOUT
    // freezing gameplay. React shows it as a brief auto-dismissing toast.
    _toast(speaker, text, sprite = null) {
        if (!text) return;
        this.opts.onToast?.({ speaker, text, sprite, id: ++this._toastId });
    }

    // ---- input handlers --------------------------------------------------

    _onKeyDown(e) {
        const k = e.key.toLowerCase();
        if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(k)) e.preventDefault();
        if (k === 'a' || k === 'arrowleft') this.input.left = true;
        else if (k === 'd' || k === 'arrowright') this.input.right = true;
        else if (k === 'w' || k === 'arrowup' || k === ' ') this.input.jump = true;
        else if (k === 'j' || k === 'k') this.input.sauce = true;
        else if (k === 'p' || k === 'escape') this.togglePause();
    }

    _onKeyUp(e) {
        const k = e.key.toLowerCase();
        if (k === 'a' || k === 'arrowleft') this.input.left = false;
        else if (k === 'd' || k === 'arrowright') this.input.right = false;
        else if (k === 'w' || k === 'arrowup' || k === ' ') this.input.jump = false;
        else if (k === 'j' || k === 'k') this.input.sauce = false;
    }

    // ---- main loop -------------------------------------------------------

    _loop(now) {
        if (!this.running) return;
        let dt = (now - this.last) / 1000;
        this.last = now;
        if (dt > MAX_FRAME) dt = MAX_FRAME;

        const active = !this.userPaused && !this.goalReached;
        if (active) {
            this.acc += dt;
            let steps = 0;
            while (this.acc >= STEP && steps < 5) {
                this._step(STEP);
                this.acc -= STEP;
                steps += 1;
            }
        }
        this._render();
        this.raf = requestAnimationFrame(this._loop.bind(this));
    }

    // ---- simulation ------------------------------------------------------

    _step(dt) {
        this.elapsed += dt;
        const p = this.player;

        const jumpPressed = this.input.jump && !this.prev.jump;
        const saucePressed = this.input.sauce && !this.prev.sauce;

        // Horizontal movement
        const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
        if (dir !== 0) {
            p.vx += dir * MOVE_ACCEL * dt;
            p.facing = dir;
        } else {
            // friction toward 0
            const f = GROUND_FRICTION * dt;
            if (p.vx > 0) p.vx = Math.max(0, p.vx - f);
            else if (p.vx < 0) p.vx = Math.min(0, p.vx + f);
        }
        p.vx = clamp(p.vx, -MAX_RUN, MAX_RUN);

        // Jump
        if (jumpPressed && p.onGround) {
            p.vy = -JUMP_V;
            p.onGround = false;
            p.jumpHeld = true;
            this.audio?.jump();
        }
        if (!this.input.jump && p.jumpHeld && p.vy < 0) {
            p.vy *= 0.5; // variable jump height
            p.jumpHeld = false;
        }

        // Gravity
        p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);

        // Parmesan wind gusts — push horizontally and/or let Matt float
        for (const w of this.winds) {
            if (!aabb(p, w)) continue;
            if (w.ax) p.vx += w.ax * dt;
            if (w.ay) p.vy = Math.max(p.vy + w.ay * dt, w.minVy ?? -210);
            if (Math.random() < 0.25) {
                this.particles.push({ x: p.x + Math.random() * 14, y: p.y + Math.random() * 16, vx: (w.ax || 0) * 0.012 + 30, vy: -8, life: 0.4, color: '#fff0c0', size: 1 });
            }
        }
        p.vx = clamp(p.vx, -WIND_MAX, WIND_MAX);

        // Integrate + collide (X then Y)
        this._moveX(p, p.vx * dt);
        const prevBottom = p.y + p.h;
        p.onGround = false;
        this._moveY(p, p.vy * dt, prevBottom);

        // Animation
        if (!p.onGround) p.anim = 2; // jump frame
        else if (Math.abs(p.vx) > 8) p.anim = (this.elapsed * 8) % 2 < 1 ? 1 : 0;
        else p.anim = 0;

        // Sauce throw
        if (p.sauceCd > 0) p.sauceCd -= dt;
        if (saucePressed && p.sauceCd <= 0) {
            this.projectiles.push({
                x: p.x + (p.facing > 0 ? p.w : -4), y: p.y + 6,
                w: 5, h: 5, vx: p.facing * SAUCE_SPEED, vy: -40, life: 1.1,
            });
            p.sauceCd = SAUCE_COOLDOWN;
            this.audio?.sauce();
        }

        if (p.invuln > 0) p.invuln -= dt;

        this._updateProjectiles(dt);
        this._updateEnemies(dt);
        this._updateEnemyShots(dt);
        this._updateGeysers();
        this._updateMushrooms(dt);
        if (this.boss) this._updateBoss(dt);
        this._updatePipes(dt);
        this._collectibles();
        this._checkTriggers();
        this._checkpoints();
        this._particles(dt);
        if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);

        // Pit
        if (p.y > PIT_Y) this._damage(true);

        // Goal
        if (!this.goalReached && this.level.goal && aabb(p, this.level.goal)) {
            this.goalReached = true;
            this.audio?.win();
            this.opts.onReachGoal?.();
        }

        // Camera
        this.cam.x = clamp(p.x + p.w / 2 - VIEW_W / 2, 0, Math.max(0, this.level.width - VIEW_W));

        this.prev.jump = this.input.jump;
        this.prev.sauce = this.input.sauce;
    }

    _solids() {
        return this.platforms.filter((pl) => !pl.broken && (
            pl.type === 'solid' || pl.type === 'breakable' || pl.type === 'ramp' || pl.type === 'parmesan'
        ));
    }

    _moveX(p, dx) {
        p.x += dx;
        for (const pl of this._solids()) {
            if (!aabb(p, pl)) continue;
            if (dx > 0) p.x = pl.x - p.w;
            else if (dx < 0) p.x = pl.x + pl.w;
            p.vx = 0;
        }
        p.x = clamp(p.x, 0, this.level.width - p.w);
    }

    _moveY(p, dy, prevBottom) {
        p.y += dy;
        // Solids + breakables
        for (const pl of this.platforms) {
            if (pl.broken) continue;
            if (pl.type === 'oneway' || pl.type === 'bounce') continue;
            if (!aabb(p, pl)) continue;
            if (dy > 0) {
                p.y = pl.y - p.h; p.vy = 0; p.onGround = true;
            } else if (dy < 0) {
                p.y = pl.y + pl.h; p.vy = 0;
                if (pl.type === 'breakable') { this._breakBlock(pl); }
            }
        }
        // One-way platforms (land only when falling onto top)
        if (dy > 0) {
            for (const pl of this.platforms) {
                if (pl.broken || (pl.type !== 'oneway' && pl.type !== 'vine')) continue;
                if (!aabb(p, pl)) continue;
                if (prevBottom <= pl.y + 4) { p.y = pl.y - p.h; p.vy = 0; p.onGround = true; }
            }
            // Bounce pads (ravioli)
            for (const pl of this.platforms) {
                if (pl.broken || pl.type !== 'bounce') continue;
                if (!aabb(p, pl)) continue;
                if (prevBottom <= pl.y + 6) {
                    p.y = pl.y - p.h; p.vy = -PAD_BOUNCE; p.onGround = false;
                    this._poof(pl.x + pl.w / 2, pl.y, '#ffd0a0', 5);
                    this.audio?.jump();
                }
            }
            // Mushroom caps
            for (const m of this.mushrooms) {
                if (!aabb(p, m)) continue;
                if (prevBottom <= m.y + 6) {
                    p.y = m.y - p.h; p.vy = -MUSH_BOUNCE; p.onGround = false;
                    m.squish = 0.18;
                    this.audio?.jump();
                }
            }
        }
    }

    _breakBlock(pl) {
        pl.broken = true;
        this._poof(pl.x + 8, pl.y + 8, '#e8cf8f', 8);
        this.score += SCORE.coin;
        this.audio?.coin();
        this._emitHud();
    }

    _updateProjectiles(dt) {
        for (const pr of this.projectiles) {
            pr.x += pr.vx * dt;
            pr.y += pr.vy * dt;
            pr.vy += 320 * dt;
            pr.life -= dt;
            // hit breakable blocks
            for (const pl of this.platforms) {
                if (!pl.broken && pl.type === 'breakable' && aabb(pr, pl)) {
                    this._breakBlock(pl); pr.life = 0;
                }
            }
            // hit enemies
            for (const e of this.enemies) {
                if (e.alive && aabb(pr, e)) { this._defeat(e); pr.life = 0; }
            }
            // hit mini-boss
            if (this.boss && this.boss.state === 'rolling' && aabb(pr, this.boss)) {
                this._hitBoss(); pr.life = 0;
            }
        }
        this.projectiles = this.projectiles.filter((pr) => pr.life > 0 &&
            pr.x > this.cam.x - 40 && pr.x < this.cam.x + VIEW_W + 40);
    }

    _updateEnemies(dt) {
        const p = this.player;
        for (const e of this.enemies) {
            if (e.poof > 0) { e.poof -= dt; continue; }
            if (!e.alive) continue;
            e.x += e.dir * e.speed * dt;
            if (e.x <= e.minX) { e.x = e.minX; e.dir = 1; }
            else if (e.x + e.w >= e.maxX) { e.x = e.maxX - e.w; e.dir = -1; }

            // Sour Pickle Guard lobs vinegar drops at nearby Matt
            if (e.type === 'pickle') {
                e.shootCd -= dt;
                if (e.shootCd <= 0 && Math.abs(p.x - e.x) < 180) {
                    e.shootCd = 2.3;
                    const dir = p.x < e.x ? -1 : 1;
                    this.enemyShots.push({ x: e.x + 6, y: e.y + 3, w: 5, h: 6, vx: dir * 118, vy: -160, life: 2.4 });
                }
            }

            if (p.invuln <= 0 && aabb(p, e)) {
                const pBottomPrev = p.y + p.h - p.vy * STEP;
                if (p.vy > 0 && pBottomPrev <= e.y + 8) {
                    this._defeat(e);
                    p.vy = -STOMP_BOUNCE;
                    p.y = e.y - p.h;
                } else {
                    this._damage(false);
                }
            }
        }
    }

    _defeat(e) {
        e.alive = false;
        e.poof = 0.35;
        this._poof(e.x + e.w / 2, e.y + e.h / 2, '#fff0c0', 10);
        this.score += SCORE.enemy;
        this.audio?.stomp();
        this._emitHud();
    }

    _updateGeysers() {
        for (const g of this.geysers) {
            const phase = (this.elapsed * 1000 + (g.phase || 0)) % g.period;
            g.on = phase < g.onTime;
            // ramp height in/out for readability
            const ramp = 220;
            let h;
            if (!g.on) h = 0;
            else if (phase < ramp) h = (phase / ramp) * g.maxH;
            else if (phase > g.onTime - ramp) h = ((g.onTime - phase) / ramp) * g.maxH;
            else h = g.maxH;
            g.curH = Math.max(0, h);
            if (g.curH > 8) {
                const jet = { x: g.x, y: g.y - g.curH, w: g.w, h: g.curH };
                if (g.kind === 'launch') {
                    // Friendly sauce launcher — pops Matt upward, no damage
                    if (aabb(this.player, jet)) { this.player.vy = -LAUNCH_V; this.player.onGround = false; }
                } else if (this.player.invuln <= 0 && aabb(this.player, jet)) {
                    this._damage(false); // 'sauce' / 'noodle' hazards hurt
                }
            }
        }
    }

    _updateMushrooms(dt) {
        for (const m of this.mushrooms) if (m.squish > 0) m.squish = Math.max(0, m.squish - dt);
    }

    _updateEnemyShots(dt) {
        const p = this.player;
        for (const s of this.enemyShots) {
            s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 360 * dt; s.life -= dt;
            if (p.invuln <= 0 && aabb(p, s)) { s.life = 0; this._damage(false); }
            else {
                for (const pl of this._solids()) { if (aabb(s, pl)) { s.life = 0; break; } }
            }
        }
        this.enemyShots = this.enemyShots.filter((s) => s.life > 0 && s.y < PIT_Y);
    }

    _updatePipes(dt) {
        if (this.warpCd > 0) { this.warpCd -= dt; return; }
        const p = this.player;
        for (const pp of this.pipes) {
            if (!pp.dest) continue;
            if (aabb(p, { x: pp.x, y: pp.y, w: pp.w, h: pp.h })) {
                this._poof(p.x + p.w / 2, p.y + p.h / 2, '#7ad08a', 12);
                p.x = pp.dest.x; p.y = pp.dest.y; p.vx = 0; p.vy = 0;
                this.warpCd = 0.9;
                this.audio?.coin();
                break;
            }
        }
    }

    // ---- mini-boss: General Meatballo ------------------------------------

    _makeBoss(b) {
        return {
            name: b.name || 'General Meatballo',
            x: b.x, y: b.y, w: 30, h: 28,
            vx: 0, vy: 0, dir: -1, onGround: true,
            arena: b.arena,
            phase: 0, hits: 0, valves: 0,
            state: 'rolling',  // rolling | crashing | dizzy
            flash: 0, defeatT: 0, spin: 0,
        };
    }

    _hitBoss() {
        const b = this.boss;
        if (!b || b.state !== 'rolling') return;
        b.hits += 1;
        b.flash = 0.18;
        this._poof(b.x + b.w / 2, b.y + 4, '#ff9a6a', 8);
        this.audio?.stomp();
        if (b.hits >= BOSS_HITS[Math.min(b.phase, BOSS_HITS.length - 1)]) {
            // Charge into the nearest parmesan wall
            b.state = 'crashing';
            b.dir = (b.x + b.w / 2 < (b.arena.minX + b.arena.maxX) / 2) ? -1 : 1;
        }
        this._emitHud();
    }

    _updateBoss(dt) {
        const b = this.boss;
        const p = this.player;
        if (b.flash > 0) b.flash -= dt;

        if (b.state === 'dizzy') {
            b.spin += dt * 7;
            b.x += b.vx * dt;
            b.vy += GRAVITY * dt;
            b.y += b.vy * dt;
            if (b.y > b.arena.floorY - b.h) { b.y = b.arena.floorY - b.h; b.vy = -130; b.vx *= 0.6; }
            b.defeatT += dt;
            if (b.defeatT > 1.7 && !this.goalReached) {
                this.goalReached = true;
                this.audio?.win();
                this.opts.onReachGoal?.();
            }
            return;
        }

        const speed = BOSS_ROLL[Math.min(b.phase, BOSS_ROLL.length - 1)];

        if (b.state === 'crashing') {
            b.x += b.dir * speed * 2.4 * dt;
            const hit = (b.dir < 0 && b.x <= b.arena.minX) || (b.dir > 0 && b.x + b.w >= b.arena.maxX);
            if (hit) {
                b.x = b.dir < 0 ? b.arena.minX : b.arena.maxX - b.w;
                b.valves += 1;
                this.shake = 0.5;
                this._poof(b.x + b.w / 2, b.y, '#f3e2b0', 18);
                this.audio?.stomp();
                if (b.valves >= 3) {
                    b.state = 'dizzy'; b.vy = -300; b.vx = b.dir * -60;
                    this.score += SCORE.miniBoss; this._emitHud();
                } else {
                    b.phase += 1; b.hits = 0; b.state = 'rolling'; b.dir *= -1;
                    this._emitHud();
                }
            }
            return;
        }

        // rolling
        b.x += b.dir * speed * dt;
        if (b.x <= b.arena.minX) { b.x = b.arena.minX; b.dir = 1; }
        else if (b.x + b.w >= b.arena.maxX) { b.x = b.arena.maxX - b.w; b.dir = -1; }

        if (b.phase >= 1 && b.onGround && Math.random() < 0.012) { b.vy = -270; b.onGround = false; }
        b.vy += GRAVITY * dt;
        b.y += b.vy * dt;
        if (b.y >= b.arena.floorY - b.h) {
            if (!b.onGround && b.phase >= 2) this.shake = Math.max(this.shake, 0.16);
            b.y = b.arena.floorY - b.h; b.vy = 0; b.onGround = true;
        }

        if (p.invuln <= 0 && aabb(p, b)) this._damage(false);
    }

    _collectibles() {
        const p = this.player;
        for (const c of this.coins) {
            if (!c.got && aabb(p, c)) { c.got = true; this.score += SCORE.coin; this.audio?.coin(); this._emitHud(); }
        }
        for (const pt of this.petals) {
            if (!pt.got && aabb(p, pt)) {
                pt.got = true; this.score += SCORE.petal; this.crumbs += 1; this.audio?.petal(); this._emitHud();
                if (pt.memory) this._toast(pt.memory.speaker, pt.memory.text);
            }
        }
        if (this.cookie && !this.cookie.got && aabb(p, this.cookie)) {
            this.cookie.got = true; p.hasCookie = true; this.audio?.petal();
            this._toast('Matt Mozzarella', 'The heart-shaped strawberry jam cookie! The gift for Princess Peach Tart.', 'cookie');
            this._emitHud();
        }
    }

    _checkTriggers() {
        const px = this.player.x;
        for (const t of this.triggers) {
            if (!t.fired && px >= t.x) {
                t.fired = true;
                const line = t.lines && t.lines[0];
                if (line) this._toast(line.speaker, line.text, line.sprite);
            }
        }
    }

    _checkpoints() {
        for (const c of this.level.checkpoints || []) {
            if (this.player.x >= c.x && this.lastCheckpoint.x < c.x) {
                this.lastCheckpoint = { x: c.x, y: c.y };
                this._poof(c.x, c.y, '#ffd23f', 6);
            }
        }
    }

    _damage(fromPit) {
        const p = this.player;
        if (p.invuln > 0 && !fromPit) return;
        this.hearts -= 1;
        this.audio?.hurt();
        this._poof(p.x + p.w / 2, p.y + p.h / 2, '#ff6b6b', 8);
        this._emitHud();
        if (this.hearts <= 0) {
            this.stop();
            this.opts.onGameOver?.();
            return;
        }
        // respawn / knockback
        if (fromPit) {
            p.x = this.lastCheckpoint.x; p.y = this.lastCheckpoint.y;
            p.vx = 0; p.vy = 0;
        } else {
            p.vy = -200; p.vx = -p.facing * 120;
        }
        p.invuln = INVULN_TIME;
    }

    _poof(x, y, color, n) {
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 * i) / n + Math.random();
            const s = 40 + Math.random() * 80;
            this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, life: 0.5, color, size: 1 + Math.round(Math.random() * 2) });
        }
    }

    _particles(dt) {
        for (const pa of this.particles) {
            pa.x += pa.vx * dt; pa.y += pa.vy * dt; pa.vy += 300 * dt; pa.life -= dt;
        }
        this.particles = this.particles.filter((pa) => pa.life > 0);
    }

    _emitHud() {
        this.opts.onHud?.({
            hearts: this.hearts,
            score: this.score,
            crumbs: this.crumbs,
            totalCrumbs: this.totalCrumbs,
            levelName: this.level.name,
            hasCookie: this.player?.hasCookie || false,
            boss: this.boss ? {
                name: this.boss.name,
                valves: this.boss.valves,
                total: 3,
                defeated: this.boss.state === 'dizzy',
            } : null,
        });
    }

    // ---- rendering -------------------------------------------------------

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, VIEW_W, VIEW_H);
        this._drawBackground(ctx);

        const sx = this.shake > 0 ? (Math.random() * 2 - 1) * this.shake * 14 : 0;
        const sy = this.shake > 0 ? (Math.random() * 2 - 1) * this.shake * 9 : 0;

        ctx.save();
        ctx.translate(-Math.round(this.cam.x) + sx, -Math.round(this.cam.y) + sy);

        if (this.level.sauceMill) this._drawSauceMill(ctx, this.level.sauceMill);
        this._drawPipes(ctx);
        this._drawPlatforms(ctx);
        this._drawGoal(ctx);
        this._drawWinds(ctx);
        this._drawCollectibles(ctx);
        this._drawGeysers(ctx);
        this._drawEnemies(ctx);
        this._drawEnemyShots(ctx);
        this._drawBoss(ctx);
        this._drawProjectiles(ctx);
        this._drawPlayer(ctx);
        this._drawParticles(ctx);

        ctx.restore();
    }

    _drawBackground(ctx) {
        const t = this.theme;
        const sky = t.sky || ['#fff3d6', '#ffd9b0'];
        const grad = ctx.createLinearGradient(0, 0, 0, VIEW_H);
        grad.addColorStop(0, sky[0]);
        grad.addColorStop(1, sky[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);

        // Parallax hills
        const camx = this.cam.x;
        this._hills(ctx, t.hillBack || '#f3c08a', camx * 0.25, 150, 60);
        this._hills(ctx, t.hillFront || '#eda964', camx * 0.45, 178, 48);

        if (t.key === 'festival') {
            this._bakeryHouses(ctx, camx * 0.55);
            this._stringLights(ctx, camx * 0.7);
        } else if (t.key === 'pasta') {
            this._giantNoodles(ctx, camx * 0.4);
            this._sauceRibbon(ctx, camx * 0.6);
        }
    }

    _giantNoodles(ctx, offset) {
        // Big translucent noodle loops drifting through the countryside
        const span = 180;
        const start = Math.floor(offset / span);
        ctx.strokeStyle = 'rgba(244, 196, 106, 0.55)';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        for (let i = start; i < start + 5; i++) {
            const x = i * span - offset + 30;
            if (x < -120 || x > VIEW_W + 120) continue;
            ctx.beginPath();
            ctx.arc(x, 150, 34, Math.PI * 0.15, Math.PI * 1.1);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(x + 50, 138, 26, Math.PI * 0.6, Math.PI * 1.7);
            ctx.stroke();
        }
        ctx.lineWidth = 1;
    }

    _sauceRibbon(ctx, offset) {
        // Warm tomato-sauce river ribbon low in the background
        ctx.fillStyle = 'rgba(226, 80, 52, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let x = 0; x <= VIEW_W; x += 10) {
            const y = 196 + Math.sin((x + offset) * 0.02 + this.elapsed) * 5;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.closePath();
        ctx.fill();
    }

    _hills(ctx, color, offset, baseY, amp) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, VIEW_H);
        for (let x = 0; x <= VIEW_W; x += 8) {
            const wx = x + offset;
            const y = baseY + Math.sin(wx * 0.012) * amp * 0.4 + Math.cos(wx * 0.03) * amp * 0.2;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(VIEW_W, VIEW_H);
        ctx.closePath();
        ctx.fill();
    }

    _bakeryHouses(ctx, offset) {
        const spacing = 150;
        const startIdx = Math.floor(offset / spacing);
        for (let i = startIdx; i < startIdx + 5; i++) {
            const x = i * spacing - offset + 40;
            if (x < -60 || x > VIEW_W + 60) continue;
            const y = 132, w = 46, h = 44;
            ctx.fillStyle = '#d98b46';
            ctx.fillRect(x, y, w, h);
            ctx.fillStyle = '#b5532a'; // roof
            ctx.beginPath();
            ctx.moveTo(x - 4, y); ctx.lineTo(x + w / 2, y - 16); ctx.lineTo(x + w + 4, y);
            ctx.closePath(); ctx.fill();
            // glowing oven window
            const glow = 0.6 + Math.sin(this.elapsed * 2 + i) * 0.15;
            ctx.fillStyle = `rgba(255,200,90,${glow})`;
            ctx.fillRect(x + 14, y + 14, 18, 18);
            ctx.fillStyle = '#7a4a2a';
            ctx.fillRect(x + 14, y + 14, 18, 18);
            ctx.fillStyle = `rgba(255,210,110,${glow})`;
            ctx.fillRect(x + 16, y + 16, 14, 14);
        }
    }

    _stringLights(ctx, offset) {
        const span = 60;
        ctx.strokeStyle = 'rgba(120,70,40,0.4)';
        ctx.lineWidth = 1;
        const colors = ['#ff7a4a', '#ffd23f', '#ff5a8a', '#7ad08a'];
        const start = Math.floor(offset / span);
        ctx.beginPath();
        for (let i = start; i < start + 12; i++) {
            const x = i * span - offset;
            ctx.moveTo(x, 18 + Math.sin(i) * 4);
            ctx.quadraticCurveTo(x + span / 2, 34, x + span, 18 + Math.sin(i + 1) * 4);
        }
        ctx.stroke();
        for (let i = start; i < start + 12; i++) {
            const x = i * span - offset + span / 2;
            ctx.fillStyle = colors[((i % colors.length) + colors.length) % colors.length];
            ctx.fillRect(Math.round(x) - 1, 30, 3, 4);
        }
    }

    _drawPlatforms(ctx) {
        for (const pl of this.platforms) {
            if (pl.broken) continue;
            if (pl.type === 'solid') this._drawGround(ctx, pl);
            else if (pl.type === 'oneway') this._drawTray(ctx, pl);
            else if (pl.type === 'breakable') this._drawCrackerBlock(ctx, pl);
            else if (pl.type === 'bounce') this._drawRavioli(ctx, pl);
            else if (pl.type === 'ramp') this._drawRamp(ctx, pl);
            else if (pl.type === 'parmesan') this._drawParmesan(ctx, pl);
            else if (pl.type === 'vine') this._drawVine(ctx, pl);
        }
        for (const m of this.mushrooms) {
            const sq = m.squish;
            drawSprite(ctx, SPRITES.mushroom, m.x - 4, m.y - 9 + sq * 18);
        }
    }

    _drawGround(ctx, pl) {
        const t = this.theme;
        ctx.fillStyle = t.ground || '#d98b46';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = t.groundTop || '#f0a85c';
        ctx.fillRect(pl.x, pl.y, pl.w, 5);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        for (let x = pl.x + 4; x < pl.x + pl.w; x += 16) ctx.fillRect(x, pl.y + 2, 6, 1);
    }

    _drawTray(ctx, pl) {
        // Cafeteria tray / breadstick plank
        ctx.fillStyle = '#cfd6dd';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = '#eef2f6';
        ctx.fillRect(pl.x, pl.y, pl.w, 2);
        ctx.fillStyle = '#9aa4ad';
        ctx.fillRect(pl.x, pl.y + pl.h - 1, pl.w, 1);
        ctx.fillStyle = '#b7bec6';
        ctx.fillRect(pl.x + 2, pl.y + 2, 3, pl.h - 3);
        ctx.fillRect(pl.x + pl.w - 5, pl.y + 2, 3, pl.h - 3);
    }

    _drawCrackerBlock(ctx, pl) {
        ctx.fillStyle = '#e8cf8f';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = '#caa94f';
        ctx.fillRect(pl.x, pl.y, pl.w, 2);
        ctx.fillRect(pl.x, pl.y + pl.h - 2, pl.w, 2);
        ctx.fillStyle = '#9a7a3a';
        ctx.fillRect(pl.x + 3, pl.y + 4, 1, 1);
        ctx.fillRect(pl.x + 9, pl.y + 6, 1, 1);
        ctx.fillRect(pl.x + 6, pl.y + 10, 1, 1);
        ctx.strokeStyle = '#9a7a3a'; ctx.lineWidth = 1;
        ctx.strokeRect(pl.x + 0.5, pl.y + 0.5, pl.w - 1, pl.h - 1);
    }

    _drawRavioli(ctx, pl) {
        ctx.fillStyle = '#f2c46a';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = '#d89a3a';
        for (let x = pl.x + 1; x < pl.x + pl.w; x += 3) ctx.fillRect(x, pl.y, 1, 1);
        ctx.fillRect(pl.x, pl.y + pl.h - 1, pl.w, 1);
        ctx.fillStyle = '#fff0c0';
        ctx.fillRect(pl.x + pl.w / 2 - 3, pl.y + 3, 6, 3);
    }

    _drawRamp(ctx, pl) {
        // Lasagna ramp — layered sheets with sauce + cheese
        ctx.fillStyle = '#e8b873';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = '#e23b34';
        ctx.fillRect(pl.x, pl.y, pl.w, 2); // sauce top
        ctx.fillStyle = '#c97a4a';
        ctx.fillRect(pl.x, pl.y + Math.floor(pl.h * 0.4), pl.w, 2);
        ctx.fillStyle = '#fff0c0';
        for (let x = pl.x + 3; x < pl.x + pl.w; x += 10) ctx.fillRect(x, pl.y + 3, 4, 1);
    }

    _drawVine(ctx, pl) {
        // Spaghetti-vine plank (one-way)
        ctx.fillStyle = '#f0c04a';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = '#ffe08a';
        ctx.fillRect(pl.x, pl.y, pl.w, 1);
        ctx.fillStyle = '#d89a3a';
        for (let x = pl.x + 1; x < pl.x + pl.w; x += 4) ctx.fillRect(x, pl.y + pl.h - 1, 2, 1);
        ctx.strokeStyle = '#f0c04a'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pl.x + 6, pl.y + pl.h); ctx.lineTo(pl.x + 6, pl.y + pl.h + 5);
        ctx.moveTo(pl.x + pl.w - 6, pl.y + pl.h); ctx.lineTo(pl.x + pl.w - 6, pl.y + pl.h + 6);
        ctx.stroke(); ctx.lineWidth = 1;
    }

    _drawParmesan(ctx, pl) {
        // Parmesan wall — pale wedge the boss crashes into
        ctx.fillStyle = '#f3e2b0';
        ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
        ctx.fillStyle = '#fff7ea';
        ctx.fillRect(pl.x, pl.y, pl.w, 2);
        ctx.fillStyle = '#e8cf8f';
        ctx.fillRect(pl.x, pl.y, 3, pl.h);
        ctx.fillRect(pl.x + pl.w - 3, pl.y, 3, pl.h);
        ctx.fillStyle = 'rgba(154,122,58,0.45)';
        for (let y = pl.y + 6; y < pl.y + pl.h - 4; y += 14) {
            for (let x = pl.x + 4; x < pl.x + pl.w - 4; x += 10) {
                ctx.fillRect(x + (y % 2 ? 3 : 0), y, 3, 3);
            }
        }
    }

    _drawPipes(ctx) {
        for (const pp of this.pipes) {
            ctx.fillStyle = pp.bonus ? '#7ad08a' : '#5fae54';
            ctx.fillRect(pp.x, pp.y, pp.w, pp.h);
            ctx.fillStyle = pp.bonus ? '#aee6b6' : '#8cc46a';
            ctx.fillRect(pp.x, pp.y, pp.w, 5);
            ctx.fillRect(pp.x + 2, pp.y, 3, pp.h);
            ctx.fillStyle = '#3a6b34';
            ctx.fillRect(pp.x, pp.y, pp.w, 1);
            ctx.fillRect(pp.x, pp.y, 1, pp.h);
            ctx.fillRect(pp.x + pp.w - 1, pp.y, 1, pp.h);
            // downward "enter" arrow hint
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            const ax = pp.x + pp.w / 2, ay = pp.y + 9;
            ctx.fillRect(ax - 1, ay, 2, 7);
            ctx.beginPath();
            ctx.moveTo(ax - 4, ay + 5); ctx.lineTo(ax + 4, ay + 5); ctx.lineTo(ax, ay + 10);
            ctx.closePath(); ctx.fill();
        }
    }

    _drawWinds(ctx) {
        for (const w of this.winds) {
            ctx.fillStyle = 'rgba(255,240,200,0.16)';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            for (let i = 0; i < 5; i++) {
                const yy = w.y + 6 + i * (w.h / 5);
                const off = (this.elapsed * 90 + i * 40) % w.w;
                ctx.fillRect(w.x + off, yy, 10, 1);
                ctx.fillRect(w.x + (off + w.w / 2) % w.w, yy + 3, 6, 1);
            }
            ctx.fillStyle = '#fff0c0';
            for (let i = 0; i < 4; i++) {
                const fx = (this.elapsed * 60 + i * 53) % w.w;
                ctx.fillRect(w.x + fx, w.y + (i * 13) % w.h, 2, 2);
            }
        }
    }

    _drawEnemyShots(ctx) {
        for (const s of this.enemyShots) drawSprite(ctx, SPRITES.vinegar, s.x, s.y);
    }

    _fillCircle(ctx, cx, cy, r) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawSauceMill(ctx, m) {
        const open = this.boss ? this.boss.valves : 3;
        ctx.fillStyle = '#8a5a2b';
        ctx.fillRect(m.x, m.y, m.w, m.h);
        ctx.fillStyle = '#6b4423';
        ctx.fillRect(m.x, m.y, m.w, 6);
        ctx.fillStyle = '#b5532a';
        ctx.beginPath();
        ctx.moveTo(m.x - 6, m.y); ctx.lineTo(m.x + m.w / 2, m.y - 22); ctx.lineTo(m.x + m.w + 6, m.y);
        ctx.closePath(); ctx.fill();
        // sign
        ctx.fillStyle = '#ffd23f';
        ctx.fillRect(m.x + m.w / 2 - 14, m.y + 8, 28, 8);
        // 3 valve wheels
        for (let i = 0; i < 3; i++) {
            const vx = m.x + 18 + i * ((m.w - 36) / 2);
            const vy = m.y + m.h - 20;
            const isOpen = i < open;
            ctx.fillStyle = isOpen ? '#ffd23f' : '#5a3a1a';
            this._fillCircle(ctx, vx, vy, 7);
            ctx.fillStyle = isOpen ? '#e23b34' : '#3a2a1a';
            this._fillCircle(ctx, vx, vy, 3);
            if (isOpen) {
                ctx.fillStyle = 'rgba(226,59,52,0.7)';
                ctx.fillRect(vx - 2, vy + 6, 4, (m.y + m.h) - (vy + 6));
            }
        }
    }

    _drawBoss(ctx) {
        const b = this.boss;
        if (!b) return;
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
        ctx.save();
        if (b.state === 'dizzy') {
            ctx.translate(cx, cy); ctx.rotate(Math.sin(b.spin) * 0.3); ctx.translate(-cx, -cy);
        }
        const base = b.flash > 0 ? '#ff8a4a' : '#a9612f';
        ctx.fillStyle = base;
        this._fillCircle(ctx, cx, cy, b.w / 2);
        ctx.fillStyle = b.flash > 0 ? '#ffd0a0' : '#c47e4a';
        this._fillCircle(ctx, cx - 4, cy - 4, b.w / 2 - 7);
        // sauce splats
        ctx.fillStyle = '#e23b34';
        ctx.fillRect(b.x + 5, b.y + 4, 4, 3);
        ctx.fillRect(b.x + b.w - 10, b.y + 7, 4, 3);
        ctx.fillRect(b.x + 9, b.y + b.h - 8, 3, 3);
        // tiny arms
        ctx.fillStyle = base;
        ctx.fillRect(b.x - 4, cy + 2, 5, 4);
        ctx.fillRect(b.x + b.w - 1, cy + 2, 5, 4);
        if (b.state === 'dizzy') {
            ctx.strokeStyle = '#2a1206'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(cx - 6, cy - 2, 3, 0, Math.PI * 2.2); ctx.stroke();
            ctx.beginPath(); ctx.arc(cx + 6, cy - 2, 3, 0, Math.PI * 2.2); ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = '#2a1206'; ctx.fillRect(cx - 4, cy + 7, 8, 2); // dazed smile
        } else {
            // angry brows
            ctx.fillStyle = '#2a1206';
            ctx.fillRect(cx - 10, cy - 8, 7, 2);
            ctx.fillRect(cx + 3, cy - 8, 7, 2);
            // eyes
            ctx.fillStyle = '#fff';
            ctx.fillRect(cx - 9, cy - 5, 5, 4);
            ctx.fillRect(cx + 4, cy - 5, 5, 4);
            ctx.fillStyle = '#2a1206';
            ctx.fillRect(cx - 6, cy - 4, 2, 3);
            ctx.fillRect(cx + 6, cy - 4, 2, 3);
            // open angry mouth
            ctx.fillStyle = '#7a1f1f';
            ctx.fillRect(cx - 5, cy + 5, 10, 5);
            ctx.fillStyle = '#fff';
            ctx.fillRect(cx - 5, cy + 5, 10, 1);
        }
        ctx.restore();
    }

    _drawGoal(ctx) {
        const g = this.level.goal;
        if (!g) return;
        // Festival Tower
        ctx.fillStyle = '#e0a3d0';
        ctx.fillRect(g.x, g.y, g.w, g.h);
        ctx.fillStyle = '#c77fb8';
        ctx.fillRect(g.x, g.y, 4, g.h);
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        ctx.moveTo(g.x - 4, g.y); ctx.lineTo(g.x + g.w / 2, g.y - 22); ctx.lineTo(g.x + g.w + 4, g.y);
        ctx.closePath(); ctx.fill();
        // banner
        ctx.fillStyle = '#ff5a8a';
        ctx.fillRect(g.x + 6, g.y + 14, g.w - 12, 18);
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 3; i++) ctx.fillRect(g.x + 12 + i * 8, g.y + 22, 3, 3);
        // little flag on top, waving
        const wave = Math.sin(this.elapsed * 4) * 3;
        ctx.fillStyle = '#ff7a4a';
        ctx.fillRect(g.x + g.w / 2 - 1, g.y - 34, 2, 14);
        ctx.fillRect(g.x + g.w / 2 + 1, g.y - 34 + wave * 0.2, 10, 7);
    }

    _drawCollectibles(ctx) {
        const bob = Math.sin(this.elapsed * 4) * 2;
        for (const c of this.coins) if (!c.got) drawSprite(ctx, SPRITES.coin, c.x, c.y + bob);
        for (const pt of this.petals) if (!pt.got) drawSprite(ctx, SPRITES.petal, pt.x, pt.y + bob);
        if (this.cookie && !this.cookie.got) {
            // sparkle ring
            ctx.fillStyle = 'rgba(255,210,110,0.5)';
            ctx.fillRect(this.cookie.x - 3, this.cookie.y + bob - 3, 15, 15);
            drawSprite(ctx, SPRITES.cookie, this.cookie.x, this.cookie.y + bob);
        }
    }

    _drawGeysers(ctx) {
        for (const g of this.geysers) {
            const kind = g.kind || 'sauce';

            if (kind === 'launch') {
                // Friendly upward sauce launcher (orange, with up-arrows)
                ctx.fillStyle = '#d6852a';
                ctx.fillRect(g.x - 2, g.y - 4, g.w + 4, 6);
                if (g.curH > 4) {
                    ctx.fillStyle = 'rgba(255,150,70,0.85)';
                    ctx.fillRect(g.x + 3, g.y - g.curH, g.w - 6, g.curH);
                    ctx.fillStyle = 'rgba(255,210,110,0.9)';
                    ctx.fillRect(g.x + 7, g.y - g.curH, g.w - 14, g.curH);
                    ctx.fillStyle = '#fff';
                    for (let k = 0; k < 3; k++) {
                        const ay = g.y - 8 - k * 10 - (this.elapsed * 30 % 10);
                        ctx.fillRect(g.x + g.w / 2 - 1, ay, 2, 4);
                        ctx.fillRect(g.x + g.w / 2 - 3, ay + 2, 2, 1);
                        ctx.fillRect(g.x + g.w / 2 + 1, ay + 2, 2, 1);
                    }
                } else if (Math.sin(this.elapsed * 6) > 0) {
                    ctx.fillStyle = '#ffb527';
                    ctx.fillRect(g.x + g.w / 2 - 2, g.y - 8, 4, 4);
                }
                continue;
            }

            if (kind === 'noodle') {
                // Overcooked noodle that whips up out of a sauce tunnel (hazard)
                ctx.fillStyle = '#c97a4a';
                ctx.fillRect(g.x - 2, g.y - 4, g.w + 4, 6);
                if (g.curH > 4) {
                    ctx.strokeStyle = '#f0c04a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
                    const segs = Math.max(2, Math.floor(g.curH / 8));
                    ctx.beginPath();
                    ctx.moveTo(g.x + g.w / 2, g.y);
                    for (let s = 1; s <= segs; s++) {
                        const yy = g.y - (g.curH * s / segs);
                        const xx = g.x + g.w / 2 + Math.sin(this.elapsed * 6 + s) * 5;
                        ctx.lineTo(xx, yy);
                    }
                    ctx.stroke(); ctx.lineWidth = 1;
                    ctx.fillStyle = '#f0c04a';
                    ctx.fillRect(g.x + g.w / 2 - 3, g.y - g.curH - 3, 6, 6);
                    ctx.fillStyle = '#2a1206';
                    ctx.fillRect(g.x + g.w / 2 - 2, g.y - g.curH - 1, 1, 1);
                    ctx.fillRect(g.x + g.w / 2 + 1, g.y - g.curH - 1, 1, 1);
                } else if (Math.sin(this.elapsed * 8) > 0) {
                    ctx.fillStyle = '#c97a4a';
                    ctx.fillRect(g.x + g.w / 2 - 2, g.y - 7, 4, 4);
                }
                continue;
            }

            // default 'sauce' geyser (red, damaging)
            ctx.fillStyle = '#b5532a';
            ctx.fillRect(g.x - 2, g.y - 4, g.w + 4, 6);
            if (g.curH > 4) {
                ctx.fillStyle = g.on ? 'rgba(226,59,52,0.9)' : 'rgba(226,59,52,0.4)';
                ctx.fillRect(g.x + 4, g.y - g.curH, g.w - 8, g.curH);
                ctx.fillStyle = 'rgba(255,120,90,0.8)';
                ctx.fillRect(g.x + 8, g.y - g.curH, g.w - 16, g.curH);
                ctx.fillStyle = '#e23b34';
                ctx.fillRect(g.x + 2, g.y - g.curH - 4, 3, 3);
                ctx.fillRect(g.x + g.w - 5, g.y - g.curH - 2, 3, 3);
            } else if (Math.sin(this.elapsed * 8) > 0) {
                ctx.fillStyle = '#e23b34';
                ctx.fillRect(g.x + g.w / 2 - 2, g.y - 8, 4, 4);
            }
        }
    }

    _drawEnemies(ctx) {
        for (const e of this.enemies) {
            if (e.poof > 0) {
                // brief friendly poof handled by particles; draw nothing
                continue;
            }
            if (!e.alive) continue;
            const sprite = SPRITES[e.type] || SPRITES.cracker;
            drawSprite(ctx, sprite, e.x, e.y, e.dir > 0);
        }
    }

    _drawProjectiles(ctx) {
        for (const pr of this.projectiles) drawSprite(ctx, SPRITES.marinara, pr.x, pr.y, pr.vx < 0);
    }

    _drawPlayer(ctx) {
        const p = this.player;
        // blink while invulnerable
        if (p.invuln > 0 && Math.floor(this.elapsed * 12) % 2 === 0) return;
        const sprite = p.anim === 2 ? SPRITES.matt_jump : p.anim === 1 ? SPRITES.matt_walk : SPRITES.matt_idle;
        drawSprite(ctx, sprite, p.x - 1, p.y, p.facing < 0);
        // cookie carried indicator
        if (p.hasCookie) drawSprite(ctx, SPRITES.cookie, p.x + 2, p.y - 11 + Math.sin(this.elapsed * 4) * 1.5);
    }

    _drawParticles(ctx) {
        for (const pa of this.particles) {
            ctx.globalAlpha = clamp(pa.life * 2, 0, 1);
            ctx.fillStyle = pa.color;
            ctx.fillRect(Math.round(pa.x), Math.round(pa.y), pa.size, pa.size);
        }
        ctx.globalAlpha = 1;
    }
}

export { VIEW_W, VIEW_H };
