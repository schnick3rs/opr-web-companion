import ArmyBookRule from './ArmyBookRule';

const normalizeWeapon = (weapon) => {
  if (weapon === undefined) return undefined

  const specialRules = weapon.specialRules.map(sr => {
    if (typeof sr === 'string') return ArmyBookRule.FromString(sr);
    return sr;
  });
  let weaponz = {
    name: weapon.label,
    range: weapon.range > 0 ? weapon.range : 'melee',
    attacks: weapon.attacks,
    rules: specialRules.map(sr => sr.name),
  };
  specialRules.forEach(sr => {
    if (sr.rating) {
      weaponz[sr.key] = isNaN(sr.rating) ? sr.rating : parseInt(sr.rating);
    }
  });
  return weaponz;

}

/**
 *
 * @param unit
 * @returns {{models, defense: (*|number), name, equipment: *[], rules: *[], quality}}
 */
const normalizeUnit = (unit) => {
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
        calculatableUnit[sr.key] = isNaN(sr.rating) ? sr.rating : parseInt(sr.rating);
      }
    });
  }

  return calculatableUnit;
}

export {
  normalizeWeapon,
  normalizeUnit,
}
