const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, upgradePackageUid } = request.params;
  const upgradePackage = request.body;
  try {
    await pool.query(
      'UPDATE opr_companion.army_books ab SET upgrade_packages = jsonb_set( ' +
      'upgrade_packages, ' +
      'array[( ' +
      'SELECT ordinality::int-1 ' +
      'FROM opr_companion.army_books tempy, jsonb_array_elements(upgrade_packages) with ordinality ' +
      'WHERE ab.uid = tempy.uid AND value->>\'uid\' = $1 ' +
      ')::text], ' +
      '$2::jsonb) ' +
      'WHERE uid = $3 AND user_id = $4',
      [upgradePackageUid, `${JSON.stringify(upgradePackage)}`, armyBookUid, userId],
    );
    response.status(200).json(upgradePackage);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }

  response.status(200).json();
}
