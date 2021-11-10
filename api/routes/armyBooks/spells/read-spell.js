const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, spellUid } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT spells ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1 AND user_id = $2',
      [ armyBookUid, userId ],
    );
    const spell = rows[0].spells.filter(spell => spell.id === spellUid);
    if (spell.length === 1) {
      response.status(200).json(...spell);
    } else {
      response.status(404).json();
    }
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
