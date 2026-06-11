// ===========================================================================
// ABYSS PROTOCOL — the entire simulation. Plain JS, no three.js imports,
// so the whole game can be smoke-tested headlessly in Node. R3F components
// only *render* this state; they never own gameplay logic.
// ===========================================================================

import { ZONES, ARENA, BAL, FLAVOR, PICKUP_LABELS } from './constants';
import { S, freshPlayer, popup, toast, gameEvent, setPhase, emit } from './store';

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const dist3 = (ax, ay, az, bx, by, bz) => {
    const dx = ax - bx, dy = ay - by, dz = az - bz;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
const angDiff = (a, b) => {
    let d = (a - b) % TAU;
    if (d > Math.PI) d -= TAU;
    if (d < -Math.PI) d += TAU;
    return d;
};

let eid = 1;

// --------------------------------------------------------------- world gen
function ring(zone, count, rMin, rMax, yMin, yMax) {
    const out = [];
    for (let i = 0; i < count; i++) {
        const a = (i / count) * TAU + rand(-0.4, 0.4);
        const r = rand(rMin, rMax);
        out.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, y: rand(yMin, yMax) });
    }
    return out;
}

function addEntity(kind, zone, pos, extra) {
    S.entities.push({
        id: eid++, kind, zone, alive: true,
        x: pos.x, y: pos.y, z: pos.z,
        revealT: -99, bob: rand(0, TAU),
        ...(extra || {}),
    });
}

export function initRun() {
    eid = 1;
    S.time = 0;
    S.score = 0;
    S.kills = 0;
    S.pearls = 0;
    S.zoneIndex = 0;
    S.inArena = false;
    S.counts = { fragment: 0, cell: 0 };
    S.entities = [];
    S.torpedoes = [];
    S.bolts = [];
    S.debris = [];
    S.popups = [];
    S.toasts = [];
    S.events = [];
    S.sonar = { t: 99, x: 0, y: 0, z: 0 };
    S.shake = 0;
    S.flash = 0;
    S.inkFactor = 0;
    S.grabbed = 0;
    S.victoryT = 0;
    S.boss = null;
    S.arenaSealed = false;
    S.debrisT = 0;
    S.flavorT = { movement: 20, zone: 0 };
    S.player = freshPlayer();
    S.gates = ZONES.map((z) => (z.gateNeeds ? { y: z.gateY, needs: z.gateNeeds, open: false } : { y: z.gateY, needs: null, open: true }));

    // ---- ZONE 0 — Twilight Reef
    ring(0, 4, 24, 62, -86, -22).forEach((p) => addEntity('o2', 0, p));
    ring(0, 3, 30, 60, -95, -35).forEach((p) => addEntity('fragment', 0, p, { hidden: true }));
    ring(0, 3, 18, 55, -90, -30).forEach((p) => addEntity('pearl', 0, p, { hidden: true }));
    ring(0, 8, 20, 70, -100, -25).forEach((p) => addEntity('mine', 0, p));
    ring(0, 3, 26, 56, -80, -40).forEach((p, i) =>
        addEntity('eel', 0, p, { homeX: p.x, homeZ: p.z, homeY: p.y, a: rand(0, TAU), windup: 0, cd: 0, mode: 'patrol', spd: BAL.eelSpeed * (1 + i * 0.08) }));

    // ---- ZONE 1 — Sunken Research Station
    ring(1, 2, 14, 40, -225, -150).forEach((p) => addEntity('cell', 1, p));
    ring(1, 3, 18, 52, -230, -150).forEach((p) => addEntity('o2', 1, p));
    addEntity('repair', 1, { x: rand(-30, 30), y: -200, z: rand(-30, 30) });
    ring(1, 3, 16, 48, -228, -150).forEach((p) => addEntity('pearl', 1, p, { hidden: true }));
    ring(1, 6, 18, 58, -235, -145).forEach((p) => addEntity('mine', 1, p));
    ring(1, 4, 18, 44, -215, -155).forEach((p, i) =>
        addEntity('drone', 1, p, { homeX: p.x, homeZ: p.z, homeY: p.y, fireT: rand(0, 2), a: rand(0, TAU), strafe: i % 2 ? 1 : -1 }));

    // ---- ZONE 2 — Abyssal Trench
    ring(2, 3, 10, 38, -362, -275).forEach((p) => addEntity('o2', 2, p));
    addEntity('repair', 2, { x: rand(-20, 20), y: -330, z: rand(-20, 20) });
    ring(2, 4, 10, 40, -365, -280).forEach((p) => addEntity('pearl', 2, p, { hidden: true }));
    ring(2, 8, 12, 42, -368, -270).forEach((p) => addEntity('mine', 2, p, { hidden: true }));
    ring(2, 4, 12, 38, -350, -285).forEach((p, i) =>
        addEntity('eel', 2, p, { homeX: p.x, homeZ: p.z, homeY: p.y, a: rand(0, TAU), windup: 0, cd: 0, mode: 'patrol', spd: BAL.eelSpeed * 1.25 }));
    ring(2, 5, 14, 38, 0, 0).forEach((p) =>
        addEntity('vent', 2, { x: p.x, y: -371, z: p.z }, { t: rand(0, BAL.ventIdle), state: 'idle' }));

    emit();
}

