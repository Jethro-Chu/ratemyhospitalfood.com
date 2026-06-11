'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Play, Pause, RotateCcw, Volume2, VolumeX,
    ArrowLeft, ArrowBigUp, ChevronsDown, Home, Trophy, Zap,
} from 'lucide-react';
import TrayDashEngine, { VIEW_W, VIEW_H, MEDALS } from '@/lib/games/trayDash/engine';
import { SPRITES } from '@/lib/games/trayDash/sprites';
import TrayDashAudio from '@/lib/games/trayDash/audio';
import PixelSprite from './PixelSprite';

export default function TrayDashGame() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const audioRef = useRef(null);
    const controlsRef = useRef(null);

    const [screen, setScreen] = useState('start'); // start|howto|playing|paused|gameover
    const [hud, setHud] = useState({ score: 0, distFt: 0, jello: 0, shield: false, best: 0 });
    const [toast, setToast] = useState(null);
    const [result, setResult] = useState(null);
    const [muted, setMuted] = useState(false);

    const screenRef = useRef(screen);
    const toastTimer = useRef(null);
    useEffect(() => { screenRef.current = screen; }, [screen]);

    const showToast = useCallback((t) => {
        if (!t) return;
        setToast(t);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        const dur = Math.min(5000, 2200 + t.text.length * 38);
        toastTimer.current = setTimeout(() => setToast(null), dur);
    }, []);

    useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

    // ---- engine bootstrap ------------------------------------------------
    useEffect(() => {
        audioRef.current = new TrayDashAudio();
        const engine = new TrayDashEngine(canvasRef.current, {
            audio: audioRef.current,
            onHud: (h) => setHud(h),
            onToast: (t) => showToast(t),
            onGameOver: (res) => { setResult(res); setScreen('gameover'); },
            onPause: (paused) => {
                if (screenRef.current === 'playing' || screenRef.current === 'paused') {
                    setScreen(paused ? 'paused' : 'playing');
                }
            },
        });
        engineRef.current = engine;
        setHud((h) => ({ ...h, best: engine.best }));
        return () => engine.destroy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- prevent page scroll while touching the controls -----------------
    useEffect(() => {
        const el = controlsRef.current;
        if (!el) return;
        const block = (e) => e.preventDefault();
        el.addEventListener('touchmove', block, { passive: false });
        el.addEventListener('touchstart', block, { passive: false });
        return () => {
            el.removeEventListener('touchmove', block);
            el.removeEventListener('touchstart', block);
        };
    }, [screen]);

    // ---- flow helpers ----------------------------------------------------
    const tap = () => audioRef.current?.select();

    const startRun = useCallback(() => {
        audioRef.current?.init();
        tap();
        setToast(null);
        setResult(null);
        engineRef.current?.newRun();
        setScreen('playing');
    }, []);

    const togglePause = useCallback(() => { tap(); engineRef.current?.togglePause(); }, []);

    const resumeGame = useCallback(() => {
        tap();
        engineRef.current?.resume();
        setScreen('playing');
    }, []);

    const toggleSound = useCallback(() => {
        const next = !muted;
        setMuted(next);
        audioRef.current?.setMuted(next);
    }, [muted]);

    // ---- touch control bindings -----------------------------------------
    const hold = (key) => ({
        onPointerDown: (e) => { e.preventDefault(); audioRef.current?.init(); engineRef.current?.setInput(key, true); },
        onPointerUp: (e) => { e.preventDefault(); engineRef.current?.setInput(key, false); },
        onPointerLeave: () => engineRef.current?.setInput(key, false),
        onPointerCancel: () => engineRef.current?.setInput(key, false),
    });

    const isPlaying = screen === 'playing';
    const medal = result ? MEDALS.find((m) => result.distFt >= m.ft) : null;

    return (
        <div className="w-full">
            <div
                className="relative w-full max-w-[760px] mx-auto rounded-3xl overflow-hidden border border-cream-300/80 shadow-warm-lg bg-ink-900 select-none"
                style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, touchAction: 'none' }}
            >
                <canvas
                    ref={canvasRef}
                    width={VIEW_W}
                    height={VIEW_H}
                    className="absolute inset-0 w-full h-full"
                    style={{ imageRendering: 'pixelated' }}
                />

                {/* HUD (only during play / pause) */}
                {(isPlaying || screen === 'paused') && (
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between gap-2 px-2.5 py-2 bg-gradient-to-b from-ink-900/70 to-transparent pointer-events-none">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-white text-[11px] sm:text-xs font-bold">
                                <PixelSprite sprite={SPRITES.jello} scale={2} alt="Jello cups" />
                                {hud.jello}
                            </span>
                            {hud.shield && (
                                <span className="flex items-center gap-1 text-[#9fe4ef] text-[10px] font-bold uppercase tracking-wider">
                                    <PixelSprite sprite={SPRITES.shield_bubble} scale={2} alt="Jello Shield" />
                                    <span className="hidden sm:inline">Shield</span>
                                </span>
                            )}
                        </div>

                        <div className="flex flex-col items-center leading-none">
                            <span className="text-honey-300 text-sm sm:text-base font-extrabold tabular-nums">{hud.score}</span>
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/70 mt-0.5">
                                {hud.distFt} ft
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pointer-events-auto">
                            <button onClick={toggleSound} aria-label={muted ? 'Unmute' : 'Mute'}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors">
                                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={togglePause} aria-label="Pause"
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors">
                                <Pause className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Touch controls: slide left, jump right */}
                {isPlaying && (
                    <div ref={controlsRef} className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4 pointer-events-none">
                        <div className="pointer-events-auto">
                            <ControlButton {...hold('slide')} label="Slide" tone="honey"><ChevronsDown className="w-7 h-7" /></ControlButton>
                        </div>
                        <div className="pointer-events-auto">
                            <ControlButton {...hold('jump')} label="Jump (hold for higher)" tone="brand"><ArrowBigUp className="w-7 h-7" /></ControlButton>
                        </div>
                    </div>
                )}

                {/* Non-blocking toast */}
                {isPlaying && toast && (
                    <div
                        key={toast.id}
                        className="absolute top-11 sm:top-12 left-1/2 -translate-x-1/2 w-[88%] max-w-[440px] z-20 pointer-events-none animate-fade-up"
                    >
                        <div className="bg-cream-50/95 backdrop-blur border border-cream-300 rounded-2xl shadow-warm-md px-3.5 py-2.5 flex items-start gap-2.5">
                            {toast.sprite && SPRITES[toast.sprite] && (
                                <div className="shrink-0 bg-cream-100 rounded-lg p-1 border border-cream-300/70">
                                    <PixelSprite sprite={SPRITES[toast.sprite]} scale={3} alt={toast.speaker} />
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="text-[9px] font-bold uppercase tracking-widest text-brand-600 mb-0.5">
                                    {toast.speaker}
                                </div>
                                <p className="text-ink-800 text-[12px] sm:text-[13px] leading-snug">{toast.text}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== SCREEN OVERLAYS ===== */}
                {screen === 'start' && (
                    <Overlay>
                        <PixelSprite sprite={SPRITES.tot_run1} scale={5} alt="Scooter Tot" className="mb-3 animate-bounce" />
                        <h1 className="font-display text-[28px] sm:text-[38px] font-semibold text-white leading-[1.05] px-4">
                            Tray <span className="text-honey-300">Dash</span>
                        </h1>
                        <p className="text-cream-100/80 text-[12px] sm:text-[13.5px] max-w-md mt-3 px-6 leading-relaxed">
                            Outrun the lunch rush! Leap soup spills, slide under flying trays,
                            and grab every jello cup. It only gets faster…
                        </p>
                        {hud.best > 0 && (
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-honey-400/20 border border-honey-300/30 text-honey-200 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                                <Trophy className="w-3 h-3" /> Best: {hud.best}
                            </div>
                        )}
                        <div className="flex flex-col items-center gap-2 mt-5 w-full px-8 max-w-xs">
                            <BigButton onClick={startRun} primary><Play className="w-4 h-4" /> Dash!</BigButton>
                            <BigButton onClick={() => { tap(); setScreen('howto'); }}>How to Play</BigButton>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}

                {screen === 'howto' && (
                    <Overlay scroll>
                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-4">How to Play</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 w-full max-w-lg text-left">
                            <HowCard title="On phone / tablet">
                                Hold <b>jump</b> to leap higher — tap it for a quick hop. Hold <b>slide</b> to duck under trays
                                (it also drops you out of the air fast).
                            </HowCard>
                            <HowCard title="On desktop">
                                <b>Space / W / ↑</b> to jump (hold = higher). <b>S / ↓</b> to slide. <b>P</b> to pause.
                            </HowCard>
                        </div>
                        <ul className="text-cream-100/80 text-[12px] mt-4 space-y-1 px-6 max-w-md text-left list-disc list-inside">
                            <li><b>Jump</b> soup spills, meatballs, and lunch carts.</li>
                            <li><b>Slide</b> under flying trays — tray walls can&rsquo;t be jumped easily!</li>
                            <li>Steam vents puff a warning before they blast. Time it.</li>
                            <li>Grab <b>jello cups</b> (+15) and rare <b>golden forks</b> (+75).</li>
                            <li>The <b>Jello Shield</b> bubble saves you from one bonk.</li>
                            <li>One crash ends the run — how far can you dash?</li>
                        </ul>
                        <BigButton onClick={() => { tap(); setScreen('start'); }} className="mt-5"><ArrowLeft className="w-4 h-4" /> Back</BigButton>
                    </Overlay>
                )}

                {screen === 'paused' && (
                    <Overlay>
                        <h2 className="font-display text-3xl font-semibold text-white mb-5">Paused</h2>
                        <div className="flex flex-col items-center gap-2 w-full px-8 max-w-xs">
                            <BigButton onClick={resumeGame} primary><Play className="w-4 h-4" /> Resume</BigButton>
                            <BigButton onClick={startRun}><RotateCcw className="w-4 h-4" /> Restart Run</BigButton>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <Home className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}

                {screen === 'gameover' && result && (
                    <Overlay>
                        <div className="text-5xl mb-1" aria-hidden="true">{medal ? medal.emoji : '🥄'}</div>
                        <h2 className="font-display text-3xl font-semibold text-white">
                            {result.newBest ? 'New Best!' : 'Wipeout!'}
                        </h2>
                        {medal && (
                            <p className="text-honey-200 text-[13px] font-semibold mt-1">{medal.name} Lunch Runner</p>
                        )}
                        <div className="bg-white/10 rounded-2xl px-5 py-3 mt-4 text-[13px] text-cream-100 space-y-1 min-w-[220px]">
                            <Row label="Distance"><span>{result.distFt} ft</span></Row>
                            <Row label="Jello grabbed"><span>{result.jello}</span></Row>
                            <div className="border-t border-white/15 my-1" />
                            <Row label="Score"><span className="text-honey-300 font-extrabold">{result.score}</span></Row>
                            <Row label="Best">
                                <span className={result.newBest ? 'text-honey-300 font-extrabold' : ''}>
                                    {result.best}{result.newBest && ' ★'}
                                </span>
                            </Row>
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-5 w-full px-8 max-w-xs">
                            <BigButton onClick={startRun} primary><Zap className="w-4 h-4" /> Run Again</BigButton>
                            <BigButton onClick={() => { tap(); setScreen('howto'); }}>How to Play</BigButton>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <Home className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}
            </div>

            {/* Desktop hint under the stage */}
            <p className="text-center text-ink-400 text-[12px] mt-3 hidden sm:block">
                Desktop: <b>Space</b> jump (hold = higher) · <b>S</b> or <b>↓</b> slide · <b>P</b> pause · or use the on-screen buttons on touch devices.
            </p>
        </div>
    );
}

/* ---------- small presentational helpers ---------- */

function ControlButton({ children, label, tone = 'cream', ...handlers }) {
    const tones = {
        cream: 'bg-cream-50/90 text-ink-800 active:bg-cream-200',
        brand: 'bg-brand-500/95 text-white active:bg-brand-600',
        honey: 'bg-honey-400/95 text-ink-900 active:bg-honey-500',
    };
    return (
        <button
            {...handlers}
            aria-label={label}
            className={`w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full shadow-warm-md border border-black/5 flex items-center justify-center select-none touch-none transition-transform active:scale-95 ${tones[tone]}`}
            style={{ touchAction: 'none' }}
        >
            {children}
        </button>
    );
}

function Overlay({ children, scroll = false }) {
    return (
        <div className={`absolute inset-0 bg-ink-900/85 backdrop-blur-sm flex flex-col items-center justify-center text-center ${scroll ? 'overflow-y-auto py-6' : ''}`}>
            {children}
        </div>
    );
}

function BigButton({ children, onClick, primary, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[0.97] w-full py-3 px-5 text-[14px] ${
                primary
                    ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-warm'
                    : 'bg-white/15 hover:bg-white/25 text-white'
            } ${className}`}
        >
            {children}
        </button>
    );
}

function HowCard({ title, children }) {
    return (
        <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <div className="text-honey-300 text-[11px] font-bold uppercase tracking-widest mb-1.5">{title}</div>
            <p className="text-cream-100/85 text-[12.5px] leading-relaxed">{children}</p>
        </div>
    );
}

function Row({ label, children }) {
    return (
        <div className="flex items-center justify-between gap-6">
            <span className="text-cream-100/70">{label}</span>
            {children}
        </div>
    );
}
