const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const spell = request.body;

  try {
    await pool.query(
      'UPDATE opr_companion.army_books SET spells = spells || $1::jsonb WHERE uid = $2 AND user_id = $3',
      [`[${JSON.stringify(spell)}]`, armyBookUid, userId],
    );
    response.status(200).json(spell);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
