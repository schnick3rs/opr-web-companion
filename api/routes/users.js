import Router from 'express-promise-router';
import * as userAccountService from './auth/user-account-service';

const router = new Router();

router.get('/', async (request, response) => {
  const users = await userAccountService.getAllUsers();

  response.status(200).json(users);
});

export default router;