function makeBoss() {
    return {
        active: true, hp: BAL.bossHp, hpMax: BAL.bossHp,
        x: 0, y: ARENA.centerY - 6, z: 0,
        phase: 1, rage: false,
        attackT: 2.2, roarT: 0,
        swipes: [],     // {angle, t, telegraph, dur}
        waves: [],      // {r, speed, hitDone}
        inks: [],       // {x,y,z, r, t}
        grabT: 0,
        introT: 2.6,    // boss reveal cinematic timer
        deathT: 0,
    };
}

// ----------------------------------------------------------------- helpers
function damagePlayer(amount, why) {
    const p = S.player;
    if (p.iframe > 0 || S.phase !== 'playing') return;
    p.hull -= amount;
    p.iframe = BAL.iframeTime;
    S.shake = Math.min(1.3, S.shake + 0.45 + amount * 0.012);
    S.flash = 1;
    gameEvent('hit');
    if (p.hull <= 0) {
        p.hull = 0;
        die(why || 'Hull breach. The sub folds like paper.');
    } else if (p.hull <= 30 && !p.warned.hull) {
        p.warned.hull = true;
        toast(FLAVOR.hullLow);
        gameEvent('alarm');
    }
}

function die(reason) {
    gameEvent('explosion');
    gameEvent('gameover');
    S.shake = 1.6;
    setPhase('gameover', reason);
}

function collect(e) {
    e.alive = false;
    const p = S.player;
    gameEvent(e.kind === 'fragment' || e.kind === 'cell' ? 'keyItem' : 'pickup');
    popup(PICKUP_LABELS[e.kind] || '+');
    if (e.kind === 'o2') p.o2 = Math.min(BAL.o2Max, p.o2 + BAL.o2Pickup);
    if (e.kind === 'cell') { p.batt = Math.min(BAL.battMax, p.batt + BAL.cellPickup); S.counts.cell++; }
    if (e.kind === 'repair') p.hull = Math.min(BAL.hullMax, p.hull + BAL.repairPickup);
    if (e.kind === 'fragment') S.counts.fragment++;
    if (e.kind === 'pearl') { S.pearls++; S.score += BAL.pearlScore; }
    checkGates();
}

function checkGates() {
    S.gates.forEach((g, i) => {
        if (g.open || !g.needs) return;
        if (S.counts[g.needs.item] >= g.needs.count) {
            g.open = true;
            toast(FLAVOR.gateOpen);
            gameEvent('doorOpen');
        }
    });
}

function killEnemy(e, score) {
    e.alive = false;
    S.kills++;
    S.score += score;
    S.shake = Math.min(1.2, S.shake + 0.25);
    gameEvent('explosion', { x: e.x, y: e.y, z: e.z });
}

function zoneAt(y) {
    for (let i = ZONES.length - 1; i >= 0; i--) {
        if (y <= ZONES[i].topY + 10 && y >= ZONES[i].floorY - 20) return i;
    }
    return y < ZONES[2].floorY ? 2 : 0;
}

