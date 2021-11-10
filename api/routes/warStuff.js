const Router = require('express-promise-router');

const repository = require('../repos/WarStuffRepository');

const router = new Router();

module.exports = router;

/**
 * /system -> return information of the system
 * /rules -> return the rules segments
 * /codex -> return the codex
 */

router.get('/', (request, response) => {

  const items = repository;

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(items);
});

router.get('/system', (request, response) => {

  const item = repository[0];

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item.system);
});

router.get('/rules', (request, response) => {

  const item = repository[0];

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item.rules);
});

router.get('/codex', (request, response) => {

  const item = repository[0];

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item.codex);
});


