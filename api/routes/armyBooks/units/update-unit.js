const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, unitId } = request.params;
  const unit = request.body;

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
      [unitId, `${JSON.stringify(unit)}`, armyBookUid, userId],
    );
    response.status(200).json(unit);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }

  response.status(200).json();
}
