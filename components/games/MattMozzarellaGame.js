'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import {
    Heart, Play, Pause, RotateCcw, Volume2, VolumeX,
    ArrowLeft, ArrowRight, ArrowBigUp, Droplet, Lock, Trophy, ChevronRight, Home,
} from 'lucide-react';
import GameEngine, { VIEW_W, VIEW_H } from '@/lib/games/mattMozzarella/engine';
import { LEVELS, SCORE } from '@/lib/games/mattMozzarella/levels';
import GameAudio from '@/lib/games/mattMozzarella/audio';
import PixelSprite from './PixelSprite';

export default function MattMozzarellaGame() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const audioRef = useRef(null);
    const controlsRef = useRef(null);

    const [screen, setScreen] = useState('start'); // start|howto|chapters|intro|playing|paused|levelcomplete|gameover|endcutscene|victory
    const [levelIndex, setLevelIndex] = useState(0);
    const [hud, setHud] = useState({ hearts: 3, score: 0, crumbs: 0, totalCrumbs: 0, levelName: '', hasCookie: false });
    const [dialogue, setDialogue] = useState(null);
    const [cutscene, setCutscene] = useState(null); // { cards:[], index, next:'playing'|'levelcomplete' }
    const [result, setResult] = useState(null);     // level-complete summary
    const [muted, setMuted] = useState(false);

    // refs mirrored for engine callbacks (avoid stale closures)
    const screenRef = useRef(screen);
    const levelRef = useRef(levelIndex);
    useEffect(() => { screenRef.current = screen; }, [screen]);
    useEffect(() => { levelRef.current = levelIndex; }, [levelIndex]);

    // ---- engine bootstrap ------------------------------------------------
    useEffect(() => {
        audioRef.current = new GameAudio();
        const engine = new GameEngine(canvasRef.current, {
            audio: audioRef.current,
            onHud: (h) => setHud(h),
            onDialogue: (d) => setDialogue(d),
            onReachGoal: () => {
                const lvl = LEVELS[levelRef.current];
                setCutscene({ cards: lvl.endCutscene || [], index: 0, next: 'levelcomplete' });
                setScreen('endcutscene');
            },
            onGameOver: () => setScreen('gameover'),
            onPause: (paused) => {
                if (screenRef.current === 'playing' || screenRef.current === 'paused') {
                    setScreen(paused ? 'paused' : 'playing');
                }
            },
        });
        engineRef.current = engine;
        return () => engine.destroy();
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

    const goPlay = useCallback((idx) => {
        const engine = engineRef.current;
        if (!engine) return;
        engine.loadLevel(LEVELS[idx]);
        engine.resume();
        engine.start();
        setScreen('playing');
    }, []);

    const beginLevel = useCallback((idx) => {
        if (LEVELS[idx].locked) return;
        audioRef.current?.init();
        setLevelIndex(idx);
        levelRef.current = idx;
        const intro = LEVELS[idx].intro || [];
        if (intro.length) {
            setCutscene({ cards: intro, index: 0, next: 'playing' });
            setScreen('intro');
        } else {
            goPlay(idx);
        }
    }, [goPlay]);

    const advanceCutscene = useCallback(() => {
        tap();
        setCutscene((cs) => {
            if (!cs) return null;
            const nextIdx = cs.index + 1;
            if (nextIdx < cs.cards.length) return { ...cs, index: nextIdx };
            // cutscene finished
            if (cs.next === 'playing') {
                goPlay(levelRef.current);
            } else if (cs.next === 'levelcomplete') {
                const e = engineRef.current;
                const bonus = SCORE.levelComplete;
                setResult({
                    score: (e?.score || 0) + bonus,
                    base: e?.score || 0,
                    bonus,
                    crumbs: e?.crumbs || 0,
                    totalCrumbs: e?.totalCrumbs || 0,
                    levelName: LEVELS[levelRef.current].name,
                    nextIndex: levelRef.current + 1 < LEVELS.length ? levelRef.current + 1 : null,
                });
                e?.stop();
                setScreen('levelcomplete');
            }
            return null;
        });
    }, [goPlay]);

    const restartLevel = useCallback(() => {
        tap();
        const e = engineRef.current;
        e.loadLevel(LEVELS[levelRef.current]);
        e.resume();
        e.start();
        setScreen('playing');
    }, []);

    const togglePause = useCallback(() => {
        tap();
        engineRef.current?.togglePause();
    }, []);

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

    return (
        <div className="w-full">
            <div
                className="relative w-full max-w-[760px] mx-auto rounded-3xl overflow-hidden border border-cream-300/80 shadow-warm-lg bg-ink-900 select-none"
                style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, touchAction: 'none' }}
            >
                {/* Game canvas */}
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
                        <div className="flex items-center gap-1" aria-label={`${hud.hearts} hearts`}>
                            {[0, 1, 2].map((i) => (
                                <Heart
                                    key={i}
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${i < hud.hearts ? 'fill-brand-500 text-brand-500' : 'fill-transparent text-white/40'}`}
                                    strokeWidth={2.5}
                                />
                            ))}
                        </div>

                        <div className="flex flex-col items-center leading-none">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/70">
                                {hud.levelName}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1 text-white text-[11px] sm:text-xs font-bold">
                                    <PixelSprite spriteKey="petal" scale={2} alt="Peach Heart Crumbs" />
                                    {hud.crumbs}/{hud.totalCrumbs}
                                </span>
                                {hud.hasCookie && <PixelSprite spriteKey="cookie" scale={2} alt="Cookie" />}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pointer-events-auto">
                            <span className="text-honey-300 text-xs sm:text-sm font-extrabold tabular-nums">
                                {hud.score}
                            </span>
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

                {/* Touch controls */}
                {isPlaying && (
                    <div ref={controlsRef} className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 sm:p-4 pointer-events-none">
                        <div className="flex gap-2.5 pointer-events-auto">
                            <ControlButton {...hold('left')} label="Move left"><ArrowLeft className="w-7 h-7" /></ControlButton>
                            <ControlButton {...hold('right')} label="Move right"><ArrowRight className="w-7 h-7" /></ControlButton>
                        </div>
                        <div className="flex gap-2.5 pointer-events-auto">
                            <ControlButton {...hold('sauce')} label="Throw sauce" tone="honey"><Droplet className="w-6 h-6" /></ControlButton>
                            <ControlButton {...hold('jump')} label="Jump" tone="brand"><ArrowBigUp className="w-7 h-7" /></ControlButton>
                        </div>
                    </div>
                )}

                {/* Dialogue box overlay */}
                {isPlaying && dialogue && dialogue.lines[0] && (
                    <button
                        onClick={() => { tap(); engineRef.current?.advanceDialogue(); }}
                        className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-left pointer-events-auto"
                        aria-label="Continue dialogue"
                    >
                        <div className="max-w-[640px] mx-auto bg-cream-50/95 backdrop-blur border border-cream-300 rounded-2xl shadow-warm-lg p-3.5 sm:p-4 flex items-start gap-3">
                            {dialogue.lines[0].sprite && (
                                <div className="shrink-0 bg-cream-100 rounded-xl p-1.5 border border-cream-300/70">
                                    <PixelSprite spriteKey={dialogue.lines[0].sprite} scale={3} alt={dialogue.lines[0].speaker} />
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-0.5">
                                    {dialogue.lines[0].speaker}
                                </div>
                                <p className="text-ink-800 text-[13px] sm:text-[14px] leading-snug">
                                    {dialogue.lines[0].text}
                                </p>
                                <div className="text-[10px] text-ink-400 mt-1.5 flex items-center gap-1">
                                    Tap to continue <ChevronRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </button>
                )}

                {/* ===== SCREEN OVERLAYS ===== */}
                {screen === 'start' && (
                    <Overlay>
                        <PixelSprite spriteKey="matt_idle" scale={5} alt="Matt Mozzarella" className="mb-3 animate-bounce" />
                        <h1 className="font-display text-[26px] sm:text-[34px] font-semibold text-white leading-[1.05] px-4">
                            Matt&rsquo;s Mozzarella<br />
                            <span className="text-honey-300">and the Sweetheart Quest</span>
                        </h1>
                        <p className="text-cream-100/80 text-[12px] sm:text-[13.5px] max-w-md mt-3 px-6 leading-relaxed">
                            Jump, dodge, and toss marinara through a magical food kingdom to rescue Princess Peach Tart.
                        </p>
                        <div className="flex flex-col items-center gap-2 mt-5 w-full px-8 max-w-xs">
                            <BigButton onClick={() => { tap(); beginLevel(0); }} primary><Play className="w-4 h-4" /> Play</BigButton>
                            <div className="flex gap-2 w-full">
                                <BigButton small onClick={() => { tap(); setScreen('howto'); }}>How to Play</BigButton>
                                <BigButton small onClick={() => { tap(); setScreen('chapters'); }}>Chapters</BigButton>
                            </div>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <ArrowLeft className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}

                {screen === 'howto' && (
                    <Overlay>
                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-4">How to Play</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 w-full max-w-lg text-left">
                            <HowCard title="On phone / tablet">
                                Tap <b>left</b> and <b>right</b> to move. Tap <b>jump</b> to hop. Tap <b>sauce</b> to throw marinara.
                            </HowCard>
                            <HowCard title="On desktop">
                                <b>A/D</b> or <b>arrow keys</b> to move. <b>Space</b> to jump. <b>J</b> to throw sauce. <b>P</b> to pause.
                            </HowCard>
                        </div>
                        <ul className="text-cream-100/80 text-[12px] mt-4 space-y-1 px-6 max-w-md text-left list-disc list-inside">
                            <li>Collect <b>Golden Garlic Coins</b> and <b>Peach Heart Crumbs</b>.</li>
                            <li>Bounce on mushroom caps. Pop cracker blocks with sauce.</li>
                            <li>Stomp or sauce enemies — they just poof away!</li>
                            <li>You have 3 hearts. Reach the Festival Tower to win the level.</li>
                        </ul>
                        <BigButton onClick={() => { tap(); setScreen('start'); }} className="mt-5"><ArrowLeft className="w-4 h-4" /> Back</BigButton>
                    </Overlay>
                )}

                {screen === 'chapters' && (
                    <Overlay scroll>
                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white mb-1">Chapters</h2>
                        <p className="text-cream-100/70 text-[12px] mb-4">Five food-filled worlds to rescue Princess Peach Tart.</p>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-md px-5">
                            {LEVELS.map((lvl, i) => (
                                <button
                                    key={lvl.id}
                                    onClick={() => { if (!lvl.locked) { tap(); beginLevel(i); } }}
                                    disabled={lvl.locked}
                                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                                        lvl.locked
                                            ? 'bg-white/5 border-white/10 cursor-not-allowed'
                                            : 'bg-cream-50 border-cream-300 hover:shadow-warm-md hover:-translate-y-0.5 active:scale-[0.99]'
                                    }`}
                                >
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg shrink-0 ${
                                        lvl.locked ? 'bg-white/10 text-white/40' : 'bg-brand-500 text-white'
                                    }`}>
                                        {lvl.locked ? <Lock className="w-4 h-4" /> : lvl.id}
                                    </div>
                                    <div className="min-w-0">
                                        <div className={`font-semibold text-[14px] truncate ${lvl.locked ? 'text-white/50' : 'text-ink-900'}`}>
                                            {lvl.name}
                                        </div>
                                        <div className={`text-[11px] truncate ${lvl.locked ? 'text-white/30' : 'text-ink-500'}`}>
                                            {lvl.locked ? 'Coming soon' : lvl.subtitle}
                                        </div>
                                    </div>
                                    {!lvl.locked && <ChevronRight className="w-4 h-4 text-brand-500 ml-auto shrink-0" />}
                                </button>
                            ))}
                        </div>
                        <BigButton onClick={() => { tap(); setScreen('start'); }} className="mt-4"><ArrowLeft className="w-4 h-4" /> Back</BigButton>
                    </Overlay>
                )}

                {(screen === 'intro' || screen === 'endcutscene') && cutscene && cutscene.cards[cutscene.index] && (
                    <Overlay>
                        <CutsceneCard card={cutscene.cards[cutscene.index]} />
                        <div className="flex items-center gap-1 mt-4">
                            {cutscene.cards.map((_, i) => (
                                <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === cutscene.index ? 'bg-honey-300' : 'bg-white/25'}`} />
                            ))}
                        </div>
                        <BigButton onClick={advanceCutscene} primary className="mt-4">
                            {cutscene.index + 1 < cutscene.cards.length ? 'Next' : (cutscene.next === 'playing' ? 'Start Level' : 'Continue')}
                            <ChevronRight className="w-4 h-4" />
                        </BigButton>
                    </Overlay>
                )}

                {screen === 'paused' && (
                    <Overlay>
                        <h2 className="font-display text-3xl font-semibold text-white mb-5">Paused</h2>
                        <div className="flex flex-col items-center gap-2 w-full px-8 max-w-xs">
                            <BigButton onClick={resumeGame} primary><Play className="w-4 h-4" /> Resume</BigButton>
                            <BigButton onClick={restartLevel}><RotateCcw className="w-4 h-4" /> Restart Level</BigButton>
                            <BigButton onClick={() => { tap(); setScreen('chapters'); }}>Chapters</BigButton>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <Home className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}

                {screen === 'gameover' && (
                    <Overlay>
                        <div className="text-5xl mb-2" aria-hidden="true">🧀</div>
                        <h2 className="font-display text-3xl font-semibold text-white">Out of hearts!</h2>
                        <p className="text-cream-100/75 text-[13px] mt-2 max-w-xs px-6">
                            Don&rsquo;t worry — even brave snacks get squished sometimes. Try again!
                        </p>
                        <div className="flex flex-col items-center gap-2 mt-5 w-full px-8 max-w-xs">
                            <BigButton onClick={restartLevel} primary><RotateCcw className="w-4 h-4" /> Try Again</BigButton>
                            <BigButton onClick={() => { tap(); setScreen('chapters'); }}>Chapters</BigButton>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <Home className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}

                {screen === 'levelcomplete' && result && (
                    <Overlay>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-honey-400 mb-3">
                            <Trophy className="w-7 h-7 text-ink-900" />
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">Level Complete!</h2>
                        <p className="text-honey-200 text-[13px] font-semibold mt-1">{result.levelName}</p>
                        <div className="bg-white/10 rounded-2xl px-5 py-3 mt-4 text-[13px] text-cream-100 space-y-1 min-w-[220px]">
                            <Row label="Score"><span>{result.base}</span></Row>
                            <Row label="Level bonus"><span>+{result.bonus}</span></Row>
                            <Row label="Peach Heart Crumbs"><span>{result.crumbs}/{result.totalCrumbs}</span></Row>
                            <div className="border-t border-white/15 my-1" />
                            <Row label="Total"><span className="text-honey-300 font-extrabold">{result.score}</span></Row>
                        </div>
                        <div className="flex flex-col items-center gap-2 mt-5 w-full px-8 max-w-xs">
                            {result.nextIndex !== null && LEVELS[result.nextIndex]?.locked && (
                                <div className="text-cream-100/70 text-[12px] flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" /> Level {result.nextIndex + 1}: {LEVELS[result.nextIndex].name} — coming soon
                                </div>
                            )}
                            <BigButton onClick={restartLevel} primary><RotateCcw className="w-4 h-4" /> Play Again</BigButton>
                            <BigButton onClick={() => { tap(); setScreen('chapters'); }}>Chapters</BigButton>
                            <Link href="/games" className="text-cream-100/60 hover:text-white text-[12px] mt-1 inline-flex items-center gap-1 transition-colors">
                                <Home className="w-3 h-3" /> Back to Games
                            </Link>
                        </div>
                    </Overlay>
                )}
            </div>

            {/* Desktop hint under the stage */}
            <p className="text-center text-ink-400 text-[12px] mt-3 hidden sm:block">
                Desktop: <b>A/D</b> or arrows move · <b>Space</b> jump · <b>J</b> sauce · <b>P</b> pause · or use the on-screen buttons on touch devices.
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
            className={`w-[58px] h-[58px] sm:w-16 sm:h-16 rounded-full shadow-warm-md border border-black/5 flex items-center justify-center select-none touch-none transition-transform active:scale-95 ${tones[tone]}`}
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

function BigButton({ children, onClick, primary, small, className = '' }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-[0.97] ${
                small ? 'flex-1 py-2.5 px-3 text-[12px]' : 'w-full py-3 px-5 text-[14px]'
            } ${
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

function CutsceneCard({ card }) {
    return (
        <div className="flex flex-col items-center px-6 max-w-md">
            {card.sprite ? (
                <div className="bg-white/10 rounded-2xl p-3 border border-white/10 mb-4">
                    <PixelSprite spriteKey={card.sprite} scale={5} alt={card.speaker} />
                </div>
            ) : (
                <div className="text-3xl mb-3" aria-hidden="true">✨</div>
            )}
            <div className="text-honey-300 text-[11px] font-bold uppercase tracking-widest mb-1.5">{card.speaker}</div>
            <p className="text-cream-50 text-[14px] sm:text-[15px] leading-relaxed">{card.text}</p>
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
