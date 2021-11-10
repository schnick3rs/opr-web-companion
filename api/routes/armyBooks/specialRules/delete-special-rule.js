const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, specialRuleUid } = request.params;

  try {
    await pool.query(
      'UPDATE opr_companion.army_books ab SET special_rules = special_rules #- ' +
      'array( ' +
      'SELECT ordinality::int-1 ' +
      'FROM opr_companion.army_books tempy, jsonb_array_elements(special_rules) with ordinality ' +
      'WHERE ab.uid = tempy.uid AND value->>\'id\' = $1 ' +
      ')::text[] ' +
      'WHERE uid = $2 AND user_id = $3',
      [ specialRuleUid, armyBookUid, userId ],
    );
    response.status(204).json();
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
