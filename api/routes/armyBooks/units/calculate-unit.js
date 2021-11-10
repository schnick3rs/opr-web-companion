const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');
const { getUserByUuid } = require('../../auth/user-account-service');
const { calculateUnit, normalizeUnit, round } = require('../point-calculator-service');

module.exports = async (request, response) => {
  const { userId, userUuid } = verifyRequest(request);
  const { isOpa, isAdmin }  = await getUserByUuid(userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid, unitId } = request.params;

  const { rows } = await pool.query(
    'SELECT units ' +
    'FROM opr_companion.army_books ' +
    'WHERE uid = $1 AND user_id = $2',
    [ armyBookUid, userId ],
  );
  const unit = rows[0].units.filter(unit => unit.id === unitId)[0];

  if (unit) {
    const normalizedUnit = normalizeUnit(unit);
    const cost = calculateUnit(normalizedUnit, false);
    if (cost > 0) {
     response.status(200).json({ cost: cost.toFixed(3) });
    }
  } else {
    response.status(400).json({});
  }
}
