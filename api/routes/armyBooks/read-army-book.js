const { verifyRequest } = require('../authProvider');
const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { armyBookUid } = request.params;

  let userId = 0;
  try {
    const verification = verifyRequest(request);
    if (verification) {
      userId = verification.userId || 0;
    }
  } catch (e) {
  }

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
    'WHERE uid = $1 AND ( public = true OR user_id = $2 )',
    [ armyBookUid, userId ]
  );

  if (rows.length !== 1) {
    response.status(404).json({});
  } else {
    let armyBook = rows[0];
    // enrich unit missing splitPageNumber
    const units = armyBook.units.map(unit => {
      return {
        ...unit,
        splitPageNumber: parseInt(unit.splitPageNumber) || 1,
      }
    })
    response.set('Cache-Control', 'public, max-age=60'); // 1 minute
    response.status(200).json({...armyBook, units});
  }

}
