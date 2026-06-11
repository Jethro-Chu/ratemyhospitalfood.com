'use client';

// ===========================================================================
// ABYSS PROTOCOL — game shell. Owns the screen state machine, DOM HUD,
// keyboard + touch input, audio lifecycle, and mounts the 3D scene.
// ===========================================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import { S, subscribe, emit, setPhase, loadHigh } from '@/lib/abyss/store';
import { initRun } from '@/lib/abyss/sim';
import { ZONES, ARENA, BAL, FLAVOR, DEPTH_SCALE, SURFACE_OFFSET } from '@/lib/abyss/constants';
import AbyssAudio from '@/lib/abyss/audio';

const FONT_MONO = "ui-monospace, 'SF Mono', Menlo, 'Courier New', monospace";

export default function AbyssGame() {
    const audio = useRef(null);
    const [, force] = useState(0);
    const [runId, setRunId] = useState(0);
    const [introStep, setIntroStep] = useState(0);
    const rootRef = useRef(null);

    // re-render on store emits + a 10Hz HUD ticker while playing
    useEffect(() => {
        const unsub = subscribe(() => force((n) => n + 1));
        const iv = setInterval(() => { if (S.phase === 'playing') force((n) => n + 1); }, 100);
        return () => { unsub(); clearInterval(iv); };
    }, []);

    // boot: audio, high score, reduced motion
    useEffect(() => {
        audio.current = new AbyssAudio();
        loadHigh();
        try {
            const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
            S.reducedMotion = mq.matches;
            const onChange = (e) => { S.reducedMotion = e.matches; };
            mq.addEventListener?.('change', onChange);
            return () => mq.removeEventListener?.('change', onChange);
        } catch (e) { /* fine */ }
    }, []);

    // ---- keyboard --------------------------------------------------------
    useEffect(() => {
        const down = (e) => {
            const playing = S.phase === 'playing';
            const game = playing || S.phase === 'paused';
            const k = e.code;
            if (playing && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(k)) {
                e.preventDefault();
            }
            if (k === 'Escape' && game) { togglePause(); return; }
            if (k === 'KeyM') { toggleSound(); return; }
            if (!playing) {
                if ((k === 'Enter' || k === 'Space') && S.phase === 'menu') { startIntro(); e.preventDefault(); }
                return;
            }
            const i = S.input;
            if (k === 'KeyW' || k === 'ArrowUp') i.f = 1;
            if (k === 'KeyS' || k === 'ArrowDown') i.b = 1;
            if (k === 'KeyA' || k === 'ArrowLeft') i.l = 1;
            if (k === 'KeyD' || k === 'ArrowRight') i.r = 1;
            if (k === 'KeyQ' || k === 'PageDown' || k === 'KeyC') i.down = 1;
            if (k === 'KeyE' || k === 'PageUp' || k === 'KeyR') i.up = 1;
            if (k === 'Space' && !e.repeat) i.sonar = true;
            if (k === 'ShiftLeft' || k === 'ShiftRight') i.boost = true;
            if (k === 'Enter') i.fire = true;
        };
        const up = (e) => {
            const i = S.input;
            const k = e.code;
            if (k === 'KeyW' || k === 'ArrowUp') i.f = 0;
            if (k === 'KeyS' || k === 'ArrowDown') i.b = 0;
            if (k === 'KeyA' || k === 'ArrowLeft') i.l = 0;
            if (k === 'KeyD' || k === 'ArrowRight') i.r = 0;
            if (k === 'KeyQ' || k === 'PageDown' || k === 'KeyC') i.down = 0;
            if (k === 'KeyE' || k === 'PageUp' || k === 'KeyR') i.up = 0;
            if (k === 'ShiftLeft' || k === 'ShiftRight') i.boost = false;
            if (k === 'Enter') i.fire = false;
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // pause when the tab hides
    useEffect(() => {
        const onVis = () => {
            if (document.hidden && S.phase === 'playing') { setPhase('paused'); audio.current?.suspend(); }
        };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    // mouse fire on the canvas area
    const onPointerDownStage = useCallback((e) => {
        if (S.phase !== 'playing') return;
        if (e.target.closest && e.target.closest('[data-ui]')) return;
        S.input.fire = true;
    }, []);
    const onPointerUpStage = useCallback(() => { S.input.fire = false; }, []);

    // ---- flow ------------------------------------------------------------
    const startIntro = useCallback(() => {
        audio.current?.init();
        audio.current?.resume();
        audio.current?.uiClick();
        setIntroStep(0);
        setPhase('intro');
    }, []);

    // intro sequencer
    useEffect(() => {
        if (S.phase !== 'intro') return;
        if (introStep >= FLAVOR.intro.length) {
            initRun();
            setRunId((n) => n + 1);
            setPhase('playing');
            return;
        }
        audio.current?.ping();
        const t = setTimeout(() => setIntroStep((s) => s + 1), 1500);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [introStep, S.phase]);

    const togglePause = useCallback(() => {
        if (S.phase === 'playing') { setPhase('paused'); audio.current?.suspend(); }
        else if (S.phase === 'paused') { setPhase('playing'); audio.current?.resume(); }
    }, []);

    const restart = useCallback(() => {
        audio.current?.uiClick();
        audio.current?.resume();
        initRun();
        setRunId((n) => n + 1);
        setPhase('playing');
    }, []);

    const toMenu = useCallback(() => {
        audio.current?.uiClick();
        setPhase('menu');
    }, []);

    const toggleSound = useCallback(() => {
        audio.current?.init();
        const next = !S.soundOn;
        S.soundOn = next;
        audio.current?.setMuted(!next);
        emit();
    }, []);

    // ---- touch input -----------------------------------------------------
    const joyRef = useRef(null);
    const joyState = useRef({ id: null, cx: 0, cy: 0 });
    const onJoyDown = (e) => {
        e.preventDefault();
        const t = e.changedTouches ? e.changedTouches[0] : e;
        joyState.current = { id: t.identifier ?? 'mouse', cx: t.clientX, cy: t.clientY };
    };
    const onJoyMove = (e) => {
        e.preventDefault();
        const js = joyState.current;
        if (js.id === null) return;
        const touches = e.changedTouches ? Array.from(e.changedTouches) : [e];
        const t = touches.find((x) => (x.identifier ?? 'mouse') === js.id);
        if (!t) return;
        const dx = t.clientX - js.cx, dy = t.clientY - js.cy;
        const i = S.input;
        i.f = dy < -12 ? Math.min(1, -dy / 50) : 0;
        i.b = dy > 12 ? Math.min(1, dy / 50) : 0;
        i.l = dx < -12 ? 1 : 0;
        i.r = dx > 12 ? 1 : 0;
        if (joyRef.current) {
            const nub = joyRef.current.querySelector('[data-nub]');
            if (nub) nub.style.transform = `translate(${Math.max(-34, Math.min(34, dx))}px, ${Math.max(-34, Math.min(34, dy))}px)`;
        }
    };
    const onJoyUp = (e) => {
        e.preventDefault();
        joyState.current.id = null;
        const i = S.input;
        i.f = i.b = i.l = i.r = 0;
        const nub = joyRef.current?.querySelector('[data-nub]');
        if (nub) nub.style.transform = 'translate(0px, 0px)';
    };
    const holdBtn = (key) => ({
        onTouchStart: (e) => { e.preventDefault(); S.input[key] = key === 'sonar' ? true : true; },
        onTouchEnd: (e) => { e.preventDefault(); if (key !== 'sonar') S.input[key] = false; },
        onPointerDown: (e) => { if (e.pointerType === 'mouse') S.input[key] = true; },
        onPointerUp: (e) => { if (e.pointerType === 'mouse' && key !== 'sonar') S.input[key] = false; },
    });

    // ---- derived HUD values ------------------------------------------------
    const p = S.player;
    const phase = S.phase;
    const playing = phase === 'playing' || phase === 'paused';
    const depth = p ? Math.round(-p.y * DEPTH_SCALE + SURFACE_OFFSET) : 0;
    const zoneName = S.inArena ? ARENA.name : ZONES[S.zoneIndex]?.name || '';
    const objective = S.inArena
        ? (S.boss && !S.boss.active ? 'Signal silenced' : ARENA.objective)
        : ZONES[S.zoneIndex]?.objective || '';
    const gateNeeds = !S.inArena && ZONES[S.zoneIndex]?.gateNeeds;
    const progress = gateNeeds ? `${S.counts[gateNeeds.item]}/${gateNeeds.count}` : '';
    const boss = S.boss;
    const isTouch = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

    return (
        <div
            ref={rootRef}
            onPointerDown={onPointerDownStage}
            onPointerUp={onPointerUpStage}
            style={{
                position: 'fixed', inset: 0, background: '#020910', color: '#cfeefc',
                fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
                overflow: 'hidden', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none',
            }}
        >
            {/* 3D stage — mounted once a run exists, kept alive through pause/over */}
            {runId > 0 && (
                <Canvas
                    key={runId}
                    dpr={[1, 1.75]}
                    gl={{ antialias: true, powerPreference: 'high-performance' }}
                    camera={{ fov: 62, near: 0.1, far: 320 }}
                    style={{ position: 'absolute', inset: 0 }}
                    frameloop={phase === 'paused' ? 'demand' : 'always'}
                >
                    <Scene audio={audio} />
                </Canvas>
            )}

            {/* damage vignette */}
            {playing && (
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    boxShadow: `inset 0 0 ${90 + S.flash * 60}px rgba(190, 30, 20, ${0.12 + S.flash * 0.55})`,
                    opacity: p && (S.flash > 0.02 || p.hull <= 30) ? 1 : 0,
                    transition: 'opacity 0.4s',
                }} />
            )}

            {/* ============== HUD ============== */}
            {playing && p && (
                <>
                    {/* top-left: vitals */}
                    <div style={{ position: 'absolute', top: 12, left: 12, width: 190, pointerEvents: 'none' }}>
                        <Bar label="HULL" value={p.hull} max={BAL.hullMax} color={p.hull <= 30 ? '#ff4434' : '#3ddc97'} blink={p.hull <= 30} />
                        <Bar label="O₂" value={p.o2} max={BAL.o2Max} color={p.o2 <= 35 ? '#ff4434' : '#46c8ff'} blink={p.o2 <= 35} />
                        <Bar label="BATT" value={p.batt} max={BAL.battMax} color={p.batt <= 22 ? '#ff4434' : '#ffd23d'} blink={p.batt <= 22} />
                    </div>

                    {/* top-right: depth / zone / score */}
                    <div style={{ position: 'absolute', top: 12, right: 12, textAlign: 'right', pointerEvents: 'none' }}>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 26, fontWeight: 700, letterSpacing: 1, textShadow: '0 0 12px rgba(70,200,255,0.55)' }}>
                            {depth}<span style={{ fontSize: 13, opacity: 0.7 }}> m</span>
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, opacity: 0.75, marginTop: 2 }}>{zoneName}</div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 13, marginTop: 6, color: '#9fe8c8' }}>
                            SCORE {Math.round(S.score)}
                        </div>
                    </div>

                    {/* boss bar */}
                    {boss && boss.introT <= 0 && boss.active && (
                        <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', width: 'min(46vw, 420px)', pointerEvents: 'none', textAlign: 'center' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 4, color: boss.rage ? '#ff6a5a' : '#bde9ff', marginBottom: 4 }}>
                                {boss.rage ? '— IT IS ANGRY —' : 'THE THING BELOW'}
                            </div>
                            <div style={{ height: 7, background: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(160,230,255,0.25)' }}>
                                <div style={{ height: '100%', width: `${(boss.hp / boss.hpMax) * 100}%`, background: boss.rage ? 'linear-gradient(90deg,#ff3b2e,#ff7a3d)' : 'linear-gradient(90deg,#1f8ba8,#46e0ff)', transition: 'width 0.25s' }} />
                            </div>
                        </div>
                    )}

                    {/* objective */}
                    <div style={{ position: 'absolute', bottom: isTouch ? 170 : 18, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', width: '90%' }}>
                        <div style={{ fontSize: 10, letterSpacing: 2.5, fontWeight: 700, color: '#7fc4dd', opacity: 0.9 }}>
                            ▸ {objective}{progress ? `  [${progress}]` : ''}
                        </div>
                    </div>

                    {/* toasts (flavor) */}
                    <div style={{ position: 'absolute', top: boss ? 64 : 52, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none', width: '92%' }}>
                        {S.toasts.map((t) => (
                            <div key={t.id} style={{
                                fontFamily: FONT_MONO, fontSize: 13, color: '#d9f6ff', margin: '4px 0',
                                textShadow: '0 0 14px rgba(80,220,255,0.5)', animation: 'abyssFade 4s forwards',
                            }}>{t.text}</div>
                        ))}
                    </div>

                    {/* pickup popups */}
                    <div style={{ position: 'absolute', bottom: isTouch ? 200 : 56, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                        {S.popups.map((t) => (
                            <div key={t.id} style={{
                                fontFamily: FONT_MONO, fontSize: 12, color: '#aef7d8', margin: '2px 0',
                                animation: 'abyssRise 1.8s forwards',
                            }}>{t.text}</div>
                        ))}
                    </div>

                    {/* top buttons */}
                    <div data-ui style={{ position: 'absolute', top: 96, right: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <UiBtn onClick={togglePause} label={phase === 'paused' ? '▶' : '❚❚'} title="Pause (Esc)" />
                        <UiBtn onClick={toggleSound} label={S.soundOn ? '🔊' : '🔇'} title="Sound (M)" />
                    </div>

                    {/* grab warning */}
                    {S.grabbed > 0 && (
                        <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
                            <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: '#ff5b4a', letterSpacing: 3, animation: 'abyssBlink 0.4s infinite' }}>
                                GRABBED — BOOST TO BREAK FREE
                            </div>
                        </div>
                    )}

                    {/* touch controls */}
                    {isTouch && phase === 'playing' && (
                        <>
                            <div
                                data-ui ref={joyRef}
                                onTouchStart={onJoyDown} onTouchMove={onJoyMove} onTouchEnd={onJoyUp} onTouchCancel={onJoyUp}
                                style={{
                                    position: 'absolute', left: 18, bottom: 24, width: 124, height: 124, borderRadius: '50%',
                                    background: 'rgba(120,200,240,0.08)', border: '1.5px solid rgba(140,220,255,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none',
                                }}
                            >
                                <div data-nub style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    background: 'rgba(140,220,255,0.25)', border: '1.5px solid rgba(160,230,255,0.5)',
                                }} />
                            </div>
                            <div data-ui style={{ position: 'absolute', right: 16, bottom: 24, display: 'grid', gridTemplateColumns: '64px 64px', gap: 10, touchAction: 'none' }}>
                                <TouchBtn {...holdBtn('up')} label="▲" sub="RISE" />
                                <TouchBtn {...holdBtn('fire')} label="◎" sub="FIRE" strong />
                                <TouchBtn {...holdBtn('down')} label="▼" sub="DIVE" />
                                <TouchBtn {...holdBtn('boost')} label="≫" sub="BOOST" />
                                <div />
                                <TouchBtn {...holdBtn('sonar')} label="◉" sub="SONAR" />
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ============== SCREENS ============== */}
            {phase === 'menu' && <MenuScreen onStart={startIntro} onSound={toggleSound} />}
            {phase === 'intro' && (
                <Screen>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 'clamp(15px, 4vw, 22px)', letterSpacing: 2, color: '#bdeeff', textShadow: '0 0 18px rgba(80,220,255,0.6)', animation: 'abyssFadeIn 0.8s' }} key={introStep}>
                        {FLAVOR.intro[Math.min(introStep, FLAVOR.intro.length - 1)]}
                    </div>
                </Screen>
            )}
            {phase === 'paused' && (
                <Screen dim>
                    <ScreenTitle>DIVE SUSPENDED</ScreenTitle>
                    <MenuButton onClick={togglePause}>Resume</MenuButton>
                    <MenuButton onClick={restart} ghost>Restart Dive</MenuButton>
                    <MenuButton onClick={toMenu} ghost>Abandon to Menu</MenuButton>
                    <BackLink />
                </Screen>
            )}
            {phase === 'gameover' && (
                <Screen dim>
                    <div style={{ fontSize: 11, letterSpacing: 5, color: '#ff6a5a', fontWeight: 800, marginBottom: 10 }}>CONNECTION LOST</div>
                    <ScreenTitle>{S.overReason || 'The abyss kept the sub.'}</ScreenTitle>
                    <StatBlock />
                    <MenuButton onClick={restart}>Dive Again</MenuButton>
                    <MenuButton onClick={toMenu} ghost>Surface to Menu</MenuButton>
                    <BackLink />
                </Screen>
            )}
            {phase === 'victory' && (
                <Screen dim>
                    <div style={{ fontSize: 11, letterSpacing: 5, color: '#46e0ff', fontWeight: 800, marginBottom: 10 }}>SIGNAL SILENCED</div>
                    <ScreenTitle>The trench is quiet now.</ScreenTitle>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: '#8fd8c8', marginTop: -6, marginBottom: 8 }}>
                        Whatever it was — it sank back below the floor.
                    </div>
                    <StatBlock victory />
                    <MenuButton onClick={restart}>Dive Again</MenuButton>
                    <MenuButton onClick={toMenu} ghost>Return to Menu</MenuButton>
                    <BackLink />
                </Screen>
            )}

            <style>{`
                @keyframes abyssFade { 0% {opacity: 0; transform: translateY(6px);} 8% {opacity: 1; transform: none;} 80% {opacity: 1;} 100% {opacity: 0;} }
                @keyframes abyssRise { 0% {opacity: 0; transform: translateY(8px);} 15% {opacity: 1;} 80% {opacity: 1;} 100% {opacity: 0; transform: translateY(-10px);} }
                @keyframes abyssFadeIn { from {opacity: 0;} to {opacity: 1;} }
                @keyframes abyssBlink { 0%, 60% {opacity: 1;} 61%, 100% {opacity: 0.25;} }
                @keyframes abyssPulse { 0%, 100% {opacity: 0.5;} 50% {opacity: 1;} }
            `}</style>
        </div>
    );
}

// ---------------------------------------------------------------- pieces
function Bar({ label, value, max, color, blink }) {
    return (
        <div style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 800, letterSpacing: 2, color: '#9fcfe2', marginBottom: 2 }}>
                <span>{label}</span>
                <span style={{ fontFamily: FONT_MONO }}>{Math.max(0, Math.round(value))}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(160,230,255,0.18)' }}>
                <div style={{
                    height: '100%', width: `${Math.max(0, (value / max) * 100)}%`, background: color,
                    transition: 'width 0.25s', animation: blink ? 'abyssPulse 0.8s infinite' : 'none',
                }} />
            </div>
        </div>
    );
}

function UiBtn({ onClick, label, title }) {
    return (
        <button onClick={onClick} title={title} aria-label={title} style={{
            width: 38, height: 38, borderRadius: 10, cursor: 'pointer', fontSize: 15,
            background: 'rgba(10,30,45,0.65)', color: '#cfeefc', border: '1px solid rgba(140,220,255,0.3)',
        }}>{label}</button>
    );
}

function TouchBtn({ label, sub, strong, ...handlers }) {
    return (
        <button {...handlers} aria-label={sub} style={{
            width: 64, height: 64, borderRadius: '50%', touchAction: 'none',
            background: strong ? 'rgba(70,224,255,0.22)' : 'rgba(120,200,240,0.1)',
            border: `1.5px solid rgba(140,220,255,${strong ? 0.65 : 0.35})`,
            color: '#dffaff', fontSize: 20, lineHeight: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
            <span>{label}</span>
            <span style={{ fontSize: 8, letterSpacing: 1.5, fontWeight: 800, opacity: 0.8 }}>{sub}</span>
        </button>
    );
}

function Screen({ children, dim }) {
    return (
        <div data-ui style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20,
            background: dim ? 'rgba(2, 8, 14, 0.72)' : 'transparent', backdropFilter: dim ? 'blur(3px)' : 'none', zIndex: 20,
        }}>{children}</div>
    );
}

function ScreenTitle({ children }) {
    return (
        <h2 style={{
            margin: '0 0 18px', fontSize: 'clamp(19px, 5vw, 30px)', fontWeight: 700, color: '#e6f9ff',
            fontFamily: "Georgia, 'Times New Roman', serif", maxWidth: 560, lineHeight: 1.25,
        }}>{children}</h2>
    );
}

function MenuButton({ children, onClick, ghost }) {
    return (
        <button onClick={onClick} style={{
            display: 'block', width: 'min(78vw, 280px)', margin: '5px 0', padding: '13px 18px',
            borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, letterSpacing: 1,
            background: ghost ? 'transparent' : 'linear-gradient(180deg, #0e6f8e, #0a4a63)',
            color: ghost ? '#9fd5e8' : '#eafaff',
            border: ghost ? '1px solid rgba(140,220,255,0.3)' : '1px solid rgba(140,230,255,0.55)',
            boxShadow: ghost ? 'none' : '0 6px 24px -8px rgba(70,200,255,0.45)',
        }}>{children}</button>
    );
}

function BackLink() {
    return (
        <Link href="/" style={{ marginTop: 14, fontSize: 12, color: '#6f9bb0', textDecoration: 'none' }}>
            ← Back to RateMyHospitalFood
        </Link>
    );
}

function StatBlock({ victory }) {
    const newBest = S.score > 0 && Math.round(S.score) >= S.high && S.high > 0;
    return (
        <div style={{
            fontFamily: FONT_MONO, fontSize: 13, color: '#bfe9f5', margin: '4px 0 16px',
            border: '1px solid rgba(140,220,255,0.25)', borderRadius: 10, padding: '10px 22px',
            background: 'rgba(8,24,36,0.6)', minWidth: 240,
        }}>
            <Row k="SCORE" v={Math.round(S.score)} hot={newBest} />
            <Row k="BEST" v={S.high} />
            <Row k="DEPTH" v={`${Math.round(-(S.player?.y || 0) * DEPTH_SCALE + SURFACE_OFFSET)} m`} />
            <Row k="PEARLS" v={S.pearls} />
            <Row k="KILLS" v={S.kills} />
            {victory && <Row k="KRAKEN" v="SILENCED" hot />}
        </div>
    );
}
function Row({ k, v, hot }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 30, padding: '2px 0' }}>
            <span style={{ opacity: 0.65 }}>{k}</span>
            <span style={{ color: hot ? '#5cffc9' : undefined, fontWeight: hot ? 700 : 400 }}>{v}</span>
        </div>
    );
}

