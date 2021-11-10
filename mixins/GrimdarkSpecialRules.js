export default {
  methods: {
    parseSpecialRuleString(text) {
      // /^(?<name>[\w ]+)\(?(?<rating>.*[^)])\)?: (?<effect>.*)$/gm
      const regex = /^(?<name>[\w -]+)\(?(?<rating>[\w\d]*)\)?: (?<effect>.*)$/gm;
      const { groups } = regex.exec(text);
      return {
        ...groups,
        label: `${groups.name}${groups.rating ? `(${groups.rating})` : '' }`,
      };
    },
  },
  data() {
    const specialRule = function(text) {
      // /^(?<name>[\w ]+)\(?(?<rating>.*[^)])\)?: (?<effect>.*)$/gm
      const regex = /^(?<name>[\w -]+)\(?(?<rating>[\w\d]*)\)?: (?<effect>.*)$/gm;
      const {groups} = regex.exec(text);
      return {
        ...groups,
        label: `${groups.name}${groups.rating ? `(${groups.rating})` : ''}`,
      };
    };
    return {
      specialRulesRepository: [
        specialRule('Aircraft: This model doesn’t interact physically with other models and terrain, and can’t be moved into contact with. Non-aircraft units count as being an extra 12” away when measuring and get -1 to shooting. When activated this model must always move 18”-36” in a straight line, and if it goes off-table then its activation ends and it may be placed back on any table edge.'),
        specialRule('Ambush: This model may be kept in reserve instead of deploying. At the start of any round after the first you may place the model anywhere over 9” away from enemy units. If both player have Ambush they roll-off to see who deploys first, and then alternate in placing them.'),
        specialRule('Anti-Air: This unit doesn’t count as being an extra 12” away and doesn’t get -1 to shooting against aircraft.'),
        specialRule('AP(X): Targets get -X to Defense rolls when blocking hits.'),
        specialRule('Blast(X): All hits are multiplied by X.'),
        specialRule('Deadly(X): Assign each wound to one model and multiply it by X. Note that these wounds don\'t carry over to other models if killed.'),
        specialRule('Fast: Move 9” when using Advance and 18” when using Rush/Charge.'),
        specialRule('Fear: Always counts as having dealt +D3 wounds for seeing who won melee.'),
        specialRule('Fearless: Gets +1 to morale tests.'),
        specialRule('Flying: May move through obstacles and may ignore terrain effects.'),
        specialRule('Furious: Gets +1 attack with a weapon of your choice when charging.'),
        specialRule('Hero: May be deployed as part of friendly units, and they may use his quality value for morale tests. When taking hits you must use the defense value of the hero’s unit until all non-hero models are killed.'),
        specialRule('Immobile: May never move/charge.'),
        specialRule('Impact(X): Deals X automatic hits when charging successfully.'),
        specialRule('Indirect: May target enemies that are not in line of sight, but gets -1 to hit rolls when shooting after moving.'),
        specialRule('Poison: When rolling an unmodified 6 to hit, that hit is multiplied by 3.'),
        specialRule('Psychic(X): May cast one spell during its activation at any point, before attacking. Pick a spell and a target in line of sight and roll D6+X. If the result is equal or higher than the number in brackets you may resolve the effects. Enemy psychics within 18” and line of sight of the caster may roll D6+X at the same time, and if the result is higher the spell is blocked. Psychics may only either try to cast or try to block a spell each round.'),
        specialRule('Regeneration: When taking a wound, roll one die. On a 5+ it is ignored.'),
        specialRule('Relentless: For each unmodified roll of 6 to hit when shooting, this model may roll 1 extra attack. This rule doesn’t apply to newly generated attacks.'),
        specialRule('Rending: Unmodified rolls of 6 to hit count as having AP(4) and ignore the regeneration rule.'),
        specialRule('Scout: This model may be deployed after all other units, and may then move by up to 12”, ignoring terrain. If both of the players have Scout they roll-off to see who deploys first, and then alternate in placing and moving them.'),
        specialRule('Slow: Move 4” when using Advance and 8” when using Rush/Charge.'),
        specialRule('Sniper: Shoots at Quality 2+, ignores cover and may pick which model is hit.'),
        specialRule('Stealth: Enemies get -1 to shooting when targeting this unit.'),
        specialRule('Strider: This model may ignore the effects of difficult terrain.'),
        specialRule('Tough(X): This model must take X wounds before being killed. If a model with tough joins a unit without it, then it is removed last when the unit takes wounds. Note that you must continue to put wounds on a single tough model until it is killed, before starting to put them on the next tough model.'),
        specialRule('Transport(X): May transport X other models. Units embark by moving into contact, and may use any action to disembark, but only move by up to 6”. Units may also be deployed inside of a transport. If a unit is inside a transport when it is destroyed, then it takes a dangerous terrain test, is immediately Pinned, and surviving models must be placed within 6” of the transport before it is removed.'),
      ],
    };
  },
};
