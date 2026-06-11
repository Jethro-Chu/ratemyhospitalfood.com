'use client';

// /abyss — hidden arcade route. Everything 3D is dynamically imported here,
// so three.js / R3F never touch the main site's bundles or homepage load.

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const AbyssGame = dynamic(() => import('@/components/abyss/AbyssGame'), {
    ssr: false,
    loading: () => <DiveLoader />,
});

function DiveLoader() {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#020910', color: '#7fc4dd',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: "ui-monospace, 'SF Mono', Menlo, 'Courier New', monospace", gap: 18,
        }}>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        border: '1.5px solid rgba(70,224,255,0.6)',
                        animation: `abyssSonar 2.2s ${i * 0.7}s infinite ease-out`,
                    }} />
                ))}
                <div style={{ position: 'absolute', inset: '44%', borderRadius: '50%', background: '#46e0ff', boxShadow: '0 0 14px #46e0ff' }} />
            </div>
            <div style={{ fontSize: 12, letterSpacing: 3 }}>FLOODING BALLAST TANKS…</div>
            <style>{`@keyframes abyssSonar { from { transform: scale(0.2); opacity: 0.9; } to { transform: scale(1.6); opacity: 0; } }`}</style>
        </div>
    );
}

export default function AbyssPage() {
    useEffect(() => { document.title = 'ABYSS PROTOCOL'; }, []);
    return (
        <main style={{ position: 'fixed', inset: 0, background: '#020910' }}>
            <AbyssGame />
            {/* persistent escape hatch above everything but the overlays */}
            <Link
                href="/"
                style={{
                    position: 'fixed', bottom: 10, left: 12, zIndex: 30,
                    fontSize: 11, color: 'rgba(127,196,221,0.55)', textDecoration: 'none',
                    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                }}
            >
                ← Back to RateMyHospitalFood
            </Link>
        </main>
    );
}
