import Router from 'express-promise-router';
import * as patreonService from './patreonService';
import * as userAccountService from '../auth/user-account-service';

const router = new Router();

function getActiveUntil() {
  const now = new Date();
  if (now.getMonth() === 11) {
    return new Date(now.getFullYear() + 1, 0, 4);
  } else {
    return new Date(now.getFullYear(), now.getMonth() + 1, 4);
  }
}

router.get('/patreon-refresh', async (request, response) => {
  const refreshToken = await patreonService.getUserPatreonRefreshToken(
    request.me.userId
  );

  if (!refreshToken) {
    response.status(401).json({ message: 'User has no refresh token' });
    return;
  }

  // eslint-disable-next-line camelcase
  const { access_token, refresh_token } =
    await patreonService.getPatreonOauthTokensFromRefresh(refreshToken);

  await patreonService.setUserPatreonRefreshToken(
    request.me.userId,
    refresh_token
  );

  const isActive = await patreonService.isActiveOnePageRulesMember(
    access_token
  );

  console.log('User is Patreon =', isActive);

  const activeUntil = isActive ? getActiveUntil() : null;
  console.info('Users patreon is considered active until ', activeUntil);

  await patreonService.setUserPatreonActive(request.me.userId, activeUntil);

  response.status(200).json({ isActive, activeUntil });
});

/**
 * example call http://localhost:3000/api/account/patreon?code=cUlv9gyg0WGHB44vALbf2CFwvkZWlR&state=None
 */
router.get('/patreon', async (request, response) => {
  const { code } = request.query;

  console.info('Patreon connection for user:', request.me);
  console.info('Patreon connection code ->', code);

  if (!code) {
    const message = 'Patreon connection failed!';
    response.status(400).json({ message });
    return;
  }

  try {
    // eslint-disable-next-line camelcase
    const { access_token, refresh_token } = await patreonService.getPatreonOauthTokensFromCode(code);

    // TODO: Error handling?
    await patreonService.setUserPatreonRefreshToken(request.me.userId, refresh_token);

    const patreonUserData = await patreonService.fetchPatreonUserData(access_token);
    if (patreonUserData) {
      // const patreonEmail = patreonService.getEmail(patreonUserData);
    }

    const isActive = await patreonService.isActiveOnePageRulesMember(access_token);

    const activeUntil = isActive ? getActiveUntil() : null;
    console.info('Users patreon is considered active until ', activeUntil);

    await patreonService.setUserPatreonActive(request.me.userId, activeUntil);

    response.status(200).redirect('/account');
  } catch (e) {
    console.error(e);
    response.status(500).json({ message: 'Error calling Patreon API' });
  }
});

/**
 * delete patron access
 */
router.delete('/patreon', async (request, response) => {
  const { id } = await userAccountService.getUserByUuid(request.me.userUuid);
  userAccountService.removePatreon(id);
  response.status(204).json();
});

export default router;
