const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid, upgradePackageUid } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT upgrade_packages "upgradePackages" ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1 AND user_id = $2',
      [ armyBookUid, userId ],
    );
    const data = rows[0];
    const upgradePackage = data.upgradePackages.filter(upgradePackage => upgradePackage.uid === upgradePackageUid);
    response.status(200).json(upgradePackage[0]);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
