import Router from 'express-promise-router';
const { pool } = require('../../db');

const router = new Router();

router.get('/', async (request, response) => {

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
);

router.get('/:slug', async (request, response) => {
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

});

router.get('/:slug/special-rules', async (request, response) => {
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
});

export default router;
