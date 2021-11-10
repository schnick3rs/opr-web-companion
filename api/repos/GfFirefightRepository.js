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

const system = (name, universe, version, hubLink) => {
  return {
    name,
    universe,
    version,
    hubLink,
  };
};

// ---

const version = (major, minor, lastModified = undefined) =>  {
  return {
    label: `v${major}.${minor}`,
    major,
    minor,
    lastModified,
  };
};

const SYSTEM = {
  GF_2_10: system(
    'Grimark Future Firefight',
    'Grimdark Future',
    version(2, 10, new Date(2020, 4, 28)),
    'https://onepagerules.com/portfolio/grimdark-future-firefight/',
  ),
};

const SR = {
  AMBUSH: 'Ambush',
  BLAST: (rating = 3) => `Blast(${rating})`,
  DEADLY: (rating = 3) => `Deadly(${rating})`,
  FAST: 'Fast',
  FEAR: 'Fear',
  FEARLESS: 'Fearless',
  FLYING: 'Flying',
  FURIOUS: 'Furious',
  HERO: 'Hero',
  RELENTLESS: 'Relentless',
  REGENERATION: 'Regeneration',
  RENDING: 'Rending',
  SLOW: 'Slow',
  STEALTH: 'Stealth',
  TOUGH: (rating = 3) => `Tough(${rating})`,
  PSYCHIC: (rating) => `Psychic(${rating})`,
  STRIDER: 'Strider',
  POISON: 'Poison',
  SCOUT: 'Scout',
  SNIPER: 'Sniper',
  IMPACT: (rating) => `Impact(${rating})`,
  GOHC: {
    CULT_ICON: 'Cult Icon',
    REDEMPTION: 'Redemption',
  },
};

const army = (name, version, bookLink) => {
  return {
    key: stringToKebab(name),
    name,
    version,
    bookLink,
  };
};

