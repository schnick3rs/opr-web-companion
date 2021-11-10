const { verifyRequest } = require('../../authProvider');
const { pool } = require('../../../db');

const unitHasHero = (unit) => {
  return unit.specialRules.some(sr => sr.key === 'hero');
}

const unitHasTough = (unit) => {
  return unit.specialRules.some(sr => sr.key === 'tough');
}

const sortUnits = (units) => {
  const unitz = [...units];
  unitz.sort((a, b) => {

    // sort by IS HERO
    if (unitHasHero(a) && !unitHasHero(b)) return -1;
    if (!unitHasHero(a) && unitHasHero(b)) return 1;

    if (unitHasHero(a)) {
      if (a.cost > b.cost) return -1;
      if (a.cost < b.cost) return 1;

      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    } else {
      // sort squads from single non heros
      if (a.size > 1 && b.size <= 1) return -1;
      if (a.size <= 1 && b.size > 1) return 1;

      if (unitHasTough(a) && !unitHasTough(b)) return 1;
      if (!unitHasTough(a) && unitHasTough(b)) return -1;

      if (a.cost > b.cost) return -1;
      if (a.cost < b.cost) return 1;

      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    }
  });
  return unitz;
}

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;

  try {
    const { rows } = await pool.query(
      'SELECT units ' +
      'FROM opr_companion.army_books ' +
      'WHERE uid = $1 AND user_id = $2',
      [ armyBookUid, userId ],
    );
    let { units } = rows[0];

    const unitz = sortUnits(units);
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
