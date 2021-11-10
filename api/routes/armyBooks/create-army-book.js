const { verifyRequest } = require('../authProvider');
const { createArmyBook } = require('./army-book-service');

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { name, hint, gameSystemId, background } = request.body;

  const armyBook = await createArmyBook(userId, gameSystemId, name, hint, background);

  if (armyBook) {
    response.status(200).json(armyBook);
  } else {
    response.status(400).json({message: 'Could not create army book.'});
  }

}
