import { pool } from '../../db';
import { nanoid } from 'nanoid';
import * as unitService from './units/unit-service';
import * as spellService from './spells/spell-service';
import * as upgradePackagesService from './upgradePackages/upgrade-packages-service';
import * as specialRulesService from './specialRules/special-rules-service';
import pluralize from "pluralize";
import { ArmyBook, CalcHelper } from "opr-army-book-helper";
import calc from "opr-point-calculator-lib";

/* CREATE */

export async function createArmyBook(userId, enabledGameSystems, name, hint, background) {
  try {
    const insert = await pool.query(
      'INSERT INTO opr_companion.army_books (uid, user_id, enabled_game_systems, name, hint, background) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING uid',
      [ nanoid(16), userId, enabledGameSystems, name, hint, background ],
    );
    const { uid } = insert.rows[0];
    const { rows } = await pool.query(
      'SELECT ' +
      'army_books.uid, ' +
      'army_books.enabled_game_systems AS "enabledGameSystems", ' +
      'army_books.name, ' +
      'army_books.hint, ' +
      'army_books.background, ' +
      'army_books.army_wide_rule AS "armyWideRule", ' +
      'army_books.units, ' +
      'army_books.upgrade_packages AS "upgradePackages", ' +
      'army_books.special_rules AS "specialRules", ' +
      'army_books.spells, ' +
      'army_books.version_string AS "versionString", ' +
      'army_books.cover_image_path AS "coverImagePath", ' +
      'army_books.cover_image_credit AS "coverImageCredit", ' +
      'army_books.official, ' +
      'army_books.public, ' +
      'army_books.is_live AS "isLive", ' +
      'army_books.modified_at AS "modifiedAt" ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1',
      [uid]
    );
    return rows[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

/* READ */

export async function getAll() {
  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.user_id AS "userId", ' +
    'army_books.enabled_game_systems AS "enabledGameSystems", ' +
    'army_books.name, ' +
    'army_books.hint, ' +
    'army_books.background, ' +
    'army_books.army_wide_rule AS "armyWideRule", ' +
    'army_books.units, ' +
    'army_books.upgrade_packages AS "upgradePackages", ' +
    'army_books.special_rules AS "specialRules", ' +
    'army_books.spells, ' +
    'army_books.modified_at AS "modifiedAt", ' +
    'army_books.official, ' +
    'army_books.public, ' +
    'army_books.version_string AS "versionString", ' +
    'army_books.cover_image_path AS "coverImagePath", ' +
    'army_books.cover_image_credit AS "coverImageCredit", ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.faction_name AS "factionName", ' +
    'army_books.faction_relation AS "factionRelation", ' +
    'user_accounts.username ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'ORDER BY army_books.name ASC',
    [],
  );
  return rows;
}

export async function getArmyBookForOwner(armyBookId, userId) {

  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.enabled_game_systems AS "enabledGameSystems", ' +
    'army_books.name, ' +
    'army_books.hint, ' +
    'army_books.background, ' +
    'army_books.army_wide_rule AS "armyWideRule", ' +
    'army_books.units, ' +
    'army_books.upgrade_packages AS "upgradePackages", ' +
    'army_books.special_rules AS "specialRules", ' +
    'army_books.spells, ' +
    'army_books.modified_at AS "modifiedAt", ' +
    'army_books.official, ' +
    'army_books.public, ' +
    'army_books.version_string AS "versionString", ' +
    'army_books.cover_image_path AS "coverImagePath", ' +
    'army_books.cover_image_credit AS "coverImageCredit", ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.faction_name AS "factionName", ' +
    'army_books.faction_relation AS "factionRelation", ' +
    'user_accounts.username ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'WHERE uid = $1 AND user_id = $2 ' +
    'ORDER BY army_books.name ASC',
    [ armyBookId, userId ]
  );

  if (rows.length !== 1) {
    console.error('More than one army book matches the query.');
    return null;
  } else {
    let armyBook = rows[0];
    // enrich unit missing splitPageNumber
    const units = armyBook.units.map(unit => {
      return {
        ...unit,
        splitPageNumber: parseInt(unit.splitPageNumber) || 1,
      }
    })
    return {...armyBook, units};
  }
}

export async function getPublicArmyBooksListView(gameSystemId = 0) {

  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.enabled_game_systems AS "enabledGameSystems", ' +
    'army_books.name, ' +
    'army_books.hint, ' +
    'army_books.background, ' +
    'army_books.army_wide_rule AS "armyWideRule", ' +
    'jsonb_array_length(army_books.units) AS "unitCount", ' +
    'jsonb_array_length(army_books.upgrade_packages) AS "upgradePackageCount", ' +
    'jsonb_array_length(army_books.special_rules) AS "specialRulesPackageCount", ' +
    'jsonb_array_length(army_books.spells) AS "spellCount", ' +
    'army_books.modified_at AS "modifiedAt", ' +
    'army_books.official, ' +
    'army_books.version_string AS "versionString", ' +
    'army_books.cover_image_path AS "coverImagePath", ' +
    'army_books.cover_image_credit AS "coverImageCredit", ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.faction_name AS "factionName", ' +
    'army_books.faction_relation AS "factionRelation", ' +
    'user_accounts.username ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'WHERE army_books.public = true ' +
    'AND (army_books.enabled_game_systems @> $1 OR $2)' +
    'ORDER BY army_books.name ASC',
    [[gameSystemId], gameSystemId === 0]
  );
  return rows;
}

