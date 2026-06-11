'use client';

// ===========================================================================
// ABYSS PROTOCOL — the 3D world. Pure procedural geometry: fog, silhouette,
// instanced primitives and emissive light. Renders lib/abyss/sim.js state;
// owns zero gameplay logic.
// ===========================================================================

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { S, drainEvents } from '@/lib/abyss/store';
import { step } from '@/lib/abyss/sim';
import { ZONES, ARENA, BAL } from '@/lib/abyss/constants';

const TAU = Math.PI * 2;
const dummy = new THREE.Object3D();
const ZERO_SCALE = new THREE.Object3D();
ZERO_SCALE.scale.setScalar(0);
ZERO_SCALE.updateMatrix();

// module-level FX queue fed by GameDirector, consumed by <Explosions/>
const fxQueue = [];

function lerp(a, b, t) { return a + (b - a) * t; }

// --------------------------------------------------------------------------
// Director: steps the sim, routes events to audio + fx, drives fog & camera
// --------------------------------------------------------------------------
function GameDirector({ audio }) {
    const { scene, camera } = useThree();
    const fogRef = useRef({ color: new THREE.Color(ZONES[0].fog), density: ZONES[0].fogDensity });

    useEffect(() => {
        scene.fog = new THREE.FogExp2(ZONES[0].fog, ZONES[0].fogDensity);
        scene.background = new THREE.Color(ZONES[0].fog);
    }, [scene]);

    useFrame((state, dt) => {
        step(dt, audio);

        // route sim events
        for (const ev of drainEvents()) {
            const a = audio.current;
            if (a) {
                if (ev.type === 'ping') a.ping();
                else if (ev.type === 'pingEcho') a.pingEcho();
                else if (ev.type === 'boost') a.boost();
                else if (ev.type === 'torpedo') a.torpedo();
                else if (ev.type === 'pickup') a.pickup();
                else if (ev.type === 'keyItem') a.keyItem();
                else if (ev.type === 'hit') a.hit();
                else if (ev.type === 'hitEnemy' || ev.type === 'hitBoss') a.hit();
                else if (ev.type === 'explosion') a.explosion();
                else if (ev.type === 'alarm') a.alarm();
                else if (ev.type === 'zap') a.zap();
                else if (ev.type === 'roar') a.roar();
                else if (ev.type === 'wave') a.waveCue();
                else if (ev.type === 'grab') a.grab();
                else if (ev.type === 'doorOpen') a.doorOpen();
                else if (ev.type === 'gameover') a.gameOver();
                else if (ev.type === 'victory') a.victory();
            }
            if (ev.type === 'explosion' && ev.x !== undefined) fxQueue.push({ kind: 'boom', x: ev.x, y: ev.y, z: ev.z, t: 0 });
            if (ev.type === 'explosion' && ev.x === undefined) fxQueue.push({ kind: 'boom', x: S.player.x, y: S.player.y, z: S.player.z, t: 0 });
            if (ev.type === 'zap' && ev.x !== undefined) fxQueue.push({ kind: 'zap', x: ev.x, y: ev.y, z: ev.z, t: 0 });
        }

        // fog follows depth band (+ ink penalty)
        const p = S.player;
        if (p) {
            const band = S.inArena ? ARENA : ZONES[Math.min(2, Math.max(0, S.zoneIndex))];
            const targetColor = new THREE.Color(band.fog);
            const targetDensity = (band.fogDensity) * (1 + S.inkFactor * 2.6);
            fogRef.current.color.lerp(targetColor, Math.min(1, dt * 1.5));
            fogRef.current.density = lerp(fogRef.current.density, targetDensity, Math.min(1, dt * 1.5));
            if (scene.fog) {
                scene.fog.color.copy(fogRef.current.color);
                scene.fog.density = fogRef.current.density;
            }
            if (scene.background) scene.background.copy(fogRef.current.color);
        }
    });
    return null;
}

// --------------------------------------------------------------------------
// Chase camera with shake
// --------------------------------------------------------------------------
function CameraRig() {
    const { camera } = useThree();
    const pos = useRef(new THREE.Vector3(0, -10, 50));
    useFrame((state, dt) => {
        const p = S.player;
        if (!p) return;
        const fx = Math.sin(p.yaw), fz = Math.cos(p.yaw);
        const target = new THREE.Vector3(p.x - fx * 9.5, p.y + 3.6, p.z - fz * 9.5);
        pos.current.lerp(target, Math.min(1, dt * 4.5));
        const shake = S.reducedMotion ? 0 : S.shake;
        camera.position.set(
            pos.current.x + (Math.random() - 0.5) * shake * 0.9,
            pos.current.y + (Math.random() - 0.5) * shake * 0.9,
            pos.current.z + (Math.random() - 0.5) * shake * 0.9,
        );
        camera.lookAt(p.x + fx * 6, p.y + 0.5, p.z + fz * 6);
    });
    return null;
}

