import Router from 'express-promise-router';
import * as userAccountService from './auth/user-account-service';

const router = new Router();

router.get('/', async (request, response) => {
  const { roles } = await userAccountService.getUserByUuid(request.me.userUuid);

  // only admins are allowed to recalculate
  if (roles.includes('admin') === false) {
    response.status(403).json({ message: 'Not Allowed.' });
    return;
  }

  const users = await userAccountService.getAllUsers();
  response.status(200).json(users);
});

export default router;
