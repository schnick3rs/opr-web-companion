const calc = require('opr-point-calculator-lib');

const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');
const { getUserByUuid } = require('../../auth/user-account-service');
const { normalizeUnit, calculateUnit } = require('../point-calculator-service');

const toCustomRule = (rule) => {
  let customRule = undefined;
  if (rule.cost) {
    if (isNaN(rule.cost)) {
      const parts = rule.cost.split(' ').map(i => i.trim());
      const func = (unit) => {
        let cost = 0;
        let next = 0;
        let operation = null;
        parts.forEach(part => {
          switch (part) {
            case '*': operation = (a, b) => a*b; break;
            case '/': operation = (a, b) => a/b; break;
            case '+': operation = (a, b) => a+b; break;
            case '-': operation = (a, b) => a-b; break;
            default:
              if (typeof part === 'string') {
                if (isNaN(part)) {
                  next = parseInt(unit[part]) || 1;
                } else {
                  next = parseInt(part);
                }
                if (typeof operation === 'function') {
                  cost = operation(cost, next);
                  operation = null;
                } else {
                  cost  = next;
                }
              }
          }
          console.info('use func -> ', part, cost, next, operation);
        });
        return cost;
      };
      customRule = {cost: func};
    } else {
      customRule = {cost: rule.cost};
    }
  }
  return customRule;
}

module.exports = async (request, response) => {
  const { userId, userUuid } = verifyRequest(request);
  const { isOpa, isAdmin }  = await getUserByUuid(userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT ' +
      'army_books.units, ' +
      'army_books.special_rules AS "specialRules", ' +
      'game_systems.slug "gameSystemSlug" ' +
      'FROM opr_companion.army_books ' +
      'INNER JOIN opr_companion.game_systems ON army_books.game_system_id = game_systems.id ' +
      'WHERE uid = $1 ' +
      'AND user_id = $2',
      [ armyBookUid, userId ],
    );
    let { units, specialRules, gameSystemSlug } = rows[0];

    let customRules = {};
    specialRules.forEach(rule => {
      const ruleCost = toCustomRule(rule);
      if (ruleCost) {
        customRules[rule.name] = ruleCost;
      }
    });

    const unitz = units.map(unit => {
      const cost = unit.costModeAutomatic
        ? Math.round(calc.unitCost(normalizeUnit(unit), customRules)/5) * 5
        : unit.cost;
      return {
        ...unit,
        cost,
      }
    });
    await pool.query(
      'UPDATE opr_companion.army_books ab SET units = $1 ' +
      'WHERE uid = $2 AND user_id = $3',
      [`${JSON.stringify(unitz)}`, armyBookUid, userId],
    );

    response.status(200).json(unitz);
  } catch (e) {
    console.error(e);
    response.status(400).json({e});
  }
}
