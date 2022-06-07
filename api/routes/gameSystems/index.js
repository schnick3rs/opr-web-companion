import Router from 'express-promise-router';
import * as gameSystemService from './game-system-service';
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
      'game_systems."armyBookBuilderEnabled", ' +
      'ab.army_book_count AS "officialArmyBookCount" ' +
      'FROM opr_companion.game_systems ' +
      'LEFT JOIN (' +
        'SELECT game_system_id, count(*)::int AS army_book_count ' +
        'FROM ( ' +
          'SELECT unnest(enabled_game_systems) as game_system_id ' +
          'FROM opr_companion.army_books ' +
          'WHERE army_books.official = true ' +
          'AND army_books.is_live = true ' +
          'AND army_books.public = true ' +
        ') ef ' +
        'GROUP BY game_system_id ' +
      ') AS ab ON ab.game_system_id = game_systems.id ' +
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
    'game_systems.aberration, ' +
    'game_systems."armyBookBuilderEnabled" ' +
    'FROM opr_companion.game_systems ' +
    'WHERE slug = $1',
    [slug]
  );

  if (rows.length !== 1) {
    response.status(404).json();
  } else {
    const armyBook = rows[0];

    response.set('Cache-Control', 'public, max-age=3600');
    response.status(200).json(armyBook);
  }
});

router.get('/:slug/special-rules', async (request, response) => {
  const { slug } = request.params;

  const rules = await gameSystemService.getGameSystemSpecialRules(slug);

  response.set('Cache-Control', 'public, max-age=3600');
  response.status(200).json(rules);
});

export default router;