// ------------------------------------------------------------------- STEP
export function step(dt, audio) {
    if (S.phase !== 'playing') return;
    dt = Math.min(dt, 0.05);
    const p = S.player;
    S.time += dt;

    // decay timers
    p.iframe = Math.max(0, p.iframe - dt);
    p.boostT = Math.max(0, p.boostT - dt);
    p.sonarCd = Math.max(0, p.sonarCd - dt);
    p.fireCd = Math.max(0, p.fireCd - dt);
    S.shake = Math.max(0, S.shake - dt * 1.6);
    S.flash = Math.max(0, S.flash - dt * 2.2);
    S.sonar.t += dt;
    S.grabbed = Math.max(0, S.grabbed - dt);

    stepPlayer(dt);
    stepResources(dt);
    stepEntities(dt);
    stepProjectiles(dt);
    stepZones(dt);
    if (S.boss) stepBoss(dt);
    stepFlavor(dt);
}

// ----------------------------------------------------------------- player
function stepPlayer(dt) {
    const p = S.player;
    const inp = S.input;

    if (S.grabbed > 0) {
        // dragged toward the kraken; boost breaks free
        if (S.boss) {
            const d = dist3(p.x, p.y, p.z, S.boss.x, S.boss.y + 14, S.boss.z) || 1;
            p.vx += ((S.boss.x - p.x) / d) * 22 * dt;
            p.vy += ((S.boss.y + 14 - p.y) / d) * 22 * dt;
            p.vz += ((S.boss.z - p.z) / d) * 22 * dt;
        }
        if (inp.boost && p.batt > 4) {
            S.grabbed = 0;
            p.batt -= 4;
            p.boostT = BAL.boostDodgeWindow;
            gameEvent('boost');
        }
    } else {
        // yaw
        p.yaw += (inp.l ? BAL.turnRate * dt : 0) - (inp.r ? BAL.turnRate * dt : 0);
        // thrust along facing
        const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
        const boosting = inp.boost && p.batt > 0.5;
        p.boosting = boosting;
        const acc = BAL.accel * (boosting ? 1.9 : 1);
        if (inp.f) { p.vx += fx * acc * dt; p.vz += fz * acc * dt; }
        if (inp.b) { p.vx -= fx * acc * 0.6 * dt; p.vz -= fz * acc * 0.6 * dt; }
        if (inp.up) p.vy += BAL.vertSpeed * 2.4 * dt * (boosting ? 1.5 : 1);
        if (inp.down) p.vy -= BAL.vertSpeed * 2.4 * dt * (boosting ? 1.5 : 1);
        if (boosting) {
            p.batt -= BAL.boostDrain * dt;
            if (!p.wasBoosting) { p.boostT = BAL.boostDodgeWindow; gameEvent('boost'); }
        }
        p.wasBoosting = boosting;
    }

    // drag + speed clamp
    const drag = Math.exp(-BAL.drag * dt);
    p.vx *= drag; p.vy *= drag; p.vz *= drag;
    const maxS = p.boosting ? BAL.boostSpeed : BAL.maxSpeed;
    const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz);
    if (sp > maxS) { const k = maxS / sp; p.vx *= k; p.vy *= k; p.vz *= k; }

    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;

    // world bounds: radial walls per zone band + ceiling
    const zone = S.inArena ? null : ZONES[zoneAt(p.y)];
    const radius = S.inArena ? ARENA.radius : zone.radius;
    const r = Math.sqrt(p.x * p.x + p.z * p.z);
    if (r > radius - 3) {
        const k = (radius - 3) / r;
        p.x *= k; p.z *= k;
        p.vx *= 0.4; p.vz *= 0.4;
    }
    if (p.y > -8) { p.y = -8; p.vy = Math.min(0, p.vy); }
    const floor = S.inArena ? ARENA.floorY + 4 : ZONES[2].floorY - 40;
    if (p.y < floor) { p.y = floor; p.vy = Math.max(0, p.vy); }

    // gates: solid floor discs unless open
    if (!S.inArena) {
        for (const g of S.gates) {
            if (!g.needs && g.y !== ZONES[2].gateY) continue;
            const gateHoleR = 11;
            const within = Math.sqrt(p.x * p.x + p.z * p.z) < (g.open ? 99 : 999);
            if (!within) continue;
            const passingDown = p.y < g.y + 2 && p.y > g.y - 8;
            if (passingDown) {
                const inHole = Math.sqrt(p.x * p.x + p.z * p.z) < gateHoleR;
                if (!(g.open && inHole)) {
                    p.y = g.y + 2;
                    p.vy = Math.max(0, p.vy * -0.3);
                }
            }
        }
        // arena entry
        if (p.y < ZONES[2].gateY - 8 && !S.inArena) enterArena();
    } else if (S.arenaSealed && p.y > ARENA.ceilY) {
        p.y = ARENA.ceilY;
        p.vy = Math.min(0, p.vy);
    }

    // sonar fire
    if (S.input.sonar && p.sonarCd <= 0 && p.batt > BAL.sonarCost) {
        p.sonarCd = BAL.sonarCooldown;
        p.batt -= BAL.sonarCost;
        S.sonar = { t: 0, x: p.x, y: p.y, z: p.z };
        gameEvent('ping');
        let big = false;
        for (const e of S.entities) {
            if (!e.alive) continue;
            if (dist3(p.x, p.y, p.z, e.x, e.y, e.z) < BAL.sonarRange) e.revealT = S.time;
        }
        if (S.boss && S.boss.active) big = true;
        if (!S.boss && p.y < ZONES[2].topY) big = true; // it is always listening down there
        if (big) { toast(FLAVOR.sonarBig); gameEvent('pingEcho'); }
    }
    S.input.sonar = false; // edge-triggered

    // torpedo fire
    if (S.input.fire && p.fireCd <= 0 && p.batt > BAL.torpedoCost) {
        p.fireCd = BAL.fireCooldown;
        p.batt -= BAL.torpedoCost;
        const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
        S.torpedoes.push({ x: p.x + fx * 2.4, y: p.y - 0.3, z: p.z + fz * 2.4, vx: fx * BAL.torpedoSpeed, vy: 0, vz: fz * BAL.torpedoSpeed, life: BAL.torpedoLife });
        gameEvent('torpedo');
    }
}

