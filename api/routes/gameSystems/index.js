import Router from 'express-promise-router';
import GameSystemService from '../../services/gameSystemService';

const router = new Router();

router.get('/', async (request, response) => {
  const gameSystems = await GameSystemService.findAll();

  response.set('Cache-Control', 'public, max-age=3600'); // 1h
  response.status(200).json(gameSystems);
}
);

router.get('/:slug', async (request, response) => {
  const { slug } = request.params;

  if (!slug) {
    response.status(400).json({ message: 'No slug given' });
    return;
  }

  const gameSystem = await GameSystemService.findBySlug(slug);

  if (!gameSystem) {
    response.status(404).json();
  } else {
    response.set('Cache-Control', 'public, max-age=3600');
    response.status(200).json(gameSystem);
  }
});

router.get('/:slug/special-rules', async (request, response) => {
  const { slug } = request.params;

  const rules = await GameSystemService.findSpecialRules(slug);

  response.set('Cache-Control', 'public, max-age=3600');
  response.status(200).json(rules);
});

export default router;
