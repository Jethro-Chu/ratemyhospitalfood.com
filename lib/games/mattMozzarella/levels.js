/**
 * Data-driven level definitions for "Matt Mozzarella and the Sweetheart Quest".
 *
 * Level 1 (The Grand Feast Festival) is fully built as a 3–5 minute stage.
 * Levels 2–5 carry their full story (intro + end cutscenes) but are marked
 * `locked: true` and ship as "coming soon" — they can be fleshed out later
 * using the same schema, so the game is easy to expand.
 *
 * Coordinate system: world pixels. TILE = 16. Ground top at GROUND_Y.
 * Platform `type`: 'solid' | 'oneway' | 'breakable' | 'bounce'.
 */

export const TILE = 16;
export const GROUND_Y = 208;

const groundSeg = (x, w) => ({ x, y: GROUND_Y, w, h: 90, type: 'solid' });
const tray      = (x, y, w) => ({ x, y, w, h: 8, type: 'oneway' });
const block     = (x, y) => ({ x, y, w: 16, h: 16, type: 'breakable' });
const pad       = (x, y, w = 40) => ({ x, y, w, h: 10, type: 'bounce' });

// ---- Coin helpers --------------------------------------------------------
const coinRow = (x, y, n, step = 24) =>
    Array.from({ length: n }, (_, i) => ({ x: x + i * step, y }));
const coinArc = (x, y, n, step = 22, lift = 14) =>
    Array.from({ length: n }, (_, i) => ({ x: x + i * step, y: y - Math.round(Math.sin((i / (n - 1)) * Math.PI) * lift * 2) }));

// =====================  LEVEL 1 — THE GRAND FEAST FESTIVAL  ================

