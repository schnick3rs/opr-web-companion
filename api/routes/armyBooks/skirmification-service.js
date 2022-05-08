import pluralize from 'pluralize';
import { ArmyBook, CalcHelper } from 'opr-army-book-helper';
import calc from 'opr-point-calculator-lib';
import * as unitService from './units/unit-service';

pluralize.addSingularRule(/Spear-Fuses$/, 'Spear-Fuse'); // see Custodian Brothers
pluralize.addSingularRule(/Fuses$/, 'Fuse'); // see Custodian Brothers
pluralize.addSingularRule(/Axes$/, 'Axe'); // see Dwaves
pluralize.addSingularRule(/Claws$/, 'Claws'); // See Alien Hives and other bestials
pluralize.addSingularRule(/Martial Arts$/, 'Martial Arts'); // See ED
pluralize.addPluralRule(/Squads$/, 'Squad'); // See HDF and others
pluralize.addPluralRule(/CCW$/, 'CCWs'); // See all the armies

export function skirmifyRulesText(battleText) {
  let skirmishText = battleText;

  skirmishText = skirmishText.replace(
    'The hero and its unit get the Ambush special rule.',
    'The hero and up to half of its army get the Ambush special rule (must deploy within 3” of the hero).'); // see RL

  // HDF - Set Example
  // Whenever the hero’s unit fails a morale test you must kill one of its models and the morale test counts as passed instead.
  // Whenever the hero’s unit fails a morale test you must kill one of its models and the morale test counts as passed instead.
  // Whenever the hero’s unit fails a morale test, it takes D3 wounds, and the morale test counts as passed instead.
  // Whenever the hero’s unit fails a morale test you must kill one of its models and the morale test counts as passed.
  skirmishText = skirmishText.replace(
    /Whenever the hero’s unit fails a morale test (.*) and the morale test counts as passed( instead)?\./gm,
    'Whenever a friendly unit within 12" fails a morale test, $1", and then all friendly units within 12" of the killed model automatically pass morale tests until the end of the round.');

  // E.g. Beastman - Madness
  skirmishText = skirmishText.replace(
    /pick (\w+) (friendly|enemy) (units) (within \d+..*). Those units (.*)/gm,
    'pick $1 $2 $3 $4. Those units, and all $2 $3 within 6" $5');

  skirmishText = skirmishText.replace(
    /pick (\w+) (friendly|enemy) (units) (within \d+..*), which (.*)/gm,
    'pick $1 $2 $3 $4. Those units, and all $2 $3 within 6" $5');

  skirmishText = skirmishText.replace(
    /pick (\w+) (friendly|enemy) (unit) (within \d+..*), which (.*)/gm,
    'pick $1 $2 $3 $4. That unit, and all $2 $3 within 6" $5');

  skirmishText = skirmishText.replace(
    /(The|This) (hero|model) and (its|his|her) unit/gm,
    'This model and all friendly units within 12”');

  skirmishText = skirmishText.replace(
    /when attacking (the|this) (hero|model) and (its|his|her) unit/gm,
    'when attacking this model or any friendly unit within 12”');

  skirmishText = skirmishText.replace(
    /(this|the) (model|hero) and (its|his@her) unit/gm,
    'this model and all friendly units within 12”');

  skirmishText = skirmishText.replace(
    /If the hero is part of a unit of (.*), the unit counts/,
    'All friendly units of $1 within 12" count');

  return skirmishText;
}

