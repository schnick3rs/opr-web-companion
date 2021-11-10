const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, specialRuleUid } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT special_rules "specialRules" ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1 AND user_id = $2',
      [ armyBookUid, userId ],
    );
    const specialRule = rows[0].specialRules.filter(specialRule => specialRule.id === specialRuleUid);
    if (specialRule.length === 1) {
      response.status(200).json(...specialRule);
    } else {
      response.status(404).json();
    }
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
