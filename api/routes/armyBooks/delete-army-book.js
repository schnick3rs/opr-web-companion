const { verifyRequest } = require('../authProvider');
const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { armyBookUid } = request.params;
  const { userId } = verifyRequest(request);

  await pool.query(
    'DELETE FROM opr_companion.army_books WHERE uid = $1 AND user_id = $2',
    [armyBookUid, userId]
  );

  response.status(204).json();
}
