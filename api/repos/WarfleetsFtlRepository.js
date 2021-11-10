const stringToKebab = function (text) {
  return text.toLowerCase().replace(/\W/gm, '-');
};

const STATS = {
  ATTACKS: 'attacks',
  EVASION: 'evasion',
  STRENGTH: 'strength',
  TOUGHNESS: 'toughness',
  MOVE: 'move',
  CRUISE: 'cruise',
  RAM: 'ram',
  TURRET: {
    STRENGTH: 'turret.strength',
    RANGE: 'turret.range',
  },
};

const TYPE = {
  HEAVY: 'Heavy Ship',
  MEDIUM: 'Medium Ship',
  LIGHT: 'Light Ship',
  SQUADRON: 'Squadron',
};

const modify = (stat, modifier, condition = null) => {
  return {
    stat,
    modifier,
    condition,
  };
};

const system = (name, universe, version, hubLink) => {
  return {
    name,
    universe,
    version,
    hubLink,
  };
};


const ftl = () => {
  return system(
    'Warfleets: FTL',
    'Warfleets',
    version(1,1, new Date(2020,11,13)),
    'https://onepagerules.com/portfolio/warfleets-ftl/',
  );
};

const version = (major, minor, lastModified = undefined) =>  {
  return {
    label: `v${major}.${minor}`,
    major,
    minor,
    lastModified,
  };
};

const faction = (name, version, hint, shipClasses = [], upgrades = []) => {
  return {
    system: ftl(),
    short: 'FTL',
    key: stringToKebab(name),
    faction: name,
    version,
    hint,
    shipClasses:  shipClasses.map((s) => { return { ...s, faction: name } }),
    upgrades:  upgrades.map((s) => { return { ...s, faction: name } }),
  };
};

const hero = (label, cost, effect, modifiers=[]) => {
  return {
    type: 'hero',
    key: stringToKebab(label),
    label,
    effect,
    cost,
    modifiers,
  };
};

const title = (label, cost, effect, modifiers=[]) => {
  return {
    type: 'title',
    key: stringToKebab(label),
    label,
    effect,
    cost,
    modifiers,
  };
};

const upgrade = (label, effect, modifiers=[]) => {
  return {
    type: 'upgrade',
    key: stringToKebab(label),
    label,
    effect,
    modifiers,
  };
};

const specialRule = (label, effect) => {
  return {
    type: 'special-rule',
    key: stringToKebab(label),
    label,
    effect,
  };
};

const shipSpeed = (move, cruise = undefined) => {
  return {
    move,
    cruise: cruise ? cruise : (move * 1.5),
  };
};

const weapon = (label, range, attacks, strength, special = undefined) => {
  return {
    type: 'weapon',
    key: stringToKebab(label),
    label,
    range,
    attacks,
    strength,
    special,
  };
};

const turret = (range, attacks, strength) => {
  return weapon('Turret', range, attacks, strength);
};

const defence = (evasion, toughness) => {
  return {
    evasion,
    toughness,
  };
};

const shipClass = (label, type, cost, speed, turret, defense, upgradeSlotCount=0, specialRules = []) => {
  const category = type ==='Squadron' ? 'Squadron' : 'Ship';
  return {
    key: stringToKebab(label),
    label,
    category,
    type,
    cost,
    speed,
    turret,
    defense,
    upgradeSlotCount,
    specialRules,
  };
};

const legendaryFleet = (name, pro, con, modifiers = []) => {
  return {
    key: stringToKebab(name),
    name,
    pro,
    con,
    modifiers,
  };
};

const effect = (name, snippet, effects = []) => {
  return {
    key: stringToKebab(name),
    name,
    snippet,
    effects,
  }
}


