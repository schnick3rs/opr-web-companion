const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');
const { getUserByUuid } = require('../../auth/user-account-service');
const { normalizeUnit, round } = require('../point-calculator-service');

module.exports = async (request, response) => {
  const { userId, userUuid } = verifyRequest(request);
  const { isOpa, isAdmin }  = await getUserByUuid(userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid, unitId } = request.params;

  const { rows } = await pool.query(
    'SELECT units ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  const unit = rows[0].units.filter(unit => unit.id === unitId)[0];

  if (unit) {
    const normalizedUnit = normalizeUnit(unit);
    /*
    let report = await calc.post('unit', { json: { unit: normalizedUnit }}).json();
    if (report && report.cost > 0) {
      const rawCost = report.cost;
      const cost = round(report.cost);
      const recalculatedUnit = {
        ...unit,
        cost,
        rawCost,
      };

      try {
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
          [unitId, `${JSON.stringify(recalculatedUnit)}`, armyBookUid, userId],
        );
        response.status(200).json(recalculatedUnit);
      } catch (e) {
        console.error(e);
        response.status(400).json({message: `Could not update unit#${unit.id}`});
      }
    }
     */
  } else {
    response.status(400).json({});
  }
}