export async function getArmyBookPublicOrOwner(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.enabled_game_systems AS "enabledGameSystems", ' +
    'army_books.name, ' +
    'army_books.hint, ' +
    'army_books.background, ' +
    'army_books.army_wide_rule AS "armyWideRule", ' +
    'army_books.units, ' +
    'army_books.upgrade_packages AS "upgradePackages", ' +
    'army_books.special_rules AS "specialRules", ' +
    'army_books.spells, ' +
    'army_books.modified_at AS "modifiedAt", ' +
    'army_books.official, ' +
    'army_books.public, ' +
    'army_books.version_string AS "versionString", ' +
    'army_books.cover_image_path AS "coverImagePath", ' +
    'army_books.cover_image_credit AS "coverImageCredit", ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.faction_name AS "factionName", ' +
    'army_books.faction_relation AS "factionRelation", ' +
    'user_accounts.username ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'WHERE uid = $1 AND ( public = true OR user_id = $2 )',
    [ armyBookUid, userId ]
  );

  if (rows.length === 0) {
    console.info(`No entry found for armyBook=${armyBookUid} and user=${userId}.`);
    return null;
  }

  if (rows.length > 1) {
    console.error(`Query returned ${rows.length} entries but expected 1.`);
    return null;
  }

  let armyBook = rows[0];

  // enrich unit missing splitPageNumber
  armyBook.units = armyBook.units.map(unit => {
    return {
      ...unit,
      splitPageNumber: parseInt(unit.splitPageNumber) || 1,
    }
  })

  return armyBook;
}

export async function getAllByUserId(userId) {
  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.enabled_game_systems AS "enabledGameSystems", ' +
    'army_books.name, ' +
    'army_books.hint, ' +
    'army_books.background, ' +
    'army_books.army_wide_rule AS "armyWideRule", ' +
    'jsonb_array_length(army_books.units) AS "unitCount", ' +
    'jsonb_array_length(army_books.upgrade_packages) AS "upgradePackageCount", ' +
    'jsonb_array_length(army_books.special_rules) AS "specialRulesPackageCount", ' +
    'jsonb_array_length(army_books.spells) AS "spellCount", ' +
    'army_books.modified_at AS "modifiedAt", ' +
    'army_books.official, ' +
    'army_books.public, ' +
    'army_books.version_string AS "versionString", ' +
    'army_books.cover_image_path AS "coverImagePath", ' +
    'army_books.cover_image_credit AS "coverImageCredit", ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.faction_name AS "factionName", ' +
    'army_books.faction_relation AS "factionRelation" ' +
    'FROM opr_companion.army_books ' +
    'WHERE user_id = $1 ' +
    'ORDER BY army_books.name ASC',
    [userId]
  );
  return rows;
}

export async function getSimpleArmyBook(armyBookId) {
  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.user_id AS "userId", ' +
    'army_books.name, ' +
    'army_books.official, ' +
    'army_books.public, ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.version_string AS "versionString", ' +
    'user_accounts.username ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'WHERE uid = $1',
    [ armyBookId ]
  );
  return rows[0];
}

export async function addUnit(armyBookUid, userId, unit) {
  await unitService.addUnit(armyBookUid, userId, unit);
}

export async function setUnits(armyBookUid, userId, units) {
  await unitService.updateUnits(armyBookUid, userId, units);
}

export async function setSpells(armyBookUid, userId, spells) {
  await spellService.updateSpells(armyBookUid, userId, spells);
}

export async function setUpgradePackages(armyBookUid, userId, upgradePackages) {
  await upgradePackagesService.updateUpgradePackages(armyBookUid, userId, upgradePackages);
}

export async function getUnit(armyBookUid, userId, unitId) {
  return await unitService.getUnit(armyBookUid, unitId, unitId);
}

export async function updateUnit(armyBookUid, userId, unitId, unit) {
  await unitService.updateUnit(armyBookUid, unitId, unit, userId);
}

