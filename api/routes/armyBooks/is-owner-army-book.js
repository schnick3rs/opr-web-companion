const { verifyRequest } = require('../authProvider');
const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { armyBookUid } = request.params;

  const { userId } = verifyRequest(request);

  const { rows } = await pool.query(
    'SELECT ' +
    'army_books.uid, ' +
    'army_books.user_id AS "userId", ' +
    'army_books.game_system_id AS "gameSystemId", ' +
    'army_books.name, ' +
    'army_books.official, ' +
    'army_books.public, ' +
    'army_books.is_live AS "isLive", ' +
    'army_books.version_string AS "versionString", ' +
    'user_accounts.username ' +
    'FROM opr_companion.army_books ' +
    'INNER JOIN opr_companion.user_accounts ON army_books.user_id = user_accounts.id ' +
    'WHERE uid = $1',
    [ armyBookUid ]
  );

  if (rows.length !== 1) {
    console.warn(`Unexpected row count. Expected 1, found ${rows.length}`);
    response.status(404).json({message: 'Not found.'});
  } else {
    let armyBook = rows[0];

    if (armyBook.userId !== userId) {
      response.status(403).json({message: 'Permission required.'});
    } else {
      response.status(200).json({...armyBook});
    }
  }

}
