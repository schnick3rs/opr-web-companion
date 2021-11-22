import ArmyBookRule from './ArmyBookRule';

const round = (preciseCost) => {
  return Math.round(preciseCost/5)*5;
}

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

const toCustomRule = (rule) => {
  let customRule = undefined;
  if (rule.cost) {
    if (isNaN(rule.cost)) {
      const parts = rule.cost.split(' ').map(i => i.trim());
      const func = (unit) => {
        let cost = 0;
        let next = 0;
        let operation = null;
        parts.forEach(part => {
          switch (part) {
            case '*': operation = (a, b) => a*b; break;
            case '/': operation = (a, b) => a/b; break;
            case '+': operation = (a, b) => a+b; break;
            case '-': operation = (a, b) => a-b; break;
            default:
              if (typeof part === 'string') {
                if (isNaN(part)) {
                  next = parseInt(unit[part]) || 1;
                } else {
                  next = parseInt(part);
                }
                if (typeof operation === 'function') {
                  cost = operation(cost, next);
                  operation = null;
                } else {
                  cost  = next;
                }
              }
          }
          console.info('use func -> ', part, cost, next, operation);
        });
        return cost;
      };
      customRule = {cost: func};
    } else {
      customRule = {cost: rule.cost};
    }
  }
  return customRule;
}

function toCustomRules(specialRules) {
  let customRules = {};
  specialRules.forEach(rule => {
    const ruleCost = toCustomRule(rule);
    if (ruleCost) {
      customRules[rule.name] = ruleCost;
    }
  });
  return customRules;
}


export {
  normalizeWeapon,
  normalizeUnit,
  toCustomRule,
  toCustomRules,
  round,
}
