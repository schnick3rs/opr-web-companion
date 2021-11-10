const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT spells ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1 AND user_id = $2',
      [ armyBookUid, userId ],
    );
    console.info(rows)
    response.status(200).json(rows[0].spells);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
