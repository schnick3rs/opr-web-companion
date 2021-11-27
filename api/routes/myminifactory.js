import Router from 'express-promise-router';
import axios from 'axios';

const router = new Router();

router.get('/:name', async (request, response) => {

  const {name } = request.params;

  const { data } = await axios.get(`https://www.myminifactory.com/api/v2/search?q=onepagerules ${name}&key=84a6ee37-1721-48da-a86c-669f3d4a5ab1`);

  const bestMatch = data.items[0];

  response.status(200).json(bestMatch);
});

export default router;
