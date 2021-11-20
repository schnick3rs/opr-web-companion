const { pool } = require('../../db');

const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 16);

async function createArmyBook(userId, gameSystemId, name, hint, background) {
  try {
    const insert = await pool.query(
      'INSERT INTO opr_companion.army_books (uid, user_id, game_system_id, name, hint, background) ' +
      'VALUES ($1, $2, $3, $4, $5, $6) RETURNING uid',
      [ nanoid(), userId, gameSystemId, name, hint, background ],
    );
    const { uid } = insert.rows[0];
    const { rows } = await pool.query(
      'SELECT ' +
      'army_books.uid, ' +
      'army_books.game_system_id AS "gameSystemId", ' +
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
      'army_books.modified_at AS "modifiedAt", ' +
      'game_systems.slug "gameSystemSlug", ' +
      'game_systems.shortname "gameSystemShortname", ' +
      'game_systems.aberration ' +
      'FROM opr_companion.army_books ' +
      'INNER JOIN opr_companion.game_systems ON army_books.game_system_id = game_systems.id ' +
      'WHERE uid = $1',
      [uid]
    );
    return rows[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function getAllPublicArmyBooks() {

  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.game_system_id AS "gameSystemId", ' +
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
    'user_accounts.username, ' +
    'game_systems.slug "gameSystemSlug", ' +
    'game_systems.fullname, ' +
    'game_systems.aberration, ' +
    'game_systems.universe, ' +
    'game_systems.shortname ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'INNER JOIN opr_companion.game_systems ON army_books.game_system_id = game_systems.id ' +
    'WHERE army_books.public = true ' +
    'ORDER BY army_books.name ASC'
  );
  return rows;
}

async function getArmyBooksByGameSystem(slug) {

  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.game_system_id AS "gameSystemId", ' +
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
    'user_accounts.username, ' +
    'game_systems.slug "gameSystemSlug", ' +
    'game_systems.fullname, ' +
    'game_systems.aberration, ' +
    'game_systems.universe, ' +
    'game_systems.shortname ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'INNER JOIN opr_companion.game_systems ON army_books.game_system_id = game_systems.id ' +
    'WHERE army_books.public = true ' +
    'AND game_systems.slug = $1 ' +
    'ORDER BY army_books.name ASC',
    [slug]
  )

  return rows;
}

async function getArmyBook(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.game_system_id AS "gameSystemId", ' +
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
    'army_books.is_live AS "isLive", ' +
    'army_books.version_string AS "versionString", ' +
    'army_books.cover_image_path AS "coverImagePath", ' +
    'army_books.cover_image_credit AS "coverImageCredit", ' +
    'army_books.faction_name AS "factionName", ' +
    'army_books.faction_relation AS "factionRelation", ' +
    'user_accounts.username, ' +
    'game_systems.slug "gameSystemSlug", ' +
    'game_systems.fullname, ' +
    'game_systems.aberration, ' +
    'game_systems.universe, ' +
    'game_systems.shortname ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'INNER JOIN opr_companion.game_systems ON army_books.game_system_id = game_systems.id ' +
    'WHERE uid = $1 AND ( public = true OR user_id = $2 )',
    [ armyBookUid, userId ]
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

async function addUnit(armyBookUid, userId, unit) {
  await pool.query(
    'UPDATE opr_companion.army_books SET units = units || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(unit)}]`, armyBookUid, userId],
  );
}

async function setUnits(armyBookUid, userId, units) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET units = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(units)}`, armyBookUid, userId],
  );
}

/**
 *
 * @param {String} armyBookUid
 * @param {number} userId
 * @param {String} unitId
 * @returns {Promise<*>}
 */
async function getUnit(armyBookUid, userId, unitId) {
  const { rows } = await pool.query(
    'SELECT units ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND ( public = true OR user_id = $2 )',
    [ armyBookUid, userId ],
  );
  return rows[0].units.filter(unit => unit.id === unitId)[0];
}

async function updateUnit(armyBookUid, userId, unitId, unit) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET units = jsonb_set( ' +
    'units, ' +
    'array[( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(units) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text], ' +
    '$2::jsonb) ' +
    'WHERE uid = $3 AND user_id = $4',
    [unitId, `${JSON.stringify(unit)}`, armyBookUid, userId],
  );
}

async function setUpgradePackages(armyBookUid, userId, upgradePackages) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET upgrade_packages = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(upgradePackages)}`, armyBookUid, userId],
  );
}

async function addUpgradePackage(armyBookUid, userId, upgradePackage) {
  await pool.query(
    'UPDATE opr_companion.army_books SET upgrade_packages = upgrade_packages || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(upgradePackage)}]`, armyBookUid, userId],
  );
}

async function getUpgradePackages(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT upgrade_packages AS "upgradePackages" ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND ( public = true OR user_id = $2 )',
    [ armyBookUid, userId ],
  );
  return rows[0].upgradePackages;
}


async function addSpecialRule(armyBookUid, userId, specialRule) {
  await pool.query(
    'UPDATE opr_companion.army_books SET special_rules = special_rules || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(specialRule)}]`, armyBookUid, userId],
  );
}

async function getSpecialRules(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT special_rules AS "specialRules" ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND ( public = true OR user_id = $2 )',
    [ armyBookUid, userId ],
  );
  return rows[0].specialRules;
}

async function setSpecialRules(armyBookUid, userId, specialRules) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET special_rules = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(specialRules)}`, armyBookUid, userId],
  );
}

module.exports = {
  createArmyBook,
  getArmyBook,
  setUnits,
  addUnit,
  getUnit,
  updateUnit,
  addUpgradePackage,
  setUpgradePackages,
  getUpgradePackages,
  addSpecialRule,
  setSpecialRules,
  getSpecialRules,
  getAllPublicArmyBooks,
  getArmyBooksByGameSystem,
};