const level1 = {
    id: 1,
    slug: 'grand-feast-festival',
    name: 'The Grand Feast Festival',
    subtitle: 'Pastaria · Festival Night',
    locked: false,
    theme: {
        key: 'festival',
        sky: ['#fff3d6', '#ffd9b0'],
        hillBack: '#f3c08a',
        hillFront: '#eda964',
        accent: '#ff7a4a',
        ground: '#d98b46',
        groundTop: '#f0a85c',
    },
    width: 3680,
    spawn: { x: 40, y: 150 },
    goal: { x: 3520, y: 96, w: 44, h: 112 }, // Festival Tower

    // Tip: every level intro is shown as story cards before play.
    intro: [
        { speaker: 'Narrator', sprite: null, text: 'In the warm kingdom of Pastaria, where rivers run with tomato sauce and bridges are baked from garlic bread, it is the night of the Grand Feast Festival.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: 'Tonight is the night. I will meet Princess Peach Tart at the Festival Tower... and finally give her this heart-shaped cookie.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: "I've been too shy for too long. But not tonight. Let's go!" },
    ],

    // One-time dialogue when Matt walks past these x positions.
    triggers: [
        { x: 70,   lines: [{ speaker: 'Tip', text: 'Move with the ← → buttons (or A / D). Tap JUMP (or Space) to hop over things!' }] },
        { x: 600,  lines: [{ speaker: 'Tip', text: 'Mind the gap — line up and jump across the sauce river!' }] },
        { x: 1230, lines: [{ speaker: 'Tip', text: 'Toss marinara with the SAUCE button (or J) to pop cracker blocks and enemies!' }] },
        { x: 1300, lines: [{ speaker: 'Spaghetti Dancer', text: 'Bounce on the wobbly mushroom caps to reach the high treats!' }] },
        { x: 1610, lines: [{ speaker: 'Dumpling Musician', text: 'Careful — the sauce geyser erupts in bursts. Cross when it rests, then leap the river!' }] },
        { x: 2980, lines: [{ speaker: 'Cupcake Child', text: 'The Festival Tower is just ahead! The Princess is waiting!' }] },
    ],

    // Mid-level story item.
    cookie: { x: 2680, y: 118 },

    checkpoints: [{ x: 1200, y: 150 }, { x: 2360, y: 150 }],

    platforms: [
        // Ground segments (gaps are sauce-river jumps)
        groundSeg(0, 560),
        groundSeg(640, 520),
        groundSeg(1200, 560),
        groundSeg(1840, 420),
        groundSeg(2340, 660),
        groundSeg(3080, 600),

        // Zone A — tutorial trays
        tray(330, 150, 64),

        // Zone B — step-up across the gap
        tray(700, 156, 80),
        tray(860, 124, 80),
        tray(1000, 150, 72),

        // Zone C — breakable cracker stack + high shelf (reached via mushroom)
        block(1248, 156), block(1264, 156), block(1280, 156),
        block(1264, 140),
        tray(1360, 104, 150),
        pad(1488, 178, 48),

        // Zone E — cookie pedestal
        tray(2640, 140, 80),

        // Zone F — climb to the Festival Tower
        tray(3160, 172, 72),
        tray(3290, 140, 72),
        tray(3410, 108, 96),
    ],

    // Bounce mushroom caps (entities — can't be defeated, launch Matt up)
    mushrooms: [
        { x: 1300, y: 192 },
        { x: 1900, y: 192 },
    ],

    // Sauce geyser hazards
    geysers: [
        // Sits on solid ground near the end of zone C — a timing hazard you
        // wait out, then jump the sauce-river gap just past it.
        { x: 1694, y: GROUND_Y, w: 40, period: 2200, onTime: 1000, maxH: 72, phase: 0 },
    ],

    enemies: [
        { type: 'cracker',  x: 220,  y: 194, minX: 150,  maxX: 330,  speed: 26 },
        { type: 'fry',      x: 820,  y: 188, minX: 660,  maxX: 1120, speed: 34 },
        { type: 'cracker',  x: 1520, y: 194, minX: 1440, maxX: 1660, speed: 30 },
        { type: 'meatball', x: 2440, y: 190, minX: 2370, maxX: 2980, speed: 64 },
        { type: 'fry',      x: 2760, y: 188, minX: 2640, maxX: 2900, speed: 36 },
        { type: 'cracker',  x: 3180, y: 194, minX: 3110, maxX: 3300, speed: 30 },
    ],

    coins: [
        ...coinRow(140, 170, 4),
        ...coinArc(330, 140, 4),
        ...coinArc(580, 175, 5),       // over the first gap
        ...coinRow(720, 132, 3),
        ...coinRow(1010, 126, 3),
        ...coinRow(1370, 86, 5),        // high shelf reward
        ...coinArc(1740, 175, 4),       // over the geyser
        ...coinRow(2040, 176, 4),
        ...coinArc(2280, 175, 5),       // over a gap
        ...coinRow(2520, 176, 4),
        ...coinRow(3170, 150, 2),
        ...coinRow(3300, 118, 2),
        ...coinRow(3430, 86, 3),
    ],

    // Peach Heart Crumbs — bonus story collectibles, each with a memory popup.
    petals: [
        { x: 884, y: 96,  memory: { speaker: 'Memory', text: 'You remember Princess Peach Tart sharing her dessert with a shy blueberry muffin.' } },
        { x: 1430, y: 80, memory: { speaker: 'Memory', text: 'You remember her laughing with you by the sauce river at last year\'s festival.' } },
        { x: 3460, y: 80, memory: { speaker: 'Memory', text: '"Even little snacks can do brave things," she once told you.' } },
    ],

    // Plays after Matt touches the Festival Tower.
    endCutscene: [
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: 'Matt, you came.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: '(He holds out the heart-shaped cookie, heart pounding...)' },
        { speaker: 'Narrator', sprite: null, text: 'Suddenly the festival sky goes dark. A cast-iron airship roars overhead!' },
        { speaker: 'King Charbroil', sprite: 'charbroil', text: 'Pastaria has grown too soft. No more sweetness. No more romance. No more warmth.' },
        { speaker: 'Narrator', sprite: 'charbroil', text: 'King Charbroil traps the Princess inside a glass dessert dome and hauls her toward the Burnt Mountains.' },
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: "Matt! Don't let him turn the kingdom cold!" },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: "I'm coming for you. I promise." },
    ],
};

// =====================  LEVELS 2–5 — STORY SCAFFOLD (locked)  =============

