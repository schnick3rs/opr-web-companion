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


const CATEGORY = [

];

const weapons = (weapons = []) => {
  return weapons.map((weapon, index) => {
    return {
      order: index+1,
      ...weapon,
    }
  });
}

const weapon = (label, attacks, range = 0, isAntiVehicle = false) => {
  return {
    key: stringToKebab(label),
    label,
    range,
    attacks,
    isAntiVehicle,
  };
};

const special = (effect) => {
  return effect;
};

const unit = (type, label, size, cost, scale, armour, equipment, special = undefined) => {
  return {
    key: stringToKebab(label),
    type,
    label,
    size,
    cost,
    scale,
    armour,
    equipment,
    special,
  };
}

const infantry = (label, size, cost, scale, equipment = [], special = undefined) => {
  return unit(
    TYPE.INFANTRY,
    label,
    size,
    cost,
    scale,
    undefined,
    equipment,
    special,
  );
}

const vehicle = (label, cost, armour = '', equipment = [], special = undefined) => {
  return unit(
    TYPE.VEHICLE,
    label,
    1,
    cost,
    1,
    armour,
    equipment,
    special,
  );
}

const upgrade = (label, effect, ) => {};
const adding = (label, effect, ) => {};
const replace = (label, effect, ) => {};

const TYPE = {
  INFANTRY: 'Infantry',
  VEHICLE: 'Vehicle',
}

const U = {
  ONE: 'one',
  ALL: 'all',
}

const W = {
  FIST: weapon('Fist',1),
  BAJONET: weapon('Bajonet',2),
  BOMB: weapon('Bomb','2d6',6, true),
  GRENADE: weapon('Grenade','d6',12),
  C4: weapon('C4','d6',12,true),
  FLAMETHROWER: weapon('Flamethrower',12, 12),
  RIFLE: weapon('Rifle',1,24),
  SNIPERRIFLE: weapon('Sniper Rifle',1, 36),
  MACHINEGUN: weapon('Machinegun',3,36),
  BAZOOKA: weapon('Bazooka','d6',36,true),
  AUTOCANNON: weapon('Autocannon',3,48),
  MORTAR: weapon('Mortar','d6',48,true),
  MISSILE: weapon('Missile','d6',48,true),
  CANNON: weapon('Cannon','2d6',48,true),
}

const system = {
  key: 'army-man-combat',
  name: 'Army Man Combat',
  version: 'v2.0',
  url: '',
  lastModified: '',
};

