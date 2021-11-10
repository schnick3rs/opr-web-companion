const { verifyRequest } = require('../authProvider');
const { pool } = require('../../db');

module.exports = async (request, response) => {

  const { userId } = verifyRequest(request);

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
    'WHERE user_id = $1 ' +
    'ORDER BY army_books.name ASC',
    [userId]
  );

  response.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  response.status(200).json(rows);
}
