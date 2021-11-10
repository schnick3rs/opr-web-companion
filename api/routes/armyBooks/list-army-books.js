const { getAllPublicArmyBooks, getArmyBooksByGameSystem} = require('./army-book-service');

module.exports = async (request, response) => {

  const { gameSystemSlug } = request.query;

  if (gameSystemSlug) {
    const items = await getArmyBooksByGameSystem(gameSystemSlug);
    response.set('Cache-Control', 'public, max-age=600'); // 5 minutes
    response.status(200).json(items);
  } else {
    const items = await getAllPublicArmyBooks();
    response.set('Cache-Control', 'public, max-age=600'); // 5 minutes
    response.status(200).json(items);
  }

}