// ---------------------------------------------------------------- menu
function MenuScreen({ onStart, onSound }) {
    const [showHow, setShowHow] = useState(false);
    return (
        <Screen>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'radial-gradient(ellipse at 50% 120%, #07273c 0%, #03101c 45%, #010810 100%)' }}>
                {/* drifting specks */}
                {Array.from({ length: 26 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute', width: 2, height: 2, borderRadius: 2,
                        left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`,
                        background: 'rgba(140,220,255,0.5)', animation: `abyssPulse ${2 + (i % 5)}s infinite`,
                    }} />
                ))}
            </div>
            <div style={{ fontSize: 10, letterSpacing: 6, color: '#5fa8c4', fontWeight: 800 }}>RMHF SPECIAL OPERATIONS</div>
            <h1 style={{
                margin: '10px 0 4px', fontSize: 'clamp(34px, 9vw, 64px)', fontWeight: 800, letterSpacing: 4,
                color: '#eafaff', fontFamily: "Georgia, 'Times New Roman', serif",
                textShadow: '0 0 34px rgba(70,200,255,0.5), 0 0 90px rgba(40,140,200,0.35)',
            }}>
                ABYSS PROTOCOL
            </h1>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12.5, color: '#7fc4dd', maxWidth: 460, lineHeight: 1.6 }}>
                A signal is rising from beneath an abandoned trench.<br />Take the sub down. Find out what is transmitting.
            </div>
            {S.high > 0 && (
                <div style={{ marginTop: 12, fontFamily: FONT_MONO, fontSize: 12, color: '#ffd23d', border: '1px solid rgba(255,210,61,0.35)', borderRadius: 999, padding: '4px 14px' }}>
                    BEST {S.high}
                </div>
            )}
            <div style={{ height: 18 }} />
            <MenuButton onClick={onStart}>▸ Begin the Dive</MenuButton>
            <MenuButton onClick={() => setShowHow((v) => !v)} ghost>{showHow ? 'Hide' : 'How to Play'}</MenuButton>
            <MenuButton onClick={onSound} ghost>Sound: {S.soundOn ? 'ON' : 'OFF'}</MenuButton>
            {showHow && (
                <div style={{
                    fontFamily: FONT_MONO, fontSize: 11.5, lineHeight: 1.8, color: '#a8d8ea', maxWidth: 440,
                    border: '1px solid rgba(140,220,255,0.25)', borderRadius: 10, padding: '10px 16px', marginTop: 8,
                    background: 'rgba(8,24,36,0.7)', textAlign: 'left',
                }}>
                    <b>DESKTOP</b> — WASD/arrows steer · E/Q rise & dive · SHIFT boost-dodge · SPACE sonar ping · ENTER or click fires torpedoes · ESC pause<br />
                    <b>MOBILE</b> — left stick steers · RISE/DIVE · FIRE · BOOST · SONAR<br />
                    <b>SURVIVE</b> — watch hull, O₂ and battery. Sonar reveals what hides. Boost through pressure waves. Collect what glows. Descend.
                </div>
            )}
            <BackLink />
        </Screen>
    );
}
