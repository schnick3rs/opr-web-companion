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

const quality = (qual, cost) => {
  return {
    key: `quality-${qual}`,
    label: `${qual}+`,
    quality: qual,
    cost,
  };
};

const specialRule = (label, cost, effect) => {
  return {
    key: stringToKebab(label),
    label,
    cost,
    effect,
  };
};

const unit = (category, name, quality, specialRules = []) => {
  let cost = (7 - parseInt(quality)) * 5;
  specialRules.forEach((rule) => cost += parseInt(rule.cost));
  return {
    key: stringToKebab(name),
    name,
    cost,
    category,
    quality,
    specialRules: specialRules.map((sr) => sr.label),
  };
};

const STAT = {
  MOVE: (v) => 'Move',
  WOUND_ROLL: (v) => 'Move',
};

const system = {
  key: 'war-stuff',
  name: 'WarStuff',
  version: 'v2.0',
  url: '',
  lastModified: '',
};

const CATEGORY = {
  FANTASY: 'Fantasy',
  ANIMALS_MONSTERS: 'Animals & Monsters',
  SCIENCE_FICTION: 'Science Fiction',
  MEDIVAL: 'Medival',
  NAPOLEONIC: 'Napoleonic',
  MODERN: 'Modern',
  TANK: 'Tank Battles',
  SB_DOGFIGHT: 'Space Battle: Dogfight',
  SB_CAPITAL_SHIPS: 'Space Battle: Capital Ships',
  SUPER_HEROES: 'Super Heroes',
  DINOSAURS: 'Dinosaurs',
};

const SR = {
  ARMORED: specialRule('Armored',15,'Whenever this unit takes a hit roll one die, on a 4+ it is ignored (this doesn’t stack with cover terrain).'),
  CAMOUFLAGED: specialRule('Camouflaged',5,'This unit always counts as being in cover terrain.'),
  DEADLY: specialRule('Deadly',10,'Whenever this unit rolls a 6 to hit it deals one automatic wound (can’t be ignored by the armored rule).'),
  DEATH_BLOW: specialRule('Death Blow',5,'If this unit is killed all units within 3” take one automatic hit.'),
  FAST: specialRule('Fast',5,'This unit moves +2” on advance and +4” on rush/charge actions.', STAT.MOVE(2)),
  FEARLESS: specialRule('Fearless',10,'This unit may re-roll failed morale tests (as long as it’s not stunned).'),
  FIRE: specialRule('Fire',10,'When dealing wounds to an enemy add +1 to the wound roll.', STAT.WOUND_ROLL(1)),
  POISON: specialRule('Poison',10,'When dealing wounds to an enemy add +1 to the wound roll.', STAT.WOUND_ROLL(1)),
  FREEZE: specialRule('Freeze',5,'When dealing hits to an enemy roll one die, on a 4+ it may not move during its next activation.'),
  FRENZY: specialRule('Frenzy',5,'This unit may re-roll failed hit rolls in melee.'),
  FLYING: specialRule('Flying',10,'This unit may move through units and obstacles, ignoring terrain effects.'),
  HEALER: specialRule('Healer',10,'Whenever a friendly unit within 3” would be killed roll one die, on a 4+ it is stunned instead.'),
  HIT_RUN: specialRule('Hit & Run',10,'When charging this unit may move back by 3” after attacking, and enemies can’t strike back.'),
  INTIMIDATING: specialRule('Intimidating',10,'Enemy units without this rule must take a morale test when in melee with it. If failed they must re-roll successful hits.'),
  LARGE: specialRule('Large',0,'This unit may re-roll failed hits in melee against non-large units. Enemies may re-roll hits when shooting at it.'),
  LEADER: specialRule('Leader',30,'When this unit is activated roll 3 dice, for each 4+ one friendly unit within 6” may take one action.'),
  MOUNTED: specialRule('Mounted',5,'This unit gets 2 attacks in melee when charging.'),
  REGENERATION: specialRule('Regeneration',20,'Whenever this unit would be killed roll one die, on a 4+ it is stunned instead.'),
  SHOOTER_SHORT: specialRule('Shooter +9"',5,'This unit may shoot with a range of 9”.', ),
  SHOOTER_MEDIUM: specialRule('Shooter +18"',10,'This unit may shoot with a range of 18”.'),
  SHOOTER_LONG: specialRule('Shooter +27"',15,'This unit may shoot with a range of 27”.'),
  SLOW: specialRule('Slow',-5,'This unit moves -2” on advance and -4” on rush/charge actions.', STAT.MOVE(-2)),
  SMALL: specialRule('Small',0,'This unit must re-roll hits in melee against non-small units. Enemies must re-roll hits when shooting at it.'),
  STEALTHY: specialRule('Stealthy',5,'This unit is deployed after all non-stealthy units. Place it anywhere over 9” away from enemy units, and if both players have stealthy units they must roll-off to see who deploys first.'),
  STRIDER: specialRule('Strider',5,'This may move through difficult terrain as if it was open terrain.'),
  TOUGH: specialRule('Tough',30,'This model only rolls on the wounds table after accumulating 3 wounds, and is only killed on an 8+.'),
  UNDEAD: specialRule('Undead',5,'This unit is not killed if you fail a morale test for losing half your army.'),
  WIZARD: specialRule('Wizards',15,'When this unit is activated you may cast one spell. Roll one die, on a 4+ apply one of these effects: (A) Fireball: Target enemy unit within 12” takes one hit with Fire. (B) Target enemy unit within 18” takes one hit with Freeze.'),
};

