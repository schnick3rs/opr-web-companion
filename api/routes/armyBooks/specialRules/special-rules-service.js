import { pool } from '../../../db';

export async function addSpecialRule(armyBookUid, userId, specialRule) {
  await pool.query(
    'UPDATE opr_companion.army_books SET special_rules = special_rules || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(specialRule)}]`, armyBookUid, userId],
  );
  return specialRule;
}

export async function getSpecialRule(armyBookUid, userId, specialRulesId) {
  const { rows } = await pool.query(
    'SELECT special_rules AS "specialRules" ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].specialRules.find(specialRules => specialRules.id === specialRulesId);
}

export async function getSpecialRules(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT special_rules AS "specialRules" ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].specialRules;
}

export async function updateSpecialRule(armyBookUid, userId, specialRulesId, specialRules) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET special_rules = jsonb_set( ' +
    'special_rules, ' +
    'array[( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(special_rules) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text], ' +
    '$2::jsonb) ' +
    'WHERE uid = $3 AND user_id = $4',
    [specialRulesId, `${JSON.stringify(specialRules)}`, armyBookUid, userId],
  );
}

export async function updateSpecialRules(armyBookUid, userId, specialRules) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET special_rules = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(specialRules)}`, armyBookUid, userId],
  );
}

export async function deleteSpecialRule(armyBookUid, userId, specialRulesId) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET special_rules = special_rules #- ' +
    'array( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(special_rules) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text[] ' +
    'WHERE uid = $2 AND user_id = $3',
    [ specialRulesId, armyBookUid, userId ],
  );
}