function enterArena() {
    S.inArena = true;
    S.arenaSealed = true;
    S.boss = makeBoss();
    S.shake = 1.2;
    toast(FLAVOR.sealed);
    gameEvent('doorOpen');
    gameEvent('roar');
    emit();
}

// -------------------------------------------------------------- resources
function stepResources(dt) {
    const p = S.player;
    p.o2 -= BAL.o2Drain * dt;
    p.batt -= BAL.battDrain * dt;
    if (p.o2 <= 35 && !p.warned.o2) { p.warned.o2 = true; toast(FLAVOR.o2Low); gameEvent('alarm'); }
    if (p.batt <= 22 && !p.warned.batt) { p.warned.batt = true; toast(FLAVOR.battLow); gameEvent('alarm'); }
    if (p.o2 > 40) p.warned.o2 = false;
    if (p.batt > 30) p.warned.batt = false;
    if (p.o2 <= 0) { p.o2 = 0; die('Oxygen depleted. The dark came in quietly.'); }
    if (p.batt <= 0) { p.batt = 0; die('Battery dead. Life support followed.'); }
}

// --------------------------------------------------------------- entities
function stepEntities(dt) {
    const p = S.player;
    const zi = S.inArena ? -1 : zoneAt(p.y);

    for (const e of S.entities) {
        if (!e.alive) continue;
        const near = Math.abs(e.zone - zi) <= 0; // only the active band simulates
        const d = dist3(p.x, p.y, p.z, e.x, e.y, e.z);

        // pickups: gentle bob + collect
        if (e.kind === 'o2' || e.kind === 'cell' || e.kind === 'repair' || e.kind === 'fragment' || e.kind === 'pearl') {
            if (near && d < 3.4) collect(e);
            continue;
        }

        if (!near) continue;

        if (e.kind === 'mine') {
            if (d < BAL.mineRadius) {
                e.alive = false;
                damagePlayer(BAL.mineDmg, 'A mine found the hull first.');
                gameEvent('explosion', { x: e.x, y: e.y, z: e.z });
            }
            continue;
        }

        if (e.kind === 'eel') {
            if (e.cd > 0) e.cd -= dt;
            if (e.mode === 'patrol') {
                e.a += dt * 0.5;
                const tx = e.homeX + Math.cos(e.a) * 9;
                const tz = e.homeZ + Math.sin(e.a) * 9;
                e.x += (tx - e.x) * dt * 1.4;
                e.z += (tz - e.z) * dt * 1.4;
                e.y += (e.homeY + Math.sin(e.a * 2.3) * 2.5 - e.y) * dt;
                if (d < 16) e.mode = 'hunt';
            } else {
                const k = (e.spd * dt) / (d || 1);
                if (d > BAL.eelRange * 0.7) { e.x += (p.x - e.x) * k; e.y += (p.y - e.y) * k; e.z += (p.z - e.z) * k; }
                if (d > 26) e.mode = 'patrol';
                if (d < BAL.eelRange && e.cd <= 0) {
                    e.windup += dt;
                    if (e.windup > BAL.eelWindup) {
                        e.windup = 0;
                        e.cd = BAL.eelCooldown;
                        damagePlayer(BAL.eelDmg, 'Electrocuted in the dark.');
                        gameEvent('zap', { x: e.x, y: e.y, z: e.z });
                    }
                } else e.windup = Math.max(0, e.windup - dt * 2);
            }
            continue;
        }

        if (e.kind === 'drone') {
            e.a += dt;
            if (d < 26) {
                // strafe orbit + shoot
                const orbit = 13;
                const ang = Math.atan2(e.x - p.x, e.z - p.z) + e.strafe * dt * 0.7;
                const tx = p.x + Math.sin(ang) * orbit;
                const tz = p.z + Math.cos(ang) * orbit;
                const ty = p.y + 3;
                e.x += (tx - e.x) * dt * 1.8;
                e.y += (ty - e.y) * dt * 1.8;
                e.z += (tz - e.z) * dt * 1.8;
                e.fireT -= dt;
                if (e.fireT <= 0) {
                    e.fireT = BAL.droneFireEvery;
                    const dd = d || 1;
                    S.bolts.push({
                        x: e.x, y: e.y, z: e.z,
                        vx: ((p.x - e.x) / dd) * BAL.droneBoltSpeed,
                        vy: ((p.y - e.y) / dd) * BAL.droneBoltSpeed,
                        vz: ((p.z - e.z) / dd) * BAL.droneBoltSpeed,
                        life: 3,
                    });
                    gameEvent('zap', { x: e.x, y: e.y, z: e.z });
                }
            } else {
                e.x += (e.homeX + Math.cos(e.a * 0.6) * 6 - e.x) * dt;
                e.y += (e.homeY - e.y) * dt;
                e.z += (e.homeZ + Math.sin(e.a * 0.6) * 6 - e.z) * dt;
            }
            continue;
        }

        if (e.kind === 'vent') {
            e.t += dt;
            if (e.state === 'idle' && e.t > BAL.ventIdle) { e.state = 'warn'; e.t = 0; }
            else if (e.state === 'warn' && e.t > BAL.ventWarn) { e.state = 'blast'; e.t = 0; gameEvent('vent', { x: e.x, y: e.y, z: e.z }); }
            else if (e.state === 'blast') {
                if (e.t > BAL.ventBlast) { e.state = 'idle'; e.t = 0; }
                else {
                    const inColumn = Math.sqrt((p.x - e.x) ** 2 + (p.z - e.z) ** 2) < BAL.ventRadius &&
                        p.y > e.y && p.y < e.y + BAL.ventHeight;
                    if (inColumn) damagePlayer(BAL.ventDmg, 'Cooked by a pressure vent.');
                }
            }
            continue;
        }
    }

    // falling debris in the station zone
    if (zi === 1) {
        S.debrisT -= dt;
        if (S.debrisT <= 0) {
            S.debrisT = BAL.debrisEvery * rand(0.7, 1.3);
            S.debris.push({
                x: p.x + rand(-14, 14), y: p.y + 36, z: p.z + rand(-14, 14),
                vy: -2, spin: rand(0, TAU), life: 9,
            });
            if (S.debris.length > 8) S.debris.shift();
        }
    }
    for (const dbr of S.debris) {
        dbr.vy = Math.max(dbr.vy - 14 * dt, -26);
        dbr.y += dbr.vy * dt;
        dbr.life -= dt;
        if (dbr.life > 0 && dist3(p.x, p.y, p.z, dbr.x, dbr.y, dbr.z) < 3.2) {
            dbr.life = 0;
            damagePlayer(BAL.debrisDmg, 'Crushed by falling wreckage.');
        }
    }
    S.debris = S.debris.filter((d) => d.life > 0 && d.y > ZONES[1].floorY - 10);
}