const quickplayUnits = [
  unit(CATEGORY.FANTASY,'Human Warrior',5,[]),
  unit(CATEGORY.FANTASY,'Human Archer',5,[SR.SHOOTER_LONG]),
  unit(CATEGORY.FANTASY,'Knight',5,[SR.FAST]),
  unit(CATEGORY.FANTASY,'Wizard',5,[SR.FIRE, SR.HEALER, SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.FANTASY,'Orc Warrior',5,[SR.FRENZY]),
  unit(CATEGORY.FANTASY,'Boar Rider',5,[SR.FRENZY, SR.FAST]),
  unit(CATEGORY.FANTASY,'Goblin Warrior',5,[]),
  unit(CATEGORY.FANTASY,'Wolf Rider',5,[SR.FAST]),
  unit(CATEGORY.FANTASY,'Elf Warrior',5,[SR.STRIDER]),
  unit(CATEGORY.FANTASY,'Elf Archer',5,[SR.STRIDER, SR.SHOOTER_LONG]),
  unit(CATEGORY.FANTASY,'Dwarf Warrior',5,[SR.FEARLESS, SR.SLOW]),
  unit(CATEGORY.FANTASY,'Dwarf Rifleman',5,[SR.FEARLESS, SR.SHOOTER_LONG, SR.SLOW]),
  unit(CATEGORY.FANTASY,'Rat Warrior',5,[SR.FAST]),
  unit(CATEGORY.FANTASY,'Rat Ogre',4,[SR.FAST, SR.INTIMIDATING, SR.TOUGH]),
  unit(CATEGORY.FANTASY,'Skink Warrior',5,[SR.POISON, SR.SHOOTER_SHORT]),
  unit(CATEGORY.FANTASY,'Saurus Warrior',4,[SR.POISON, SR.FRENZY]),
  unit(CATEGORY.FANTASY,'Zombie',5,[SR.SLOW, SR.UNDEAD, SR.DEADLY]),
  unit(CATEGORY.FANTASY,'Skeleton',5,[SR.UNDEAD]),
  unit(CATEGORY.FANTASY,'Ghoul',5,[SR.POISON, SR.UNDEAD]),
  unit(CATEGORY.FANTASY,'Vampire',4,[SR.LEADER, SR.UNDEAD, SR.TOUGH]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Stone Golem',3,[SR.SLOW,SR.TOUGH]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Giant Scorpion',5,[SR.STRIDER,SR.POISON,SR.TOUGH]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Bear',4,[SR.INTIMIDATING]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Minotaur',4,[SR.DEADLY,SR.INTIMIDATING]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Chimera',2,[SR.LARGE,SR.SHOOTER_MEDIUM,SR.TOUGH]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Troll',3,[SR.INTIMIDATING,SR.TOUGH]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Giant Spider',5,[SR.INTIMIDATING,SR.POISON,SR.TOUGH,SR.FREEZE]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Giant',2,[SR.FRENZY,SR.INTIMIDATING,SR.LARGE,SR.TOUGH]),
  unit(CATEGORY.ANIMALS_MONSTERS,'Dragon',2,[SR.INTIMIDATING,SR.FIRE,SR.FLYING,SR.LARGE,SR.TOUGH]),
  unit(CATEGORY.SCIENCE_FICTION,'Guardsman',5,[SR.SHOOTER_LONG]),
  unit(CATEGORY.SCIENCE_FICTION,'Battle Brother',4,[SR.FEARLESS,SR.SHOOTER_LONG]),
  unit(CATEGORY.SCIENCE_FICTION,'Terminator Brother',3,[SR.FEARLESS,SR.SHOOTER_LONG]),
  unit(CATEGORY.SCIENCE_FICTION,'High Elf Guardian',5,[SR.FAST,SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SCIENCE_FICTION,'High Elf Jetbike',5,[SR.FAST,SR.LARGE,SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SCIENCE_FICTION,'Ork Choopa Boy',5,[SR.SHOOTER_SHORT]),
  unit(CATEGORY.SCIENCE_FICTION,'Ork Shoota Boy',5,[SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SCIENCE_FICTION,'Robot Beetle Swarm',5,[SR.SMALL]),
  unit(CATEGORY.SCIENCE_FICTION,'Robot Warrior',4,[SR.SHOOTER_LONG]),
  unit(CATEGORY.SCIENCE_FICTION,'Alien Assaulter',5,[SR.FAST]),
  unit(CATEGORY.SCIENCE_FICTION,'Alien Shooter',5,[SR.FAST,SR.SHOOTER_SHORT]),
  unit(CATEGORY.SCIENCE_FICTION,'Alien Soul Snatcher',4,[SR.DEADLY,SR.STRIDER,SR.HIT_RUN]),
  unit(CATEGORY.SCIENCE_FICTION,'Alien Juggernaut',2,[SR.INTIMIDATING,SR.FEARLESS,SR.LARGE,SR.TOUGH]),
  unit(CATEGORY.MEDIVAL,'Peasant',5,[]),
  unit(CATEGORY.MEDIVAL,'Man at Arms',4,[]),
  unit(CATEGORY.MEDIVAL,'Crossbowman',4,[SR.SHOOTER_LONG]),
  unit(CATEGORY.MEDIVAL,'Knight',3,[SR.FAST,SR.INTIMIDATING]),
  unit(CATEGORY.MEDIVAL,'King',2,[SR.LEADER,SR.TOUGH]),
  unit(CATEGORY.NAPOLEONIC,'Carabineer',5,[SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.NAPOLEONIC,'Fusilier',5,[SR.SHOOTER_LONG]),
  unit(CATEGORY.NAPOLEONIC,'Hussar',5,[SR.FAST]),
  unit(CATEGORY.NAPOLEONIC,'Cuirassier',5,[SR.FAST,SR.SHOOTER_LONG]),
  unit(CATEGORY.NAPOLEONIC,'General',4,[SR.FAST,SR.LEADER]),
  unit(CATEGORY.MODERN,'Partisan',5,[SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.MODERN,'Engineer',4,[SR.FIRE,SR.SHOOTER_SHORT]),
  unit(CATEGORY.MODERN,'Medic',4,[SR.HEALER,SR.SHOOTER_SHORT]),
  unit(CATEGORY.MODERN,'Rifleman',4,[SR.SHOOTER_LONG]),
  unit(CATEGORY.MODERN,'Machine gunner',4,[SR.FREEZE,SR.SHOOTER_LONG]),
  unit(CATEGORY.MODERN,'Sniper',4,[SR.DEADLY,SR.SHOOTER_LONG]),
  unit(CATEGORY.MODERN,'Sergeant',3,[SR.LEADER,SR.SHOOTER_SHORT]),
  unit(CATEGORY.TANK,'M3 Stuart',5,[SR.SHOOTER_LONG,SR.SMALL]),
  unit(CATEGORY.TANK,'M4 Sherman',5,[SR.SHOOTER_LONG]),
  unit(CATEGORY.TANK,'Stug III',5,[SR.SHOOTER_LONG,SR.SLOW]),
  unit(CATEGORY.TANK,'Tiger I',3,[SR.SHOOTER_LONG]),
  unit(CATEGORY.TANK,'T-34',4,[SR.SHOOTER_LONG]),
  unit(CATEGORY.TANK,'SU-100',2,[SR.SHOOTER_LONG,SR.SLOW]),
  unit(CATEGORY.SB_DOGFIGHT,'X-Wing',4,[SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SB_DOGFIGHT,'Millennium Falcon',3,[SR.SHOOTER_MEDIUM,SR.SLOW]),
  unit(CATEGORY.SB_DOGFIGHT,'TIE Fighter',5,[SR.FAST,SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SB_DOGFIGHT,'TIE Bomber',4,[SR.FIRE,SR.SHOOTER_SHORT]),
  unit(CATEGORY.SB_CAPITAL_SHIPS,'Fast Attack Craft',5,[SR.FAST,SR.SHOOTER_SHORT]),
  unit(CATEGORY.SB_CAPITAL_SHIPS,'Frigate',4,[SR.FAST,SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SB_CAPITAL_SHIPS,'Cruiser',3,[SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SB_CAPITAL_SHIPS,'Battlecruiser',3,[SR.SHOOTER_LONG]),
  unit(CATEGORY.SB_CAPITAL_SHIPS,'Battleship',2,[SR.SHOOTER_LONG,SR.SLOW]),
  unit(CATEGORY.SUPER_HEROES,'Catwoman',4,[SR.FAST,SR.STRIDER]),
  unit(CATEGORY.SUPER_HEROES,'Joker',4,[SR.FRENZY,SR.SHOOTER_SHORT]),
  unit(CATEGORY.SUPER_HEROES,'Bane',3,[SR.TOUGH]),
  unit(CATEGORY.SUPER_HEROES,'Batman',3,[SR.STEALTHY,SR.DEADLY]),
  unit(CATEGORY.SUPER_HEROES,'Superman',2,[SR.FLYING,SR.DEADLY,SR.TOUGH]),
  unit(CATEGORY.SUPER_HEROES,'Iron Man',3,[SR.FAST,SR.FLYING,SR.SHOOTER_MEDIUM]),
  unit(CATEGORY.SUPER_HEROES,'Hulk',2,[SR.LARGE,SR.TOUGH]),
  unit(CATEGORY.SUPER_HEROES,'Captain America',4,[SR.ARMORED,SR.LEADER]),
  unit(CATEGORY.SUPER_HEROES,'Thor',3,[SR.INTIMIDATING]),
  unit(CATEGORY.SUPER_HEROES,'Loki',3,[SR.POISON,SR.DEATH_BLOW]),
  unit(CATEGORY.DINOSAURS,'Pterodactyl',5,[SR.FLYING]),
  unit(CATEGORY.DINOSAURS,'Velociraptor',4,[SR.FAST]),
  unit(CATEGORY.DINOSAURS,'Stegosaurus',3,[]),
  unit(CATEGORY.DINOSAURS,'Triceratops',3,[SR.FRENZY]),
  unit(CATEGORY.DINOSAURS,'Ankylosaurus',3,[SR.TOUGH]),
  unit(CATEGORY.DINOSAURS,'Brontosaurus',2,[SR.LARGE,SR.TOUGH]),
  unit(CATEGORY.DINOSAURS,'T-Rex',2,[SR.DEADLY,SR.LARGE,SR.TOUGH]),
];

module.exports = [
  {
    system,
    codex: {
      qualities: [
        quality(6, 5),
      ],
      minCost: 5,
      maxSpecialRules: 3,
      specialRules: Object.values(SR),
    },
    quickplayUnits,
    rules: sections(
      [
        section(
          'General Principles',
          [
            element('The most important rule','Whenever the rules are unclear use common sense and personal preference. Have fun!'),
            element('Quality Tests','Roll one six-sided die and if you score the unit‘s quality value or higher it‘s a success.'),
          ],
        ),
        section(
          'Preperation',
          [
            element('The Battlefield','The game is played on a flat 4‘x4‘ surface, with at least 10-15 pieces of terrain on it.'),
            element('The Armies','The players must put together two armies of 150pts each.'),
            element('Deployment','Players roll-off and the winner picks one of the table corners as his deployment zone with his opponent taking the opposite. Then the players alternate in placing one unit each within 18” of their table corner, starting with the player that won the deployment roll-off.'),
            element('Mission','The game ends after 4 rounds and players sum the point value of all enemy units they destroyed. The player with most points wins.'),
          ],
        ),
        section(
          'Activation',
          [
            p('The player picks one unit and it may do one of the following:'),
            ul([
              '<strong>Hold: </strong>Move 0”, can shoot.',
              '<strong>Hunker: </strong>Move 0”, can’t shoot, counts as being in cover.',
              '<strong>Guard: </strong>Move 0”, can shoot in reaction to the enemy.',
              '<strong>Advance: </strong>Move 6”, can shoot only after moving.',
              '<strong>Rush: </strong>Move 12”, can’t shoot.',
              '<strong>Charge: </strong>Move 12” into melee.',
            ]),
          ],
        ),
        section('Movement',[
          p('Units may move and turn in any direction regardless of the model‘s facing, and they may only move within 1“ of others if they are charging.'),
        ]),
        section('Shooting',[
          p('Models in range and line of sight may fire. Shooting models take one quality test and a success is a hit. Defending models then take a quality test and if they fail they take one wound.'),
          p('<strong>Guard Actions:</strong> Units that are on guard may not move or shoot, but may react to enemy units that move into their line of sight by shooting. The player may stop enemy units at any point of their move to shoot, but the target counts as being in cover.')
        ]),
        section('Melee',[
          p('Charging models must move into base contact with the target and then attack in melee, which works like shooting. Then the defending model may strike back, and if one of the units is destroyed the other may move by up to 3“, else the charging model must move back by 1“.'),
        ]),
        section('Wounds',[
          p('When a model takes one or more wounds place a wound marker next to it for each. Then roll one die and add the number of markers to the result:'),
          ul(['<strong>2-5:</strong> Stunned','<strong>6+:</strong> Killed']),
          p('Killed','Remove from play.'),
          p('Stunned','The model is Stunned until the end of its next activation (place the model on its side to show this). Stunned models must stay. If a Stunned model takes any hits from shooting or is charged again then it is immediately killed.'),
        ]),
        section('Morale',[
          p('If at the end of any round an army is down to half of its starting size or less, then it must take a morale test. Pick one model that is not stunned and take a quality test, if failed all models from his army are killed. Note that if there are only stunned models left in the army then the test is failed.'),
        ]),
        section('Terrain',[
          p('Cover Terrain','Whenever units within or behind cover terrain take hits roll one die, on a 5+ the hits are ignored.'),
          p('Difficult Terrain','Units moving through difficult terrain halve their move distance.'),
          p('Dangerous Terrain','Units moving across dangerous terrain must roll one die, on a 1 they take one wound.'),
          p('Elevated Terrain','Units taking shots from lower elevation count as being in cover.'),
        ]),
        section('Multi-Player Games',[
          p('The game can be played with up to 4 players by modifying the rules a little:'),
          ul([
            '<strong>Deployment:</strong> Players roll-off and then pick table corners and deploy one unit each in order',
            '<strong>Playing the Game:</strong> In the first round players take turns in the same order as deployment. In each new round players roll-off to set a new order of activations for that round.',
          ]),
        ]),
        section('Unit Creation',[
          p('When preparing armies you have to create units based on your models by picking their quality value and special rules. Each unit may have up to three special rules and always costs at least 5pts.'),
          p('<em>For more rules on how to build units, visit <a href="https://onepagerules.com/portfolio/one-off-games/" title="WarStuff">WarStuff</a> on OnePageRules.</em>')
        ]),
        section('Special Movements',[
          p('Pushing','Whenever a model rolls a Stunned result the attacker may try to push it away. Roll one die, on a 4+ the attacker may move the model by up to 2” in any direction.'),
          p('Falling','If a model is pushed off an elevated position at least 2” tall it takes X+1 hits, where X is 1 hit for every full 3” it fell. Then place the model Stunned within 2” of the bottom of the elevation.'),
          p('Dropping','Models may drop off steep elevation up to 6” high instead of climbing down. Roll X+1 dice trying to score 3+, where X is one die for every full 3” it drops. If all rolls are successes you may place the model within 2” of the bottom of the elevation and continue moving without counting elevation. If any roll is failed the model falls down instead.'),
          p('Jumping','Models may cross gaps up to 1” wide as if they were solid ground, however they must jump to cross gaps up to 6” wide. Roll X+1 dice trying to score 3+, where X is one die for every full 3” it jumps. If all rolls are successes the model may move across the gap as if it was solid ground. If any roll is failed the model falls down instead.'),
        ]),
      ],
    ),
  },
];
