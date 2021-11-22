import Router from 'express-promise-router';
import repository from '../repos/GfArenaRepository';

const router = new Router();

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

export default router;
