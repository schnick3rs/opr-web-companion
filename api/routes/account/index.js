import Router from 'express-promise-router';
import PatreonService from '../../services/patreonService';
import UserAccountService from '../../services/UserAccountService';

const router = new Router();

router.get('/patreon-refresh', async (request, response) => {
  const refreshToken = await UserAccountService.getUserPatreonRefreshToken(request.me.userId);

  if (!refreshToken) {
    response.status(401).json({ message: 'User has no refresh token' });
    return;
  }

  // UserAccountService.refreshPatreon(request.me.userId)

  // eslint-disable-next-line camelcase
  const { access_token, refresh_token } =
    await PatreonService.getPatreonOauthTokensFromRefresh(refreshToken);

  await UserAccountService.setUserPatreonRefreshToken(request.me.userId, refresh_token);

  const isActive = await PatreonService.isActiveOnePageRulesMember(access_token);

  console.log('User is Patreon =', isActive);

  const activeUntil = isActive ? PatreonService.computeComingActiveUntilDate() : null;
  console.info('Users patreon is considered active until ', activeUntil);

  await UserAccountService.setUserPatreonActive(request.me.userId, activeUntil);

  response.status(200).json({ isActive, activeUntil });
});

/**
 * example call http://localhost:3000/api/account/patreon?code=cUlv9gyg0WGHB44vALbf2CFwvkZWlR&state=None
 */
router.get('/patreon', async (request, response) => {
  const { code } = request.query;
  const { userUuid } = request.me;

  console.info('Patreon connection for user ->', JSON.stringify(request.me));

  if (!code) {
    response.status(400).redirect('/account?error=deny');
    return;
  }

  try {
    // eslint-disable-next-line camelcase
    const { access_token, refresh_token } = await PatreonService.getPatreonOauthTokensFromCode(code);

    // TODO: Error handling?
    await UserAccountService.setUserPatreonRefreshToken(userUuid, refresh_token);

    const patreonUserData = await PatreonService.fetchPatreonUserData(access_token);
    if (patreonUserData) {
      console.info('fetched user data ->', patreonUserData);
      const userByPatreon = await UserAccountService.getUserByEmail(patreonUserData.data.attributes.email);
      if (!userByPatreon) {
        response.status(403).redirect('/account?error=mail');
        return;
      }
      // const patreonEmail = patreonService.getEmail(patreonUserData);
      if (userByPatreon.uuid === userUuid) {
        // --
      } else {
        response.status(403).redirect('/account?error=mail');
        return;
      }
    }

    const isActive = await PatreonService.isActiveOnePageRulesMember(access_token);

    const activeUntil = isActive ? PatreonService.computeComingActiveUntilDate() : null;
    console.info('Users patreon is considered active until ', activeUntil);
    await UserAccountService.setUserPatreonActive(userUuid, activeUntil);

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
  const { id } = await UserAccountService.getUserByUuid(request.me.userUuid);
  UserAccountService.removePatreon(id);
  response.status(204).json();
});

export default router;
