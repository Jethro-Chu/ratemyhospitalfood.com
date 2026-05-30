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
const vine      = (x, y, w) => ({ x, y, w, h: 8, type: 'vine' });
const ramp      = (x, y, w) => ({ x, y, w, h: 14, type: 'ramp' });
const parm      = (x, y, w, h) => ({ x, y, w, h, type: 'parmesan' });

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

// =====================  LEVEL 2 — THE PASTA PIPE FIELDS  ==================

const level2 = {
    id: 2,
    slug: 'pasta-pipe-fields',
    name: 'The Pasta Pipe Fields',
    subtitle: 'The journey begins',
    locked: false,
    theme: {
        key: 'pasta',
        sky: ['#fbe9c8', '#f6c98a'],
        hillBack: '#f0c98a',
        hillFront: '#e8b06a',
        accent: '#e8642e',
        ground: '#cf9a52',
        groundTop: '#ecc06a',
    },
    width: 4280,
    spawn: { x: 36, y: 150 },
    goal: null, // completion is triggered by defeating General Meatballo

    intro: [
        { speaker: 'Narrator', sprite: null, text: 'Matt follows a trail of glowing peach petals into the Pasta Pipe Fields — rolling noodle hills, spaghetti vines, and bubbling sauce tunnels.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: 'She left a trail for me. Each petal is a little memory. I just have to follow them.' },
        { speaker: 'Narrator', sprite: null, text: "But King Charbroil's army is spreading — turning fresh food stale and warm kitchens cold. The Sauce Mill ahead has stopped flowing." },
    ],

    triggers: [
        { x: 60,   lines: [{ speaker: 'Tip', text: 'Same controls as before — move, JUMP, and throw SAUCE. Follow the peach petals!' }] },
        { x: 980,  lines: [{ speaker: 'Tip', text: 'Bounce on the springy ravioli pads to reach the high treats!' }] },
        { x: 1700, lines: [{ speaker: 'Tip', text: 'Walk into a pasta pipe to travel through it. Green-glowing pipes hide bonus coins!' }] },
        { x: 2640, lines: [{ speaker: 'Tip', text: 'Lasagna ramps ahead! Ride the parmesan wind to float across the sauce river.' }] },
        { x: 3300, lines: [{ speaker: 'Tina Tomato', sprite: 'tina_tomato', text: "General Meatballo blocks the Sauce Mill! Dodge his rolls and pelt him with marinara!" }] },
    ],

    checkpoints: [
        { x: 1240, y: 150 },
        { x: 2620, y: 150 },
        { x: 3360, y: 150 },
    ],

    // ---- platforms -------------------------------------------------------
    platforms: [
        // SECTION 1 — Opening Fields
        groundSeg(0, 520),
        groundSeg(600, 360),         // gap 520..600 (sauce river)
        tray(220, 150, 70),
        tray(380, 138, 64),
        vine(700, 132, 70),

        // SECTION 2 — Ravioli Bounce Garden
        groundSeg(1010, 200),        // gap 960..1010
        groundSeg(1300, 200),        // gap 1210..1300
        groundSeg(1560, 200),        // gap 1500..1560
        pad(1060, 186, 46),
        pad(1360, 186, 46),
        vine(1090, 116, 60),
        vine(1230, 92, 64),
        vine(1390, 116, 60),
        tray(1600, 140, 70),

        // SECTION 3 — Pasta Pipe Maze
        groundSeg(1700, 190),        // pipe A sends Matt past the parmesan wall
        parm(1834, 120, 18, 88),     // blocking wall — must take the pipe
        groundSeg(1900, 320),        // arrival side
        groundSeg(2300, 320),        // gap 2220..2300
        tray(2070, 132, 60),
        tray(2470, 128, 70),
        vine(2230, 88, 96),          // bonus ledge (Pipe B destination)

        // SECTION 4 — Lasagna Ramp Chase (sauce river below = pits)
        ramp(2620, 116, 96),
        ramp(2720, 138, 96),
        ramp(2820, 160, 96),
        ramp(2920, 182, 110),
        groundSeg(3040, 170),        // landing
        groundSeg(3320, 70),         // after the wind gap (3210..3320)
        tray(3120, 150, 60),

        // SECTION 5 — Sauce Mill arena
        groundSeg(3400, 800),        // arena floor 3400..4200
        parm(3460, 168, 16, 40),     // left crash wall (low — hop over to enter)
        parm(4170, 116, 18, 92),     // right crash wall (blocks exit, holds mill)
        tray(3560, 150, 80),         // raised dodge platform
        tray(3980, 150, 80),         // raised dodge platform
    ],

    // ---- pipes (auto-warp on walk-in) ------------------------------------
    pipes: [
        { x: 1772, y: 168, w: 28, h: 40, dest: { x: 1912, y: 150 } },              // forward past the wall
        { x: 2010, y: 168, w: 28, h: 40, bonus: true, dest: { x: 2250, y: 64 } },  // up to the bonus ledge
    ],

    // ---- launch + hazard geysers -----------------------------------------
    geysers: [
        { x: 2150, y: GROUND_Y, w: 38, kind: 'launch', period: 1700, onTime: 1100, maxH: 110, phase: 0 },
        { x: 3250, y: GROUND_Y + 90, w: 40, kind: 'noodle', period: 2200, onTime: 1100, maxH: 86, phase: 0 }, // rises from the sauce river
    ],

    // ---- parmesan wind gusts ---------------------------------------------
    winds: [
        { x: 3210, y: 96, w: 110, h: 120, ax: 70, ay: -1280, minVy: -150 }, // float across the sauce river
    ],

    enemies: [
        { type: 'cracker',  x: 300,  y: 194, minX: 240,  maxX: 470,  speed: 28 },
        { type: 'fry',      x: 720,  y: 188, minX: 620,  maxX: 940,  speed: 38 },
        { type: 'cracker',  x: 1360, y: 194, minX: 1310, maxX: 1500, speed: 30 },
        { type: 'fry',      x: 1620, y: 188, minX: 1560, maxX: 1740, speed: 40 },
        { type: 'pickle',   x: 2090, y: 191, minX: 2070, maxX: 2120, speed: 14 }, // guards the maze
        { type: 'pickle',   x: 2480, y: 191, minX: 2460, maxX: 2540, speed: 14 },
        { type: 'meatball', x: 2700, y: 124, minX: 2620, maxX: 3030, speed: 78 }, // rolls down the ramps
        { type: 'fry',      x: 3120, y: 134, minX: 3100, maxX: 3180, speed: 36 },
    ],

    coins: [
        ...coinRow(120, 172, 4),
        ...coinArc(220, 138, 3),
        ...coinArc(500, 176, 5),       // over the first sauce river
        ...coinRow(700, 112, 3),
        ...coinArc(1040, 150, 4),      // ravioli bounce arc
        ...coinRow(1230, 70, 4),       // top of the vines
        ...coinArc(1360, 150, 4),
        ...coinArc(2130, 150, 4),      // launch geyser arc
        ...coinRow(2250, 44, 4),       // bonus ledge reward
        ...coinRow(2480, 104, 3),
        ...coinArc(2680, 110, 5, 24),  // down the ramps
        ...coinRow(3050, 178, 3),
        ...coinRow(3700, 176, 3),      // arena
    ],

    petals: [
        { x: 460, y: 96, memory: { speaker: 'Memory', text: 'Peach Tart once helped a shy blueberry muffin at the Grand Feast Festival. "Peach Tart always noticed the little ones."' } },
        { x: 1250, y: 56, memory: { speaker: 'Memory', text: 'You remember laughing with her by the sauce river. "She made even an ordinary sauce river feel magical."' } },
        { x: 2250, y: 40, memory: { speaker: 'Memory', text: '"Even little snacks can do brave things," she told you once. You hold onto that.' } },
    ],

    // ---- Sauce Mill + mini-boss ------------------------------------------
    sauceMill: { x: 4070, y: 96, w: 96, h: 112 },
    miniBoss: {
        name: 'General Meatballo',
        x: 3760,
        y: GROUND_Y - 28,
        arena: { minX: 3478, maxX: 4170, floorY: GROUND_Y },
    },

    endCutscene: [
        { speaker: 'Narrator', sprite: null, text: 'General Meatballo crashes into the last parmesan wall and bounces away, dizzy and grumbling but unhurt.' },
        { speaker: 'General Meatballo', sprite: 'meatball', text: 'Owwa... okay, okay! The valves are all yours, mozzarella...' },
        { speaker: 'Narrator', sprite: null, text: 'The Sauce Mill rumbles back to life. Warm tomato rivers begin to flow again across the Pasta Pipe Fields.' },
        { speaker: 'Narrator', sprite: null, text: 'On a piece of crust, written in peach jam, Matt finds a message:' },
        { speaker: 'Princess Peach Tart', sprite: 'peach_tart', text: 'Matt, I believe in you. Follow the sauce river to Soup Swamp.' },
        { speaker: 'Matt Mozzarella', sprite: 'matt_idle', text: "She knew I'd come." },
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
