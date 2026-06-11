// ===========================================================================
// ABYSS PROTOCOL — world layout, balance, and flavor. All hand-authored.
// One continuous vertical world: zones are depth bands of a single column.
// Depth meter shown to the player = -y * DEPTH_SCALE + SURFACE_OFFSET.
// ===========================================================================

export const DEPTH_SCALE = 2.4;       // world units -> "meters" on the HUD
export const SURFACE_OFFSET = 312;    // the dive starts already below safe depth

export const ZONES = [
    {
        id: 0,
        name: 'TWILIGHT REEF',
        topY: 0, floorY: -110, radius: 78,
        fog: '#04111d', fogDensity: 0.016,
        ambient: '#1a3a52', ambientIntensity: 0.5,
        water: '#062032',
        objective: 'Locate 3 sonar fragments — the gate below is sealed',
        gateY: -110, gateNeeds: { item: 'fragment', count: 3 },
    },
    {
        id: 1,
        name: 'SUNKEN RESEARCH STATION',
        topY: -130, floorY: -240, radius: 64,
        fog: '#020b12', fogDensity: 0.022,
        ambient: '#11293d', ambientIntensity: 0.34,
        water: '#03141f',
        objective: 'Find 2 battery cells to power the pressure lift',
        gateY: -240, gateNeeds: { item: 'cell', count: 2 },
    },
    {
        id: 2,
        name: 'ABYSSAL TRENCH',
        topY: -260, floorY: -372, radius: 46,
        fog: '#010407', fogDensity: 0.030,
        ambient: '#0a1a26', ambientIntensity: 0.2,
        water: '#010a12',
        objective: 'Descend to the signal source',
        gateY: -372, gateNeeds: null, // open maw into the arena
    },
];

// The kraken arena — a bowl below everything.
export const ARENA = {
    name: 'THE SIGNAL',
    centerY: -430, radius: 70, floorY: -452, ceilY: -385,
    fog: '#000203', fogDensity: 0.020,
    objective: 'Survive',
};

export const BAL = {
    // sub
    hullMax: 100, o2Max: 150, battMax: 100,
    o2Drain: 0.85,            // per second, always
    battDrain: 0.28,          // per second (headlights / life support)
    accel: 26, maxSpeed: 17, boostSpeed: 34,
    turnRate: 2.2, vertSpeed: 11, drag: 1.7,
    boostDrain: 11,           // battery per second while boosting
    boostDodgeWindow: 0.38,   // seconds of i-frames vs boss waves after boost tap
    sonarCost: 7, sonarCooldown: 5, sonarRange: 64, sonarRevealTime: 6.5,
    fireCooldown: 0.55, torpedoCost: 2, torpedoSpeed: 58, torpedoLife: 2.6, torpedoDmg: 6,
    iframeTime: 1.0,
    // pickups
    o2Pickup: 38, cellPickup: 42, repairPickup: 34,
    pearlScore: 500, killScore: 120, mineScore: 60,
    // hazards
    mineDmg: 24, mineRadius: 4.2,
    eelDmg: 11, eelRange: 6.5, eelWindup: 1.1, eelCooldown: 2.4, eelSpeed: 9,
    droneDmg: 8, droneBoltSpeed: 26, droneFireEvery: 2.1, droneSpeed: 10.5,
    debrisDmg: 14, debrisEvery: 3.6,
    ventDmg: 13, ventIdle: 3.4, ventWarn: 0.9, ventBlast: 1.5, ventHeight: 26, ventRadius: 3.4,
    // kraken
    bossHp: 120,
    swipeDmg: 17, swipeTelegraph: 1.0, swipeDuration: 1.15,
    waveDmg: 15, waveSpeed: 34, waveBand: 3.0,
    grabDmg: 12, grabRange: 6.0, grabHold: 1.4,
    inkLife: 8.5,
    bossContactDmg: 20,
};

// flavor — sparse, dark, never spammy
export const FLAVOR = {
    intro: [
        'Signal detected below safe depth.',
        'Dive authorized.',
        'Abyss Protocol initiated.',
    ],
    zone0: 'The light is already failing.',
    zone1: 'The station went quiet in 1987. Nobody asked why.',
    zone2: 'The trench is looking back.',
    arena: 'Sonar contact: too large to classify.',
    sonarBig: 'Sonar contact: too large to classify.',
    movement: 'Something moved outside the lights.',
    hullLow: 'Hull integrity failing.',
    o2Low: 'Oxygen reserves critical.',
    battLow: 'Battery reserves critical.',
    wave: 'Kraken pressure wave incoming.',
    sealed: 'Pressure doors sealed above.',
    gateOpen: 'The gate yields. Nothing below is locked anymore.',
    rage: 'It has stopped toying with you.',
};

export const PICKUP_LABELS = {
    o2: '+ Oxygen Capsule',
    fragment: 'Sonar Fragment found',
    cell: '+ Battery Cell',
    repair: '+ Repair Kit',
    pearl: '+ Ancient Pearl',
};

export const HIGH_KEY = 'abyssProtocolHigh';
