const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const upgradePackages = request.body;

  try {
    await pool.query(
      'UPDATE opr_companion.army_books ' +
      'SET upgrade_packages = upgrade_packages || $1::jsonb ' +
      'WHERE uid = $2 AND user_id = $3',
      [`[${JSON.stringify(upgradePackages)}]`, armyBookUid, userId],
    );
    response.status(200).json(upgradePackages);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
