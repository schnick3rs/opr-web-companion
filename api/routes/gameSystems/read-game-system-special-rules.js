const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { slug } = request.params;

  const { rows } = await pool.query(
    'SELECT ' +
      'game_special_rules.* ' +
    'FROM opr_companion.game_systems ' +
    'INNER JOIN opr_companion.game_special_rules ON game_special_rules."gameSystemId" = game_systems.id ' +
    'WHERE slug = $1 ' +
    'ORDER BY game_special_rules.name ASC',
    [slug]
  );

  response.set('Cache-Control', 'public, max-age=3600');
  response.status(200).json(rows);
}
