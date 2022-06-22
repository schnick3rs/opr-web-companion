// @ts-ignore
import {query} from '../config/database';
import {ISimpleGameSystem, ISpecialRule} from "../models/DbInterfaces";

export default class GameSystemService {

  public static async findAll(): Promise<ISimpleGameSystem[]> {
    let sql = `SELECT
        game_systems.id,
        game_systems.slug,
        game_systems.fullname,
        game_systems.universe,
        game_systems."portfolioLink",
        game_systems.shortname,
        game_systems.aberration,
        game_systems."armyBookBuilderEnabled",
        ab.army_book_count AS "officialArmyBookCount"
      FROM opr_companion.game_systems
        LEFT JOIN (
          SELECT game_system_id, count(*)::int AS army_book_count
          FROM (
            SELECT unnest(enabled_game_systems) as game_system_id
            FROM opr_companion.army_books
            WHERE army_books.official = true
            AND army_books.is_live = true
            AND army_books.public = true
          ) ef
          GROUP BY game_system_id
        ) AS ab ON ab.game_system_id = game_systems.id
      ORDER BY sort_order`;
    return await query(sql);
  }

  public static async findById(id: number): Promise<ISimpleGameSystem> {
    let sql = `SELECT
        game_systems.id,
        game_systems.slug,
        game_systems.fullname,
        game_systems.universe,
        game_systems."portfolioLink",
        game_systems.shortname,
        game_systems.aberration,
        game_systems."armyBookBuilderEnabled"
      FROM opr_companion.game_systems
      WHERE id = $1`;
    const rows = await query(sql, [id]);
    return rows[0];
  }

  public static async findBySlug(slug: String): Promise<ISimpleGameSystem> {
    let sql = `SELECT
        game_systems.id,
        game_systems.slug,
        game_systems.fullname,
        game_systems.universe,
        game_systems."portfolioLink",
        game_systems.shortname,
        game_systems.aberration,
        game_systems."armyBookBuilderEnabled"
      FROM opr_companion.game_systems
      WHERE slug = $1`;
    const rows = await query(sql, [slug]);
    return rows[0];
  }

  public static async findSpecialRules(slug: String): Promise<ISpecialRule[]> {
    let sql = `SELECT
        special_rules.*
      FROM opr_companion.game_systems
        INNER JOIN opr_companion.special_rules
          ON special_rules."gameSystemId" = game_systems.id
      WHERE slug = $1
      ORDER BY special_rules.name`;
    return await query(sql, [slug]);
  }
}