// ------------------------------------------------------------- projectiles
function stepProjectiles(dt) {
    const p = S.player;

    for (const t of S.torpedoes) {
        t.x += t.vx * dt; t.y += t.vy * dt; t.z += t.vz * dt;
        t.life -= dt;
        if (t.life <= 0) continue;
        // hit enemies
        for (const e of S.entities) {
            if (!e.alive) continue;
            if (e.kind !== 'eel' && e.kind !== 'drone' && e.kind !== 'mine') continue;
            if (dist3(t.x, t.y, t.z, e.x, e.y, e.z) < (e.kind === 'mine' ? 3.4 : 3.0)) {
                t.life = 0;
                if (e.kind === 'mine') { e.alive = false; S.score += BAL.mineScore; gameEvent('explosion', { x: e.x, y: e.y, z: e.z }); }
                else {
                    e.hp = (e.hp === undefined ? (e.kind === 'drone' ? 2 : 2) : e.hp) - 1;
                    gameEvent('hitEnemy', { x: e.x, y: e.y, z: e.z });
                    if (e.hp <= 0) killEnemy(e, BAL.killScore);
                }
                break;
            }
        }
        // hit the kraken
        if (t.life > 0 && S.boss && S.boss.active && S.boss.introT <= 0) {
            const b = S.boss;
            const dBody = dist3(t.x, t.y, t.z, b.x, b.y + 12, b.z);
            if (dBody < 17) {
                t.life = 0;
                b.hp -= BAL.torpedoDmg;
                S.score += BAL.torpedoDmg;
                gameEvent('hitBoss');
                if (b.hp <= 0) startVictory();
            }
        }
    }
    S.torpedoes = S.torpedoes.filter((t) => t.life > 0);

    for (const b of S.bolts) {
        b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
        b.life -= dt;
        if (b.life > 0 && dist3(p.x, p.y, p.z, b.x, b.y, b.z) < 2.4) {
            b.life = 0;
            damagePlayer(BAL.droneDmg, 'Shot down by station security.');
        }
    }
    S.bolts = S.bolts.filter((b) => b.life > 0);
}