const level2 = {
    id: 2, slug: 'pasta-pipe-fields', name: 'The Pasta Pipe Fields',
    subtitle: 'The journey begins', locked: true,
    theme: { key: 'pasta', sky: ['#fbe9c8', '#f6c98a'], accent: '#e8642e' },
    miniBoss: 'General Meatballo',
    intro: [
        { speaker: 'Narrator', sprite: null, text: 'Matt follows glowing peach petals into the Pasta Pipe Fields — giant noodles, spaghetti vines, and bubbling sauce tunnels.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: 'She left a trail for me. I just have to follow the petals.' },
    ],
    endCutscene: [
        { speaker: 'Narrator', sprite: null, text: 'Matt defeats General Meatballo and the sauce rivers flow again.' },
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: '(written in peach jam) Matt, I believe in you. Follow the sauce river to Soup Swamp.' },
    ],
};

const level3 = {
    id: 3, slug: 'soup-swamp', name: 'The Soup Swamp',
    subtitle: 'Courage & patience', locked: true,
    theme: { key: 'swamp', sky: ['#dfe7d6', '#bcd3b0'], accent: '#e8642e' },
    miniBoss: 'The Sour Stew Witch',
    intro: [
        { speaker: 'Narrator', sprite: null, text: 'Misty broth lakes and floating croutons. Tina Tomato guards this swamp — and does not trust strangers.' },
        { speaker: 'Tina Tomato', sprite: 'tina_tomato', text: 'Most heroes turn back when the broth gets deep.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: "I'm not turning back. Someone I love is waiting for me." },
        { speaker: 'Tina Tomato', sprite: 'tina_tomato', text: 'Then take this. Spicy Marinara can warm even the coldest heart.' },
    ],
    endCutscene: [
        { speaker: 'Narrator', sprite: null, text: 'The Warm Hearth Tree lights the path to the Burnt Mountains.' },
        { speaker: 'Tina Tomato', sprite: 'tina_tomato', text: 'Go. And tell her the whole swamp is rooting for her.' },
    ],
};

const level4 = {
    id: 4, slug: 'burnt-mountains', name: 'The Burnt Mountains',
    subtitle: 'Cast-Iron Castle', locked: true,
    theme: { key: 'burnt', sky: ['#3a2f33', '#5a3b30'], accent: '#ff6b3d' },
    miniBoss: 'Sir Searsalot',
    intro: [
        { speaker: 'Narrator', sprite: null, text: 'Ash, blackened toast cliffs, and barbecue-sauce lava. King Charbroil\'s Cast-Iron Castle looms above.' },
        { speaker: 'Sir Searsalot', sprite: 'charbroil', text: 'You came all this way for a dessert?' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: 'No. I came for someone who makes the world sweeter.' },
    ],
    endCutscene: [
        { speaker: 'Cupcake Villager', sprite: null, text: 'She held onto your cookie. She said she knew you would come.' },
        { speaker: 'King Charbroil', sprite: 'charbroil', text: 'You should have stayed in your little festival. Everything burns.' },
    ],
};

const level5 = {
    id: 5, slug: 'sweetheart-rescue', name: 'The Sweetheart Rescue',
    subtitle: 'Final boss', locked: true,
    theme: { key: 'tower', sky: ['#2a2024', '#4a2f2a'], accent: '#ff6b3d' },
    boss: 'King Charbroil',
    intro: [
        { speaker: 'Narrator', sprite: null, text: 'The highest tower of the Cast-Iron Castle. The Princess waits beneath the glass dome. This is it.' },
        { speaker: 'King Charbroil', sprite: 'charbroil', text: 'You think courage makes you special?' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: 'No. Love does.' },
    ],
    endCutscene: [
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: 'Matt, he isn\'t just angry. He\'s lonely.' },
        { speaker: 'King Charbroil', sprite: 'charbroil', text: 'I was once part of the feast. But I was burned, thrown away, and forgotten.' },
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: 'No one should be forgotten. But hurting others will not heal you.' },
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: 'You came all this way for me.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: 'I told you I would.' },
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: 'You gave me your heart.' },
    ],
};

export const LEVELS = [level1, level2, level3, level4, level5];

export const SCORE = {
    coin: 10,
    petal: 50,
    enemy: 25,
    miniBoss: 250,
    levelComplete: 500,
    finalBoss: 1000,
};