module.exports = [
  {
    ...faction(
      'Common',
      'v1.5',
      'Default ship classes and upgrades, available to all factions.',
      [
        shipClass(
          'Heavy Ship',
          TYPE.HEAVY,
          80,
          shipSpeed(4),
          turret(24,2,2),
          defence(2,2),
          4,
        ),
        shipClass(
          'Medium Ship',
          TYPE.MEDIUM,
          60,
          shipSpeed(6),
          turret(18,2,1),
          defence(3,3),
          3,
        ),
        shipClass(
          'Light Ship',
          TYPE.LIGHT,
          40,
          shipSpeed(8),
          turret(12,2,0),
          defence(4,4),
          2,
        ),
        shipClass(
          'Gunship Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
        ),
        shipClass(
          'Fighter Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,3,0),
          defence(5,6),
          0,
          ['Anti-Squadron'],
        ),
        shipClass(
          'Bomber Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(8),
          turret(2,1,2),
          defence(4,5),
          0,
          ['Anti-Ship', 'Deadly'],
        ),
      ],
      [
        upgrade('Ablative Armor','Enemy ships ramming this ship take +1 damage, and this ship never takes any damage from overlapping enemy ships.'),
        upgrade('Armored Plating','This upgrade takes 5 damage to be disabled.'),
        upgrade('Gravity Bumper','Enemy ships are pushed by +D6“ when rammed by this ship.'),
        upgrade(
          'Nuclear Ammo',
          'Turret gets +1 strength',
          [
            modify(STATS.TURRET.STRENGTH,1),
          ],
        ),
        upgrade(
          'Precision Rig',
          'Turret gets +1 to hit.',
        ),
        upgrade(
          'Pulse Engine',
          'Gets +2“ on move and +3“ on cruise/ram actions.',
          [
            modify(STATS.MOVE,2),
            modify(STATS.CRUISE,3),
          ],
        ),
        upgrade('Reinforced Ram','Deals +1 damage when ramming enemy ships.'),
        upgrade('Repair Bay','When activated may remove 1 damage from another ship within 4“.'),
        upgrade('Shield Booster','When taking a point of damage roll one die, on a 5+ it is ignored.'),
        upgrade(
          'Stealth Rig',
          'Always counts as in cover when targeted from over 12“ away.',
          [
            modify(STATS.EVASION,1),
          ],
        ),
        upgrade('Tractor Beam','When activated pick one enemy ship within 8“ and move it D6+1“ toward this ship.'),
        upgrade('Warp Drive','When using move actions may move straight by D6+2“, ignoring all ships and terrain.'),
        // Weapons
        weapon('Energy Cannon',12,3,1,'Counts as having the Anti-Ship rule.'),
        weapon('Giga Cannon',6,1,4,'Counts as having the Deadly rule.'),
        weapon('Heavy Cannon',12,4,0,'Counts as having the Relentless rule.'),
        weapon('Linked Railgun',24,3,1,'Counts as having the Overheating rule.'),
        weapon('Missile Cluster',18,1,1,'Counts as having the Blast rule.'),
        weapon('Plasma Cannon',18,2,3,'Counts as having the Overheating rule.'),
        weapon('Tsunami Cannon',24,1,2,'May only be fired when holding and counts as having the Deadly rule.'),
        weapon('Weapon Batteries',6,2,2,'Counts as having the Broadside rule.'),
      ],
    ),
    heroes: [
      hero('Tactical Master',15,'May choose not to be deployed at the start of the game, but instead may be deployed anywhere over 9“ away from enemies at the start of any round after the first.'),
      hero('Expert Sapper',10,'When this ship is activated you may place a mine marker within 4“. Enemies moving within 2“ of the mine take 2 damage and remove it.'),
      hero('Ace Commander',10,'The first time a friendly squadron within 6“ is activated each round, you may activate another friendly squadron within 6“.'),
    ],
    titles: [
      title('Vanguard',10,'When deployed may immediately be moved straight by up to its move speed.'),
      title('Avenger',5,'May fire sides mounted weapons from both side facings at once.'),
      title('Defiant',5,'Whenever a friendly ship within 6“ is destroyed, you may remove 2 damage from this ship.'),
    ],
    specialRules: [
      specialRule('Anti-Ship','May only target enemy ships and gets +1 to hit.'),
      specialRule('Anti-Squadron','May only target enemy squadrons and gets +1 to hit.'),
      specialRule('Blast','If the target is hit all models within 4“ of it are also hit by this weapon.'),
      specialRule('Broadside','May only be mounted on the sides facing, and doubles its attacks when targeting enemy ships in their side facing'),
      specialRule('Deadly','This weapos deals +1 damage per hit on the target'),
      specialRule('Fragile','The first time this model takes damage each round it takes +1 damage'),
      specialRule('Overheating','If you roll a 1 to hit, then this ship takes 1 damage.'),
      specialRule('Relentless','This weapon may split its attacks to fire at different targets.'),
      specialRule('Rogue','This squadron may be activated during other phases, but may only either move or shoot when doing so.'),
    ],
    legendaryFleets: [],
  },
  {
    ...faction(
      'Empire',
      'v1.5',
      'All-rounder faction with abilities that deal self-damage for strong effects.',
      [
        shipClass(
          'Destroyer',
          TYPE.HEAVY,
          100,
          shipSpeed(4),
          turret(24,2,2),
          defence(2,2),
          5,
        ),
        shipClass(
          'Gladiator',
          TYPE.MEDIUM,
          70,
          shipSpeed(6),
          turret(24,2,1),
          defence(3,3),
          3,
        ),
        shipClass(
          'Raider',
          TYPE.LIGHT,
          40,
          shipSpeed(10),
          turret(6,3,0),
          defence(4,4),
          2,
        ),
        shipClass(
          'Slave Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
          ['Rogue'],
        ),
        shipClass(
          'Tempest Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
          ['Escort', 'Fragile'],
        ),
      ],
      [
        upgrade('Control Center','Friendly squadrons within 6“ may move even if engaged.'),
        upgrade('Hazardous Ammo','When firing its turret may choose to take 1 damage in order to get +1 to hit and +1 strength.'),
        upgrade('Munitions Resupply','Friendly squadrons within 4“ may shoot twice if they use hold actions.'),
        upgrade('Overcharged Rudders','May choose to take 1 damage to pivot once by up to 90° at any point when using move actions.'),
        // weapons
        weapon('Proximity Guns',4,2,0,'Counts as having the Anti-Squadron rule, and may be fired once at every squadron that is in range.'),
        weapon('Ion Cannon',18,2,1),
        weapon('Particle Cannon',12,3,0,'Counts as having the Deadly rule when targeting enemies in their front facing.'),
      ],
    ),
    heroes: [
      hero('Engineering Expert',15,'When you would damage enemy ships you may chose not to deal damage, and instead the enemy must pick one upgrade, which can’t be used until the end of the game.'),
      hero('Supply Strategist',10,'After all ships have been deployed this ship may be removed and deployed again.'),
    ],
    titles: [
      title('Unity',10,'May shoot before moving'),
      title('Suppressor',5,'Turret gets +1 to hit and +1 strength when targeting enemies that were already hit this round.'),
    ],
    specialRules: [
      specialRule('Escort','Enemy squadrons within 4“ may only target squadrons with Escort'),
    ],
    legendaryFleets: [
      legendaryFleet(
        'The Golden Shield',
        'The first time each round that a friendly ship would take 2 or more damage, it only takes 1 damage.',
        'Enemies get +1 strength and +1 to hit when targeting friendly ships that used this rule until the end of the round.',
        ),
      legendaryFleet(
        'The Pride of Tyria',
        'The first time each round that an enemy ship moves in line of sight of a friendly ship that is in range of its turret, it must react by shooting at it with its turret and gets -1 to hit.',
        'Friendly ships that use this rule take 1 damage after shooting.',
        ),
      legendaryFleet(
        'The Penal Fleet',
        'The first time each round that a friendly ship is activated it must take 2 actions instead of ony 1.',
        'Friendly ships that use this rule take 2 damage after activating.',
        ),
    ],
  },
  {
    ...faction(
      'Alliance',
      'v1.5',
      'Long-range faction with anti-squadron effects, but generally fragile.',
      [
        shipClass(
          'Eagle',
          TYPE.HEAVY,
          80,
          shipSpeed(4),
          turret(30,2,3),
          defence(2,2),
          4,
          ['Fragile'],
        ),
        shipClass(
          'Harrier',
          TYPE.MEDIUM,
          60,
          shipSpeed(6),
          turret(24,2,1),
          defence(3,3),
          3,
          ['Fragile'],
        ),
        shipClass(
          'Kite',
          TYPE.LIGHT,
          40,
          shipSpeed(8),
          turret(18,2,0),
          defence(4,4),
          2,
          ['Fragile'],
        ),
        shipClass(
          'Falcon Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(4,5),
          0,
          ['Defender', 'Rogue'],
        ),
        shipClass(
          'Hawk Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(6,2,0),
          defence(5,5),
          0,
          ['Fragile'],
        ),
      ],
      [
        upgrade('Advanced Precision Rig','Turret gets the Deadly rule when shooting at targets that are 18“ or further away.'),
        upgrade('EMP Blaster','Enemy squadrons within 4“ count as being engaged.'),
        upgrade('Point Defence System','After being shot at by enemy squadrons may shoot back with 3 attacks and strength 0.'),
        upgrade('Targeting Array','Turret gets +1 to hit and +1 strength when shooting at targets that are 12“ or further away.'),
        // weapons
        weapon('Rapid-Fire Gun',6,6,0,'Counts as having the Anti-Squadron and Relentless rules.'),
        weapon('Flechette Cannon',24,1,0,'Counts as having the Blast rule.'),
        weapon('Turbo Laser',30,1,1),
      ],
      ),
    heroes: [
      hero('Master Spotter',15,'When activated pick one enemy model within 24“. All friendly units get +1 to hit against it until this ship’s next activation.'),
      hero('Lone Hunter',10,'Turret gets +1 to hit and +1 strength as long as no friendly ships are within 6“.'),
    ],
    titles: [
      title('Paragon',10,'Enemies don’t hit on 2+ against this ship when using hold actions.'),
      title('Sunder',5,'May ignore cover when shooting at enemy ships.'),
    ],
    specialRules: [
      specialRule('Defender','Enemy squadrons within 4“ count as engaged.'),
    ],
    // buffs ships
    legendaryFleets: [
      legendaryFleet(
        'Hope Remains',
        'Friendly ships add +3“ to the range of their weapons.',
        'Enemies get +1 to hit when targeting friendly ships.',
        [
          effect(
            'Hope Remains (Pro)',
            'Friendly ships add +3“ to the range of their weapons.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Hope Remains (Con)',
            'Enemies get +1 to hit when targeting friendly ships.',
            { categoryFilter: 'Ship' },
          ),
        ],
        ),
      legendaryFleet(
        'Atov’s Veterans',
        'Friendly ships get +1 to hit when shooting at targets that are 12“ or further away.',
        'Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.',
        [
          effect(
            'Atov’s Veterans (Pro)',
            'Friendly ships get +1 to hit when shooting at targets that are 12“ or further away.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Atov’s Veterans (Con)',
            'Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.',
            { categoryFilter: 'Ship' },
          ),
        ],
        ),
      legendaryFleet(
        'Rangers of Moazu',
        'Friendly ships get +2 to hit when targeting enemy squadrons.',
        'Enemy squadrons always deal +1 damage when targeting ships.',
        [
          effect(
            'Rangers of Moazu (Pro)',
            'Friendly ships get +2 to hit when targeting enemy squadrons.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Rangers of Moazu (Con)',
            'Enemy squadrons always deal +1 damage when targeting ships.',
          ),
        ],
        ),
    ],
  },
  {
    ...faction(
      'Marauders',
      'v1.5',
      'Short-range faction with cheaper ships and squadrons built for ramming.',
      [
        shipClass(
          'Killer',
          TYPE.HEAVY,
          70,
          shipSpeed(4),
          turret(18,2,2),
          defence(2,3),
          4,
          ['Battering Ram'],
        ),
        shipClass(
          'Crusher',
          TYPE.MEDIUM,
          50,
          shipSpeed(6),
          turret(12,2,1),
          defence(3,4),
          3,
          ['Battering Ram'],
        ),
        shipClass(
          'Chopper',
          TYPE.LIGHT,
          30,
          shipSpeed(8),
          turret(6,2,0),
          defence(4,5),
          2,
          ['Battering Ram'],
        ),
        shipClass(
          'Turbo Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(12),
          turret(2,2,0),
          defence(5,6),
        ),
        shipClass(
          'Suicide Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
          ['Suicide Run', 'Fragile'],
        ),
      ],
      [
        upgrade('Bomber Command Center', 'Friendly squadrons within 6“ get +1 strength when targeting enemy ships.'),
        upgrade(
          'Charged Munitions',
          'Turret gets the Deadly rule when shooting at targets that are 6“ or closer to it..',
          [
            modify(STATS.TURRET, 'Deadly', 'against targets within 6"'),
          ],
        ),
        upgrade('Gunnery Crew','Turret gets +1 to hit and +1 strength when shooting at targets that are 12“ or closer to it.'),
        upgrade('Rapid Launch Bays','Friendly squadrons within 4“ get +2“ on move and +3“ on cruise actions.'),
        // Weapons
        weapon('Mega Cannon',6,2,4,'Counts as having the Deadly and Overheating rules.'),
        weapon('Ripper Array',6,3,1,'Counts as having the Broadside rule.'),
        weapon('Ship-Buster Gun',6,1,3,'Counts as having the Deadly and the Anti-Ship rules.'),
      ],
      ),
    heroes: [
      hero('Tyrant Boss',15,'Friendly squadrons within 4“ that would be destroyed are only destroyed after their next activation.'),
      hero('Speed Freak',10,'When using cruise actions enemies get -1 to hit against this ship until its next activation.'),
    ],
    titles: [
      title('Ravager',10,'May pivot twice when using cruise or ram actions.'),
      title('Impetuous',5,'Ignores difficult and dangerous terrain.'),
    ],
    specialRules: [
      specialRule('Battering Ram','Counts as having +1 max. upgrades for the purpose of ramming.'),
      specialRule('Suicide Run','May use ram actions (counts as having 0 upgrades), but is immediately destroyed when doing so.'),
    ],
    legendaryFleets: [
      legendaryFleet(
        'Iron Behemoths',
        'Friendly ships using ram actions push targets by +D6“.',
        'Friendly ships get -2“ on move and -3“ on cruise/ram actions.',
        [
          effect(
            'Iron Behemoths (Pro)',
            'Friendly ships using ram actions push targets by +D6“.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Iron Behemoths (Con)',
            'Friendly ships get -2“ on move and -3“ on cruise/ram actions.',
            { categoryFilter: 'Ship' }, // -2/3 move
          ),
        ],
        ),
      legendaryFleet(
        'Crimson Vortex',
        'Whenever a friendly ship is destroyed, all models within 4“ immediately take 2 damage.',
        'Friendly ships count as having the Fragile rule.',
        [
          effect(
            'Crimson Vortex (Pro)',
            'Whenever a friendly ship is destroyed, all models within 4“ immediately take 2 damage.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Crimson Vortex (Con)',
            'Friendly ships count as having the Fragile rule.',
            { categoryFilter: 'Ship' },
          ),
        ],
        ),
      legendaryFleet(
        'Morka’s Mob',
        'When preparing your fleet you may take +1 squadron per ship.',
        'Friendly squadrons count as having the Fragile rule.',
        [
          effect(
            'Morka’s Mob (Pro)',
            'When preparing your fleet you may take +1 squadron per ship.',
          ),
          effect(
            'Morka’s Mob (Con)',
            'Friendly squadrons count as having the Fragile rule.',
            { categoryFilter: 'Squadron' },
          ),
        ],
        ),
    ],
  },
  {
    ...faction(
      'Nomads',
      'v1.5',
      'Exotic faction with a variety of niche weapons and upgrades.',
      [
        shipClass(
          'Dusk',
          TYPE.HEAVY,
          80,
          shipSpeed(4),
          turret(24,2,2),
          defence(3,3),
          4,
        ),
        shipClass(
          'Twilight',
          TYPE.MEDIUM,
          60,
          shipSpeed(6),
          turret(18,2,1),
          defence(4,4),
          3,
        ),
        shipClass(
          'Dawn',
          TYPE.LIGHT,
          40,
          shipSpeed(8),
          turret(12,2,0),
          defence(5,5),
          2,
        ),
        shipClass(
          'Flicker Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
          ['Jammer', 'Fragile'],
        ),
        shipClass(
          'Shimmer Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(6,5),
          0,
          ['Fragile'],
        ),
      ],
      [
        upgrade('Early Warning System','When activated pick one ship facing, and enemies get -1 to hit against that facing until this ship’s next activation.'),
        upgrade('Gravity Trap Launcher','When activated, place a gravity trap marker within 6“. All enemies within 4“ of it halve their speed.'),
        upgrade('System Overrider','When activated pick one enemy squadron within 6“, and you may immediately activate and control it once as if it was your own squadron.'),
        upgrade('Wraith Drive','When using ram actions this ship may move through its target, but does not push it.'),
        // Weapons
        weapon('Splitter Cannon',12,1,2,'Counts as having the Blast rule.'),
        weapon('Precision Laser',12,4,0,'Counts as having the Anti-Squadron rule'),
        weapon('Storm Missiles',12,3,1,'May choose to get +2 attacks but count as having the Overheating rule.'),
      ],
      ),
    heroes: [
      hero('Restles Creator',15,'Once per round, when a friendly squadron is destroyed, you may place that squadron within 2“ instead and remove all damage from it.'),
      hero('Defensive Master',10,'This ship can‘t take more than 1 damage at once from a single weapon‘s attack.'),
    ],
    titles: [
      title('Instigator',10,'Friendly ships that target enemies within 6“ get +1 to hit.'),
      title('Protector',5,'Enemies targeting squadrons within 6“ get -1 to hit.'),
    ],
    specialRules: [
      specialRule('Jammer','Friendly squadrons within 4“ may move even if engaged.'),
    ],
    legendaryFleets: [
      legendaryFleet(
        'Children of the Vanished Mist',
        'One friendly ship counts as having +1 upgrade slots.',
        'That ship counts as Fragile, and enemies may always pick which upgrades are damaged/disabled.',
        [
          effect(
            'Children of the Vanished Mist (Pro)',
            'One friendly ship counts as having +1 upgrade slots.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Children of the Vanished Mist (Con)',
            'That ship counts as Fragile, and enemies may always pick which upgrades are damaged/disabled.',
            { categoryFilter: 'Ship' }, // same as PRO
          ),
        ],
        ),
      legendaryFleet(
        'The Forgotten',
        'Once per round you may count one friendly ship as activated so that you can activate another friendly ship that had already activated.',
        'Enemies deal +1 damage when targeting friendly ships that were already activated this round.',
        [
          effect(
            'The Forgotten (Pro)',
            'Once per round you may count one friendly ship as activated so that you can activate another friendly ship that had already activated.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'The Forgotten (Con)',
            'Enemies deal +1 damage when targeting friendly ships that were already activated this round.',
            { categoryFilter: 'Ship' }, // same as PRO
          ),
        ],
        ),
      legendaryFleet(
        'Mirage of the Void',
        'When activating ships during their phase, you may always go first.',
        'All ships in your fleet must be of exactly the same type and with the exact same upgrades.',
        [
          effect(
            'Mirage of the Void (Pro)',
            'When activating ships during their phase, you may always go first.',
          ),
          effect(
            'Mirage of the Void (Con)',
            'All ships in your fleet must be of exactly the same type and with the exact same upgrades.',
          ),
        ],
        ),
    ],
  },
  {
    ...faction(
      'Progenitors',
      'v1.5',
      'Defensive faction with slow but durable ships and powerful weapons.',
      [
        shipClass(
          'Dodecahedron',
          TYPE.HEAVY,
          80,
          shipSpeed(2),
          turret(24,2,2),
          defence(2,2),
          4,
          ['Hardened']
        ),
        shipClass(
          'Octahedron',
          TYPE.MEDIUM,
          60,
          shipSpeed(4),
          turret(18,2,1),
          defence(3,3),
          3,
          ['Hardened']
        ),
        shipClass(
          'Tetrahedron',
          TYPE.LIGHT,
          40,
          shipSpeed(6),
          turret(12,2,0),
          defence(4,4),
          2,
          ['Hardened']
        ),
        shipClass(
          'Prism Squadron',
          TYPE.SQUADRON,
          20,
          shipSpeed(8),
          turret(2,2,0),
          defence(4,4),
          0,
          ['Grit', 'Rogue'],
        ),
        shipClass(
          'Cube Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(6),
          turret(2,2,0),
          defence(4,4),
          0,
          ['Heavy'],
        ),
      ],
      [
        upgrade('Fortified Bow','Enemies shooting at this ship in its front facing get -1 strength.'),
        upgrade('Gravity Field','All enemies within 4“ halve their speed.'),
        upgrade('Redundant Shields','Enemies shooting at this ship in its rear facing get -2 strength.'),
        upgrade('Repair Pods','When this ship is activated roll one die for each friendly squadron within 4“ with damage on it. On a 5+ you may remove 1 damage from it.'),
        // Weapons
        weapon('Baryon Guns',6,3,1,'Counts as having the Anti-Squadron rule.'),
        weapon('Neutron Cannon',12,2,2,'May only be fired when holding and counts as having the Deadly rule.'),
        weapon('Potron Cannon',6,1,4,'Counts as having the Broadside and the Deadly rules.'),
      ],
    ),
    heroes: [
      hero('Ancient Guardian',15,'When this ship activates you may remove 1 damage from one non-disabled upgrade.'),
      hero('Prudent Director',10,'When taking any damage may transfer 1 damage to a friendly ship within 4“.'),
    ],
    titles: [
      title('Stronghold',10,'Enemies firing at this ship from 12“ or further get -1 strength.'),
      title('Redemption',5,'This ship takes no damage from overlapping, and always deals +1 damage when overlapping.'),
    ],
    specialRules: [
      specialRule('Grit','May move even if engaged, but enemy squadrons may also move if engaged with it.'),
      specialRule('Hardened','This ship ignores all strength values as long as it has no damage on it.'),
      specialRule('Heavy','Takes 5 damage to be destroyed.'),
    ],
    legendaryFleets: [
      legendaryFleet(
        'Prismatic Bastion',
        'At the beginning of each round roll one die for each point of damage on friendly ships. On a 5+ you may remove that damage.',
        'Enemies deal +1 damage to friendly ships that are damaged.',
        [
          effect(
            'Prismatic Bastion (Pro)',
            'At the beginning of each round roll one die for each point of damage on friendly ships. On a 5+ you may remove that damage.',
          ),
          effect(
            'Prismatic Bastion (Con)',
            'Enemies deal +1 damage to friendly ships that are damaged.',
            { categoryFilter: 'Ship' },
          ),
        ],
        ),
      legendaryFleet(
        'Abyssal Vanguard',
        'Enemies get -1 strength when shooting at friendly ships that are 12“ or further away.',
        'Enemies get +1 strength when shooting at friendly ships that are 12“ or closer to them.',
        [
          effect(
            'Abyssal Vanguard (Pro)',
            'Enemies get -1 strength when shooting at friendly ships that are 12“ or further away.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Abyssal Vanguard (Con)',
            'Enemies get +1 strength when shooting at friendly ships that are 12“ or closer to them.',
            { categoryFilter: 'Ship' },
          ),
        ],
        ),
      legendaryFleet(
        'Ancient Protectors',
        'One friendly ship may always ignore all damage the first time it takes damage each round.',
        'That ship may only use hold actions during the game.',
        [
          effect(
            'Ancient Protectors (Pro)',
            'One friendly ship may always ignore all damage the first time it takes damage each round.',
            { categoryFilter: 'Ship' }, // one
          ),
          effect(
            'Ancient Protectors (Con)',
            'That ship may only use hold actions during the game.',
            { categoryFilter: 'Ship' }, // morror
          ),
        ],
        ),
    ],
  },
  {
    ...faction(
      'Xenos',
      'v1.5',
      'Offensive faction with cheap and fragile ships built for swarm tactics.',
      [
        shipClass(
          'Matriarch',
          TYPE.HEAVY,
          60,
          shipSpeed(4),
          turret(24,2,2),
          defence(2,2),
          3,
        ),
        shipClass(
          'Guardian',
          TYPE.MEDIUM,
          40,
          shipSpeed(6),
          turret(18,2,1),
          defence(3,3),
          2,
        ),
        shipClass(
          'Warrior',
          TYPE.LIGHT,
          20,
          shipSpeed(8),
          turret(12,2,0),
          defence(4,4),
          1,
        ),
        shipClass(
          'Parasite Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
          ['Counter-Attack', 'Fragile'],
        ),
        shipClass(
          'Tentacle Squadron',
          TYPE.SQUADRON,
          10,
          shipSpeed(10),
          turret(2,2,0),
          defence(5,5),
          0,
          ['Swarm', 'Fragile'],
        ),
      ],
      [
        upgrade('Crushing Maw','When ramming ships roll one die, on a 4-6 deal +2 damage, on a 1-3 deal +1 damage and take +1 damage.'),
        upgrade('Pheromone Glands','Friendly squadrons within 6“ get +1 to hit when targeting enemy squadrons.'),
        upgrade('Predator Cysts','Turret gets +1 to hit and +1 strength when targeting enemy ships that already activated this round.'),
        upgrade('Toxin Sacs','Enemy ships attacking this ship from within 4“ that deal any damage immediately take 2 damage.'),
        // Weapons
        weapon('Acid Spray',6,4,0,'Counts as having the Broadside rule.'),
        weapon('Bio-Cannon',12,2,0,'Counts as having the Blast rule.'),
        weapon('Spike Launcher',12,4,0,'Counts as having the Anti-Ship rule.'),
      ],
    ),
    heroes: [
      hero('Brood Controller',15,'When this ship is activated all friendly unengaged squadrons within 4“ may immediately move by up to half their move speed.'),
      hero('Tyrant Champion',10,'This ship gets +4 to hit and +4 strength when attacking enemy heroes with its turret.'),
    ],
    titles: [
      title('Devourer',10,'This ship’s turret gets the Deadly rule.'),
      title('Wrecker',5,'This ship’s turret gets the Deadly rule when targeting enemies in their rear facing.'),
    ],
    specialRules: [
      specialRule('Counter-Attack','After being shot at by squadrons may shoot back.'),
      specialRule('Swarm','Gets +1 to hit and +1 strength for each other friendly squadron that is engaged with the target.'),
    ],
    legendaryFleets: [
      legendaryFleet(
        'Endless Hunger',
        'Friendly ships deal +X damage when using ram actions, where X is their max. number of upgrades.',
        'Enemies hit on 2+ when targeting friendly ships that are 12“ or closer.',
        [
          effect(
            'Endless Hunger (Pro)',
            'Friendly ships deal +X damage when using ram actions, where X is their max. number of upgrades.',
            { categoryFilter: 'Ship' },
          ),
          effect(
            'Endless Hunger (Con)',
            'Enemies hit on 2+ when targeting friendly ships that are 12“ or closer.',
            { categoryFilter: 'Ship' },
          ),
        ],
        ),
      legendaryFleet(
        'Dread Fleet',
        'Friendly ships get +1 strength when shooting at targets that are 12“ or closer.',
        'Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.',
        [
          effect(
            'Dread Fleet (Pro)',
            'Friendly ships get +1 strength when shooting at targets that are 12“ or closer.',
            { categoryFilter: 'Ship' },
            ),
          effect(
            'Dread Fleet (Con)',
            'Enemies get +1 strength when shooting at friendly ships that are 12“ or closer.',
            { categoryFilter: 'Ship' },
            ),
        ],
        ),
      legendaryFleet(
        'Void Maw',
        'Whenever a friendly heavy ship is activated, all enemy squadrons within 4“ are destroyed.',
        'Enemy squadrons always deal +1 damage when targeting friendly heavy ships.',
        [
          effect(
            'Void Maw (Pro)',
            'Whenever a friendly heavy ship is activated, all enemy squadrons within 4“ are destroyed.',
            { typeFilter: TYPE.HEAVY },
            ),
          effect(
            'Void Maw (Con)',
            'Enemy squadrons always deal +1 damage when targeting friendly heavy ships.',
            { typeFilter: TYPE.HEAVY },
            ),
        ],
        ),
    ],
  },
];