// --------------------------------------------------------------------------
// The submarine — procedural hull, glass dome, glowing engines, headlight
// --------------------------------------------------------------------------
export function SubmarineModel({ idle = false }) {
    return (
        <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[1.0, 2.6, 6, 12]} />
                <meshStandardMaterial color="#27404e" metalness={0.7} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.55, 0.9]}>
                <sphereGeometry args={[0.62, 16, 12]} />
                <meshStandardMaterial color="#8fdfff" emissive="#39c7ff" emissiveIntensity={0.25} transparent opacity={0.85} metalness={0.2} roughness={0.05} />
            </mesh>
            <mesh position={[0, 0.9, -0.9]} rotation={[0.3, 0, 0]}>
                <boxGeometry args={[0.16, 0.8, 0.5]} />
                <meshStandardMaterial color="#1d3340" metalness={0.6} roughness={0.4} />
            </mesh>
            {[-1, 1].map((s) => (
                <mesh key={s} position={[s * 1.05, -0.15, -1.0]} rotation={[0, 0, s * 0.25]}>
                    <boxGeometry args={[0.9, 0.1, 0.7]} />
                    <meshStandardMaterial color="#1d3340" metalness={0.6} roughness={0.4} />
                </mesh>
            ))}
            {[-0.45, 0.45].map((s) => (
                <mesh key={s} position={[s, -0.1, -2.05]}>
                    <cylinderGeometry args={[0.18, 0.26, 0.5, 10]} />
                    <meshStandardMaterial color="#0b1a22" emissive="#37e2ff" emissiveIntensity={idle ? 0.6 : 1.6} />
                </mesh>
            ))}
            <mesh position={[0, -0.1, 2.15]}>
                <sphereGeometry args={[0.3, 10, 8]} />
                <meshStandardMaterial color="#dffbff" emissive="#bdf3ff" emissiveIntensity={2.2} />
            </mesh>
        </group>
    );
}

function PlayerSub() {
    const group = useRef();
    const spot = useRef();
    const spotTarget = useRef();
    const coneMat = useRef();
    const roll = useRef(0);

    useFrame((state, dt) => {
        const p = S.player;
        if (!p || !group.current) return;
        group.current.position.set(p.x, p.y, p.z);
        // bank into turns, pitch with vertical motion
        const turning = (S.input.l ? 1 : 0) - (S.input.r ? 1 : 0);
        roll.current = lerp(roll.current, turning * -0.35, Math.min(1, dt * 4));
        group.current.rotation.set(
            lerp(group.current.rotation.x, clampPitch(-p.vy * 0.04), Math.min(1, dt * 5)),
            p.yaw,
            roll.current,
        );
        if (spot.current && spotTarget.current) {
            spot.current.target = spotTarget.current;
            const battFrac = p.batt / BAL.battMax;
            spot.current.intensity = 110 * Math.max(0.25, Math.min(1, battFrac * 2.2));
        }
        if (coneMat.current) {
            coneMat.current.opacity = 0.055 + (p.boosting ? 0.02 : 0);
        }
        if (p.iframe > 0) {
            group.current.visible = Math.floor(state.clock.elapsedTime * 14) % 2 === 0;
        } else group.current.visible = true;
    });

    return (
        <group ref={group}>
            <SubmarineModel />
            {/* headlight */}
            <spotLight
                ref={spot}
                position={[0, 0.1, 2.2]}
                angle={0.5}
                penumbra={0.7}
                distance={70}
                decay={1.6}
                color="#bfeaff"
                intensity={110}
            />
            <object3D ref={spotTarget} position={[0, -0.6, 30]} />
            {/* visible light cone */}
            <mesh position={[0, 0, 14]} rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[7.5, 26, 20, 1, true]} />
                <meshBasicMaterial ref={coneMat} color="#9fdcff" transparent opacity={0.055} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
            </mesh>
            <pointLight position={[0, 0.4, 0]} distance={9} intensity={2.2} color="#7fd4ff" />
        </group>
    );
}
function clampPitch(v) { return Math.max(-0.5, Math.min(0.5, v)); }

// --------------------------------------------------------------------------
// Sonar pulse ring
// --------------------------------------------------------------------------
function SonarRing() {
    const mesh = useRef();
    const mat = useRef();
    useFrame(() => {
        if (!mesh.current) return;
        const s = S.sonar;
        const life = 1.6;
        if (s.t > life) { mesh.current.visible = false; return; }
        mesh.current.visible = true;
        const k = s.t / life;
        const r = 2 + k * BAL.sonarRange;
        mesh.current.position.set(s.x, s.y, s.z);
        mesh.current.scale.setScalar(r);
        if (mat.current) mat.current.opacity = 0.5 * (1 - k);
    });
    return (
        <mesh ref={mesh} visible={false} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1, 0.02, 8, 64]} />
            <meshBasicMaterial ref={mat} color="#46ffd9" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}

