/**
 * Tray Dash — original food-themed pixel art.
 *
 * Same tiny char-grid + palette format as the Matt Mozzarella set; the
 * baking/blitting helpers are shared so both games use one sprite cache.
 */

import { getSpriteCanvas, drawSprite } from '../mattMozzarella/sprites';

export { getSpriteCanvas, drawSprite };

/** Build a sprite object. */
function S(palette, rows) {
    return { palette, rows, w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

// =====================  HERO: SCOOTER TOT  =================================
// A speedy tater tot in red sneakers. (13 wide)

const totPalette = {
    o: '#6b4423', // outline
    g: '#eda73d', // crispy golden body
    h: '#f9d077', // highlight
    b: '#c5811f', // shadow
    w: '#ffffff', // eye white
    k: '#33220f', // pupil
    m: '#9c4a2a', // mouth
    p: '#ffb1a0', // cheeks
    r: '#e2554a', // sneakers
    s: '#fff7e0', // sneaker sole
};

const TOT_BODY = [
    '...ooooooo...',
    '..ohhhhhhho..',
    '.ohhgggggho..',
    '.ohgggggggho.',
    'oggwwgggwwggo',
    'oggwkgggwkggo',
    'oggwwgggwwggo',
    'ohgpgggggpgho',
    'ohgggmmmgggho',
    '.ohgggggggho.',
    '.obgggggggbo.',
    '..oogggggoo..',
];

export const tot_run1 = S(totPalette, [
    ...TOT_BODY,
    '..rr.....rr..',
    '..rrs....rrs.',
]);

export const tot_run2 = S(totPalette, [
    ...TOT_BODY,
    '....rr..rr...',
    '...srr...rrs.',
]);

export const tot_jump = S(totPalette, [
    ...TOT_BODY,
    '...rr...rr...',
    '...ss...ss...',
]);

// Sliding flat on the floor, face forward. (16 wide)
export const tot_slide = S(totPalette, [
    '..oooooooooo....',
    '.ohhgggggggho...',
    '.ohggggggwwggo..',
    '.ohggggggwkggo..',
    '.obggggggggpgo..',
    '..oogggggggoo...',
    '..rrs....rrs....',
]);

// =====================  PICKUPS  ===========================================

// Wobbly red jello cup — the thing you grab. (8x9)
export const jello = S(
    {
        o: '#8a2433', r: '#ef4a64', h: '#ff8aa0',
        c: '#fdf3da', d: '#d9c49a',
    },
    [
        '..oooo..',
        '.orrrro.',
        'orhhrrro',
        'orrrrrro',
        'orrrrrro',
        '.oooooo.',
        '.cddddc.',
        '.cddddc.',
        '..cccc..',
    ],
);

// Golden fork — rare big bonus. (7x10)
export const golden_fork = S(
    { y: '#f4b942', d: '#c8901e' },
    [
        '.y.y.y.',
        '.y.y.y.',
        '.yyyyy.',
        '.dyyyd.',
        '..dyd..',
        '...y...',
        '...y...',
        '...y...',
        '..dyd..',
        '..ddd..',
    ],
);

// Jello shield bubble — survive one hit. (10x8)
export const shield_bubble = S(
    { o: '#2d8fa3', c: '#9fe4ef', w: '#ffffff' },
    [
        '..oooooo..',
        '.occcccco.',
        'occwwcccco',
        'occwccccco',
        'occcccccco',
        'occcccccco',
        '.occcccco.',
        '..oooooo..',
    ],
);

// =====================  HAZARDS  ===========================================

// Runaway meatball, rolls down the line at you. (13x11)
export const meatball_roll = S(
    {
        o: '#3f200c', b: '#8a4a26', d: '#6b3318', h: '#a8643a',
        w: '#ffffff', k: '#241307',
    },
    [
        '...ooooooo...',
        '..obbbbbbbo..',
        '.obbhbbbbdbo.',
        'obbbbdbbbbdbo',
        'obwwbbbwwbbbo',
        'obwkbbbwkbbbo',
        'obbbbdbbbbbbo',
        'obbdbbbbdbbbo',
        '.obbbbdbbbbo.',
        '..obbbbbbbo..',
        '...ooooooo...',
    ],
);

// Flying cafeteria tray with a jello riding on top. (18x8)
export const tray_fly = S(
    {
        o: '#4d5263', s: '#b9c2d4', h: '#e6ebf5', d: '#828ca3',
        j: '#ef4a64', q: '#8a2433',
    },
    [
        '.....qqqq.........',
        '....qjjjjq........',
        '....qjjjjq........',
        '.oooooooooooooooo.',
        'ohssssssssssssssho',
        'osssssssssssssssso',
        'odssssssssssssssdo',
        '.oooooooooooooooo.',
    ],
);

// Registry for HUD icons / cards / toasts.
export const SPRITES = {
    tot_run1, tot_run2, tot_jump, tot_slide,
    jello, golden_fork, shield_bubble,
    meatball_roll, tray_fly,
};
