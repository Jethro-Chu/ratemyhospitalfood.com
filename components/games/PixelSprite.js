'use client';
import { useEffect, useRef } from 'react';
import { SPRITES, getSpriteCanvas } from '@/lib/games/mattMozzarella/sprites';

/**
 * Renders a single pixel-art sprite (by key) to a crisp upscaled canvas.
 * Used for HUD icons, cutscene portraits, and the games-page card art.
 */
export default function PixelSprite({ spriteKey, scale = 4, className = '', alt = '' }) {
    const ref = useRef(null);
    const sprite = SPRITES[spriteKey];

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas || !sprite) return;
        canvas.width = sprite.w * scale;
        canvas.height = sprite.h * scale;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const baked = getSpriteCanvas(sprite, false, 1);
        if (baked) ctx.drawImage(baked, 0, 0, sprite.w, sprite.h, 0, 0, canvas.width, canvas.height);
    }, [sprite, scale]);

    if (!sprite) return null;
    return (
        <canvas
            ref={ref}
            role="img"
            aria-label={alt}
            className={className}
            style={{ imageRendering: 'pixelated', display: 'block' }}
        />
    );
}