module.exports = [
  {
    system,
    codex: {
      units: [
        infantry(
          'Recruits',
          5,
          15,
          2,
          [W.RIFLE.key],
          special('Must re-roll successful quality tests (once per test).'),
          [
            upgrade(
              'Bayonets',
              [ adding(10, U.ALL, W.BAJONET.key) ]
            ),
            upgrade(
              'Grenadier',
              [
                adding(5, U.ONE, W.GRENADE.key),
                adding(10, U.ONE, W.C4.key),
              ],
            ),
            upgrade(
              'Specialist',
              [
                replace(10, W.RIFLE.key, U.ONE, W.FLAMETHROWER.key),
                replace(10, W.RIFLE.key, U.ONE, W.BAZOOKA.key),
              ],
            ),
          ],
        ),
        infantry(
          'Rifleman',
          5,
          25,
          2,
          [W.RIFLE.key],
          undefined,
          [
            upgrade(
              'Bayonets',
              [ adding(10, U.ALL, W.BAJONET.key) ]
            ),
            upgrade(
              'Grenadier',
              [
                adding(5, U.ONE, W.GRENADE.key),
                adding(10, U.ONE, W.C4.key),
              ],
            ),
            upgrade(
              'Specialist',
              [
                replace(10, W.RIFLE.key, U.ONE, W.FLAMETHROWER.key),
                replace(10, W.RIFLE.key, U.ONE, W.BAZOOKA.key),
              ],
            ),
          ],
        ),
        infantry(
          'Veterans',
          5,
          40,
          2,
          [W.RIFLE.key],
          special('May re-roll failed quality tests (once per test).'),
          [
            upgrade(
              'Bayonets',
              [ adding(10, U.ALL, W.BAJONET.key) ]
            ),
            upgrade(
              'Grenadier',
              [
                adding(5, U.ONE, W.GRENADE.key),
                adding(10, U.ONE, W.C4.key),
              ],
            ),
            upgrade(
              'Specialist',
              [
                replace(10, W.RIFLE.key, U.ONE, W.FLAMETHROWER.key),
                replace(10, W.RIFLE.key, U.ONE, W.BAZOOKA.key),
              ],
            ),
          ],
        ),
        infantry(
          'Gunners',
          1,
          10,
          3,
          [W.MACHINEGUN.key],
        ),
        infantry(
          'Snipers',
          1,
          20,
          3,
          [W.SNIPERRIFLE.key],
          special('Passes quality tests on 2+ when shooting and Infantry units don’t get a block die per hit.'),
        ),
        infantry(
          'Heavy Weapons',
          1,
          20,
          3,
          [W.MORTAR.key],
          special('May shoot at enemies it can’t see as long as they are in line of sight of other friendly units.'),
        ),
        vehicle(
          'Jeep',
          40,
          1,
          [],
          special('Transport up to 5 models. Units that move in contact may get in, and may use Advance to get out. If a infantry is inside when destroyed all models are placed within 3” and the infantry takes D6 hits.'),
        ),
        vehicle(
          'Truck',
          60,
          1,
          [],
          special('Transport up to 10 models. Units that move in contact may get in, and may use Advance to get out. If a infantry is inside when destroyed all models are placed within 3” and the infantry takes D6 hits.'),
        ),
        vehicle(
          'APC',
          110,
          2,
          [],
          special('Transport up to 10 models. Units that move in contact may get in, and may use Advance to get out. If a infantry is inside when destroyed all models are placed within 3” and the infantry takes D6 hits.'),
        ),
        vehicle(
          'Tank',
          150,
          3,
          [W.CANNON.key],
        ),
        vehicle(
          'Medium Tank',
          175,
          4,
          [W.CANNON.key],
        ),
        vehicle(
          'Heavy Tank',
          200,
          5,
          [W.CANNON.key],
        ),
        vehicle(
          'Artillery',
          90,
          undefined,
          [W.CANNON.key],
          special('Moves only 6” on Advance and 12” on Rush actions. May only shoot when using Hold actions and target enemies it can’t see as long as they are in line of sight of other friendly units.')
        ),
      ],
      weapons: Object.keys(W).map((key) => W[key]),
    },
    rules: sections(
      [
        section(
          'General Principles',
          [
            p('The most important rule','Whenever the rules are unclear use common sense and personal preference. Have fun!'),
            p('Quality Tests','Roll one six-sided die and if you score a 4+ it‘s a success.'),
            p('Additional Dice','When adding dice to a roll they are added to the total roll of the unit, and not to each individual model.'),
          ],
        ),
        section(
          'Preperation',
          [
            p('The Battlefield','The game is played on a flat 4‘x4‘ surface, with at least 5-10 pieces of terrain on it.'),
            p('The Armies','The players must put together two armies of 300pts, of which up to half are vehicles. They may also take a total of up to three units of Gunners, Snipers or Supports in any combination.'),
            p('Deployment','Players roll-off and the winner picks one of the table edges as his deployment zone with his opponent taking the opposite. Then the players alternate in placing one unit each within 12” of their table edge, starting with the player that won the deployment roll-off.'),
            p('Mission','The game ends after 4 rounds and players sum the point value of all enemy units they completely destroyed or that are pinned. The player with most points wins.'),
          ],
        ),
        section(
          'Playing the Game',
          [
            p('The game is played in rounds with players alternating in activating one unit each until all units have been activated. Before each activation both players roll one die and add the number of non-activated units they have, and the player with the highest result may activate a unit next.'),
          ],
        ),
        section('Activation',[
          p('The player picks one unit and it may do one of the following:'),
          ul([
            '<strong>Hold: </strong>Move 0”, can shoot.',
            '<strong>Hunker: </strong>Move 0”, can’t shoot, gets +1 die to blocking rolls.',
            '<strong>Guard: </strong>Move 0”, can shoot in reaction to the enemy.',
            '<strong>Advance: </strong>Move 6”, can shoot only after moving.',
            '<strong>Rush: </strong>Move 12”, can’t shoot.',
            '<strong>Charge: </strong>Move 12” into melee.',
          ]),
        ]),
        section('Movement',[
          p('Unit members must stay within 2” of at least one other member and within 6” of all other members. Units may only move within 1” of others when charging and may only charge if at least one model can reach one model from the target.'),
        ]),
        section('Shooting',[
          p('Models in range and line of sight may fire one weapon. Shooting models take one quality test per attack in the unit and each success is a hit. Defending models then take as many quality tests as hits and each success is a block. Subtract the number of blocks from the number of hits and the defender removes as many models from the target as the result.'),
          p('Guard Actions','Units that are on guard may not move or shoot, but may react to enemy units that move into their line of sight by shooting. The player may stop enemy units at any point of their move to shoot, but the target gets +1 die to its blocking roll.'),
        ]),
        section('Melee',[
          p('Charging models must move into base contact with the target or as close as possible. Then defenders must do the same moving up to 3”. Models within 2” of enemies may strike with all their melee weapons and the charging unit gets +1 die to its attack roll. This works like shooting but casualties are only removed after both units have attacked. Once both units are done the unit that caused least wounds must take a quality test and if failed it is destroyed. If neither unit is destroyed they must continue fighting until one of them is.'),
        ]),
        section('Morale',[
          p('If shooting brings a unit down to half or less of its original size, then it must take a quality test. If failed it is Pinned and must take a quality test when trying to activate or if it is charged. If the test is passed the unit stops being Pinned and may activate or fight in melee normally. If the test if failed the unit is destroyed.'),
        ]),
        section('Terrain',[
          p('Cover Terrain','Infantry units with most models in or behind cover get +1 die to blocking rolls against shooting attacks.'),
          p('Difficult Terrain','Units moving through difficult terrain may not move more than their Advance action distance.'),
          p('Dangerous Terrain','Units moving across dangerous terrain must roll as many dice as models and for each 1 they take one hit.'),
          p('Elevated Terrain','Units charging from higher elevation or being charged from lower elevation get +1 attack die in melee, and units taking shots from lower elevation count as being in cover.'),
        ]),
        section('Army Creation',[
          p('This section of the rules provides you with guidelines on how to create balanced armies to play the game.'),
          p('<em>For more rules on how to build units, visit <a href="https://onepagerules.com/portfolio/one-off-games/" title="Army Man Combat">Army Man Combat</a> on OnePageRules.</em>')
        ]),
      ],
    ),
  },
];
