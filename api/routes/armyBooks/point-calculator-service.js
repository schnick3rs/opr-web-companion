const calc = require('opr-point-calculator-lib');

function normalizeWeapon(weapon) {
  if (weapon === undefined) return undefined

  const specialRules = weapon.specialRules.map(sr => {
    if (typeof sr === 'string') {
      {
        const match = /(?<name>[\w\d \-&]+[\w\d])\(?(?<modify>\+?)(?<rating>[\w\d]*)\)?(?<condition>.*)/.exec(sr);
        if (match) {
          const { name, rating, modify, condition } = match.groups;
          return { name, key: name.toLowerCase(), rating };
        }
        console.warn(`Could not parse ${sr}`);
        return null;
      }
    }
    return sr;
  });
  let weaponz = {
    name: weapon.label,
    range: weapon.range > 0 ? weapon.range : undefined,
    attacks: weapon.attacks,
    rules: specialRules.map(sr => sr.name),
  };
  specialRules.forEach(sr => {
    if (sr.rating) { weaponz[sr.key] = sr.rating; }
  });
  return weaponz;

}

/**
 *
 * @param unit
 * @returns {{models, defense: (*|number), name, equipment: *[], rules: *[], quality}}
 */
function normalizeUnit(unit) {
  if (unit === undefined) return undefined;

  let clone = Object.assign({}, unit);

  let equipment = [];

  if (clone.equipment) {
    let shelf = [];
    clone.equipment.forEach(e => {
      if (e.count && e.count > 1) {
        for (let i = 0; i < e.count; i++) {
          shelf.push(e);
        }
      } else {
        shelf.push(e);
      }
    });
    equipment = shelf.map(e => normalizeWeapon(e));
  }

  let calculatableUnit = {
    name: clone.name,
    models: clone.size,
    quality: clone.quality,
    defense: clone.defense,
    rules: [],
    equipment,
  };

  if (clone.specialRules) {
    clone.specialRules = clone.specialRules.map(sr => {
      return {
        ...sr,
        key: sr.key === 'tough-skirmish' ? 'tough' : sr.key,
      };
    });
    calculatableUnit.rules = clone.specialRules.map(sr => sr.name);
    clone.specialRules.forEach(sr => {
      if (sr.rating) {
        calculatableUnit[sr.key] = sr.rating;
      }
    });
  }

  return calculatableUnit;
}

const calculateUnit = (unit, roundCosts = true) => {
  const preciseCost = calc.unitCost(unit);
  return roundCosts ? Math.round(preciseCost/5)*5 : preciseCost;
}

module.exports = {
  normalizeWeapon,
  normalizeUnit,
  calculateUnit,
  round: (value) => Math.round(value/5)*5,
}
