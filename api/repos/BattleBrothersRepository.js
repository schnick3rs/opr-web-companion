const stringToKebab = function (text) {
  return text.toLowerCase().replace(/\W/gm, '-');
};

const sections = (sections) => {
  return {
    sections,
  }
};

const section = (headline, elements) => {
  return {
    key: `section-${stringToKebab(headline)}`,
    headline,
    elements,
  }
};

const p = (one, two = undefined) => {
  return two ? `<p><strong>${one}:</strong> ${two}</p>` : `<p>${one}</p>`;
}

const ul = (items = []) => {
  return `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

const element = (label, content) => {
  return {
    key: `element-${stringToKebab(label)}`,
    label,
    content,
  }
};

// ---

const army = (name, version) => {
  return {
    system: 'Grimdark Future',
    key: stringToKebab(name),
    faction: name,
    version,
  };
};

const unit = function(name, size, quality, defence, equipment = [], specialRules = [], upgrades= '', cost = 0) {
  return {
    name,
    size,
    quality,
    defence,
    equipment: equipment.map((e) => {
      return {
        ...e,
        amount: e.amount || size,
      };
    }),
    specialRules: specialRules.map((rule) => {
      const { groups } = /^(?<name>[\w -]+)\(?(?<rating>[\w\d]*)\)?$/gm.exec(rule);
      return {
        ...groups,
        label: `${groups.name}${groups.rating ? `(${groups.rating})` : ''}`,
      };
    }),
    upgrades: upgrades.split(''),
    cost,
  };
};

const weapon = function(label, range = undefined, attacks = 1, ap = 0, specialRules = []) {
  return {
    label,
    range,
    attacks,
    specialRules: ap ? [ `AP(${ap})`, ... specialRules] : specialRules,
  };
};

const melee = function(label, attacks, ap, specialRules) {
  return weapon(label, undefined, attacks, ap, specialRules);
};

const item = function(label, specialRules = []) {
  return {
    label,
    specialRules,
  };
};

const specialRule = function(text) {
  const splits = text.split(': ');
  return {
    label: splits[0],
    effect: splits[1],
  };
};

// Blurred Sight (4+): Target enemy unit within 12” gets -1 to hit next time it shoots.
const spell = function(text) {
  const splits = text.split(': ');
  const effect = splits[1];
  const nameSplits = splits[0].split(' (');
  const name = nameSplits[0];
  const tn = nameSplits[1];
  return {
    name,
    tn,
    effect,
  };
};

const upgradeChoice = function(gains= [], cost= 0) {
  return {
    label: gains.map((g) => g.label).join(', '),
    gains,
    cost,
  };
};

const E = {
  ASSAULT_RIFLE: weapon('Assault Rifle',12,1),
  PISTOL: weapon('Pistol',12,1),
  CARBINES: weapon('Carbine',18,2),
  GRAVITY_RIFLE: weapon('Gravity Rifle',18,2,1, ['Rending']),
  PLASMA_RIFLE: weapon('Plasma Rifle',24,1,2),
  FLAMETHROWER: weapon('Flamethrower',12,6),
  FUSION_RIFLE: weapon('Fusion Rifle',12,1,4,['Deadly(6)']),
  PLASMA_PISTOL: weapon('Plasma Pistol',12, 1,2),
  CCW: (attacks= 1) => melee('CCW', attacks),
};

const SR = {
  AMBUSH: 'Ambush',
  BLAST: (rating) => `Blast(${rating})`,
  FAST: 'Fast',
  FEAR: 'Fear',
  FEARLESS: 'Fearless',
  FLYING: 'Flying',
  FURIOUS: 'Furious',
  HERO: 'Hero',
  RELENTLESS: 'Relentless',
  SLOW: 'Slow',
  STEALTH: 'Stealth',
  TOUGH: (rating) => `Tough(${rating})`,
  PSYCHIC: (rating) => `Psychic(${rating})`,
  STRIDER: 'Strider',
  SCOUT: 'Scout',
  IMPACT: (rating) => `Impact(${rating})`,
  ORMA: {
    BAD_SHOT: 'Bad Shot',
    GOOD_SHOT: 'Good Shot',
  },
  PRIME_BROTHERS: {
    PRIME: 'Prime',
  },
}

const armyBookPage = (label, units=[], upgrades={}, specialRules=[], psychicSpells=[]) => {
  return {
    label,
    units,
    upgrades,
    specialRules,
    psychicSpells,
  };
};

const grimdarkPrimeBrothers = {
  ...army('Prime Brothers','v2.12'),
  pages: [
    armyBookPage(
      'Infantry Units',
      [
        unit(
          'Assault Squad',
          5,
          3,
          2,
          [E.PISTOL, E.CCW(3)],
          [SR.PRIME_BROTHERS.PRIME],
          'FG',
          185,
        ),
      ],
      {
        F: {
          letter: 'F',
          options: [
            {
              hint: 'Upgrade one model with:',
              type: 'upgrade',
              upgradeTarget: 'one',
              upgradeLimit: 1,
              choices: [
                { label: 'Medical Training', gain: [ SR.PRIME_BROTHERS.MEDICAL_TRAINING ], cost: 45 },
              ],
            },
          ],
        },
        G: {
          letter: 'G',
          options: [
            {
              hint: 'Replace one pistol:',
              type: 'replacement',
              adjustments: [
                { group: 'equipment', modifier: -1, value: 'Pistol' },
              ],
              choices: [
                { label: 'Plasma Pistol', gain: [ E.PLASMA_PISTOL ], cost: 5 },
              ],
            },
          ],
        },
        I: {
          letter: 'I',
          options: [
            {
              hint: 'Replace all Heavy Pistols and CCWs:',
              type: 'replacement',
              adjustments: [
                { group: 'equipment', modifier: '-*', value: 'Heavy Pistol' },
                { group: 'equipment', modifier: '-*', value: 'CCW' },
              ],
              choices: [
                { label: 'Assault Rifles and CCWs', gain: [ E.ASSAULT_RIFLE, E.CCW(2) ], cost: 0 },
              ],
            },
            {
              hint: 'Replace one Heavy Pistols and CCWs:',
              type: 'replacement',
              replacementLimit: 1,
              adjustments: [
                { group: 'equipment', modifier: -1, value: 'Heavy Pistol' },
                { group: 'equipment', modifier: -1, value: 'CCW' },
              ],
              choices: [
                { label: 'Heavy Pistol and Energy Sword', gain: [ weapon('Heavy Pistol',12,1,1), melee('Energy Sword',3,1,['Rending']) ], cost: 5 },
                { label: 'Heavy Pistol and Energy Fist', gain: [ weapon('Heavy Pistol',12,1,1), melee('Energy Fist',3,3) ], cost: 5 },
                { label: 'Heavy Pistol and Energy Hammer', gain: [ weapon('Heavy Pistol',12,1,1), melee('Energy Sword',3,1,['Deadly(3)']) ], cost: 10 },
                { label: 'Heavy Chainsaw Sword', gain: [ melee('Heavy Chainsaw Sword',9,1) ], cost: 20 },
              ],
            },
            {
              hint: 'Upgrade all models with:',
              type: 'upgrade',
              upgradeTarget: 'all',
              choices: [
                { label: 'Grapnels', gain: [ SR.STRIDER ], cost: 20 },
                { label: 'Orbital Deployment', gain: [ SR.AMBUSH ], cost: 40 },
              ],
            },
          ],
        },
        J: {
          letter: 'J',
          options: [
            {
              hint: 'Replace all Heavy Plasma Rifles:',
              type: 'replacement',
              adjustments: [
                { group: 'equipment', modifier: '-*', value: 'Heavy Plasma Rifle' },
              ],
              choices: [
                { label: 'Plasma Auto-Rifles', gain: [ weapon('Plasma Auto-Rifle',24,2,1) ], cost: 10 },
                { label: 'Light Plasma Cannons', gain: [ weapon('Light Plasma Cannon',26,1,2) ], cost: 10 },
              ],
            },
          ],
        },
      }
    ),
    armyBookPage(
      'Vehicles',
      [
        unit(
          'Prime Attack Walker',
          1,
          3,
          2,
          [
            weapon('Heavy Gattling Gun',30,12,1),
            melee('Walker Fist',4,4),
            melee('Stomp',2,1),
            weapon('Twin Storm Rifle',24,4),
          ],
          [ SR.FEAR, SR.PRIME_BROTHERS.PRIME, SR.TOUGH(12) ],
          'E',
          500,
        ),
      ],
      {
        E: {
          letter: 'E',
          options: [
            {
              hint: 'Replace Heavy Gatling Gun',
              type: 'replacement',
              adjustments: [
                {group: 'equipment', modifier: -1, value: 'Heavy Gatling Gun'},
              ],
              choices: [
                upgradeChoice([weapon('Heavy Plasma Cannon', 36, 6, 2, [SR.BLAST(6)])], 20),
              ],
            },
            {
              hint: 'Replace Twin Storm Rifle',
              type: 'replacement',
              adjustments: [
                {group: 'equipment', modifier: -1, value: 'Twin Storm Rifle'},
              ],
              choices: [
                upgradeChoice([weapon('Twin HE-Launcher', 18, 6, undefined, [SR.BLAST(3)])], 5),
              ],
            },
            {
              hint: 'Upgrade with one',
              type: 'upgrade',
              upgradeTarget: 'unit',
              upgradeLimit: 1,
              choices: [
                upgradeChoice([weapon('Heavy Flamethrower', 12, 6, 1)], 20),
                upgradeChoice([weapon('Gattling Gun', 24, 6, 1)], 35),
              ],
            },
            {
              hint: 'Upgrade with one',
              type: 'upgrade',
              upgradeTarget: 'unit',
              upgradeLimit: 1,
              choices: [
                upgradeChoice([weapon('AA-Rocket Pod', 24, 1, 2, [SR.ANTI_AIR])], 10),
              ],
            },
          ],
        },
      },
    ),
  ],
};

const grimdarkBattleBrothers = {
  ...army('Battle Brothers','v2.12'),
  pages: [
    {
      label: 'Basic Units',
      units: [
        unit(
          'Captain',
          1,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS, SR.HERO, SR.RELENTLESS, SR.TOUGH(3)],
          'ABC',
          90,
        ),
        unit(
          'Champion',
          1,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS, SR.HERO, SR.TOUGH(3)],
          'ABC',
          80,
        ),
        unit(
          'Engineer',
          1,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS, SR.HERO, 'Repair', SR.TOUGH(3)],
          'AB',
          90,
        ),
        unit(
          'Psychic',
          1,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS, SR.HERO, SR.PSYCHIC(1), SR.TOUGH(3)],
          'ABD',
          100,
        ),
        unit(
          'Pathfinders',
          5,
          3,
          4,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS, SR.STRIDER],
          'AH',
          140,
        ),
        unit(
          'Battle Brothers',
          5,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS],
          'AE',
          150,
        ),
        unit(
          'Assault Brothers',
          5,
          3,
          2,
          [E.PISTOL, E.CCW(2)],
          [SR.FEARLESS],
          'AF',
          150,
        ),
        unit(
          'Support Brothers',
          5,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FEARLESS, SR.RELENTLESS],
          'AG',
          160,
        ),
        unit(
          'Brother Bikers',
          3,
          3,
          2,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FAST, SR.FEARLESS, SR.IMPACT(1)],
          'AI',
          125,
        ),
        unit(
          'Pathfinder Bikers',
          3,
          3,
          4,
          [E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FAST, SR.FEARLESS, SR.IMPACT(1), SR.SCOUT],
          'AJ',
          130,
        ),
        unit(
          'Support Bike',
          1,
          3,
          2,
          [weapon('Heavy Flamethrower',12,6,1), E.ASSAULT_RIFLE, E.CCW(1)],
          [SR.FAST, SR.FEARLESS, SR.IMPACT(3), SR.TOUGH(3)],
          'AK',
          115,
        ),
      ],
      upgrades: {
        A: {
          letter: 'A',
          options: [
            {
              hint: 'Replace one Assault Rifle and CCW',
              type: 'replacement',
              replacements: [
                { amount: 'one', what: 'Assault Rifle' },
                { amount: 'one', what: 'CCW' },
              ],
              choices: [
                { label: 'Pistol and CCW(2)', gain: [ E.PISTOL, E.CCW(2) ], cost: 0},
                { label: 'Heavy Chainsaw Sword', gain: [ weapon('Heavy Chainsaw Sword',0,6,1) ], cost: 10 },
                { label: '2x Energy Claws', gain: [ melee('2x Energy Claws',2,1,['Rending']) ], cost: 10 },
              ],
            },
            {
              hint: 'Replace one Pistol',
              type: 'replacement',
              replacements: [
                { amount: 'one', what: 'Pistol' },
              ],
              choices: [
                { label: 'Gravity Pistol', gain: [ weapon('Gravity Pistol',12,2,0,['Rending']) ], cost: 5},
                { label: 'Plasma Pistol', gain: [ weapon('Plasma Pistol',12,1,2) ], cost: 5},
                { label: 'Storm Rifle', gain: [ weapon('Storm Rifle',24,2) ], cost: 5},
                { label: 'Combat Shield', gain: [ item('Combat Shield',['Shield Wall']) ], cost: 10 },
              ],
            },
            {
              hint: 'Replace one CCW',
              type: 'replacement',
              replacements: [
                { amount: 'one', what: 'CCW' },
              ],
              choices: [
                { label: 'Energy Sword', gain: [ melee('Energy Sword',2,1,['Rending']) ], cost: 5},
                { label: 'Energy Fist', gain: [ melee('Energy Fist',2,3) ], cost: 10},
                { label: 'Energy Hammer', gain: [ melee('Energy Hammer',2,1,['Deadly(3)']) ], cost: 10},
                { label: 'Chainsaw Fist', gain: [ melee('Chainsaw Fist',4,3) ], cost: 20},
              ],
            },
            {
              hint: 'Take one Assault Rifle attachment',
              type: 'upgrade-item',
              modifies: [
                { amount: 'one', what: E.ASSAULT_RIFLE.label },
              ],
              choices: [
                { gain: [ E.GRAVITY_RIFLE ], cost: 10 },
                { gain: [ E.PLASMA_RIFLE ], cost: 15 },
                { gain: [ E.FLAMETHROWER ], cost: 15 },
                { gain: [ E.FUSION_RIFLE ], cost: 25 },
              ],
            },
          ],
        },
        B: {
          letter: 'B',
          options: [
            {
              hint: 'Upgrade with one',
              type: 'upgrade-unit-one',
              select: [
                { amount: 'one' },
              ],
              choices: [
                { gain: [ item('Jetpack',[SR.AMBUSH, SR.FLYING]) ], cost: 15 },
                {
                  gain: [
                    item('Combat Bike',[SR.FAST, SR.IMPACT(1)], ),
                    weapon('Twin Assault Rifle',24,2),
                  ],
                  cost: 20
                },
                { gain: [ item('Destroyer Armor',[SR.AMBUSH, SR.TOUGH(3)]) ], cost: 80 },
              ],
            },
            {
              hint: 'Upgrade with any',
              type: 'upgrade-unit-any',
              select: [
                { amount: 'any' },
              ],
              choices: [
                { label: 'Veteran Infantry', gain: [ item('Veteran Infantry',['Veteran Infantry']) ], cost: 10 },
              ],
            },
          ],
        },
      },
      specialRules: [
        specialRule('Advanced Tactics: The hero and his unit get +3” range when shooting and +3” range when using charge actions.'),
      ],
      psychicSpells: [
        spell('Blurred Sight (4+): Target enemy unit within 12” gets -1 to hit next time it shoots.'),
      ],
    },
  ],
};

const grimdarkOrcMarauders = {
  ...army('Orc Marauders','v2.12'),
  pages: [
    {
      label: 'Infantry',
      units: [
        unit(
          'Warlord',
          1,
          3,
          4,
          [E.PISTOL, E.CCW(3)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.HERO, SR.TOUGH(3)],
          'ABDE',
          50,
        ),
        unit(
          'Mechanic',
          1,
          4,
          4,
          [E.PISTOL, E.CCW(3)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.HERO, SR.ORMA.REPAIR, SR.TOUGH(3)],
          'ABDF',
          55,
        ),
        unit(
          'Shaman',
          1,
          4,
          4,
          [E.PISTOL, E.CCW(3)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.HERO, SR.PSYCHIC(1), SR.TOUGH(3)],
          'ABDG',
          65,
        ),
        unit(
          'Goblin Herd',
          10,
          6,
          6,
          [E.PISTOL, E.CCW(1)],
          [SR.ORMA.GOOD_SHOT],
          'HI',
          60,
        ),
        unit(
          'Orc Mob',
          10,
          4,
          5,
          [E.PISTOL, E.CCW(2)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS],
          'ACJK',
          155,
        ),
        unit(
          'Jetpack Orcs',
          5,
          4,
          5,
          [E.PISTOL, E.CCW(2)],
          [SR.AMBUSH, SR.ORMA.BAD_SHOT, SR.FLYING, SR.FURIOUS],
          'ACIL',
          135,
        ),
        unit(
          'Commandos',
          5,
          4,
          5,
          [E.PISTOL, E.CCW(2)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.SCOUT, SR.STEALTH, SR.STRIDER],
          'ACKM',
          130,
        ),
        unit(
          'Specialist Orcs',
          5,
          4,
          5,
          [E.CARBINES, E.CCW(2)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.RELENTLESS],
          'N',
          95,
        ),
        unit(
          'Orc Pirates',
          5,
          3,
          5,
          [E.PISTOL, E.CCW(3)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.RELENTLESS, SR.TOUGH(3)],
          'O',
          230,
        ),
        unit(
          'Boss Mob',
          5,
          3,
          5,
          [E.PISTOL, E.CCW(3)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.TOUGH(3)],
          'BP',
          225,
        ),
        unit(
          'Ultra Bosses',
          3,
          3,
          2,
          [E.CARBINES, melee('Energy Claws',3,2)],
          [SR.ORMA.BAD_SHOT, SR.FURIOUS, SR.SLOW, SR.TOUGH(3)],
          'Q',
          215,
        ),
        unit(
          'Orc Bikers',
          3,
          4,
          5,
          [E.PISTOL, E.CCW(2)],
          [SR.ORMA.BAD_SHOT, SR.FAST, SR.FURIOUS, SR.IMPACT(1)],
          'ACR',
          70,
        ),
        unit(
          'Boss Bikers',
          3,
          3,
          5,
          [E.PISTOL, E.CCW(3)],
          [SR.ORMA.BAD_SHOT, SR.FAST, SR.FURIOUS, SR.IMPACT(1), SR.TOUGH(3)],
          'ABR',
          170,
        ),
        unit(
          'Boss Trike',
          1,
          3,
          5,
          [weapon('Double Shutgun',12,4), melee('Ultra Claw',3,2)],
          [SR.ORMA.BAD_SHOT, SR.FAST, SR.FURIOUS, SR.IMPACT(3), SR.RELENTLESS, SR.TOUGH(6)],
          'S',
          120,
        ),
        unit(
          'Mini Helicopter',
          1,
          4,
          5,
          [E.PISTOL, E.CCW(2)],
          [SR.ORMA.BAD_SHOT, SR.FAST, SR.FURIOUS, SR.IMPACT(3), SR.RELENTLESS, SR.TOUGH(6)],
          'T',
          75,
        ),
      ],
      upgrades: {
        A: {
          letter: 'A',
          options: [
            {
              hint: 'Replace one Assault Rifle and CCW',
              type: 'replacement',
              replacements: [
                { amount: 'one', what: 'Assault Rifle' },
                { amount: 'one', what: 'CCW' },
              ],
              choices: [
                { gain: [ E.PISTOL, E.CCW(2) ], cost: 0},
                { gain: [ weapon('Heavy Chainsaw Sword',0,6,1) ], cost: 10 },
                { gain: [ melee('2x Energy Claws',2,1,['Rending']) ], cost: 10 },
              ],
            },
            {
              hint: 'Replace one Pistol',
              type: 'replacement',
              replacements: [
                { amount: 'one', what: 'Pistol' },
              ],
              choices: [
                { gain: [ weapon('Gravity Pistol',12,2,0,['Rending']) ], cost: 5},
                { gain: [ weapon('Plasma Pistol',12,1,2) ], cost: 5},
                { gain: [ weapon('Storm Rifle',24,2) ], cost: 5},
                { gain: [ item('Combat Shield',['Shield Wall']) ], cost: 10 },
              ],
            },
            {
              hint: 'Replace one CCW',
              type: 'replacement',
              replacements: [
                { amount: 'one', what: 'CCW' },
              ],
              choices: [
                { gain: [ melee('Energy Sword',2,1,['Rending']) ], cost: 5},
                { gain: [ melee('Energy Fist',2,3) ], cost: 10},
                { gain: [ melee('Energy Hammer',2,1,['Deadly(3)']) ], cost: 10},
                { gain: [ melee('Chainsaw Fist',4,3) ], cost: 20},
              ],
            },
            {
              hint: 'Take one Assault Rifle attachment',
              type: 'upgrade-item',
              modifies: [
                { amount: 'one', what: E.ASSAULT_RIFLE.label },
              ],
              choices: [
                { gain: [ E.GRAVITY_RIFLE ], cost: 10 },
                { gain: [ E.PLASMA_RIFLE ], cost: 15 },
                { gain: [ E.FLAMETHROWER ], cost: 15 },
                { gain: [ E.FUSION_RIFLE ], cost: 25 },
              ],
            },
          ],
        },
        B: {
          letter: 'B',
          options: [
            {
              hint: 'Upgrade with one',
              type: 'upgrade-unit',
              select: [
                { amount: 'one' },
              ],
              choices: [
                { gain: [ item('Jetpack',[SR.AMBUSH, SR.FLYING]) ], cost: 15 },
                {
                  gain: [
                    item('Combat Bike',[SR.FAST, SR.IMPACT(1)], ),
                    weapon('Twin Assault Rifle',24,2),
                  ],
                  cost: 20
                },
                { gain: [ item('Destroyer Armor',[SR.AMBUSH, SR.TOUGH(3)]) ], cost: 80 },
              ],
            },
            {
              hint: 'Upgrade with any',
              type: 'upgrade-unit',
              select: [
                { amount: 'any' },
              ],
              choices: [
                { gain: [ item('Veteran Infantry',['Veteran Infantry']) ], cost: 10 },
              ],
            },
          ],
        },
      },
      specialRules: [
        specialRule('Advanced Tactics: The hero and his unit get +3” range when shooting and +3” range when using charge actions.'),
      ],
      psychicSpells: [
        spell('Blurred Sight (4+): Target enemy unit within 12” gets -1 to hit next time it shoots.'),
      ],
    },
  ],
};

module.exports = [
  army('Alien Hives','v2.9'),
  grimdarkBattleBrothers,
  army('Battle Brother Detachments','v2.13'),
  army('Battle Sisters','v2.12'),
  army('Dark Elf Raiders','v2.7'),
  army('Dwarf Guilds','v2.6'),
  army('Elven Jesters','v2.6'),
  army('Feudal Guard','v2.8'),
  army('Havoc Brother Disciples','v2.13'),
  army('Havoc Brothers','v2.11'),
  army('High Elf Fleets','v2.9'),
  army('Human Defense Force','v2.13'),
  army('Human Inquisition','v2.7'),
  army('Infected Colonies','v2.4'),
  army('Machine Cult Defilers','v2.4'),
  army('Machine Cult','v2.10'),
  grimdarkOrcMarauders,
  grimdarkPrimeBrothers,
  army('Ratmen Clans','v2.6'),
  army('Rebel Guerrillas','v2.5'),
  army('Robot Legion','v2.11'),
  army('Soul-Snatcher Cults','v2.8'),
  army('TAO Coalition','v2.11'),
  army('Titan Lords','v2.4'),
  army('Vile Rattus Cult','v2.5'),
  army('Wormhole Daemons','v2.9'),
];