// ------------------------------------------------------------------ zones
function stepZones(dt) {
    const p = S.player;
    if (S.inArena) return;
    const zi = zoneAt(p.y);
    if (zi !== S.zoneIndex) {
        S.zoneIndex = zi;
        toast(FLAVOR['zone' + zi] || ZONES[zi].name);
        gameEvent('zoneChange', { zone: zi });
        emit();
    }
}

// ------------------------------------------------------------------- boss
function stepBoss(dt) {
    const b = S.boss;
    const p = S.player;
    if (!b.active) {
        b.deathT += dt;
        return;
    }

    if (b.introT > 0) {
        b.introT -= dt;
        S.shake = Math.max(S.shake, 0.35);
        return; // reveal cinematic: it rises, you stare
    }

    // phase thresholds
    const frac = b.hp / b.hpMax;
    const phase = frac > 0.75 ? 1 : frac > 0.5 ? 2 : frac > 0.25 ? 3 : 4;
    if (phase !== b.phase) {
        b.phase = phase;
        b.roarT = 1.2;
        S.shake = Math.min(1.5, S.shake + 0.8);
        gameEvent('roar');
        if (phase === 4 && !b.rage) { b.rage = true; toast(FLAVOR.rage); }
    }
    b.roarT = Math.max(0, b.roarT - dt);

    // contact damage with the body
    if (dist3(p.x, p.y, p.z, b.x, b.y + 12, b.z) < 15) {
        damagePlayer(BAL.bossContactDmg, 'It barely noticed the impact.');
        const d = dist3(p.x, p.y, p.z, b.x, b.y + 12, b.z) || 1;
        p.vx += ((p.x - b.x) / d) * 26;
        p.vz += ((p.z - b.z) / d) * 26;
    }

    // attack scheduler
    const speedMul = b.rage ? 0.55 : 1;
    b.attackT -= dt;
    if (b.attackT <= 0) {
        const roll = Math.random();
        if (phase === 1) {
            spawnSwipe(b);
            b.attackT = rand(2.6, 3.6) * speedMul;
        } else if (phase === 2) {
            if (roll < 0.55) spawnSwipe(b); else spawnInk(b);
            b.attackT = rand(2.4, 3.4) * speedMul;
        } else {
            if (roll < 0.4) spawnSwipe(b);
            else if (roll < 0.65) spawnInk(b);
            else spawnWave(b);
            b.attackT = rand(2.2, 3.2) * speedMul;
        }
        if (b.rage && Math.random() < 0.5) spawnSwipe(b); // rage doubles up
    }

    // swipes
    for (const s of b.swipes) {
        s.t += dt;
        if (s.t > s.telegraph && s.t < s.telegraph + s.dur) {
            // sweeping arm: angular position travels across +-40deg around s.angle
            const k = (s.t - s.telegraph) / s.dur;
            const armAng = s.angle - 0.7 + k * 1.4;
            const pa = Math.atan2(p.x - b.x, p.z - b.z);
            const radial = Math.sqrt((p.x - b.x) ** 2 + (p.z - b.z) ** 2);
            const vertOk = Math.abs(p.y - (b.y + 13)) < 9;
            if (vertOk && radial > 8 && radial < 52 && Math.abs(angDiff(pa, armAng)) < 0.22 && p.boostT <= 0) {
                damagePlayer(BAL.swipeDmg, 'Swatted into the dark.');
            }
            // grab: linger near the sweeping tip and it takes you
            const tipX = b.x + Math.sin(armAng) * 46;
            const tipZ = b.z + Math.cos(armAng) * 46;
            if (S.grabbed <= 0 && phase >= 3 && vertOk &&
                dist3(p.x, p.y, p.z, tipX, b.y + 13, tipZ) < BAL.grabRange && Math.random() < 0.6 * dt * 10) {
                S.grabbed = BAL.grabHold;
                damagePlayer(BAL.grabDmg, 'Taken.');
                gameEvent('grab');
            }
        }
    }
    b.swipes = b.swipes.filter((s) => s.t < s.telegraph + s.dur);

    // shockwaves
    for (const w of b.waves) {
        w.r += BAL.waveSpeed * dt;
        const radial = Math.sqrt((p.x - b.x) ** 2 + (p.z - b.z) ** 2);
        if (!w.hitDone && Math.abs(radial - w.r) < BAL.waveBand && Math.abs(p.y - (b.y + 10)) < 12) {
            if (p.boostT > 0) { w.hitDone = true; S.score += 40; } // clean dodge
            else { w.hitDone = true; damagePlayer(BAL.waveDmg, 'The pressure wave hit like a freight train.'); }
        }
    }
    b.waves = b.waves.filter((w) => w.r < ARENA.radius + 16);

    // ink
    let ink = 0;
    for (const c of b.inks) {
        c.t += dt;
        if (dist3(p.x, p.y, p.z, c.x, c.y, c.z) < c.r) ink = Math.max(ink, 1 - c.t / BAL.inkLife);
    }
    b.inks = b.inks.filter((c) => c.t < BAL.inkLife);
    S.inkFactor += (ink - S.inkFactor) * Math.min(1, dt * 3);
}

