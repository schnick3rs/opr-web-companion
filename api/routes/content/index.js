const Router = require('express-promise-router');
const cors = require('cors');
const router = new Router();
module.exports = router;

const contentful = require('contentful')
const config = {
  space: process.env.CTF_SPACE_ID,
  accessToken: process.env.CTF_CDA_ACCESS_TOKEN
}
const client = contentful.createClient(config);

router.get('/game-systems/', cors(), async (request, response) => {

  const query = {
    'content_type': 'gameSystem',
    order: '-fields.universe,fields.name',
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystems = gameSystemsResponse.items;

  response.status(200).json(gameSystems);
});

router.get('/game-systems/:slug', cors(), async (request, response) => {
  const { slug } = request.params;

  const query = {
    'content_type': 'gameSystem',
    'fields.slug[in]': slug,
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystem = gameSystemsResponse.items[0].fields;

  response.status(200).json(gameSystem);
});

router.get('/game-systems/:slug/special-rules', cors(), async (request, response) => {
  const { slug } = request.params;

  const query = {
    'content_type': 'gameSystem',
    'fields.slug[in]': slug,
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystem = gameSystemsResponse.items[0].fields;

  const specialRules = gameSystem.commonSpecialRules.map(sr => {
    return {
      ...sr.fields,
      key: sr.fields.slug,
    };
  });

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(specialRules);
});

router.get('/game-systems/:slug/rule-book', cors(), async (request, response) => {
  const { slug } = request.params;

  const query = {
    'content_type': 'gameSystem',
    'fields.slug[in]': slug,
  };
  const gameSystemsResponse = await client.getEntries(query);
  const gameSystem = gameSystemsResponse.items[0]
  const ruleBooks = gameSystem.fields.ruleBooks;
  const ruleBookEntry = await client.getEntry(ruleBooks[0].sys.id, {include: 3});
  const ruleBook = ruleBookEntry.fields;

  response.status(200).json(ruleBook);
});

router.get('/rule-books/:id', async (request, response) => {
  const { id } = request.params;

  const ruleBookResponse = await client.getEntry(id, {include: 3});
  const ruleBook = ruleBookResponse.fields;

  response.status(200).json(ruleBook);
});