export function skirmify(armyBook) {
  armyBook.units = armyBook.units.map((unit) => {
    const originalUnit = CalcHelper.normalizeUnit(unit);

    // we only recompute for units size > 1
    if (originalUnit.models > 1) {
      const cost = calc.unitCost({ ...originalUnit, models: 1 });

      if (cost >= 100) {
        // we discard this unit later
        unit.size = 1;
      } else if (cost < 15) {
        unit.size = 3;
      } else if (cost < 5) {
        unit.size = 5;
      } else {
        unit.size = 1;
      }

      // reset the new size to compute the final cost
      const adjustedUnit = { ...originalUnit, models: unit.size };
      unit.cost = CalcHelper.round(calc.unitCost(adjustedUnit));

      // We remove some common sufixes that do not make sense for unit size 1
      if (unit.size === 1) {
        // TODO better Prime Exceptions
        unit.name = unit.name.replace('Infiltration Squad', 'Infiltrator');
        unit.name = unit.name.replace('Assault Squad', 'Assault Prime Brother');
        unit.name = unit.name.replace('Blaster Squad', 'Blaster Prime Brother');
        unit.name = unit.name.replace('Guard Squad', 'Guardian');
        unit.name = unit.name.replace('Elimination Squad', 'Eliminator');
        unit.name = unit.name.replace('Eradication Squad', 'Eradicator');

        unit.name = unit.name.replace(' Squad', ''); // see HDF
        unit.name = unit.name.replace(' Squads', ''); // see HDF
        unit.name = unit.name.replace(' Mob', ''); // see Orc Marauders
        // unit.name = unit.name.replace(' Team', ''); // see Custodian Brothers
        unit.name = unit.name.replace(' Council', ''); // see High Elf Fleet
        unit.name = unit.name.replace(' Herd', ''); // see Orc Marauders

        // Pluralize according to unit size
        unit.name = pluralize(unit.name, unit.size);

        // Ensure unit equipment is named with the unit.size in mind
        unit.equipment = unit.equipment.map((weapon) => {
          const name = weapon.label || weapon.name;

          weapon.name = pluralize(name, unit.size);
          weapon.label = pluralize(name, unit.size);

          return weapon;
        });

        // restructure psychic units
        const psyRuleNames = armyBook.specialRules.filter(sr => sr.description.startsWith('This unit counts as having Psychic(1)')).map(sr => sr.name); // ['Seer Council']
        if (psyRuleNames.length > 0) {
          if (unit.size === 1) {
            const psyRuleIndex = unit.specialRules.findIndex(sr => psyRuleNames.includes(sr.name));
            if (psyRuleIndex >= 0) {
              unit.specialRules[psyRuleIndex] = {
                key: 'psychic',
                name: 'Psychic',
                rating: 1,
              };
            }
          }
        }
      }
    }

    // Little helper
    unit.equipment = unit.equipment.map((weapon) => {
      const name = weapon.label || weapon.name;
      weapon.name = name;
      weapon.label = name;
      return weapon;
    });

    // We assume, that for Skirmish, all units fit on a single page
    unit.splitPageNumber = 1;

    return unit;
  })
    .filter(unit => unit.cost < 100) // discard units with rounded cost >= 100
    .filter(unit => unit.specialRules.every(sr => sr.key !== 'artillery')) // discard units with rule 'artillery'
  ;

  // re-Sort units
  armyBook.units = unitService.sortUnitsSkirmish(armyBook.units);

  armyBook.specialRules = armyBook.specialRules.map((sr) => {
    // TODO check remaining exceptions
    sr.description = skirmifyRulesText(sr.description);
    return sr;
  });

  /**
   * UPGRADE PACKAGES
   *
   * - Merge sections that use the same units, making distinction obsolete
   * - Shrink section label
   * - Merge options with same label
   * - Discard sections where prerequisite it not met
   * - Recalculate cost
   * - Discard expensive options
   * - Discard empty options
   * - Discard empty sections
   * - Discard empty packages
   */

  /* TODO merge upgrade packages for same units
   * get all units with more than one upgrade package
   *
   */
  armyBook.units.map((unit) => {
    if (unit.upgrades.length > 1) {
      const otherUpgrades = armyBook.units.filter(unyt => unyt.id !== unit.id).flatMap(unyt => unyt.upgrades);
      const missing = unit.upgrades.every((upgrade) => {
        return !otherUpgrades.includes(upgrade);
      });
      if (missing) {
        console.warn('merge upgrades', unit.upgrades);
      } else {
        console.warn('all fine', unit.upgrades);
      }
    }
    return unit;
  });

  // Shrink names due to units with size 1
  armyBook.upgradePackages = armyBook.upgradePackages.map((pack) => {
    const usingUnits = armyBook.units.filter(unit => unit.upgrades.includes(pack.uid));
    const sizes = usingUnits.map(unit => unit.size);
    const maxSize = Math.max(...sizes);

    pack.sections = pack.sections.map((section) => {
      if (maxSize === 1) {
        // Check if we can remove "any"
        if (section.label.startsWith('Replace any')) {
          const armySection = ArmyBook.UpgradeSection.FromString(section.label);

          // currently we only check if the replace affects one weapon. might catch all cases
          if (armySection && armySection.lose.length === 1) {
            const remove = armySection.lose[0];

            // check that every unit having that weapon has a count of <= 1
            const onlySingleUses = usingUnits.every((unit) => {
              const unitEquip = unit.equipment.find((equipment) => {
                const name = equipment.label || equipment.name;
                console.info('### Checking ->', unit.name, 'having -> ', name);
                return name === remove;
              });
              if (unitEquip) {
                console.info('### ', unit.name, 'has', unitEquip.label, 'count', unitEquip.count);
                return !(unitEquip.count > 1);
              } else {
                return true;
              }
            });
            if (onlySingleUses) {
              // section.label = section.label.replace('Replace any', 'Replace');
              // ToDo disable all any
            }
          }
        }

        section.label = section.label.replace('Replace one', 'Replace');
        section.label = section.label.replace('Replace all', 'Replace');
        section.label = section.label.replace(/Replace up to \w+/, 'Replace any');
        section.label = section.label.replace(/Replace with up to \w+/, 'Replace');
        section.label = section.label.replace('Any model may replace', 'Replace');
        section.label = section.label.replace('Upgrade one model', 'Upgrade');
        section.label = section.label.replace('Upgrade all models', 'Upgrade');
        section.label = section.label.replace('Upgrade any model', 'Upgrade');
        section.label = section.label.replace('One model may take', 'Take');

        section.label = pluralize(section.label, 1);

        // TODO singlularize options
        section.options = section.options.map((option) => {
          option.gains = option.gains.map((gain) => {
            if (gain.type === 'ArmyBookWeapon') {
              // gain.name = pluralize.singular(gain.name);
            }
            return gain;
          });
          return option;
        });
      } else {
        section.label = section.label.replace(/Replace up to \w+/, 'Replace one');
        section.label = section.label.replace(/Replace with up to \w+/, 'Replace one');
      }

      return section;
    });

    // TODO discard upgrades without prerequisite

    // group by section label
    pack.sections = pack.sections.reduce((previousValue, currentValue) => {
      // Replace all
      // Replace any
      // Upgrade all models with
      // Upgrade all X with:

      const sameSectionIndex = previousValue.findIndex((section) => {
        if (section.label.startsWith('Upgrade with ')) {
          // We do not want to merge upgrades which have a limit like 'Upgrade with one'
          return false;
        }
        if (section.label.startsWith('Upgrade all models with')) {
          // We do not want to merge upgrades which have a limit like 'Upgrade with one'
          return false;
        }
        return section.label === currentValue.label;
      });

      if (sameSectionIndex >= 0) {
        const options = currentValue.options;
        // const existingOptions = previousValue[sameSectionIndex];
        previousValue[sameSectionIndex].options.push(...options);
      } else {
        previousValue.push(currentValue);
      }
      return previousValue;
    },
    []
    );

    return pack;
  });

  // Recalculate costs for upgrade packages
  armyBook.upgradePackages = armyBook.upgradePackages.map((pack) => {
    const usingUnits = armyBook.units.filter(unit => unit.upgrades.includes(pack.uid));
    const recalcedOptions = CalcHelper.recalculateUpgradePackage(armyBook.uid, pack, usingUnits, calc, {});
    for (const payload of recalcedOptions) {
      const { sectionIndex, optionIndex, option } = payload;
      pack.sections[sectionIndex].options[optionIndex] = option;
    }
    return pack;
  });

  // We remove upgrade options that cost >= 50
  armyBook.upgradePackages = armyBook.upgradePackages
    .map((pack) => {
      pack.sections = pack.sections.map((section) => {
        section.options = section.options.filter(option => option.cost < 50);
        return section;
      })
      // discard sections with options that are empty
        .filter(section => section.options.length > 0)
      // discard sections with add <> model -> Add one model with
        .filter(section => section.label.startsWith('Add one model with') === false);

      return pack;
    })
    .filter(pack => pack.sections.length > 0);

  // We remove upgrade references within units that are packages that are empty or gone
  const armyBookUpgrades = armyBook.upgradePackages.map(pack => pack.uid);
  armyBook.units = armyBook.units.map((unit) => {
    unit.upgrades = unit.upgrades.filter((upgrade) => {
      return armyBookUpgrades.includes(upgrade);
    });
    return unit;
  });

  armyBook.autogenerated = true;

  return armyBook;
}
