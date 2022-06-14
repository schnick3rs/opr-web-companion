import pluralize from 'pluralize';
import * as ArmyBook from './ArmyBook';

const round = (preciseCost) => {
  return Math.round(preciseCost / 5) * 5;
};

const logVerbose = false;

const normalizeWeapon = (weapon) => {
  if (weapon === undefined) { return undefined; }

  const specialRules = weapon.specialRules.map((sr) => {
    if (typeof sr === 'string') { return ArmyBook.Rule.FromString(sr); }
    return sr;
  });
  const weaponz = {
    name: weapon.label,
    range: weapon.range > 0 ? weapon.range : 'melee',
    attacks: weapon.attacks,
    rules: specialRules.map(sr => sr.name),
  };
  specialRules.forEach((sr) => {
    if (sr.rating) {
      weaponz[sr.key] = isNaN(sr.rating) ? sr.rating : parseInt(sr.rating);
    }
  });
  return weaponz;
};

/**
 *
 * @param unit
 * @returns {{models, defense: (*|number), name, equipment: *[], rules: *[], quality}}
 */
const normalizeUnit = (unit) => {
  if (unit === undefined) { return undefined; }

  const clone = Object.assign({}, unit);

  let equipment = [];

  if (clone.equipment) {
    const shelf = [];
    clone.equipment.forEach((e) => {
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

  const calculatableUnit = {
    name: clone.name,
    models: clone.size,
    quality: clone.quality,
    defense: clone.defense,
    rules: [],
    equipment,
  };

  if (clone.specialRules) {
    clone.specialRules = clone.specialRules.map((sr) => {
      return {
        ...sr,
        key: sr.key.replace('-skirmish', '')
      };
    });
    calculatableUnit.rules = clone.specialRules.map(sr => sr.name);
    clone.specialRules.forEach((sr) => {
      if (sr.rating) {
        calculatableUnit[sr.key] = isNaN(sr.rating) ? sr.rating : parseInt(sr.rating);
      }
    });
  }

  return calculatableUnit;
};

const toCustomRule = (rule) => {
  let customRule;
  if (rule.cost) {
    if (isNaN(rule.cost)) {
      const parts = rule.cost.split(' ').map(i => i.trim());
      const func = (unit) => {
        let cost = 0;
        let next = 0;
        let operation = null;
        parts.forEach((part) => {
          switch (part) {
            case '*': operation = (a, b) => a * b; break;
            case '/': operation = (a, b) => a / b; break;
            case '+': operation = (a, b) => a + b; break;
            case '-': operation = (a, b) => a - b; break;
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
                  cost = next;
                }
              }
          }
          console.info('use func -> ', part, cost, next, operation);
        });
        return cost;
      };
      customRule = { cost: func };
    } else {
      customRule = { cost: rule.cost };
    }
  }
  return customRule;
};

const toCustomRules = (specialRules) => {
  const customRules = {};
  specialRules.forEach((rule) => {
    const ruleCost = toCustomRule(rule);
    if (ruleCost) {
      customRules[rule.name] = ruleCost;
    }
  });
  return customRules;
};

const checkPrerequisites = (unit, section) => {
  // ToDo check for weapon buffs
  if (section.affects) {
    const idx = unit.equipment.findIndex(e => pluralize(e.name) === pluralize(section.affects));
    return idx >= 0;
  }

  return section.lose.every((lost) => {
    const idx = unit.equipment.findIndex(e => pluralize(e.name) === pluralize(lost));
    return idx >= 0;
  });
};

// We check other upgrade packages if they
//  (a) have a LOSE for a current item AND
//  (b) have a GAIN that matches this packages loss.
/**
 *
 * @param unit {object}
 * @param section {object}
 * @param upgradePackage {object}
 * @returns {[string, string]}
 */
const findMissingPrerequisites = (unit, section, upgradePackage) => {
  // eslint-disable-next-line no-unused-vars
  const foundDependency = false;
  let foundSection;
  let foundOption;

  upgradePackage.sections
    .filter((section) => {
      const theSection = section.type === 'ArmyBookUpgradeSection'
        ? ArmyBook.UpgradeSection.FromObject(section)
        : ArmyBook.UpgradeSection.FromString(section.label);
      return checkPrerequisites(unit, theSection);
    })
    // TODO FIX
    // eslint-disable-next-line array-callback-return
    .some((potentialSection, sectionIndex) => {
      const { options } = potentialSection;
      // TODO FIX
      // eslint-disable-next-line array-callback-return
      options.some((potentialOption) => {
        let foundAll = false;
        const potentialGains = ArmyBook.UpgradeOption.ExtractGains(potentialOption);
        if (section.affects) {
          const idx = potentialGains.findIndex(e => pluralize.singular(e.name) === pluralize.singular(section.affects));
          foundAll = idx >= 0;
        } else {
          foundAll = section.lose.every((lost) => {
            const alreadyHasIndex = unit.equipment.findIndex(e => pluralize.singular(e.name) === pluralize.singular(lost));
            if (alreadyHasIndex >= 0) {
              return true;
            } else {
              const innerIndex = potentialGains.findIndex(e => pluralize.singular(e.name) === pluralize.singular(lost));
              return innerIndex >= 0;
            }
          });
        }
        if (foundAll) {
          foundSection = potentialSection;
          foundOption = potentialOption;
          return true;
        }
      });
    });
  return [foundSection, foundOption];
};

const applyUpgrade = (unit, section, option) => {
  // remove lose
  section.lose.forEach((l) => {
    const idx = unit.equipment.findIndex(e => pluralize(e.name) === pluralize(l));
    if (idx >= 0) {
      unit.equipment.splice(idx, 1);
    } else if (logVerbose) { console.warn(`Equipment [${l}] not found in [${unit.name}] equipments -> ${unit.equipment.map(e => e.label)}.`); }
  });

  if (section.variant === 'model') {
    console.info('Add Model, purge equipment', section);
    unit.equipment = [];
  }

  // add gains
  const gains = ArmyBook.UpgradeOption.ExtractGains(option);

  const checkCondition = (condition) => {
    switch (condition) {
      case 'in melee': return (weapon) => {
        const { range } = weapon;
        return range === 0 || range === undefined || range === null;
      };
      case 'when shooting': return (weapon) => {
        const { range } = weapon;
        return parseInt(range) > 0;
      };
      default:
        console.warn(`Unexpected condition -> ${condition}, use 'in melee' or 'when shooting'`);
    }
  };

  gains.forEach((g) => {
    if (g instanceof ArmyBook.Defense) { unit.defense = unit.defense - parseInt(g.rating); }
    if (g instanceof ArmyBook.Weapon) { unit.equipment.push(g); }
    if (g instanceof ArmyBook.Rule) {
      if (g.condition) {
        // currently we assume all conditions are melee
        unit.equipment = unit.equipment.map((weapon) => {
          // check for the condition
          if (logVerbose) { console.info(`Upgraded ${weapon.name} with ${g.label}.`); }
          if (checkCondition(g.condition)(weapon)) {
            if (g.modify) {
              if (logVerbose) { console.info(` Modify ${weapon.name} with ${g.label}.`); }
              const existingRule = weapon.specialRules.find(sr => sr.name === g.name);
              if (existingRule) {
                // increment
                const srIndex = weapon.specialRules.findIndex(sr => sr.name === g.name);
                const existingRating = parseInt(existingRule.rating);
                const addedRating = parseInt(g.rating);
                // g.rating = existingRating + addedRating;
                weapon.specialRules[srIndex].rating = existingRating + addedRating;
              } else {
                weapon.specialRules.push(g);
              }
            } else {
              weapon.specialRules.push(g);
            }
          }
          return weapon;
        });
      }
      if (section.affects) {
        if (section.affects === 'weapons') {
          unit.equipment = unit.equipment.map((weapon) => {
            if (weapon.name === section.affects) {
              weapon.specialRules.push(g);
              if (logVerbose) { console.info(`Upgraded ${section.affects} with ${g.label}.`); }
            }
            return weapon;
          });
        } else {
          unit.equipment = unit.equipment.map((weapon) => {
            if (pluralize.singular(weapon.name) === pluralize.singular(section.affects)) {
              weapon.specialRules.push(g);
              if (logVerbose) { console.info(`Upgraded ${section.affects} with ${g.label}.`); }
              return weapon;
            } else {
              return weapon;
            }
          });
        }
      } else if (g.modify === true) {
        const existingRule = unit.specialRules.find(sr => sr.name === g.name);
        if (existingRule) {
          // increment
          const srIndex = unit.specialRules.findIndex(sr => sr.name === g.name);
          const existingRating = parseInt(existingRule.rating);
          const addedRating = parseInt(g.rating);
          // g.rating = existingRating + addedRating;
          unit.specialRules[srIndex].rating = existingRating + addedRating;
        } else {
          unit.specialRules.push(g);
        }
      } else {
        unit.specialRules.push(g);
      }
    }
  });

  return unit;
};

const calculateUnitCost = (unit, pointCalculator, customRules = {}) => {
  const equipment = unit.equipment.map((e) => {
    // normalize weapons
    const equipmentSpecialRules = e.specialRules.map((sr) => {
      if (typeof sr === 'string') { return ArmyBook.Rule.FromString(sr); }
      return sr;
    });
    const weapon = {
      name: e.label,
      range: e.range > 0 ? e.range : 'melee',
      attacks: e.attacks,
      rules: equipmentSpecialRules.map(sr => sr.name),
    };
    equipmentSpecialRules.forEach((sr) => {
      if (sr.rating) {
        weapon[sr.key] = isNaN(sr.rating) ? sr.rating : parseInt(sr.rating);
      }
    });
    return weapon;
  });
  const calculatableUnit = {
    name: unit.name,
    models: unit.size,
    quality: unit.quality,
    defense: unit.defense,
    rules: unit.specialRules.map(sr => sr.name),
    equipment,
  };
  unit.specialRules.forEach((sr) => {
    if (sr.rating) {
      calculatableUnit[sr.key] = isNaN(sr.rating) ? sr.rating : parseInt(sr.rating);
    }
  });
  unit.specialRules = unit.specialRules.map((sr) => {
    return {
      ...sr,
      key: sr.key.replace('-skirmish', '')
    };
  });
  return pointCalculator.unitCost(calculatableUnit, customRules);
};

const recalculateUpgradePackage = (armyBookUid, upgradePackage, units, calc, customRules = {}) => {
  const recalcedOptions = [];
  upgradePackage.sections.forEach((section, sectionIndex) => {
    section.options.forEach((option, optionIndex) => {
      const upgradeSection = section.type === 'ArmyBookUpgradeSection'
        ? ArmyBook.UpgradeSection.FromObject(section)
        : ArmyBook.UpgradeSection.FromString(section.label);

      if (logVerbose) { console.debug('Checking upgrade package ->', upgradeSection); }

      if (upgradeSection === undefined) {
        console.warn('Upgrade section is undefined for ->', section);
        return;
      }

      const upgradeCostSet = units.map((origin) => {
        let unit = JSON.parse(JSON.stringify(origin));
        if (upgradeSection.computeCostAsSingleModel) {
          unit.size = 1;
        }

        // flatten equipment count
        if (unit.equipment) {
          const shelf = [];
          unit.equipment.forEach((e) => {
            if (e.count && e.count > 1) {
              const count = e.count;
              if (logVerbose) { console.info(`Found ${count}x ${e.name || e.label}`); }
              delete e.count;
              for (let i = 0; i < count; i++) {
                if (logVerbose) { console.info(`Adding ${e.name || e.label}`); }
                shelf.push(e);
              }
            } else {
              shelf.push(e);
            }
          });
          unit.equipment = shelf;
        }

        // normalize equipment
        unit.equipment = unit.equipment.map((e) => {
          const equipmentName = e.label || e.name;
          const name = pluralize.singular(equipmentName);
          return {
            ...e,
            name,
            specialRules: e.specialRules.map(sr => ArmyBook.Rule.FromString(sr)),
          };
        });

        let clone = JSON.parse(JSON.stringify(unit));

        let isValid = checkPrerequisites(clone, upgradeSection);

        if (!isValid) {
          // console.info(`Prerequisites not sufficient for [${clone.name}]. Checking other sections...`);
          const [section, option] = findMissingPrerequisites(clone, upgradeSection, upgradePackage);
          if (section && option) {
            isValid = true;
            const thisSection = section.type === 'ArmyBookUpgradeSection'
              ? ArmyBook.UpgradeSection.FromObject(section)
              : ArmyBook.UpgradeSection.FromString(section.label);
            unit = applyUpgrade(unit, thisSection, option);
            clone = JSON.parse(JSON.stringify(unit));
          } else {
            // console.warn(`No option found that provides missing prerequisites for [${clone.name}]`);
          }
        }

        clone = applyUpgrade(clone, upgradeSection, option);

        let baseCost = calculateUnitCost(unit, calc, customRules).toFixed(3);
        if (upgradeSection.variant === 'model') {
          baseCost = 0;
        }
        const upgradedCost = calculateUnitCost(clone, calc, customRules).toFixed(3);
        const baseCostRound = Math.round(baseCost / 5) * 5;
        const upgradedCostRound = Math.round(upgradedCost / 5) * 5;
        return {
          unitName: unit.name,
          baseCost,
          upgradedCost,
          newCostPrecise: (upgradedCost - baseCost),
          newCostRounded: (upgradedCostRound - baseCostRound),
          unit,
          clone,
          isValid,
        };
      });
      if (logVerbose) { console.info(`Cost proposal for ${option.label}:`); }
      if (logVerbose) { console.table(upgradeCostSet); }

      // select the largest cost
      let proposedCost;
      if (upgradeCostSet && upgradeCostSet.length > 0) {
        const props = upgradeCostSet
          .filter((nc) => {
            if (nc.isValid) {
              return true;
            } else {
              if (logVerbose) { console.info(`Skip cost for ${nc.unitName} ...`); }
              return false;
            }
          })
          .map((nc) => {
            if (nc.newCostRounded >= 5) {
              return nc.newCostRounded;
            } else if (nc.newCostPrecise > 0) {
              return 5;
            } else if (nc.newCostPrecise < 0) {
              return nc.newCostRounded;
            } else {
              return 0;
            }
          }).map(c => parseInt(c));
        proposedCost = Math.max.apply(null, props);
      }

      const payload = {
        armyBookUid,
        upgradePackageUid: upgradePackage.uid,
        sectionIndex,
        optionIndex,
        option: {
          ...option,
          // cost: option.mode === 'auto-update' ? proposedCost : option.cost,
          cost: proposedCost,
          proposedCost,
          proposedVersion: calc.version(),
          proposedCostHint: upgradeCostSet.map((cost) => {
            return {
              unitName: cost.unitName,
              newCostPrecise: cost.newCostPrecise.toFixed(3),
              newCostRounded: cost.newCostRounded,
              isValid: cost.isValid,
            };
          }),
        },
      };
      recalcedOptions.push(payload);
    });
  });
  return recalcedOptions;
};

export {
  normalizeWeapon,
  normalizeUnit,
  toCustomRule,
  toCustomRules,
  round,
  checkPrerequisites,
  findMissingPrerequisites,
  applyUpgrade,
  calculateUnitCost,
  recalculateUpgradePackage,
};
