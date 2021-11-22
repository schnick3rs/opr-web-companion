import { pool } from '../../../db';
import { nanoid } from 'nanoid';

export const generateUnitId = () => {
  return nanoid(9);
};

const unitHasHero = (unit) => {
  return unit.specialRules.some(sr => sr.key === 'hero');
}

const unitHasTough = (unit) => {
  return unit.specialRules.some(sr => sr.key === 'tough');
}

export const sortUnits = (units) => {
  const unitz = [...units];
  unitz.sort((a, b) => {

    // sort by IS HERO
    if (unitHasHero(a) && !unitHasHero(b)) return -1;
    if (!unitHasHero(a) && unitHasHero(b)) return 1;

    if (unitHasHero(a)) {
      if (a.cost > b.cost) return -1;
      if (a.cost < b.cost) return 1;

      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    } else {
      // sort squads from single non heros
      if (a.size > 1 && b.size <= 1) return -1;
      if (a.size <= 1 && b.size > 1) return 1;

      if (unitHasTough(a) && !unitHasTough(b)) return 1;
      if (!unitHasTough(a) && unitHasTough(b)) return -1;

      if (a.cost > b.cost) return -1;
      if (a.cost < b.cost) return 1;

      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    }
  });
  return unitz;
}

export const addUnit = async (armyBookUid, userId, unit) => {
  await pool.query(
    'UPDATE opr_companion.army_books SET units = units || $1::jsonb WHERE uid = $2 AND user_id = $3',
    [`[${JSON.stringify(unit)}]`, armyBookUid, userId],
  );
  return unit;
}

export const getUnits = async (armyBookUid, userId) => {
  const { rows } = await pool.query(
    'SELECT units ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows ? rows[0].units : null;
}

export const getUnit = async (armyBookUid, unitId, userId) => {
  const { rows } = await pool.query(
    'SELECT units ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  return rows[0].units.find(unit => unit.id === unitId);
}

export const updateUnit = async(armyBookUid, unitId, unit, userId) => {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET units = jsonb_set( ' +
    'units, ' +
    'array[( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(units) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text], ' +
    '$2::jsonb) ' +
    'WHERE uid = $3 AND user_id = $4',
    [unitId, `${JSON.stringify(unit)}`, armyBookUid, userId],
  );
}

export const updateUnits = async(armyBookUid, userId, units) => {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET units = $1 ' +
    'WHERE uid = $2 AND user_id = $3',
    [`${JSON.stringify(units)}`, armyBookUid, userId],
  );
}

export const deleteUnit = async(armyBookUid, unitId, userId) => {
  await pool.query(
    'UPDATE opr_companion.army_books ab SET units = units #- ' +
    'array( ' +
    'SELECT ordinality::int-1 ' +
    'FROM opr_companion.army_books tempy, jsonb_array_elements(units) with ordinality ' +
    'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
    ')::text[] ' +
    'WHERE uid = $2 AND user_id = $3',
    [ unitId, armyBookUid, userId ],
  );
}