export async function addUpgradePackage(armyBookUid, userId, upgradePackage) {
  await upgradePackagesService.addUpgradePackage(armyBookUid, userId, upgradePackage);
}

export async function getUpgradePackages(armyBookUid, userId) {
  return await upgradePackagesService.getUpgradePackages(armyBookUid, userId);
}

export async function addSpecialRule(armyBookUid, userId, specialRule) {
  return await specialRulesService.addSpecialRule(armyBookUid, userId, specialRule);
}

export async function getSpecialRules(armyBookUid, userId) {
  return await specialRulesService.getSpecialRules(armyBookUid, userId);
}

export async function setSpecialRules(armyBookUid, userId, specialRules) {
  await specialRulesService.updateSpecialRules(armyBookUid, userId, specialRules)
}

export async function deleteArmyBook(armyBookId, userId) {
  await pool.query(
    'DELETE FROM opr_companion.army_books WHERE uid = $1 AND user_id = $2',
    [armyBookId, userId]
  );
}

export async function updateArmyBook(armyBookUid, userId, fields, values) {
  console.info(fields, values)
  await pool.query(
    'UPDATE opr_companion.army_books SET ' +
    fields.join(',') +
    ' WHERE uid = $'+(1+fields.length)+' AND user_id = $'+(2+fields.length)+' ',
    [...values, armyBookUid, userId],
  );
}

// https://stackoverflow.com/questions/39573219/can-i-store-a-word-document-in-a-postgresql-database
export async function savePdfA4(armyBookUid, data, timestamp, service = 'unknown') {
  await pool.query(
    'INSERT INTO opr_companion.army_books_pdfs (army_book_uid, pdf_a4, pdf_a4_created_at, service) ' +
    'VALUES ($1, $2::bytea, $3, $4) ' +
    'ON CONFLICT (army_book_uid) DO '+
    'UPDATE SET pdf_a4 = $2::bytea, pdf_a4_created_at = $3, service = $4',
    [armyBookUid, data, timestamp, service],
  );
}

export async function readPdfA4(armyBookUid) {
  const { rows } = await pool.query(
    'SELECT ' +
    'army_books_pdfs.pdf_a4 AS "byteArray", ' +
    'army_books_pdfs.pdf_a4_created_at AS "createdAt" ' +
    'FROM opr_companion.army_books_pdfs ' +
    'WHERE army_books_pdfs.army_book_uid = $1 ',
    [armyBookUid],
  );
  return rows[0]
}

export async function readPdfLetter(armyBookUid) {
  const { rows } = await pool.query(
    'SELECT army_books_pdfs.pdf_letter AS "pdf" ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.army_books_pdfs ON army_books.uid = army_books_pdfs.army_book_uid ' +
    'WHERE uid = $1 ' +
    'AND army_books.modified_at::timestamp(0) = army_books_pdfs.pdf_letter_created_at::timestamp(0) ',
    [armyBookUid],
  );
  return rows[0]?.pdf;
}

