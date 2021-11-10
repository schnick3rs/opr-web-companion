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

// melee
const m = (label, cost, attacks) => {
  return {
    key: stringToKebab(label),
    range: 0,
    label,
    cost,
    attacks,
  };
};

// ranged
const r = (label, cost, attacks, range, bands) => {
  return {
    key: stringToKebab(label),
    range,
    label,
    cost,
    attacks,
    bands
  };
};

const band = (mod, from, to) => {
  return { mod, from, to};
}

const specialRule = (label, cost, effect) => {
  return {
    key: stringToKebab(label),
    label,
    cost,
    effect,
  };
};

const sr = (string) => {
  const { groups: { label, cost, effect } } = /(?<label>.*) \((?<cost>\d+)pts\): (?<effect>.*)/.exec(string)
  return specialRule(label, cost, effect);
}

const STAT = {
  MOVE: (v) => 'Move',
  WOUND_ROLL: (v) => 'Move',
}

const system = {
  key: 'double-tab',
  name: 'Double Tab',
  version: 'v2.1',
  url: '',
  lastModified: '',
};

module.exports = [
  {
    system,
    codex: {
      minCost: 5,
      weapons: weapons([
        m('Knife',1,2),
        m('Sword',4,4),
        r('Pistol',3,2,18, [
          band(0,0,18),
        ]),
        r('Shotgun',3,2,18, [
          band(1,0,9),
          band(-1,9,18),
        ],),
        r('SMG',4,4,18, [
          band(0,0,9),
          band(-1,9,18),
        ]),
        r('Carbine',5,3,27, [
          band(0,0,9),
          band(1,9,18),
          band(0,18,27),
        ]),
        r('Rifle',5,2,36, [
          band(0,0,18),
          band(1,18,27),
          band(0,27,36),
        ]),
        r('LMG',6,4,36,[
          band(-1,0,9),
          band(0,9,18),
          band(1,18,27),
          band(0,27,36),
        ]),
        r('Sniper Rifle',6,2,36, [
          band(-1,0,9),
          band(0,9,18),
          band(1,18,36),
        ]),
      ]),
      specialRules: [
        sr('Ambush (2pts): Unit may be kept in reserve instead of deploying. At the start of any round after the first you may place the model anywhere over 8” away from enemy units. If both players have ambushing units they roll-off to see who deploy first.'),
        sr('Armored (4pts): Gets +1 to block rolls.'),
        sr('Athletic (1pts): Only count half the height towards your move when climbing up to 4“.'),
        sr('Camouflage (4pts): When deployed gets a camo marker. Enemies can‘t attack units with camo markers but can use a special detect action to spot it when acting/reacting. Take a quality test to spot, if successful the marker is removed. This unit can use a special cloak action to place a marker as long as it‘s not in line of sight of enemies. If this unit attacks it loses its marker, and units reacting to this attack get -2 to their rolls.'),
        sr('Doctor (6pts): Friendly units within 4“ get +1 to block rolls.'),
        sr('Engineer (6pts): Friendly units within 4“ get +1 to shooting rolls.'),
        sr('Fast (2pts): Moves +2“ on Advance/Charge and +4“ on Rush.'),
        sr('Fire Ammo (4pts): Enemies hit by shooting get -2 to block rolls'),
        sr('Flying (3pts): May ignore enemy units and terrain when moving.'),
        sr('Grenade (1pts): Once per game may throw a grenade of any type, which works like a weapon with 2 attacks. The grenade flies in a straight line by up to 6“ per hit, and the effect is based on its type. Note that dodging units don‘t cancel out grenade successes, but instead may dodge by 2“ per success. (A) Flash: All units within 3“ get -2 to all quality rolls until the end of your turn. (B) Frag: All units within 3“ take one automatic hit. (C) Smoke: All line of sight is blocked within 3“ until the start of your next turn.'),
        sr('Hacker (2pts): May use a special hack action against one enemy unit within 8“. Roll one die, on a 4+ the target gets -1 to its next attack or block roll (does not stack).'),
        sr('Infiltrate (2pts): May immediately move by up to 8“ when deployed.'),
        sr('Piercing Ammo (2pts): Enemies hit by shooting get -1 to block rolls.'),
        sr('Poison Gear [Melee] (2pts): Enemies hit by melee get a poison marker. When a poisoned unit activated roll one die, on 3+ remove the poison marker, else it is immediately killed.'),
        sr('Poison Gear [Ranged] (2pts): Enemies hit by shooting get a poison marker. When a poisoned unit activated roll one die, on 3+ remove the poison marker, else it is immediately killed.'),
        sr('Regeneration (4pts): Whenever this unit would be killed roll one die, on a 5+ it survives instead.'),
        sr('Scout (2pts): After all units have deployed this model may deploy within 24” of the player’s table edge. If both of the players have scouting units they roll-off to see who deploys first.'),
        sr('Sixth Sense (2pts): Enemy units within 8“ lose their camo markers.'),
        sr('Spotter (2pts): This unit may use a special spot action to mark an enemy unit in line of sight. The next friendly unit that shoots at it gets +1 to hit rolls.'),
        sr('Tough (12pts): If this unit fails to block one or more hits place a wound marker on it for each hit and it is not killed. Only once the unit takes 3rd wound marker it is killed.'),
      ],
    },
    rules: sections(
      [
        section(
          'General Principles',
          [
            p('The most important rule','Whenever the rules are unclear use common sense and personal preference. Have fun!'),
            p('Quality Tests','Roll one six-sided die and if you score a 4+ it‘s a success.'),
            p('Modifiers','If you need to roll a 7+ or higher to succeed, then a roll of 6+ followed by 4+ is a success. Note that rolls of 1 always fail.'),
            p('Line of Sight','Units can only see in the front 180° part of their base.'),
          ],
        ),
        section(
          'Preperation',
          [
            p('The Battlefield','The game is played on a flat 4‘x4‘ surface, with at least 15-20 pieces of terrain on it.'),
            p('The Armies','The players must put together two armies of 50pts each.'),
            p('Deployment','Players roll-off and the winner picks one of the table edges as his deployment zone with his opponent taking the opposite. Then the players alternate in placing one unit each within 12” of their table edge, starting with the player that won the deployment roll-off.'),
            p('Mission','Place D3 objectives. Players roll-off to go first and then alternate in placing one marker each outside of deployment zones and over 9” away from each other. At the end of each round if a unit is within 3” of a marker while enemies aren’t, then it’s seized and remains seized even after leaving. Stunned units can’t seize markers and if units from both sides are contesting a marker then it becomes neutral again. The game ends after 4 rounds and the player that controls most markers wins.',)
          ],
        ),
        section(
          'Playing the Game',
          [
            p('The game is played in alternating player turns in which they activate one or more of their models, starting with the player that deployed first. During their turn players get as many activation points as living units in their army, which they may spend on any unit without limits. Once a player has run out of activation points his turn ends.'),
          ],
        ),
        section('Activation',[
          p('The player picks one unit and it may do one of the following per activation point:'),
          ul([
            '<strong>Hold: </strong>Move 0”, can shoot.',
            '<strong>Advance: </strong>Move 4”, can shoot at any point of its move.',
            '<strong>Rush: </strong>Move 8”, can´t shoot.',
            '<strong>Charge: </strong>Move 4” into melee.',
          ]),
        ]),
        section('Movement',[
          p('Units may climb surfaces up to 4“ tall by counting the height toward their move, and may climb surfaces of any height by using ladders and only counting half the height toward their move. Units may freely move into base contact with enemy units, but may only move out of contact by dodging.'),
        ]),
        section('Shooting',[
          p('Units not in melee may fire one weapon at enemies in range and line of sight, and may split attack between them. When shooting on the move pick at which point to fire. Take one quality test per attack and each success is a hit. For each hit defending units take one quality test and if any of them are failed the model is killed.')
        ]),
        section('Melee',[
          p('Units may use all melee weapons against one unit in base contact. This works like shooting, but the defender may only react by dodging or also using a melee attack.'),
        ]),
        section('Morale',[
          p('If a unit takes hits but is not killed, then it must take a quality test. If failed the unit must move by 2” trying to be out of sight and as far as possible from enemies. If the test was from melee the unit is stunned instead. Stunned units can’t use reactions and must spend one activation point to recover from this state.'),
        ]),
        section('Reaction',[
          p('Whenever a unit has line of sight to an enemy as it takes any actions, then it may react at any point. Actions and reactions are simultaneous, so if a reaction kills a unit it may still finish its action. Note that units in base contact with enemies may only react to those units, and may only use either dodge or melee reactions.'),
          p('Move','The unit may move by its Advance speed, but only after the active unit has resolved any attacks.'),
          p('Dodge','The unit must move by up to 2”, which may be used to move out of base contact with enemies. If the unit was the target of an attack take 2 quality tests and compare results with the attacker. For each success cancel out an enemy success, and if no enemy successes are left then it moves by 2”. Else it takes hits and doesn’t move.'),
          p('Shoot','The unit takes a shoot action but with only 1 attack. If the unit was the target of a shooting attack compare results with the attacker. For each success cancel out an enemy success.'),
          p('Melee','The unit takes a melee action, but with only 1 attack. If the unit was the target of a melee attack compare results with the attacker. For each success cancel out an enemy success.'),
        ]),
        section('Terrain',[
          p('Cover Terrain','Units shooting at targets within or behind cover terrain get-1 to their shooting rolls.'),
          p('Difficult Terrain','Units moving through difficult terrain halve their move.'),
          p('Elevated Terrain','Units shooting at targets on lower elevation get +1 to shooting rolls.'),
        ]),
        section('Unit Creation',[
          p('When preparing armies you have to create units based on your models by picking their weapons and special rules. Each unit must have at least one melee weapon, but else there are no restrictions.'),
          p('<em>For more rules on how to build units, visit <a href="https://onepagerules.com/portfolio/one-off-games/" title="Double Tab">Double Tab</a> on OnePageRules.</em>')
        ]),
      ],
    ),
  },
];
