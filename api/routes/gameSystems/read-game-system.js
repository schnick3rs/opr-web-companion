const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { slug } = request.params;

  const { rows } = await pool.query(
    'SELECT ' +
      'game_systems.id, ' +
      'game_systems.slug, ' +
      'game_systems.fullname, ' +
      'game_systems.universe, ' +
      'game_systems."portfolioLink", ' +
      'game_systems.shortname, ' +
      'game_systems."armyBookBuilderEnabled" ' +
    'FROM opr_companion.game_systems ' +
    'WHERE slug = $1',
    [slug]
  );

  if (rows.length !== 1) {
    response.status(404).json();
  } else {
    let armyBook = rows[0];

    response.set('Cache-Control', 'public, max-age=3600');
    response.status(200).json(armyBook);
  }

}
