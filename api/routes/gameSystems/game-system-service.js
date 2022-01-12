import { pool } from '../../db';

export async function getGameSystemBySlug(slug) {
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

  return rows[0];
}

export async function getGameSystemById(id) {

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
    'WHERE id = $1',
    [id]
  );
  return rows[0];
}
