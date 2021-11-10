const { verifyRequest } = require('../authProvider');
const { pool } = require('../../db');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const data = request.body

  const patchableColumns = [
    'version_string',
    'name',
    'background',
    'hint',
    'cover_image_path',
    'cover_image_credit',
    'is_live',
  ];
  const updateSetFields = [];
  const updateSetValues = [];
  patchableColumns.forEach((column) => {
    if(data[column] !== undefined) {
      updateSetFields.push(`${column} = $${updateSetFields.length+1}`);
      updateSetValues.push(data[column]);
    } else {
      console.info(`No entry found for ${column}`);
    }
  })

  try {
    await pool.query(
      'UPDATE opr_companion.army_books SET ' +
      updateSetFields.join(',') +
      ' WHERE uid = $'+(1+updateSetFields.length)+' AND user_id = $'+(2+updateSetFields.length)+' ',
      [...updateSetValues, armyBookUid, userId],
    );
    response.status(204).json();
  } catch (e) {
    console.warn(e)
    response.status(500).json({message: 'Could not update armybook'});
  }

}