function spawnSwipe(b) {
    const angle = Math.atan2(S.player.x - b.x, S.player.z - b.z) + rand(-0.5, 0.5);
    b.swipes.push({ angle, t: 0, telegraph: BAL.swipeTelegraph * (b.rage ? 0.7 : 1), dur: BAL.swipeDuration });
    gameEvent('swipe');
}
function spawnWave(b) {
    b.waves.push({ r: 6, hitDone: false });
    toast(FLAVOR.wave);
    gameEvent('wave');
}
function spawnInk(b) {
    for (let i = 0; i < 3; i++) {
        const a = rand(0, TAU), r = rand(10, 34);
        b.inks.push({ x: b.x + Math.cos(a) * r, y: b.y + rand(8, 24), z: b.z + Math.sin(a) * r, r: rand(12, 18), t: 0 });
    }
    gameEvent('ink');
}

function startVictory() {
    const b = S.boss;
    b.active = false;
    b.deathT = 0.0001;
    S.score += 2500;
    S.score += Math.round(S.player.hull * 8 + S.player.o2 * 3);
    const fast = Math.max(0, 600 - S.time);
    S.score += Math.round(fast * 2);
    S.shake = 1.6;
    gameEvent('explosion');
    gameEvent('victory');
    // brief sink cinematic, then the screen
    setTimeout(() => { /* renderer handles pacing via deathT */ }, 0);
    setPhase('victory');
}

// ----------------------------------------------------------------- flavor
function stepFlavor(dt) {
    S.flavorT.movement -= dt;
    if (S.flavorT.movement <= 0) {
        S.flavorT.movement = rand(50, 90);
        if (!S.inArena && Math.random() < 0.7) {
            toast(FLAVOR.movement);
            gameEvent('pingEcho');
        }
    }
}

export const _test = { zoneAt, damagePlayer, makeBoss, enterArena };
