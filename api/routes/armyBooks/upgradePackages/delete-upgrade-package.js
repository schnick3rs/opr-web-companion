const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, upgradePackageUid } = request.params;

  try {
    await pool.query(
      'UPDATE opr_companion.army_books ab SET upgrade_packages = upgrade_packages #- ' +
      'array( ' +
      'SELECT ordinality::int-1 ' +
      'FROM opr_companion.army_books tempy, jsonb_array_elements(upgrade_packages) with ordinality ' +
      'WHERE ab.uid = tempy.uid AND value->>\'uid\' = $1 ' +
      ')::text[] ' +
      'WHERE uid = $2 AND user_id = $3',
      [ upgradePackageUid, armyBookUid, userId ],
    );
    response.status(204).json();
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
