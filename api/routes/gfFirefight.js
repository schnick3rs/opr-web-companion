import Router from 'express-promise-router';
import repository from '../repos/GfFirefightRepository';

const router = new Router();

router.get('/assets/', (request, response) => {
  let items = repository.assets;

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(items);
});

router.get('/army-books/', (request, response) => {
  let items = repository.armyBooks;

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(items);
});

router.get('/army-books/:slug', (request, response) => {
  const { slug } = request.params;

  const item = repository.armyBooks.find((item) => item.key === slug);

  response.set('Cache-Control', 'public, max-age=3600'); // one hour
  response.status(200).json(item);
});

export default router;
