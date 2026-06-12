'use client';

import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import useReducedMotion from '@/hooks/useReducedMotion';

/** True below the md breakpoint — used to serve a much lighter scene. */
function useIsMobile() {
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 767px)');
        const update = () => setMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    return mobile;
}

/**
 * Drifting ember particle field. Points slowly orbit and the whole
 * cloud leans toward the pointer for a parallax feel.
 */
function EmberField({ count = 700 }) {
    const points = useRef(null);

    const { positions, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = 6 + Math.pow(Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1, 0.5) * 9;
            const theta = ((i * 0.61803398875) % 1) * Math.PI * 2;
            const y = (((i * 0.7548776662) % 1) - 0.5) * 9;
            positions[i * 3]     = Math.cos(theta) * r;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(theta) * r - 4;
            sizes[i] = 0.5 + ((i * 0.3819660113) % 1) * 1.5;
        }
        return { positions, sizes };
    }, [count]);

    useFrame((state, delta) => {
        if (!points.current) return;
        points.current.rotation.y += delta * 0.022;
        const targetX = state.pointer.y * 0.12;
        const targetZ = state.pointer.x * 0.06;
        points.current.rotation.x += (targetX - points.current.rotation.x) * 0.04;
        points.current.rotation.z += (targetZ - points.current.rotation.z) * 0.04;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
            </bufferGeometry>
            <pointsMaterial
                size={0.045}
                color="#FF7440"
                transparent
                opacity={0.65}
                sizeAttenuation
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

/** Molten centerpiece blob, gently breathing and chasing the pointer. */
function MoltenCore({ detail = 48 }) {
    const mesh = useRef(null);

    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.elapsedTime;
        mesh.current.position.x += (state.pointer.x * 0.9 - mesh.current.position.x) * 0.03;
        mesh.current.position.y += (state.pointer.y * 0.5 - mesh.current.position.y) * 0.03;
        const s = 1 + Math.sin(t * 0.6) * 0.04;
        mesh.current.scale.setScalar(s);
    });

    return (
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
            <mesh ref={mesh} position={[0, 0, -1]}>
                <icosahedronGeometry args={[1.7, detail]} />
                <MeshDistortMaterial
                    color="#FF5A1F"
                    emissive="#7A1E04"
                    emissiveIntensity={0.55}
                    roughness={0.25}
                    metalness={0.15}
                    distort={0.42}
                    speed={1.6}
                />
            </mesh>
        </Float>
    );
}

function Rig() {
    const { camera } = useThree();
    useFrame((state) => {
        camera.position.x += (state.pointer.x * 0.4 - camera.position.x) * 0.03;
        camera.position.y += (state.pointer.y * 0.25 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, -1);
    });
    return null;
}

/**
 * Hero background scene. Renders a static ember gradient instead of
 * WebGL when the user prefers reduced motion.
 */
export default function HeroScene() {
    const reduced = useReducedMotion();
    const mobile = useIsMobile();

    if (reduced) {
        return (
            <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(255,90,31,0.18) 0%, rgba(11,11,15,0) 70%)',
                }}
            />
        );
    }

    return (
        <div className="absolute inset-0" aria-hidden="true">
            <Canvas
                dpr={mobile ? [1, 1.25] : [1, 1.75]}
                camera={{ position: [0, 0, 7], fov: mobile ? 52 : 42 }}
                gl={{ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.35} />
                    <pointLight position={[6, 4, 6]} intensity={120} color="#FFC53D" />
                    <pointLight position={[-6, -3, 4]} intensity={60} color="#FF5A1F" />
                    <MoltenCore detail={mobile ? 20 : 48} />
                    <EmberField count={mobile ? 240 : 700} />
                    <Rig />
                </Suspense>
            </Canvas>
            {/* Vignette so type stays readable over the scene */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 90% 70% at 50% 45%, rgba(11,11,15,0) 30%, rgba(11,11,15,0.85) 100%), linear-gradient(180deg, rgba(11,11,15,0.55) 0%, rgba(11,11,15,0) 25%, rgba(11,11,15,0) 60%, #0B0B0F 100%)',
                }}
            />
        </div>
    );
}
