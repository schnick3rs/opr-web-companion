const { pool } = require('../../db');

module.exports = async (request, response) => {

  const { rows } = await pool.query(
    'SELECT ' +
      'game_systems.id, ' +
      'game_systems.slug, ' +
      'game_systems.fullname, ' +
      'game_systems.universe, ' +
      'game_systems."portfolioLink", ' +
      'game_systems.shortname, ' +
      'game_systems.aberration, ' +
      'game_systems."armyBookBuilderEnabled" ' +
    'FROM opr_companion.game_systems ' +
    'ORDER BY sort_order ASC '
  );

  response.set('Cache-Control', 'public, max-age=3600'); // 1h
  response.status(200).json(rows);
}
