const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const units = request.body;

  try {
    await pool.query(
      'UPDATE opr_companion.army_books ab SET units = $1 ' +
      'WHERE uid = $2 AND user_id = $3',
      [`${JSON.stringify(units)}`, armyBookUid, userId],
    );

    response.status(200).json(units);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
