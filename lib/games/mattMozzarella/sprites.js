/**
 * Matt Mozzarella — original food-themed pixel art.
 *
 * Every sprite is a tiny char-grid + palette. No external images, so
 * nothing can 404 later. A renderer pre-bakes each sprite to an
 * offscreen <canvas> at native pixel size; the game canvas is itself
 * low-res and CSS-upscaled with image-rendering: pixelated, so blitting
 * at native scale stays crisp.
 *
 * Any char missing from the palette (".", " ", etc.) renders transparent.
 * Rows do not need to be uniform width — the renderer reads each row's
 * own length.
 */

/** Build a sprite object. */
function S(palette, rows) {
    return { palette, rows, w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

// =====================  CHARACTERS  =======================================

// Matt Mozzarella — golden crispy mozzarella stick with a soft face. (13x18)
const mattPalette = {
    o: '#6b4423', // outline
    g: '#e8a13c', // crust
    h: '#f6c46a', // crust highlight
    b: '#c47e28', // crust shadow
    w: '#ffffff', // eye white
    k: '#3a2a1a', // pupil
    m: '#9c4a2a', // smile
    p: '#ffb1a0', // cheeks
};

export const matt_idle = S(mattPalette, [
    '....oooo.....',
    '..oohhhhoo...',
    '.ohhggggho...',
    '.ohgggggho...',
    'ohgggggggho..',
    'oggwwggwwggo.',
    'oggwkggwkggo.',
    'oggwwggwwggo.',
    'ohgppggppgho.',
    'ohgggmmgggho.',
    'ohggmmmmggho.',
    'oohgggggghoo.',
    '.ohgggggggho.',
    '.ohgggggggho.',
    '.oohgggghoo..',
    '..oggggggo...',
    '..oo.oo.oo...',
    '..oo....oo...',
]);

export const matt_walk = S(mattPalette, [
    '....oooo.....',
    '..oohhhhoo...',
    '.ohhggggho...',
    '.ohgggggho...',
    'ohgggggggho..',
    'oggwwggwwggo.',
    'oggwkggwkggo.',
    'oggwwggwwggo.',
    'ohgpggggpgho.',
    'ohgggmmgggho.',
    'ohggmmmmggho.',
    'oohgggggghoo.',
    '.ohgggggggho.',
    '.ohgggggggho.',
    '.oohgggghoo..',
    '..oggggggo...',
    '.oo....oo....',
    '.oo......oo..',
]);

export const matt_jump = S(mattPalette, [
    'o...oooo...o.',
    'oo.ohhhho.oo.',
    '.oohhgggghoo.',
    '..ohgggggho..',
    '.ohgggggggho.',
    '.oggwwggwwgo.',
    '.oggwkggwkgo.',
    '.oggwwggwwgo.',
    '.ohgpggggpho.',
    '.ohgggmmggho.',
    '.ohggmmmmgho.',
    '.oohgggggho..',
    '..ohgggggho..',
    '..ohgggggho..',
    '...ohgggho...',
    '...oggggo....',
    '...oo.oo.....',
    '..oo...oo....',
]);

// Princess Peach Tart — peach-glazed tart with a little gold crown. (11x14)
export const peach_tart = S(
    {
        o: '#7a4a2a',
        c: '#f4c542', C: '#ffe08a', // crown
        p: '#ffb27a', P: '#ff8f5e', h: '#ffd6b0', // peach
        r: '#c97a4a', R: '#a9612f', // crust
        w: '#ffffff', k: '#3a2a1a', m: '#b5532a', s: '#ff7a9c',
    },
    [
        '..c.c.c....',
        '.cCcCcCc...',
        '.occccccо.'.replace('о', 'o'),
        'opppppppo.',
        'opPhhPppo.',
        'opwwppwwpo',
        'opwkppwkpo',
        'oppspssppo',
        'opphmmhppo',
        'oppphmhppo',
        'orRRRRRRRo',
        'orRrRrRRRo',
        '.oRRRRRo..',
        '..ooooo...',
    ]
);

// King Charbroil — big charred burger with a crooked crown (silly, not scary). (11x14)
export const charbroil = S(
    {
        o: '#1c1410',
        c: '#3a3128', C: '#55473a', // char
        b: '#6b4a2a', B: '#8a5a2b', // bun
        w: '#ffd23f', k: '#2a1a10', // angry eyes
        m: '#d65a3a', // sauce mouth
        y: '#f4c542', r: '#ff6b3d',
    },
    [
        '.y.y.y.y...',
        'yyyyyyyyy..',
        'occccccccо'.replace('о', 'o'),
        'ocCCccCCco',
        'occwwccwwco'.slice(0, 10),
        'ocwkccwkco',
        'occccccccо'.replace('о', 'o'),
        'ocmmccmmco',
        'oBBBBBBBBo',
        'obBbBbBbbo',
        'occccccccо'.replace('о', 'o'),
        'ocrcrcrcro',
        '.occcccco.',
        '..ooooo...',
    ]
);

// Tina Tomato — brave cherry tomato ally (used in later-level data). (10x11)
export const tina_tomato = S(
    {
        o: '#7a1f1f', r: '#e23b34', R: '#ff5a4f', h: '#ff8f86',
        w: '#ffffff', k: '#3a1010', m: '#7a1f1f', l: '#5fae54', L: '#7ad08a',
    },
    [
        '...lLl....',
        '..lLlL....',
        '.orRRRro..',
        'orRhhRRRo.',
        'orwwRwwRo.',
        'orwkRwkRo.',
        'orRRRRRRo.',
        'orRmmmRRo.',
        'orRRmRRRo.',
        '.oRRRRo...',
        '..oooo....',
    ]
);

// =====================  COLLECTIBLES  =====================================

export const coin = S(
    { o: '#9a6b12', g: '#ffcf3f', h: '#fff0a8', s: '#d59a1e' },
    [
        '..oooo..',
        '.oghhgo.',
        'oghggsgo',
        'oghgsggo',
        'oghggsgo',
        'oghgsggo',
        '.oghhgo.',
        '..oooo..',
    ]
);

// Heart-shaped strawberry jam cookie — the story gift item. (9x9)
export const cookie = S(
    {
        o: '#7a4a2a', c: '#d9a25a', C: '#e8b873',
        j: '#e23b5e', J: '#ff6b88', s: '#ffffff',
    },
    [
        '.oo...oo.',
        'ocCo.oCco',
        'oCjJjJjCo',
        'ocjJjJjco',
        'oCcjjjcCo',
        '.ocjjjco.',
        '..ocjco..',
        '...ojo...',
        '....o....',
    ]
);

// Peach Heart Crumb / petal — glowing peach petal collectible. (7x6)
export const petal = S(
    { o: '#c2607a', p: '#ffb6c8', P: '#ff8fae', h: '#ffe1ea' },
    [
        '..ooo..',
        '.opPpo.',
        'opPhPpo',
        'opPPPpo',
        '.opPpo.',
        '..ooo..',
    ]
);

// Spicy Marinara projectile — a zippy sauce blob. (5x5)
export const marinara = S(
    { o: '#7a1f1f', r: '#e23b34', R: '#ff5a4f', h: '#ffd0a0', y: '#ffd23f' },
    [
        '.yoo.',
        'oRRRo',
        'oRhRo',
        'oRRRo',
        '.ooo.',
    ]
);

// =====================  ENEMIES  ==========================================

export const cracker = S(
    { o: '#9a7a3a', c: '#e8cf8f', C: '#f3e2b0', k: '#5a4520', m: '#7a5a28' },
    [
        'oooooooo',
        'oCcCcCco',
        'ockCccko',
        'oCccCcCo',
        'ocCkccCo',
        'oCccCcco',
        'ockCcmko',
        'oooooooo',
    ]
);

export const fry = S(
    { o: '#6b3a16', f: '#e8a13c', F: '#f6c46a', b: '#8a5a2b', w: '#fff', k: '#3a2a1a' },
    [
        '.oo.oo.',
        '.oF.Fo.',
        '.oF.Fo.',
        'ooFoFoo',
        'oFwFwFo',
        'oFkFkFo',
        'oFbFbFo',
        'obFbFbo',
        'oFbbbFo',
        '.ooooo.',
    ]
);

export const meatball = S(
    { o: '#3a1c0e', m: '#8a4a24', M: '#a9612f', h: '#c47e4a', w: '#fff', k: '#2a1206', s: '#6b3418' },
    [
        '..oooo..',
        '.omMMmo.',
        'omMhhMmo',
        'oMwMMwMo',
        'oMkMMkMo',
        'oMMmmMMo',
        'omMssMmo',
        '.omMMmo.',
        '..oooo..',
    ]
);

// =====================  PROPS / TILES  ====================================

// Mushroom bounce cap. (9x9)
export const mushroom = S(
    { o: '#6b2a2a', r: '#e25a4f', R: '#ff7a6f', w: '#fff5e0', s: '#d6c2a0' },
    [
        '..orrro..',
        '.orRwRRro',
        'orRwRRwRo',
        'orRRwRRRo',
        'orrrrrrro',
        '..owwwo..',
        '..owswo..',
        '..owswo..',
        '..ooooo..',
    ]
);

export const soup_lantern = S(
    { o: '#5a3a1a', g: '#ffd23f', G: '#fff0a8', m: '#8a5a2b', l: '#ffe98a' },
    [
        '...mm...',
        '..ommo..',
        '.oGgGgo.',
        'oGglgGo.',
        'oGlggGo.',
        'oGgglGo.',
        '.oGggo..',
        '..ooo...',
    ]
);

// Sour Pickle Guard — grumpy pickle that lobs vinegar drops. (12x14)
export const pickle = S(
    { o: '#2f5a2a', g: '#6aa84f', G: '#8cc46a', w: '#ffffff', k: '#23331f', m: '#3a5a2a' },
    [
        '....oooo....',
        '..oogGGgoo..',
        '.oggGggGggo.',
        '.oggggggggo.',
        'oggwwggwwggo',
        'oggwkggwkggo',
        'oggwwggwwggo',
        '.oggggggggo.',
        '.oggmmmmggo.',
        '.oggggggggo.',
        '..oggggggo..',
        '...oooooo...',
        '...o....o...',
        '...o....o...',
    ]
);

// Vinegar drop — Sour Pickle Guard projectile. (5x6)
export const vinegar = S(
    { o: '#2f6a4a', G: '#7fd8a0', B: '#caf3da' },
    [
        '..o..',
        '.oGo.',
        'oGBGo',
        'oGGGo',
        'oGBGo',
        '.ooo.',
    ]
);

// =====================  RENDERER  =========================================

const _cache = new Map();

/** Draw a sprite's pixels onto a 2d context at native scale (1px = 1px). */
export function paintSprite(ctx, sprite, ox = 0, oy = 0) {
    const { palette, rows } = sprite;
    for (let y = 0; y < rows.length; y++) {
        const row = rows[y];
        for (let x = 0; x < row.length; x++) {
            const color = palette[row[x]];
            if (!color) continue;
            ctx.fillStyle = color;
            ctx.fillRect(ox + x, oy + y, 1, 1);
        }
    }
}

/** Pre-baked offscreen canvas for a sprite (cached by content+flip+scale). */
export function getSpriteCanvas(sprite, flip = false, scale = 1) {
    if (typeof document === 'undefined') return null;
    const key = `${sprite.rows.join('|')}:${flip}:${scale}`;
    if (_cache.has(key)) return _cache.get(key);

    const base = document.createElement('canvas');
    base.width = sprite.w;
    base.height = sprite.h;
    paintSprite(base.getContext('2d'), sprite);

    let out = base;
    if (flip || scale !== 1) {
        const c = document.createElement('canvas');
        c.width = sprite.w * scale;
        c.height = sprite.h * scale;
        const cx = c.getContext('2d');
        cx.imageSmoothingEnabled = false;
        cx.save();
        if (flip) { cx.translate(c.width, 0); cx.scale(-1, 1); }
        cx.drawImage(base, 0, 0, sprite.w, sprite.h, 0, 0, sprite.w * scale, sprite.h * scale);
        cx.restore();
        out = c;
    }
    _cache.set(key, out);
    return out;
}

/** Blit a sprite to the game context at integer position. */
export function drawSprite(ctx, sprite, x, y, flip = false) {
    const c = getSpriteCanvas(sprite, flip, 1);
    if (c) ctx.drawImage(c, Math.round(x), Math.round(y));
}

// Registry so React (HUD / cutscenes / cards) can fetch by key.
export const SPRITES = {
    matt_idle, matt_walk, matt_jump,
    peach_tart, charbroil, tina_tomato,
    coin, cookie, petal, marinara,
    cracker, fry, meatball, pickle, vinegar,
    mushroom, soup_lantern,
};
