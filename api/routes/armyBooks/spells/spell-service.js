import { pool } from '../../../db';


export async function addSpell(armyBookUid, userId, spell) {
  await pool.query(
    'UPDATE opr_companion.army_books SET spells = spells || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(spell)}]`, armyBookUid, userId],
  );
  return spell;
}

export async function getSpell(armyBookUid, userId, spellUid) {
  const { rows } = await pool.query(
    'SELECT spells ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].spells.find(spell => spell.id === spellUid);
}

export async function getSpells(armyBookUid, userId) {
  const { rows } = await pool.query(
    'SELECT spells ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].spells;
}

export async function updateSpell(armyBookUid, userId, spellUid, spell) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET spells = jsonb_set( ' +
    'spells, ' +
    'array[( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(spells) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text], ' +
    '$2::jsonb) ' +
    'WHERE uid = $3 AND user_id = $4',
    [spellUid, `${JSON.stringify(spell)}`, armyBookUid, userId],
  );
}

export async function updateSpells(armyBookUid, userId, spells) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET spells = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(spells)}`, armyBookUid, userId],
  );
}

export async function deleteSpell(armyBookUid, userId, spellUid) {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET spells = spells #- ' +
    'array( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(spells) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text[] ' +
    'WHERE uid = $2 AND user_id = $3',
    [ spellUid, armyBookUid, userId ],
  );
}

