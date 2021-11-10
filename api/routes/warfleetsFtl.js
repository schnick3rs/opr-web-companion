const Router = require('express-promise-router');

const repository = require('../repos/WarfleetsFtlRepository');

const router = new Router();

module.exports = router;

router.get('/', (request, response) => {
  let items = repository;

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(items);
});

router.get('/:slug', (request, response) => {
  const { slug } = request.params;

  const item = repository.find((item) => item.key === slug);

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item);
});

router.get('/:slug/legendary-fleets', (request, response) => {
  const { slug } = request.params;

  const item = repository.find((item) => item.key === slug);

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item.legendaryFleets);
});

router.get('/optional-rules/:slug', (request, response) => {
  const { slug } = request.params;

  const item = repository.find((item) => item.key === slug);

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item);
});
