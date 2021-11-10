const { customAlphabet, nanoid } = require('nanoid');
const nanoid16 = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 16)
let { pluralize } = require('pluralize');

const { verifyRequest } = require('../authProvider');
const { getUserByUuid } = require('../auth/user-account-service');
const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { userId, userUuid } = verifyRequest(request);
  const { isOpa, isAdmin }  = await getUserByUuid(userUuid);

  // only admins are allowed to upload
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  let {
    name,
    hint,
    gameSystemId,
    background,
    versionString,
    units,
    upgradePackages,
    spells,
    specialRules,
    official,
    costModeAutomatic,
  } = request.body;

  // make all units match the requested cost mode
  units = units.map(unit => {
    unit.costMode = costModeAutomatic ? 'automatic' : 'manually';
    unit.costModeAutomatic = costModeAutomatic;

    unit.equipment.forEach((gear, index) => {
      gear.name = gear.name || gear.label; // AF use label, but we use name
      //gear.name = pluralize.singular(gear.name); // we singularize any name
      gear.id = nanoid(5);
      if (gear.count && gear.count > 1 && !isNaN(gear.count)) {
        const count = gear.count;
        delete gear.count;
        for (let i = 1; i < count; i++) {
          let duplicate = {
            ...gear,
            id: nanoid(5),
          }
          unit.equipment.push(duplicate);
        }
      }
    });

    unit.equipment.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    });

    return unit;
  })

  try {
    const insert = await pool.query(
      'INSERT INTO opr_companion.army_books (uid, user_id, game_system_id, name, hint, background, version_string, units, upgrade_packages, spells, special_rules, official) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11::jsonb, $12) RETURNING uid',
      [
        nanoid16(),
        userId,
        gameSystemId,
        name,
        hint,
        background,
        versionString,
        `${JSON.stringify(units)}`,
        `${JSON.stringify(upgradePackages)}`,
        `${JSON.stringify(spells)}`,
        `${JSON.stringify(specialRules)}`,
        official,
      ],
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
      'army_books.public, ' +
      'army_books.version_string AS "versionString", ' +
      'army_books.cover_image_path AS "coverImagePath", ' +
      'army_books.cover_image_credit AS "coverImageCredit", ' +
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
    const armyBook = rows[0];
    response.status(200).json(armyBook);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