export function skirmify(armyBook) {

  pluralize.addSingularRule(/Spear-Fuses$/, 'Spear-Fuse'); // see Custodian Brothers
  pluralize.addSingularRule(/Fuses$/, 'Fuse'); // see Custodian Brothers
  pluralize.addSingularRule(/Axes$/, 'Axe'); // see Dwaves
  pluralize.addSingularRule(/Claws$/, 'Claws'); // See Alien Hives and other bestials
  pluralize.addSingularRule(/Martial Arts$/, 'Martial Arts'); // See ED
  pluralize.addPluralRule(/Squads$/, 'Squad'); // See HDF and others
  pluralize.addPluralRule(/CCW$/, 'CCWs'); // See all the armies

  armyBook.units = armyBook.units.map(unit => {

    let originalUnit = CalcHelper.normalizeUnit(unit);

    // we only recompute for units size > 1
    if (originalUnit.models > 1) {

      const cost = calc.unitCost({...originalUnit, models: 1});

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
      const adjustedUnit = {...originalUnit, models: unit.size};
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
        //unit.name = unit.name.replace(' Team', ''); // see Custodian Brothers
        unit.name = unit.name.replace(' Council', ''); // see High Elf Fleet
        unit.name = unit.name.replace(' Herd', ''); // see Orc Marauders

        // Pluralize according to unit size
        unit.name = pluralize(unit.name, unit.size);

        // Ensure unit equipment is named with the unit.size in mind
        unit.equipment = unit.equipment.map(weapon => {
          const name = weapon.label || weapon.name;

          weapon.name = pluralize(name, unit.size);
          weapon.label = pluralize(name, unit.size);

          return weapon;
        });

        // restructure psychic units
        const psyRuleNames = armyBook.specialRules.filter(sr => sr.description.startsWith('This unit counts as having Psychic(1)')).map(sr => sr.name); // ['Seer Council']
        if (psyRuleNames.length > 0) {
          if (unit.size === 1) {
            const psyRuleIndex = unit.specialRules.findIndex(sr => psyRuleNames.some(psyRule => sr.name === psyRule));
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
    unit.equipment = unit.equipment.map(weapon => {
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

  armyBook.specialRules = armyBook.specialRules.map(sr => {
    // TODO check remaining exceptions

    sr.description = sr.description.replace(
      'The hero and its unit get the Ambush special rule.',
      'The hero and up to half of its army get the Ambush special rule (must deploy within 3” of the hero).'); // see RL

    sr.description = sr.description.replace(
      'Whenever the hero’s unit fails a morale test, you must kill one of its models, and the morale test counts as passed instead.',
      'Whenever a friendly unit within 12" fails a morale test, you must kill one friendly model within 12", and then all friendly units within 12" of the killed model automatically pass morale tests until the end of the round.'); // see HDF

    sr.description = sr.description.replace(
      /pick (\w+) (friendly|enemy) (units) (within \d+..*), which (.*)/gm,
      `pick $1 $2 $3 $4. Those units, and all $2 $3 within 6" $5`);

    sr.description = sr.description.replace(
      /pick (\w+) (friendly|enemy) (unit) (within \d+..*), which (.*)/gm,
      `pick $1 $2 $3 $4. That unit, and all $2 $3 within 6" $5`);

    sr.description = sr.description.replace(
      'The hero and its unit',
      'This model and all friendly units within 12”');

    sr.description = sr.description.replace(
      'his model and its unit',
      'his model and all friendly units within 12”');

    sr.description = sr.description.replace(
      'The model and its unit',
      'This model and all friendly units within 12”');

    sr.description = sr.description.replace(
      /If the hero is part of a unit of (.*), the unit counts/,
      'All friendly units of $1 within 12" count');
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
  armyBook.units.map(unit => {
    if (unit.upgrades.length > 1) {
      const otherUpgrades = armyBook.units.filter(unyt => unyt.id !== unit.id).flatMap(unyt => unyt.upgrades);
      const missing = unit.upgrades.every(upgrade => {
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
  armyBook.upgradePackages = armyBook.upgradePackages.map(pack => {
    const usingUnits = armyBook.units.filter(unit => unit.upgrades.includes(pack.uid));
    const sizes = usingUnits.map(unit => unit.size);
    const maxSize = Math.max(...sizes);

    pack.sections = pack.sections.map(section => {

      if (maxSize === 1) {

        // Check if we can remove "any"
        if (section.label.startsWith('Replace any')) {

          const armySection = ArmyBook.UpgradeSection.FromString(section.label);

          // currently we only check if the replace affects one weapon. might catch all cases
          if (armySection && armySection.lose.length === 1) {
            const remove = armySection.lose[0];

            // check that every unit having that weapon has a count of <= 1
            const onlySingleUses = usingUnits.every(unit => {
              const unitEquip = unit.equipment.find(equipment => {
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
              //section.label = section.label.replace('Replace any', 'Replace');
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
        section.options = section.options.map(option => {
          option.gains = option.gains.map(gain => {
            if (gain.type === 'ArmyBookWeapon') {
              //gain.name = pluralize.singular(gain.name);
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

        let sameSectionIndex = previousValue.findIndex((section) => {
          if (section.label.startsWith('Upgrade with ') ) {
            // We do not want to merge upgrades which have a limit like 'Upgrade with one'
            return false;
          }
          return section.label === currentValue.label
        });

        if (sameSectionIndex >= 0) {
          let options = currentValue.options;
          let existingOptions = previousValue[sameSectionIndex];
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
  armyBook.upgradePackages = armyBook.upgradePackages.map(pack => {
    const usingUnits = armyBook.units.filter(unit => unit.upgrades.includes(pack.uid));
    const recalcedOptions = CalcHelper.recalculateUpgradePackage(armyBook.uid, pack, usingUnits, calc, {});
    for (const payload of recalcedOptions) {
      const { upgradePackageUid, sectionIndex, optionIndex, option} = payload;
      pack.sections[sectionIndex].options[optionIndex] = option;
    }
    return pack;
  });

  // We remove upgrade options that cost >= 50
  armyBook.upgradePackages = armyBook.upgradePackages
    .map(pack => {
      pack.sections = pack.sections.map(section => {
        section.options = section.options.filter(option => option.cost < 50);
        return section;
      })
        // discard sections with options that are empty
        .filter(section => section.options.length > 0)
        // discard sections with add <> model -> Add one model with
        .filter(section => section.label.startsWith('Add one model with') === false);

      return pack;
    });

  armyBook.autogenerated = true;

  return armyBook;
}
