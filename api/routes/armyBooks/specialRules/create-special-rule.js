const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

const sortSpecialRules = (specialRules) => {
  specialRules.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
  });
}

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const specialRules = request.body;

  try {
    await pool.query(
      'UPDATE opr_companion.army_books SET special_rules = special_rules || $1::jsonb WHERE uid = $2 AND user_id = $3',
      [`[${JSON.stringify(specialRules)}]`, armyBookUid, userId],
    );

    response.status(200).json(specialRules);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