const unit = function(name, size, quality, defence, equipment = [], specialRules = [], upgrades= '', cost = 0) {
  return {
    name,
    key: stringToKebab(name),
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
    type: 'weapon',
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

const createSpecialRule = (name, effect, hint, forUnit, forWeapon, hasRating = false, ratingFactor = undefined) => {
  return {
    key: stringToKebab(name),
    label: `${name}${hasRating ? '(X)' : ''}`,
    name,
    hint,
    effect,
    forUnit,
    forWeapon,
    hasRating,
    ratingFactor,
  };
};

const createUnitSpecialRule = (name, effect, hint, hasRating = false, ratingFactor = undefined) => {
  return createSpecialRule(name, effect, hint, true, false, hasRating, ratingFactor);
};

const createWeaponSpecialRule = (name, effect, hint, hasRating = false, ratingFactor = undefined) => {
  return createSpecialRule(name, effect, hint, false, true, hasRating, ratingFactor);
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
  const threshold = nameSplits[1];
  return {
    name,
    threshold,
    effect,
  };
};

const upgradeChoice = function(gains= [], cost= 0) {
  const label = gains.map((g) => (g instanceof Object) ? g.label : g).join(', ');
  return {
    label,
    key: stringToKebab(label),
    gains,
    cost,
  };
};

const upgradeWith = (limit = undefined, options = []) => {
  return {
    type: 'upgrade',
    limit,
    options,
  };
};

const replace = (limit = undefined, lose = [], options = []) => {
  return {
    type: 'replacement',
    limit,
    lose,
    options,
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


const armyBookPage = (label, units=[], upgrades={}, specialRules=[], psychicSpells=[]) => {
  return {
    label,
    units,
    upgrades,
    specialRules,
    psychicSpells,
  };
};

const specialRules = {
  AMBUSH: createUnitSpecialRule(
    'Ambush',
    'This model may be kept in reserve instead of deploying. At the start of any round after the first you may place the model anywhere over 9” away from enemy units. If both player have Ambush they roll-off to see who deploys first, and then alternate in placing them.',
    'Deploy this unit after the first round.',
    ),
  AP: createWeaponSpecialRule(
    'AP',
    'Targets get -X to Defense rolls when blocking hits.',
    'Reduce defense by X.',
    true,
    1,
  ),
  BLAST: createWeaponSpecialRule(
    'Blast',
    'All hits are multiplied by X and may be split evenly among all enemy units within 3” of a single model (target picks how).',
    'Hit X models within 3”.',
    true,
    3,
  ),
  DEADLY: createWeaponSpecialRule(
    'Deadly',
    'Assign each wound to one model and multiply it by X. Note that these wounds don´t carry over to other models if killed.',
    'Wounds deal X damage against a single model.',
    true,
    3,
  ),
  FAST: createUnitSpecialRule(
    'Fast',
    'Move 9” when using Advance and 18” when using Rush/Charge.',
    'Move increase by +3” / +6”',
  ),
  FEAR: createUnitSpecialRule(
    'Fear',
    'Always counts as having dealt +D3 wounds for seeing wound effects in melee (must deal at least 1 wound from attacks in order to apply).',
    'Count as having dealt +d3 wounds for melee resolution.',
  ),
  FEARLESS: createUnitSpecialRule(
    'Fearless',
    'Gets +1 to morale tests.',
    '+1 to morale tests.',
  ),
  FLYING: createUnitSpecialRule(
    'Flying',
    'May move through obstacles and may ignore terrain effects. This model only needs to roll 2+ for a successful drop or leap, and it may freely jump without having to roll for it.',
    'Ignore terrain and jump better.',
  ),
  FURIOUS: createUnitSpecialRule(
    'Furious',
    'Gets +1 attack with a weapon of your choice when charging.',
    '+1 A when charging.',
  ),
  HERO: createUnitSpecialRule(
    'Hero',
    'Friendly units within 12” of the hero may use his quality for morale tests, as long as he isn’t Stunned.',
    'Allies in 12” use your morale.',
  ),
  IMMOBILE: createUnitSpecialRule(
    'Immobile',
    'May never move/charge.',
    'No moving.',
  ),
  IMPACT: createUnitSpecialRule(
    'Impact',
    'Deals X automatic hits when charging successfully.',
    '+X auto hits on charge.',
    true,
    1,
  ),
  INDIRECT: createWeaponSpecialRule(
    'Indirect',
    'May target enemies that are not in line of sight, but gets -1 to hit rolls when shooting after moving.',
    'Shots ignore LoS but get -1 when moving.',
  ),
  POISON: createWeaponSpecialRule(
    'Poison',
    'When rolling an unmodified 6 to hit, that hit is multiplied by 3.',
    'Hits of 6 deal 3 hits.',
  ),
  PSYCHIC: createUnitSpecialRule(
    'Psychic',
    'May cast one spell during its activation at any point, before attacking. Pick a spell and a target in line of sight and roll D6+X. If the result is equal or higher than the number in brackets you may resolve the effects. Spells may target a single unit or split their effects evenly among all friendly or enemy units within 6” of a single model (target picks how). Enemy psychics within 18” and line of sight of the caster may roll D6+X at the same time, and if the result is higher the spell is blocked. Psychics may only either try to cast or try to block a spell each round.',
    'May cast and block spells.',
    true,
    1,
  ),
  REGENERATION: createUnitSpecialRule(
    'Regeneration',
    'When taking a wound, roll one die. On a 5+ it is ignored.',
    'Ignore wounds on 5+.',
  ),
  RELENTLESS: createUnitSpecialRule(
    'Relentless',
    'For each unmodified roll of 6 to hit when shooting, this model may roll 1 extra attack. This rule doesn’t apply to newly generated attacks.',
    '+1 attack once, for each hit of 6 when shooting.',
  ),
  RENDING: createWeaponSpecialRule(
    'Rending',
    'Unmodified rolls of 6 to hit count as having AP(4) and ignore the regeneration rule.',
    'Hits of 6 have AP(4) and ignore regeneration.',
  ),
  SCOUT: createUnitSpecialRule(
    'Scout',
    'This model may be deployed after all other units, and may then move by up to 12”, ignoring terrain. If both of the players have Scout they roll-off to see who deploys first, and then alternate in placing and moving them.',
    'Deploy last with 12” advantage.',
  ),
  SLOW: createUnitSpecialRule(
    'Slow',
    'Move 4” when using Advance and 8” when using Rush/Charge.',
    'Reduce move by -2” / -4”.',
  ),
  SNIPER: createWeaponSpecialRule(
    'Sniper',
    'Shoots at Quality 2+, ignores cover and may pick which model is hit.',
    'Shot with 2+, ignore cover and pick target.',
  ),
  STEALTH: createUnitSpecialRule(
    'Stealth',
    'Enemies get -1 to shooting when targeting this unit.',
    'Shots suffer -1.',
  ),
  STRIDER: createUnitSpecialRule(
    'Strider',
    'This model may ignore the effects of difficult terrain. This model only needs to roll 2+ for a successful drop, leap or jump.',
    'Ignore terrain, jump on 2+.',
  ),
  TOUGH: createUnitSpecialRule(
    'Tough',
    'This model only rolls to see what happens from wounds once it has taken at least X wounds, and is only Knocked Out on rolls of 5+X or more. When Stunned and hit by shooting or charged, this model takes 1 wound instead of being Knocked Out, unless it already has X or more wounds.',
    'Sustain more hits.',
    true,
    3,
  ),
};

const gangsOfHiveCityTheCult = {
  system: system(
    'Grimark Future Firefight',
    'Grimdark Future',
    version(2,10, new Date(2020,4,28)),
    'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
  ...army(
    'The Cult',
    version(2,2, new Date(2020,6,24)),
    'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
  ),
  hint: 'The Cult are religious fanatics turned gangers with the holy mission to cleanse the streets of hive city.',
  units: [
    unit(
      'Cult Leader',
      1,
      4,
      4,
      [E.PISTOL, E.CCW(2)],
      [SR.HERO, SR.STRIDER, SR.TOUGH(3)],
      'ABCD',
      45,
    ),
    unit(
      'Cult Champion',
      1,
      4,
      5,
      [E.PISTOL, E.CCW(2)],
      [SR.HERO, SR.STRIDER, SR.TOUGH(3)],
      'ABCE',
      40,
    ),
    unit(
      'Cult Veteran',
      1,
      4,
      5,
      [E.PISTOL, E.CCW(2)],
      [SR.STRIDER],
      'ABC',
      20,
    ),
    unit(
      'Cult Ganger',
      1,
      5,
      5,
      [E.PISTOL, E.CCW(2)],
      [SR.STRIDER],
      'AB',
      15,
    ),
    unit(
      'Cult Rookies',
      3,
      6,
      6,
      [E.PISTOL, E.CCW(2)],
      [SR.STRIDER],
      'AB',
      30,
    ),
  ],
  upgrades: {
    A: [
      {
        type: 'replacement',
        lose: [ E.PISTOL ],
        options: [
          upgradeChoice([ weapon('Sawn-Off Shotgun',6,2,1) ],5),
          upgradeChoice([ weapon('Flamethrower Pistol',6,6) ],5),
          upgradeChoice([ weapon('Heavy Pistol',12,1,1) ],5),
          upgradeChoice([ E.ASSAULT_RIFLE ],5),
        ],
      },
      {
        type: 'replacement',
        lose: [ E.PISTOL, E.CCW(2) ],
        options: [
          upgradeChoice([ E.PISTOL, E.PISTOL, melee('Knife',1) ],0),
          upgradeChoice([ E.CCW(2), E.CCW(2) ],5),
          upgradeChoice([ melee('Great Weapon',2,2) ],5),
          upgradeChoice([ melee('Chainsaw Glaive',4,0,[SR.RENDING]) ],10),
          upgradeChoice([ weapon('Spear-Shotgun',12,2), melee('Spear',2,0,[SR.DEADLY(3)]) ],10),
          upgradeChoice([ weapon('Spear-Rifle',24,1), melee('Spear',2,0,[SR.DEADLY(3)]) ],10),
        ],
      },
    ],
    B: [
      {
        type: 'replacement',
        lose: [ E.PISTOL ],
        limit: 1,
        options: [
          upgradeChoice([ weapon('Heavy Flamethrower',12,6,1) ],10),
          upgradeChoice([ weapon('Grenade Crossbow',24,1,1,[SR.BLAST(3)]) ],10),
          upgradeChoice([ weapon('Machinegun',36,3) ],10),
        ],
      },
    ],
    C: [
      {
        type: 'replacement',
        limit: 1,
        lose: [ E.PISTOL ],
        options: [
          upgradeChoice([weapon('Flamethrower',12,6)],10),
        ],
      },
      {
        type: 'attachment',
        limit: 1,
        improve: E.ASSAULT_RIFLE,
        options: [
          upgradeChoice([weapon('Flamethrower',12,6)],10),
        ],
      },
      {
        type: 'replacement',
        limit: 1,
        lose: [ E.PISTOL, E.CCW(2) ],
        options: [
          upgradeChoice([weapon('Sniper Rifle',36,1,1,[SR.SNIPER])],15),
        ],
      },
    ],
    D: [
      {
        type: 'upgrade',
        options: [
          upgradeChoice([SR.GOHC.CULT_ICON],15),
          upgradeChoice([SR.GOHC.REDEMPTION],20),
        ],
      },
    ],
    E: [
      {
        type: 'upgrade',
        limit: 1,
        options: [
          upgradeChoice([SR.GOHC.CULT_ICON],15),
          upgradeChoice([SR.GOHC.REDEMPTION],20),
        ],
      },
    ],
  },
};

const gangsOfHiveCity = [
  gangsOfHiveCityTheCult,
  {
  system: system(
    'Grimark Future Firefight',
    'Grimdark Future',
    version(2,10, new Date(2020,4,28)),
    'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
  ...army(
    'The Hidden',
    version(2,2, new Date(2020,6,24)),
    'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
  ),
  hint: 'The Hidden are the most secretive gang, striking from the shadows to take out their foes.',
},
  {
    system: system(
      'Grimark Future Firefight',
      'Grimdark Future',
      version(2,10, new Date(2020,4,28)),
      'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
    ...army(
      'The Femmes',
      version(2,2, new Date(2020,6,24)),
      'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
    ),
    hint: 'The Femmes are a female-only gang that wages war for political interest, rioting against the police.',
  },
  {
    system: system(
      'Grimark Future Firefight',
      'Grimdark Future',
      version(2,10, new Date(2020,4,28)),
      'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
    ...army(
      'The Brutes',
      version(2,2, new Date(2020,6,24)),
      'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
    ),
    hint: 'The Brutes are the most violent and brutal gang, only accepting those filled with rage and bloodlust.',
  },
  {
    system: system(
      'Grimark Future Firefight',
      'Grimdark Future',
      version(2,10, new Date(2020,4,28)),
      'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
    ...army(
      'The Miners',
      version(2,2, new Date(2020,6,24)),
      'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
    ),
    hint: 'The Miners are a guild of workers that have been forced to fight once their mines collapsed shut.',
  },
  {
    system: system(
      'Grimark Future Firefight',
      'Grimdark Future',
      version(2,10, new Date(2020,4,28)),
      'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
    ...army(
      'The Artisans',
      version(2,2, new Date(2020,6,24)),
      'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
    ),
    hint: 'The Artisans are technologically advanced weapon smiths that use dangerous radioactive equipment.',
  },
  {
    system: system(
      'Grimark Future Firefight',
      'Grimdark Future',
      version(2,10, new Date(2020,4,28)),
      'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
    ...army(
      'The Bodyguards',
      version(2,2, new Date(2020,6,24)),
      'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
    ),
    hint: 'The Bodyguards are mercenary groups hired for their excellent equipment and combat strategy.',
  },
  {
    system: system(
      'Grimark Future Firefight',
      'Grimdark Future',
      version(2,10, new Date(2020,4,28)),
      'https://onepagerules.com/portfolio/grimdark-future-firefight/',
    ),
    ...army(
      'The Cannibals',
      version(2,2, new Date(2020,6,24)),
      'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
    ),
    hint: 'The Cannibals are the most insane gang, eating the corpses of their enemies to feed on their souls.',
  },
];

const ALIENHIVES = {
  E: {
    BIO_CARBINE: weapon('Bio-Carbine',18,3),
    LARGE_TWIN_BIO_PISTOLS: weapon('Twin Bio-Pistols',12,6),
    LARGE_RAZOR_CLAWS: melee('Razor Claws',3,1),
    TWIN_BIO_PISTOLS: weapon('Twin Bio-Pistols',12,2),
    RAZOR_CLAWS: melee('Razor Claws',1),
  },
  SR: {
    PSYCHICBARRIER: 'Psychic Barrier',
    PHEROMONES: 'Pheromones',
    SHROUDING_MIST: 'Shrouding Mist',
  }
};
const alienHives = {
  system: system(
    'Grimark Future Firefight',
    'Grimdark Future',
    version(2, 10, new Date(2020, 4, 28)),
    'https://onepagerules.com/portfolio/grimdark-future-firefight/',
  ),
  ...army(
    'Alien Hives',
    version(2, 9, new Date(2020, 6, 24)),
    'https://drive.google.com/file/d/1R38xcSYJMe_Pm7sDcKcIM0twyTY9givq/view?usp=sharing',
  ),
  hint: 'Nomnomnom.',
  units: [
    unit(
      'Veteran Warrior',
      1,
      4,
      3,
      [ ALIENHIVES.E.BIO_CARBINE, ALIENHIVES.E.LARGE_RAZOR_CLAWS ],
      [SR.FEARLESS,SR.HERO,SR.TOUGH(6)],
      'AB',
      110,
    ),
    unit(
      'Snatcher Veteran',
      1,
      3,
      4,
      [ melee('2x Piercing Claws',2,0,[SR.RENDING]) ],
      [SR.FAST,SR.HERO,SR.SCOUT,SR.STRIDER,SR.TOUGH(6)],
      'C',
      75,
    ),
    unit(
      'Grunts',
      3,
      5,
      5,
      [ weapon('Bio-Guns',12,1), melee('Razor Claws',1) ],
      [ SR.STRIDER ],
      'D',
      35,
    ),
    unit(
      'Assault Grunt',
      1,
      5,
      5,
      [ melee('Razor Claws', 2) ],
      [ SR.FAST, SR.STRIDER ],
      'E',
      15,
    ),
    unit(
      'Winged Grunts',
      1,
      5,
      5,
      [ weapon('Bio-Gun',12,1), melee('Razor Claws',1) ],
      [ SR.AMBUSH, SR.FLYING ],
      'D',
      20,
    ),
    unit(
      'Soul-Snatcher',
      1,
      3,
      4,
      [ melee('Piercing Claws',2,0,[ SR.RENDING ]) ],
      [ SR.FAST, SR.SCOUT, SR.STRIDER ],
      'C',
      40,
    ),
    unit(
      'Hive Swarm',
      1,
      6,
      6,
      [ melee('Swarm Attacks',3) ],
      [ SR.FEARLESS, SR.TOUGH(3) ],
      'F',
      20,
    ),
    unit(
      'Hive Warrior',
      1,
      4,
      3,
      [ ALIENHIVES.E.BIO_CARBINE, ALIENHIVES.E.LARGE_RAZOR_CLAWS ],
      [ SR.FEARLESS, SR.TOUGH(3) ],
      'AB',
      60,
    ),
    unit(
      'Ravenous Beast',
      1,
      4,
      3,
      [ melee('2x Razor Claws',3,1) ],
      [ SR.FAST, SR.STRIDER, SR.TOUGH(3) ],
      'BG',
      65,
    ),
    unit(
      'Venom Floater',
      1,
      4,
      3,
      [ melee('Poison Cloud',6,0,[ SR.POISON ]) ],
      [ ALIENHIVES.SR.SHROUDING_MIST, SR.STEALTH, SR.TOUGH(3) ],
      '',
      105,
    ),
    unit(
      'Synapse Floater',
      1,
      4,
      3,
      [ melee('Psychic Shock',1) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.PSYCHIC(1), SR.TOUGH(3) ],
      'F',
      100,
    ),
    unit(
      'Hive Guardan',
      1,
      3,
      2,
      [ melee('Razor Claws',3,2), melee('Razor Claws',3,2) ],
      [ SR.FEARLESS, SR.TOUGH(3) ],
      'H',
      110,
    ),
  ],
  upgrades: {
    A: [
      {
        type: 'replacement',
        lose: [ ALIENHIVES.E.BIO_CARBINE ],
        options: [
          upgradeChoice([ ALIENHIVES.E.LARGE_RAZOR_CLAWS ],0),
          upgradeChoice([ weapon('Twin Bio-Pistols',3,1) ],5),
          upgradeChoice([ weapon('Bio-Spitter',24,1,0,[SR.BLAST(3)]) ],5),
          upgradeChoice([ weapon('Shredder Cannon',24,4,0,[SR.RENDING]) ],10),
          upgradeChoice([ weapon('Barb Cannon',36,1,1,[SR.BLAST(3)]) ],15),
          upgradeChoice([ weapon('Acid Cannon',36,1,3,[SR.DEADLY(3)]) ],15),
        ],
      },
      {
        type: 'upgrade',
        limit: 1,
        options: [
          upgradeChoice([ weapon('Poison Hooks', 6,3,0,[SR.POISON]) ],5),
          upgradeChoice([ weapon('Shredding Hooks', 6,3,0,[SR.RENDING]) ],5),
          upgradeChoice([ weapon('Shock Hooks', 6,3,2) ],5),
          upgradeChoice([ weapon('Acid Hooks', 6,3,0,[SR.DEADLY(3)]) ],5),
        ],
      },
      {
        type: 'upgrade',
        options: [
          upgradeChoice([ SR.AMBUSH, SR.FLYING ],10),
          upgradeChoice([ ALIENHIVES.SR.PSYCHICBARRIER ],10),
          upgradeChoice([ ALIENHIVES.SR.PHEROMONES ],45),
        ],
      },
    ],
    B: [
      {
        type: 'replacement',
        lose: [ ALIENHIVES.E.LARGE_RAZOR_CLAWS ],
        options: [
          upgradeChoice([ melee('Piercing Claws',3,1,[SR.RENDING]) ],5),
          upgradeChoice([ melee('Smashing Claws',3,3) ],5),
          upgradeChoice([ melee('Serrated Claws',6,1) ],10),
          upgradeChoice([ melee('Sword Claws',3,1,[SR.DEADLY(3)]) ],10),
          upgradeChoice([ melee('Whip Limb and Sword Claw',2,0,[SR.DEADLY(6)]) ],10),
        ],
      },
    ],
    C: [
      {
        type: 'upgrade',
        options: [
          upgradeChoice([ melee('Razor Claws',2) ],5),
          upgradeChoice([ SR.PSYCHIC(1) ],10),
        ],
      },
    ],
    D: [
      {
        type: 'replacement',
        lose: [ weapon('Bio-Gun',12,1) ],
        options: [
          upgradeChoice([ weapon('Twin Bio-Pistols',12,2) ],5),
          upgradeChoice([ weapon('Bio-Spike',18,1,1) ],5),
          upgradeChoice([ weapon('Bio-Carbine',18,3) ],10),
        ],
      },
      {
        type: 'replacement',
        limit: 1,
        lose: [ weapon('Bio-Gun',12,1) ],
        options: [
          upgradeChoice([ weapon('Bio-Shredder',6,2,0,[ SR.RENDING ]) ],5),
          upgradeChoice([ weapon('Shock-Gun',12,1,2) ],5),
          upgradeChoice([ weapon('Bio-Flamer',12,6) ],10),
          upgradeChoice([ weapon('Acid-Gun',6,1,3,[ SR.DEADLY(3) ]) ],10),
          upgradeChoice([ weapon('Bio-Rifle',18,1,1,[ SR.SNIPER ]) ],10),
        ],
      },
      {
        type: 'upgrade',
        options: [
          upgradeChoice([ SR.FURIOUS ],5),
          upgradeChoice([ SR.POISON ],5),
        ],
      },
    ],
    E: [
      {
        type: 'replacement',
        lose: [ melee('Razor Claws',2) ],
        options: [
          upgradeChoice([ melee('Smashing Claws',4,0) ],5),
          upgradeChoice([ melee('Piercing Claws',2,0,[ SR.RENDING ]) ],5),
          upgradeChoice([ melee('Serrated Claws',2,2) ],5),
          upgradeChoice([ melee('Sword Claws',2,0,[ SR.DEADLY(3) ]) ],5),
        ],
      },
      {
        type: 'upgrade',
        options: [
          upgradeChoice([ SR.FURIOUS ],5),
          upgradeChoice([ SR.POISON ],5),
        ],
      },
    ],
    F: [
      {
        type: 'upgrade',
        options: [
          upgradeChoice([ SR.AMBUSH ],5),
          upgradeChoice([ weapon('Twin Bio-Pistols',12, 6) ],5),
        ],
      },
    ],
    G: [
      {
        type: 'upgrade',
        options: [
          upgradeChoice([ SR.AMBUSH ],5),
          upgradeChoice([ SR.SCOUT ],5),
        ],
      },
    ],
    H: [
      {
        type: 'replacement',
        lose: [ melee('Razor Claws',3,2) ],
        options: [
          upgradeChoice([ melee('Piercing Claws',3,2,[SR.RENDING]) ],5),
          upgradeChoice([ melee('Smashing Claws',3,4) ],5),
          upgradeChoice([ melee('Serrated Claws',6,2) ],10),
          upgradeChoice([ melee('Sword Claws',3,2,[SR.DEADLY(3)]) ],10),
          upgradeChoice([ melee('Whip Limb and Sword Claw',2,1,[SR.DEADLY(6)]) ],10),
        ],
      },
      {
        type: 'replacement',
        limit: 1,
        lose: [ melee('Razor Claws',3,2) ],
        options: [
          upgradeChoice([ weapon('Heavy Shock-Gun',24,1,2,[ SR.BLAST(3) ]) ],10),
          upgradeChoice([ weapon('Bio-Harpun',24,1,4,[ SR.BLAST(3) ]) ],35),
        ],
      },
    ],
  },
};

const ROBOT_LEGIONS = {
  E: {},
  SR: {
    DARKNESS_PROTOCOL: specialRule('Darkness-Protocol: The hero and up to half of your army get the Ambush special rule (must deploy within 3” of the hero).'),
    GLOOM_PROTOCOL: specialRule('Gloom-Protocol: This model may block spells as if it had the Psychic special rule. If it is a Psychic then it gets +1 to spell block rolls.'),
    REGEN_PROTOCOL: specialRule('Regen-Protocol: The hero and all friendly units within 12” may ignore wounds from Regeneration on 4+.'),
    FLUX: specialRule('Flux: For each unmodified result of 6 you roll to hit that hit is multiplied by 4.'),
    HUNTER: specialRule('Hunter: On a round in which this unit arrives from Ambush it gets AP(+3).'),
  },
};

const ROBOT_LEGION_UPGRADES = {

};

const robotLegion = {
  system: SYSTEM.GF_2_10,
  ...army(
    'Robot Legions',
    version(2, 12, new Date(2020, 6, 24)),
    'https://drive.google.com/file/d/1RUhd7_e2cTaKWseWC9lcxbg9U1Xxvy9D/view?usp=sharing',
  ),
  units: [
    unit(
      'Overseer',
      1,
      3,
      2,
      [ weapon('Staff-Shot',12,3,1), melee('Staff',3) ],
      [ SR.HERO, SR.FEARLESS, SR.REGENERATION, SR.SLOW, SR.TOUGH(3) ],
      'A',
      95,
    ),
    unit(
      'Technomancer',
      1,
      3,
      3,
      [ weapon('Staff-Shot',12,3,1), melee('Staff',3) ],
      [ SR.HERO, SR.FEARLESS, SR.REGENERATION, SR.SLOW, SR.TOUGH(3) ],
      'B',
      85,
    ),
    unit(
      'Warden',
      1,
      3,
      2,
      [ weapon('Heavy Reaper Rifle',24,2,2), melee('Heavy CCW',3,1) ],
      [ SR.HERO, SR.FEARLESS, SR.REGENERATION, SR.SLOW, SR.TOUGH(3) ],
      '',
      105,
    ),
    unit(
      'Warrior',
      1,
      3,
      3,
      [ weapon('Gauss Rifle',24,1,0,[ SR.RENDING ]), E.CCW(1) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.SLOW ],
      'C',
      25,
    ),
    unit(
      'Eternal',
      1,
      3,
      2,
      [ weapon('Gauss Rifle',24,1,0,[ SR.RENDING ]), E.CCW(1) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.SLOW ],
      'D',
      30,
    ),
    unit(
      'Guardian',
      1,
      3,
      2,
      [ weapon('Rod-Shot',12,2,1), melee('Rod',2) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.SLOW ],
      'E',
      30,
    ),
    unit(
      'Flesh-Eater',
      1,
      3,
      3,
      [ melee('Metal Claws',3,1,[SR.RENDING]) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.SLOW ],
      'F',
      30,
    ),
    unit(
      'Sniper',
      1,
      3,
      2,
      [ weapon('Sniper Carbine',24,1,1,[SR.SNIPER]), E.CCW(1) ],
      [ SR.AMBUSH, SR.FEARLESS, SR.REGENERATION, SR.SLOW ],
      'G',
      45,
    ),
    unit(
      'Bot Swarm',
      1,
      6,
      6,
      [ melee('Swarm Attacks',3,0,[SR.RENDING]) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.STRIDER, SR.TOUGH(3) ],
      '',
      40,
    ),
    unit(
      'Hover Bike',
      1,
      3,
      3,
      [ weapon('Twin Gauss Rifle',24,2,0,[SR.RENDING]) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.STRIDER ],
      'H',
      40,
    ),
    unit(
      'Robot Snake',
      1,
      3,
      2,
      [ melee('Metal Fangs',3,1,[SR.RENDING]) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.STRIDER, SR.TOUGH(3) ],
      'I',
      110,
    ),
    unit(
      'Tri-Scorpion',
      1,
      3,
      2,
      [ melee('2x Armblades',2,2) ],
      [ SR.FEARLESS, SR.REGENERATION, SR.STRIDER, SR.TOUGH(3) ],
      'J',
      110,
    ),
    unit(
      'Annihilator',
      1,
      3,
      2,
      [ weapon('Gauss Cannon',24,2,1,[SR.RENDING]), E.CCW(3) ],
      [ SR.AMBUSH, SR.FEARLESS, SR.REGENERATION, SR.STRIDER, SR.TOUGH(3) ],
      'K',
      125,
    ),
  ],
  upgrades: {
    A: [
      upgradeWith(
        1,
        [
          upgradeChoice([ weapon('Wrist-Mounted Flamer',12,6) ], 10),
          upgradeChoice([ weapon('Wrist-Mounted Laser Cannon',48,1,4,[SR.DEADLY(6)]) ], 95),
        ],
      ),
      replace(
        undefined,
        [ weapon('Staff-Shot'), weapon('Staff')],
        [
          upgradeChoice([ melee('Hyper Sword',3,1,[SR.RENDING]) ],0),
          upgradeChoice([ melee('Void Sword',6,1) ],5),
          upgradeChoice([ melee('Phase Blade',3,4) ],5),
          upgradeChoice([ melee('War Scyte',3,2,[SR.DEADLY(3)]) ],10),
        ],
      ),
    ],
    B: [
      upgradeWith(
        1,
        [
          upgradeChoice([ weapon('Flame-Protocol',12,6,1) ],20),
          upgradeChoice([ weapon('Dread-Protocol',18,3,2) ],20),
          upgradeChoice([ weapon('Solar-Protocol',24,1,3,[SR.DEADLY(3)]) ],20),
        ],
      ),
      upgradeWith(
        1,
        [
          upgradeChoice([ ROBOT_LEGIONS.SR.GLOOM_PROTOCOL ],10),
          upgradeChoice([ SR.FEAR ],20),
          upgradeChoice([ ROBOT_LEGIONS.SR.DARKNESS_PROTOCOL ],60),
        ],
      ),
      upgradeWith(
        undefined,
        [
          upgradeChoice([ item('Jetpack',[SR.AMBUSH, SR.FLYING]) ],15),
          upgradeChoice([ item('BotMaster',[SR.PSYCHIC(1)]) ],20),
          upgradeChoice([ ROBOT_LEGIONS.SR.REGEN_PROTOCOL ],65),
        ],
      ),
      upgradeWith(
        1,
        [
          upgradeChoice([ melee('Technoslave',3,1) ],10),
        ],
      ),
      upgradeWith(
        1,
        [
          upgradeChoice([ melee('Technoslave',3,1) ],10),
        ],
      ),
    ],
    C: [
      replace(
        1,
        [ weapon('Gauss Rifle') ],
        [
          upgradeChoice([ weapon('Reaper Rifle',12,1,2) ],0),
          upgradeChoice([ weapon('Flame Caster',12,6) ],5),
          upgradeChoice([ weapon('Plasma Caster',24,1,2) ],5),
          upgradeChoice([ weapon('Fusion Caster',12,1,4,SR.DEADLY(6)) ],20),
        ],
      ),
    ],
    D: [
      replace(
        1,
        [ weapon('Gauss Rifle') ],
        [
          upgradeChoice([ weapon('Flux Rifle',24,1,1,[ROBOT_LEGIONS.SR.FLUX.label]) ],5),
          upgradeChoice([ weapon('Heavy Gauss Rifle',24,1,1,[SR.RENDING]) ],5),
        ],
      ),
    ],
    E: [
      replace(
        1,
        [ weapon('Rod-Shot'), weapon('Rod') ],
        [
          upgradeChoice([ melee('War-Scyte',2,4) ],5),
          upgradeChoice([ weapon('Antimatter Pistol',12,1,1), melee('Void Sword',4,1) ],5),
          upgradeChoice([ melee('Hyper Sword',2,1,[ SR.RENDING ]), item('Shield', [SR.STEALTH]) ],5),
        ],
      ),
      upgradeWith(
        undefined,
        [
          upgradeChoice([item('Jetpack', [SR.AMBUSH,SR.FLYING])],15),
        ],
      ),
    ],
    F: [
      upgradeWith(
        undefined,
        [
          upgradeChoice([ SR.AMBUSH ],10),
        ],
      ),
      replace(
        undefined,
        [weapon('Metal Claws')],
        [
          upgradeChoice([melee('Chainsaw Claws',6,1)],5),
          upgradeChoice([melee('Plasma Claws',3,3)],5),
          upgradeChoice([melee('Elextric Claws',3,1,[SR.DEADLY(3)])],5),
        ],
      )
    ],
    G: [
      upgradeWith(
        undefined,
        [
          upgradeChoice([ROBOT_LEGIONS.SR.HUNTER.label],5),
        ],
      ),
    ],
    H: [
      replace(
        undefined,
        [weapon('Twin Gauss Rifle')],
        [
          upgradeChoice([weapon('Twin Flux Rifle',24,2,1,[ROBOT_LEGIONS.SR.FLUX.label])],5),
          upgradeChoice([weapon('Antimatter Rifle',24,1,1,[SR.BLAST(3)])],5),
        ],
      ),
    ],
    I: [
      upgradeWith(
        1,
        upgradeChoice([weapon('Antimatter Pistol',12,1,1)],5),
        upgradeChoice([weapon('Death Graze',12,1,0,[SR.DEADLY(3)])],5),
        upgradeChoice([melee('Whip Coil',3,1,[SR.RENDING])],15),
      ),
    ],
    J: [
      replace(
        undefined,
        [weapon('2x Arm Blades')],
        upgradeChoice([melee('Heavy Armblade',4,4)],10),
      ),
      upgradeWith(
        undefined,
        [
          upgradeChoice([item('Plasmabot', [SR.RENDING])],10),
        ],
      ),
    ],
    K: [
      replace(
        undefined,
        [weapon('Gauss Cannon')],
        [
          upgradeChoice([weapon('Heavy Gauss Cannon',36,1,4,[SR.DEADLY(6)])],55),
        ],
      )
    ],
  },
};

module.exports = {
  system: SYSTEM.GF_2_10,
  assets: {
    specialRules: Object.values(specialRules),
  },
  armyBooks: [
    ...gangsOfHiveCity,
    alienHives,
    robotLegion,
  ],
};