// --------------------------------------------------------------------------
// Instanced renderer over sim entities of one kind
// --------------------------------------------------------------------------
function InstancedKind({ kind, max, geometry, material, baseScale = 1, glow, spin = 0, bobAmp = 0.5 }) {
    const ref = useRef();
    useFrame((state) => {
        const m = ref.current;
        if (!m) return;
        const t = state.clock.elapsedTime;
        let i = 0;
        for (const e of S.entities) {
            if (e.kind !== kind || !e.alive) continue;
            if (i >= max) break;
            const hiddenNow = e.hidden && (S.time - e.revealT > BAL.sonarRevealTime) &&
                Math.hypot(S.player.x - e.x, S.player.y - e.y, S.player.z - e.z) > 10;
            if (hiddenNow) { dummy.scale.setScalar(0.001); }
            else dummy.scale.setScalar(baseScale * (glow && S.time - e.revealT < BAL.sonarRevealTime ? 1.2 : 1));
            dummy.position.set(e.x, e.y + Math.sin(t * 1.4 + e.bob) * bobAmp, e.z);
            dummy.rotation.set(0, spin ? t * spin + e.bob : e.bob, 0);
            dummy.updateMatrix();
            m.setMatrixAt(i++, dummy.matrix);
        }
        for (; i < max; i++) m.setMatrixAt(i, ZERO_SCALE.matrix);
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, max]} frustumCulled={false}>
            {geometry}
            {material}
        </instancedMesh>
    );
}

function Pickups() {
    return (
        <group>
            <InstancedKind kind="o2" max={12} baseScale={1}
                geometry={<capsuleGeometry args={[0.55, 0.9, 4, 10]} />}
                material={<meshStandardMaterial color="#dffaff" emissive="#37c8ff" emissiveIntensity={1.4} />} />
            <InstancedKind kind="cell" max={4} baseScale={1}
                geometry={<boxGeometry args={[0.9, 1.3, 0.9]} />}
                material={<meshStandardMaterial color="#fff7cf" emissive="#ffd83d" emissiveIntensity={1.6} />} />
            <InstancedKind kind="repair" max={3} baseScale={1}
                geometry={<boxGeometry args={[1.1, 1.1, 1.1]} />}
                material={<meshStandardMaterial color="#ffe2dd" emissive="#ff5d4a" emissiveIntensity={1.2} />} />
            <InstancedKind kind="fragment" max={4} glow baseScale={1} spin={1.2}
                geometry={<octahedronGeometry args={[0.9, 0]} />}
                material={<meshStandardMaterial color="#d8fff4" emissive="#2dffc9" emissiveIntensity={2.2} />} />
            <InstancedKind kind="pearl" max={12} glow baseScale={1} spin={0.6}
                geometry={<sphereGeometry args={[0.7, 14, 10]} />}
                material={<meshStandardMaterial color="#fdfaff" emissive="#c9a7ff" emissiveIntensity={1.5} metalness={0.6} roughness={0.2} />} />
        </group>
    );
}

function Mines() {
    return (
        <InstancedKind kind="mine" max={26} baseScale={1} bobAmp={0.8}
            geometry={<icosahedronGeometry args={[1.1, 0]} />}
            material={<meshStandardMaterial color="#1a232b" emissive="#ff3030" emissiveIntensity={0.7} metalness={0.7} roughness={0.5} />} />
    );
}

