const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, unitId } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT units ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1 AND user_id = $2',
      [ armyBookUid, userId ],
    );
    const unit = rows[0].units.filter(unit => unit.id === unitId);
    if (unit.length === 1) {
      response.status(200).json(...unit);
    } else {
      response.status(404).json();
    }
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
