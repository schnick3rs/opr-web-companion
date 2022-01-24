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

export async function getGameSystemSpecialRules(slug) {
  try {
    const { rows } = await pool.query(
      'SELECT ' +
      'special_rules.* ' +
      'FROM opr_companion.game_systems ' +
      'INNER JOIN opr_companion.special_rules ON special_rules."gameSystemId" = game_systems.id ' +
      'WHERE slug = $1 ' +
      'ORDER BY special_rules.name ASC',
      [slug]
    );
    return rows;
  } catch (e) {
    console.error(e.message);
  }
}