// eels + drones are few — individual meshes with refs
function Hunters() {
    const eels = useRef([]);
    const drones = useRef([]);
    const eelList = useMemo(() => S.entities.filter((e) => e.kind === 'eel'), []);
    const droneList = useMemo(() => S.entities.filter((e) => e.kind === 'drone'), []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        eelList.forEach((e, i) => {
            const g = eels.current[i];
            if (!g) return;
            g.visible = e.alive;
            if (!e.alive) return;
            g.position.set(e.x, e.y, e.z);
            g.rotation.y = Math.atan2(S.player.x - e.x, S.player.z - e.z);
            const charge = e.windup > 0 ? 1 + e.windup * 1.6 : 1;
            g.scale.set(1, 1, 1 + Math.sin(t * 6 + i) * 0.15);
            const mat = g.children[0] && g.children[0].material;
            if (mat) mat.emissiveIntensity = 0.9 * charge + Math.sin(t * 8) * 0.2;
        });
        droneList.forEach((e, i) => {
            const g = drones.current[i];
            if (!g) return;
            g.visible = e.alive;
            if (!e.alive) return;
            g.position.set(e.x, e.y, e.z);
            g.rotation.y = t * 2 + i;
        });
    });

    return (
        <group>
            {eelList.map((e, i) => (
                <group key={e.id} ref={(el) => { eels.current[i] = el; }}>
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <capsuleGeometry args={[0.35, 3.4, 4, 8]} />
                        <meshStandardMaterial color="#10212b" emissive="#49f2ff" emissiveIntensity={0.9} />
                    </mesh>
                    <mesh position={[0, 0, 1.9]}>
                        <sphereGeometry args={[0.42, 10, 8]} />
                        <meshStandardMaterial color="#0a161d" emissive="#aefcff" emissiveIntensity={1.4} />
                    </mesh>
                </group>
            ))}
            {droneList.map((e, i) => (
                <group key={e.id} ref={(el) => { drones.current[i] = el; }}>
                    <mesh>
                        <octahedronGeometry args={[0.9, 0]} />
                        <meshStandardMaterial color="#202b33" emissive="#ff9d2e" emissiveIntensity={1.1} metalness={0.8} roughness={0.3} />
                    </mesh>
                    <mesh position={[0, 0.5, 0]}>
                        <sphereGeometry args={[0.18, 8, 6]} />
                        <meshBasicMaterial color="#ff4242" />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// --------------------------------------------------------------------------
// Projectiles, debris, explosions
// --------------------------------------------------------------------------
function Torpedoes() {
    const ref = useRef();
    const MAXN = 12;
    useFrame(() => {
        const m = ref.current;
        if (!m) return;
        let i = 0;
        for (const t of S.torpedoes) {
            if (i >= MAXN) break;
            dummy.position.set(t.x, t.y, t.z);
            dummy.rotation.set(Math.PI / 2, Math.atan2(t.vx, t.vz), 0, 'YXZ');
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            m.setMatrixAt(i++, dummy.matrix);
        }
        for (; i < MAXN; i++) m.setMatrixAt(i, ZERO_SCALE.matrix);
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, MAXN]} frustumCulled={false}>
            <capsuleGeometry args={[0.22, 1.4, 4, 8]} />
            <meshStandardMaterial color="#15222b" emissive="#62ffe9" emissiveIntensity={2.4} />
        </instancedMesh>
    );
}

function Bolts() {
    const ref = useRef();
    const MAXN = 16;
    useFrame(() => {
        const m = ref.current;
        if (!m) return;
        let i = 0;
        for (const b of S.bolts) {
            if (i >= MAXN) break;
            dummy.position.set(b.x, b.y, b.z);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            m.setMatrixAt(i++, dummy.matrix);
        }
        for (; i < MAXN; i++) m.setMatrixAt(i, ZERO_SCALE.matrix);
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, MAXN]} frustumCulled={false}>
            <sphereGeometry args={[0.3, 8, 6]} />
            <meshBasicMaterial color="#ffb02e" />
        </instancedMesh>
    );
}

function DebrisFalling() {
    const ref = useRef();
    const MAXN = 10;
    useFrame((state) => {
        const m = ref.current;
        if (!m) return;
        let i = 0;
        for (const d of S.debris) {
            if (i >= MAXN) break;
            dummy.position.set(d.x, d.y, d.z);
            dummy.rotation.set(d.spin + d.y * 0.05, d.spin, d.spin * 0.7);
            dummy.scale.set(1.6, 0.5, 1.1);
            dummy.updateMatrix();
            m.setMatrixAt(i++, dummy.matrix);
        }
        for (; i < MAXN; i++) m.setMatrixAt(i, ZERO_SCALE.matrix);
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, MAXN]} frustumCulled={false}>
            <boxGeometry args={[1.4, 1.4, 1.4]} />
            <meshStandardMaterial color="#26333c" metalness={0.5} roughness={0.7} />
        </instancedMesh>
    );
}

function Explosions() {
    const ref = useRef();
    const MAXN = 14;
    const live = useRef([]);
    useFrame((state, dt) => {
        while (fxQueue.length) {
            const fx = fxQueue.shift();
            if (live.current.length < MAXN) live.current.push(fx);
        }
        const m = ref.current;
        if (!m) return;
        let i = 0;
        live.current.forEach((fx) => { fx.t += dt; });
        live.current = live.current.filter((fx) => fx.t < 0.6);
        for (const fx of live.current) {
            const k = fx.t / 0.6;
            dummy.position.set(fx.x, fx.y, fx.z);
            dummy.scale.setScalar(0.6 + k * (fx.kind === 'zap' ? 3 : 7));
            dummy.updateMatrix();
            m.setMatrixAt(i++, dummy.matrix);
        }
        for (; i < MAXN; i++) m.setMatrixAt(i, ZERO_SCALE.matrix);
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={ref} args={[undefined, undefined, MAXN]} frustumCulled={false}>
            <sphereGeometry args={[1, 12, 8]} />
            <meshBasicMaterial color="#ffd9a0" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}

// --------------------------------------------------------------------------
// Ambient particles — marine snow, capped & recycled around the player
// --------------------------------------------------------------------------
function MarineSnow() {
    const ref = useRef();
    const COUNT = 700;
    const seeds = useMemo(() => {
        const arr = new Float32Array(COUNT * 4);
        for (let i = 0; i < COUNT; i++) {
            arr[i * 4 + 0] = (Math.random() - 0.5) * 120;
            arr[i * 4 + 1] = (Math.random() - 0.5) * 90;
            arr[i * 4 + 2] = (Math.random() - 0.5) * 120;
            arr[i * 4 + 3] = 0.4 + Math.random() * 1.1;
        }
        return arr;
    }, []);
    const geo = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 3), 3));
        return g;
    }, []);
    useFrame((state) => {
        const p = S.player;
        if (!p || !ref.current) return;
        const t = state.clock.elapsedTime;
        const pos = geo.attributes.position.array;
        const n = S.quality < 1 || S.reducedMotion ? COUNT / 2 : COUNT;
        for (let i = 0; i < COUNT; i++) {
            if (i > n) { pos[i * 3 + 1] = 99999; continue; }
            const sx = seeds[i * 4], sy = seeds[i * 4 + 1], sz = seeds[i * 4 + 2], spd = seeds[i * 4 + 3];
            // wrap around the player in a 120-unit cube, drifting down + sideways
            pos[i * 3 + 0] = p.x + wrap(sx + Math.sin(t * 0.1 + i) * 2 - p.x * 0.06, 120);
            pos[i * 3 + 1] = p.y + wrap(sy - t * spd - p.y * 0.06, 90);
            pos[i * 3 + 2] = p.z + wrap(sz - p.z * 0.06, 120);
        }
        geo.attributes.position.needsUpdate = true;
    });
    return (
        <points ref={ref} geometry={geo} frustumCulled={false}>
            <pointsMaterial color="#9fc8d8" size={0.16} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
        </points>
    );
}
function wrap(v, range) { return ((v % range) + range * 1.5) % range - range / 2; }

