/**
 * GameEngine — a compact 2D platformer engine for Matt Mozzarella.
 * Pure canvas + requestAnimationFrame, fixed-timestep physics, no libraries.
 *
 * React owns the high-level screens (start, intro, pause menu, level complete,
 * cutscenes). The engine owns the playable world and reports up via callbacks:
 *   onHud(hud)         — hearts / score / crumbs / level name changed
 *   onDialogue(payload)— show a dialogue box ({lines}) and freeze the sim;
 *                        null clears it. React calls engine.advanceDialogue().
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
        this.simPaused = false;   // dialogue / cutscene
        this.userPaused = false;  // pause menu
        this.raf = 0;
        this.acc = 0;
        this.last = 0;
        this.elapsed = 0;

        this.input = { left: false, right: false, jump: false, sauce: false };
        this.prev = { jump: false, sauce: false };

        this.dialogue = null;     // active dialogue payload
        this.goalReached = false;

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
            ...e, w: 16, h: e.type === 'meatball' ? 16 : 14, dir: -1, alive: true, poof: 0,
        }));
        this.coins = (level.coins || []).map((c) => ({ ...c, w: 8, h: 8, got: false }));
        this.petals = (level.petals || []).map((p) => ({ ...p, w: 7, h: 6, got: false }));
        this.cookie = level.cookie ? { ...level.cookie, w: 9, h: 9, got: false } : null;
        this.triggers = (level.triggers || []).map((t) => ({ ...t, fired: false }));
        this.projectiles = [];
        this.particles = [];

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
        if (this.dialogue || this.goalReached) return;
        this.userPaused = !this.userPaused;
        this.opts.onPause?.(this.userPaused);
    }
    pause() { this.userPaused = true; }
    resume() { this.userPaused = false; }

    advanceDialogue() {
        if (!this.dialogue) return;
        this.dialogue.lines.shift();
        if (this.dialogue.lines.length === 0) {
            this.dialogue = null;
            this.simPaused = false;
            this.opts.onDialogue?.(null);
        } else {
            this.opts.onDialogue?.({ ...this.dialogue, lines: [...this.dialogue.lines] });
        }
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

        const active = !this.simPaused && !this.userPaused && !this.goalReached;
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
        this._updateGeysers();
        this._updateMushrooms(dt);
        this._collectibles();
        this._checkTriggers();
        this._checkpoints();
        this._particles(dt);

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
        return this.platforms.filter((pl) => !pl.broken && (pl.type === 'solid' || pl.type === 'breakable'));
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
                if (pl.broken || pl.type !== 'oneway') continue;
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
            if (g.curH > 6 && this.player.invuln <= 0) {
                const jet = { x: g.x, y: g.y - g.curH, w: g.w, h: g.curH };
                if (aabb(this.player, jet)) this._damage(false);
            }
        }
    }

    _updateMushrooms(dt) {
        for (const m of this.mushrooms) if (m.squish > 0) m.squish = Math.max(0, m.squish - dt);
    }

    _collectibles() {
        const p = this.player;
        for (const c of this.coins) {
            if (!c.got && aabb(p, c)) { c.got = true; this.score += SCORE.coin; this.audio?.coin(); this._emitHud(); }
        }
        for (const pt of this.petals) {
            if (!pt.got && aabb(p, pt)) {
                pt.got = true; this.score += SCORE.petal; this.crumbs += 1; this.audio?.petal(); this._emitHud();
                if (pt.memory) this._startDialogue([pt.memory]);
            }
        }
        if (this.cookie && !this.cookie.got && aabb(p, this.cookie)) {
            this.cookie.got = true; p.hasCookie = true; this.audio?.petal();
            this._startDialogue([{ speaker: 'Matt Mozzarella', text: 'The heart-shaped strawberry jam cookie! This is the gift for Princess Peach Tart. I have to keep it safe.' }]);
            this._emitHud();
        }
    }

    _checkTriggers() {
        const px = this.player.x;
        for (const t of this.triggers) {
            if (!t.fired && px >= t.x) { t.fired = true; this._startDialogue(t.lines); }
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

    _startDialogue(lines) {
        if (!lines || !lines.length) return;
        this.dialogue = { lines: [...lines] };
        this.simPaused = true;
        this.opts.onDialogue?.({ lines: [...lines] });
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
        });
    }

    // ---- rendering -------------------------------------------------------

    _render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, VIEW_W, VIEW_H);
        this._drawBackground(ctx);

        ctx.save();
        ctx.translate(-Math.round(this.cam.x), -Math.round(this.cam.y));

        this._drawPlatforms(ctx);
        this._drawGoal(ctx);
        this._drawCollectibles(ctx);
        this._drawGeysers(ctx);
        this._drawEnemies(ctx);
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
        }
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
            // base spout
            ctx.fillStyle = '#b5532a';
            ctx.fillRect(g.x - 2, g.y - 4, g.w + 4, 6);
            if (g.curH > 4) {
                ctx.fillStyle = g.on ? 'rgba(226,59,52,0.9)' : 'rgba(226,59,52,0.4)';
                ctx.fillRect(g.x + 4, g.y - g.curH, g.w - 8, g.curH);
                ctx.fillStyle = 'rgba(255,120,90,0.8)';
                ctx.fillRect(g.x + 8, g.y - g.curH, g.w - 16, g.curH);
                // droplets
                ctx.fillStyle = '#e23b34';
                ctx.fillRect(g.x + 2, g.y - g.curH - 4, 3, 3);
                ctx.fillRect(g.x + g.w - 5, g.y - g.curH - 2, 3, 3);
            } else {
                // warning bubble when resting
                const blink = Math.sin(this.elapsed * 8) > 0;
                if (blink) { ctx.fillStyle = '#e23b34'; ctx.fillRect(g.x + g.w / 2 - 2, g.y - 8, 4, 4); }
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