// --------------------------------------------------------------------------
// ZONE 0 — Twilight Reef: coral silhouettes, god rays, bioluminescent dots
// --------------------------------------------------------------------------
function Reef() {
    const corals = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 90; i++) {
            const a = Math.random() * TAU;
            const r = 30 + Math.random() * 46;
            arr.push({
                x: Math.cos(a) * r, z: Math.sin(a) * r,
                y: -110 + Math.random() * 4,
                s: 2 + Math.random() * 7,
                ry: Math.random() * TAU,
            });
        }
        return arr;
    }, []);
    const coralRef = useRef();
    useEffect(() => {
        const m = coralRef.current;
        if (!m) return;
        corals.forEach((c, i) => {
            dummy.position.set(c.x, c.y, c.z);
            dummy.scale.set(c.s * 0.4, c.s, c.s * 0.4);
            dummy.rotation.set(0, c.ry, 0);
            dummy.updateMatrix();
            m.setMatrixAt(i, dummy.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
    }, [corals]);

    const dots = useMemo(() => {
        const g = new THREE.BufferGeometry();
        const arr = new Float32Array(120 * 3);
        for (let i = 0; i < 120; i++) {
            const a = Math.random() * TAU, r = 24 + Math.random() * 50;
            arr[i * 3] = Math.cos(a) * r;
            arr[i * 3 + 1] = -108 + Math.random() * 30;
            arr[i * 3 + 2] = Math.sin(a) * r;
        }
        g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
        return g;
    }, []);

    return (
        <group>
            <instancedMesh ref={coralRef} args={[undefined, undefined, 90]} frustumCulled={false}>
                <coneGeometry args={[1, 1, 5]} />
                <meshStandardMaterial color="#0c2433" roughness={0.9} />
            </instancedMesh>
            {/* faint god rays from above */}
            {[[-30, 18], [10, -38], [38, 26]].map(([x, z], i) => (
                <mesh key={i} position={[x, -40, z]} rotation={[0, 0, 0.12 * (i - 1)]}>
                    <coneGeometry args={[14, 90, 12, 1, true]} />
                    <meshBasicMaterial color="#1d4d66" transparent opacity={0.05} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
            ))}
            <points geometry={dots}>
                <pointsMaterial color="#37e8b8" size={0.5} sizeAttenuation transparent opacity={0.8} depthWrite={false} />
            </points>
            {/* reef floor */}
            <mesh position={[0, -111.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[80, 36]} />
                <meshStandardMaterial color="#071824" roughness={1} />
            </mesh>
        </group>
    );
}

// --------------------------------------------------------------------------
// Gate ring at a zone boundary
// --------------------------------------------------------------------------
function Gate({ index }) {
    const ringMat = useRef();
    const disc = useRef();
    useFrame((state) => {
        const g = S.gates[index];
        if (!g) return;
        const t = state.clock.elapsedTime;
        if (ringMat.current) {
            ringMat.current.emissiveIntensity = g.open ? 2.4 + Math.sin(t * 3) * 0.6 : 0.6 + Math.sin(t * 1.4) * 0.2;
            ringMat.current.emissive.set(g.open ? '#2dffc9' : '#ff4630');
        }
        if (disc.current) disc.current.visible = !g.open;
    });
    const y = ZONES[index].gateY;
    return (
        <group position={[0, y, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[11, 1.2, 10, 40]} />
                <meshStandardMaterial ref={ringMat} color="#16242e" emissive="#ff4630" emissiveIntensity={0.6} metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh ref={disc} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                <circleGeometry args={[11, 28]} />
                <meshStandardMaterial color="#0d1d28" metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* annulus shelf around the gate so the boundary reads as solid */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
                <ringGeometry args={[11, ZONES[index].radius + 6, 36]} />
                <meshStandardMaterial color="#081521" roughness={1} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
}

// --------------------------------------------------------------------------
// ZONE 1 — Sunken Research Station
// --------------------------------------------------------------------------
function Station() {
    const blink = useRef();
    useFrame((state) => {
        if (blink.current) {
            const on = Math.sin(state.clock.elapsedTime * 2.4) > 0.4;
            blink.current.material.emissiveIntensity = on ? 3 : 0.2;
        }
    });
    const modules = useMemo(() => ([
        { p: [-26, -212, -18], s: [22, 8, 12], r: 0.2 },
        { p: [14, -222, 22], s: [16, 7, 10], r: -0.4 },
        { p: [30, -198, -24], s: [12, 6, 9], r: 0.9 },
        { p: [-8, -232, 6], s: [26, 9, 11], r: 1.4 },
        { p: [0, -178, -38], s: [10, 14, 10], r: 0 },
    ]), []);
    return (
        <group>
            {modules.map((m, i) => (
                <group key={i} position={m.p} rotation={[0, m.r, i % 2 ? 0.08 : -0.06]}>
                    <mesh>
                        <boxGeometry args={m.s} />
                        <meshStandardMaterial color="#0e1d27" metalness={0.55} roughness={0.6} />
                    </mesh>
                    {/* broken glowing windows */}
                    {Array.from({ length: 4 }).map((_, w) => (
                        <mesh key={w} position={[-m.s[0] / 2 + (w + 0.5) * (m.s[0] / 4), 0.6, m.s[2] / 2 + 0.06]}>
                            <planeGeometry args={[m.s[0] / 7, 1.4]} />
                            <meshStandardMaterial
                                color="#06121a"
                                emissive={w === 1 && i % 2 ? '#091b14' : '#1fae8f'}
                                emissiveIntensity={w === 2 && i === 3 ? 0.05 : 0.8}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    ))}
                </group>
            ))}
            {/* central spire + warning light */}
            <mesh position={[0, -205, 0]}>
                <cylinderGeometry args={[1.2, 2.2, 56, 8]} />
                <meshStandardMaterial color="#0c1822" metalness={0.6} roughness={0.5} />
            </mesh>
            <mesh ref={blink} position={[0, -176, 0]}>
                <sphereGeometry args={[0.8, 10, 8]} />
                <meshStandardMaterial color="#220505" emissive="#ff2e2e" emissiveIntensity={3} />
            </mesh>
            {/* drooping cables */}
            {[[-20, -16], [18, 8], [-2, 30]].map(([x, z], i) => (
                <mesh key={i} position={[x, -196 - i * 6, z]} rotation={[0.4 + i * 0.3, i, 0.3]}>
                    <cylinderGeometry args={[0.12, 0.12, 26, 5]} />
                    <meshStandardMaterial color="#091017" roughness={0.9} />
                </mesh>
            ))}
            <mesh position={[0, -241.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[66, 32]} />
                <meshStandardMaterial color="#050f17" roughness={1} />
            </mesh>
        </group>
    );
}

// --------------------------------------------------------------------------
// ZONE 2 — Abyssal Trench: canyon walls, bones, vents, watching eyes
// --------------------------------------------------------------------------
function Trench() {
    const wallRef = useRef();
    const walls = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 60; i++) {
            const a = (i / 60) * TAU;
            const r = 44 + Math.random() * 10;
            arr.push({
                x: Math.cos(a) * r, z: Math.sin(a) * r,
                y: -318 + (Math.random() - 0.5) * 90,
                s: 8 + Math.random() * 18, ry: Math.random() * TAU,
            });
        }
        return arr;
    }, []);
    useEffect(() => {
        const m = wallRef.current;
        if (!m) return;
        walls.forEach((c, i) => {
            dummy.position.set(c.x, c.y, c.z);
            dummy.scale.set(c.s * 0.6, c.s * 1.6, c.s * 0.6);
            dummy.rotation.set(0, c.ry, 0);
            dummy.updateMatrix();
            m.setMatrixAt(i, dummy.matrix);
        });
        m.instanceMatrix.needsUpdate = true;
    }, [walls]);

    const eyes = useMemo(() => Array.from({ length: 7 }).map((_, i) => ({
        x: Math.cos(i * 1.9) * 38, z: Math.sin(i * 1.9) * 38, y: -290 - i * 11, ph: i * 1.3,
    })), []);
    const eyeRefs = useRef([]);
    useFrame((state) => {
        const t = state.clock.elapsedTime;
        eyes.forEach((e, i) => {
            const g = eyeRefs.current[i];
            if (!g) return;
            const open = Math.sin(t * 0.5 + e.ph) > 0.55;
            g.visible = open || S.sonar.t < 2.5; // a ping makes them all open at once
        });
    });

    return (
        <group>
            <instancedMesh ref={wallRef} args={[undefined, undefined, 60]} frustumCulled={false}>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#060e15" roughness={1} />
            </instancedMesh>
            {/* whale fall — a ribcage */}
            {Array.from({ length: 7 }).map((_, i) => (
                <mesh key={i} position={[14 - i * 4.5, -369, -10]} rotation={[0, 0.3, Math.PI / 2 + (i - 3) * 0.06]}>
                    <torusGeometry args={[6 - Math.abs(i - 3) * 0.7, 0.35, 6, 18, Math.PI]} />
                    <meshStandardMaterial color="#5e6a70" roughness={0.9} />
                </mesh>
            ))}
            {/* ancient ruin slabs */}
            {[[-22, -362, 18, 0.4], [-28, -358, 8, -0.2], [24, -365, 24, 0.8]].map(([x, y, z, r], i) => (
                <mesh key={i} position={[x, y, z]} rotation={[r * 0.3, r, 0.1]}>
                    <boxGeometry args={[7, 12, 1.6]} />
                    <meshStandardMaterial color="#0a141c" roughness={0.95} />
                </mesh>
            ))}
            {/* watching eyes — pairs of pale dots that blink out */}
            {eyes.map((e, i) => (
                <group key={i} ref={(el) => { eyeRefs.current[i] = el; }} position={[e.x, e.y, e.z]}>
                    {[-0.7, 0.7].map((s) => (
                        <mesh key={s} position={[s, 0, 0]}>
                            <sphereGeometry args={[0.28, 6, 5]} />
                            <meshBasicMaterial color="#b8ffe9" />
                        </mesh>
                    ))}
                </group>
            ))}
            <mesh position={[0, -373.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[48, 28]} />
                <meshStandardMaterial color="#03080d" roughness={1} />
            </mesh>
        </group>
    );
}

function Vents() {
    const refs = useRef([]);
    const vents = useMemo(() => S.entities.filter((e) => e.kind === 'vent'), []);
    useFrame(() => {
        vents.forEach((v, i) => {
            const g = refs.current[i];
            if (!g) return;
            const jet = g.children[1];
            if (!jet) return;
            if (v.state === 'blast') {
                const k = Math.min(1, v.t / 0.25);
                jet.visible = true;
                jet.scale.set(1, k, 1);
                jet.material.opacity = 0.5 * (1 - v.t / BAL.ventBlast * 0.5);
            } else if (v.state === 'warn') {
                jet.visible = true;
                jet.scale.set(0.4, 0.12, 0.4);
                jet.material.opacity = 0.35;
            } else jet.visible = false;
        });
    });
    return (
        <group>
            {vents.map((v, i) => (
                <group key={v.id} ref={(el) => { refs.current[i] = el; }} position={[v.x, v.y, v.z]}>
                    <mesh>
                        <cylinderGeometry args={[2.4, 3.4, 2.4, 10]} />
                        <meshStandardMaterial color="#101a20" emissive="#ff7b29" emissiveIntensity={0.5} roughness={0.8} />
                    </mesh>
                    <mesh position={[0, BAL.ventHeight / 2, 0]}>
                        <cylinderGeometry args={[1.4, 2.6, BAL.ventHeight, 10, 1, true]} />
                        <meshBasicMaterial color="#ffd9a8" transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// --------------------------------------------------------------------------
// THE KRAKEN — silhouette colossus: dome, 8 animated tentacle chains, eyes
// --------------------------------------------------------------------------
const SEGS = 9;
function Kraken() {
    const root = useRef();
    const tentacles = useRef([]);
    const eyeL = useRef(); const eyeR = useRef();
    const teleRefs = useRef([]);
    const waveRefs = useRef([]);
    const inkRefs = useRef([]);

    useFrame((state, dt) => {
        const b = S.boss;
        const g = root.current;
        if (!g) return;
        if (!b) { g.visible = false; return; }
        g.visible = true;
        const t = state.clock.elapsedTime;

        // intro rise / death sink
        let yOff = 0;
        if (b.introT > 0) yOff = -34 * (b.introT / 2.6);
        if (!b.active) yOff = -b.deathT * 6;
        g.position.set(b.x, b.y + yOff, b.z);
        g.rotation.y = Math.sin(t * 0.1) * 0.2;

        // tentacles: curling chains; during a swipe, the matching arm extends
        for (let i = 0; i < 8; i++) {
            const chain = tentacles.current[i];
            if (!chain) continue;
            const baseA = (i / 8) * TAU;
            let extend = 0;
            for (const s of b.swipes) {
                const da = Math.abs(((baseA - s.angle + Math.PI * 3) % TAU) - Math.PI);
                if (da < 0.6) {
                    const k = s.t < s.telegraph ? (s.t / s.telegraph) * 0.4 : 0.4 + ((s.t - s.telegraph) / s.dur) * 0.6;
                    extend = Math.max(extend, k);
                }
            }
            for (let j = 0; j < SEGS; j++) {
                const seg = chain.children[j];
                if (!seg) continue;
                const reach = 6 + j * (4.4 + extend * 3.2);
                const curl = Math.sin(t * (b.rage ? 2.2 : 1.1) + i * 0.9 + j * 0.55) * (0.5 - extend * 0.3);
                const lift = Math.sin(j * 0.42 + t * 0.7 + i) * 2.4 + j * (1.5 + extend * 1.6);
                seg.position.set(
                    Math.sin(baseA + curl * 0.12) * reach,
                    4 + lift,
                    Math.cos(baseA + curl * 0.12) * reach,
                );
                const sc = (1 - j / SEGS) * 3.4 + 0.45;
                seg.scale.setScalar(sc * (1 + extend * 0.15));
            }
        }

        // eyes track the player; rage turns them red
        const p = S.player;
        [eyeL.current, eyeR.current].forEach((eye, k) => {
            if (!eye) return;
            eye.material.color.set(b.rage ? '#ff4030' : '#9ffcff');
            const s = 1 + Math.sin(t * (b.rage ? 9 : 3) + k) * 0.12;
            eye.scale.setScalar(s);
        });

        // telegraphs (swipe warnings) — group yaw keeps the strip exactly on the attack bearing
        teleRefs.current.forEach((g2, i) => {
            const s = b.swipes[i];
            if (!g2) return;
            if (!s || s.t > s.telegraph) { g2.visible = false; return; }
            g2.visible = true;
            const k = s.t / s.telegraph;
            g2.position.set(b.x, b.y + 13, b.z);
            g2.rotation.y = s.angle;
            const m = g2.children[0];
            if (m) m.material.opacity = 0.18 + k * 0.3;
        });

        // shockwave rings
        waveRefs.current.forEach((m, i) => {
            const w = b.waves[i];
            if (!m) return;
            if (!w) { m.visible = false; return; }
            m.visible = true;
            m.position.set(b.x, b.y + 10, b.z);
            m.scale.setScalar(w.r);
            m.material.opacity = Math.max(0, 0.55 - w.r / (ARENA.radius + 20) * 0.5);
        });

        // ink clouds
        inkRefs.current.forEach((m, i) => {
            const c = b.inks[i];
            if (!m) return;
            if (!c) { m.visible = false; return; }
            m.visible = true;
            m.position.set(c.x, c.y, c.z);
            const k = Math.min(1, c.t * 2);
            m.scale.setScalar(c.r * k);
            m.material.opacity = 0.85 * (1 - c.t / BAL.inkLife);
        });
    });

    return (
        <group>
            <group ref={root} visible={false}>
                {/* body: hood + mantle */}
                <mesh position={[0, 16, 0]}>
                    <sphereGeometry args={[13, 20, 16]} />
                    <meshStandardMaterial color="#07111a" roughness={0.85} />
                </mesh>
                <mesh position={[0, 26, 0]} rotation={[0, 0, 0]}>
                    <coneGeometry args={[10.5, 22, 16]} />
                    <meshStandardMaterial color="#081420" roughness={0.85} />
                </mesh>
                {/* faint bioluminescent veins */}
                <mesh position={[0, 18, 0]}>
                    <sphereGeometry args={[13.25, 12, 10]} />
                    <meshBasicMaterial color="#0e3b4d" wireframe transparent opacity={0.25} />
                </mesh>
                {/* eyes */}
                <mesh ref={eyeL} position={[-4.6, 16, 11.4]}>
                    <sphereGeometry args={[1.5, 10, 8]} />
                    <meshBasicMaterial color="#9ffcff" />
                </mesh>
                <mesh ref={eyeR} position={[4.6, 16, 11.4]}>
                    <sphereGeometry args={[1.5, 10, 8]} />
                    <meshBasicMaterial color="#9ffcff" />
                </mesh>
                {/* under-light sells the silhouette */}
                <pointLight position={[0, 4, 0]} distance={90} intensity={26} color="#0e4d5e" />
                {/* 8 tentacle chains */}
                {Array.from({ length: 8 }).map((_, i) => (
                    <group key={i} ref={(el) => { tentacles.current[i] = el; }}>
                        {Array.from({ length: SEGS }).map((_, j) => (
                            <mesh key={j}>
                                <sphereGeometry args={[1, 10, 8]} />
                                <meshStandardMaterial color="#060f17" roughness={0.9} />
                            </mesh>
                        ))}
                    </group>
                ))}
            </group>

            {/* attack FX live outside the root so positions are absolute */}
            {Array.from({ length: 3 }).map((_, i) => (
                <group key={'tel' + i} ref={(el) => { teleRefs.current[i] = el; }} visible={false}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 30]}>
                        <planeGeometry args={[10, 46]} />
                        <meshBasicMaterial color="#ff3b2e" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            ))}
            {Array.from({ length: 3 }).map((_, i) => (
                <mesh key={'wave' + i} ref={(el) => { waveRefs.current[i] = el; }} visible={false} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1, 0.06, 8, 48]} />
                    <meshBasicMaterial color="#6fe8ff" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
                </mesh>
            ))}
            {Array.from({ length: 9 }).map((_, i) => (
                <mesh key={'ink' + i} ref={(el) => { inkRefs.current[i] = el; }} visible={false}>
                    <sphereGeometry args={[1, 10, 8]} />
                    <meshBasicMaterial color="#01070b" transparent opacity={0.85} depthWrite={false} />
                </mesh>
            ))}
        </group>
    );
}

// --------------------------------------------------------------------------
// Arena bowl
// --------------------------------------------------------------------------
function Arena() {
    return (
        <group>
            <mesh position={[0, ARENA.floorY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[ARENA.radius + 14, 40]} />
                <meshStandardMaterial color="#020608" roughness={1} />
            </mesh>
            {/* ruined monoliths circling the arena */}
            {Array.from({ length: 10 }).map((_, i) => {
                const a = (i / 10) * TAU;
                return (
                    <mesh key={i} position={[Math.cos(a) * (ARENA.radius - 4), ARENA.floorY + 9, Math.sin(a) * (ARENA.radius - 4)]} rotation={[0, -a, (i % 3 - 1) * 0.12]}>
                        <boxGeometry args={[5, 22, 2.4]} />
                        <meshStandardMaterial color="#050d13" roughness={0.95} emissive="#0a2e33" emissiveIntensity={0.25} />
                    </mesh>
                );
            })}
        </group>
    );
}

// --------------------------------------------------------------------------
// Scene root
// --------------------------------------------------------------------------
export default function Scene({ audio }) {
    return (
        <>
            <GameDirector audio={audio} />
            <CameraRig />
            <ambientLight color="#1a3a52" intensity={0.55} />
            <directionalLight position={[20, 80, 10]} intensity={0.35} color="#2a5a78" />

            <PlayerSub />
            <SonarRing />
            <Torpedoes />
            <Bolts />
            <DebrisFalling />
            <Explosions />
            <MarineSnow />
            <Pickups />
            <Mines />
            <Hunters />

            <Reef />
            <Gate index={0} />
            <Station />
            <Gate index={1} />
            <Trench />
            <Vents />
            <Arena />
            <Kraken />
        </>
    );
}
