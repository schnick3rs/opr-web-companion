import Router from 'express-promise-router';

import bcrypt from 'bcryptjs';
import { sign } from '../authProvider';
import UserAccountService from '../../services/userAccountService';
import MailService from '../../services/mailService';

const router = new Router();

router.post('/user-account', async (request, response) => {
  const { username, email, password } = request.body;

  if (username === undefined || email === undefined || password === undefined) {
    const message = 'Incomplete request';
    response.status(400).json({ message });
    return;
  }

  const trimmedUsername = username.trim();
  const trimmedMail = email.toLowerCase().trim();

  if (!UserAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    response.status(400).json({ message });
    return;
  }

  const user = await UserAccountService.getUserByEmail(email);
  if (user) {
    const message = `An user with email:${email} already exists.`;
    response.status(400).json({ message });
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!UserAccountService.validatePasswordConstrains(trimmedPassword)) {
    const message = 'Password does not fulfill constrains.';
    response.status(400).json({ message });
    return;
  }

  try {
    const uuid = await UserAccountService.createUser(trimmedUsername, trimmedMail, trimmedPassword);
    console.log(`Created new user ${email}::${uuid}.`);
    response.status(200).json({ email, uuid });
    return;
  } catch (e) {
    const message = 'INSERT issue. Could not create user.';
    console.warn(e);
    response.status(500).json({ message });
  }
});

/**
 * returns the user data of the logged in user that is used for the frontend handling and display
 */
router.get('/user', async (request, response) => {
  const { userUuid } = request.me;
  if (userUuid) {
    const { username, uuid, createdAt, roles, patreon, patreonActiveUntil } = await UserAccountService.getUserByUuid(userUuid);
    /**
     * When fetching the user for the frontend, we check if there was a former patron duration
     * and if it is now inactive, if so, we try to refresh the token.
     */
    if (patreonActiveUntil && new Date(patreonActiveUntil) < new Date()) {
      console.info('Patron outdated, refreshing token:', userUuid, patreonActiveUntil);
      await UserAccountService.refreshPatreonToken(userUuid);
      const userData = await UserAccountService.getUserByUuid(userUuid);
      const user = {
        username: userData.username,
        uuid: userData.uuid,
        createdAt: userData.createdAt,
        roles: userData.roles,
        scope: userData.roles,
        patreon: userData.patreon,
      };
      response.status(200).json({ user });
    } else {
      response.status(200).json({ user: { username, uuid, createdAt, roles, scope: roles, patreon } });
      return;
    }
  }
  response.status(403).json();
});

router.post('/reset-password-request', async (request, response) => {
  const { email } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!UserAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const user = await UserAccountService.getUserByEmail(trimmedMail);
  if (!user) {
    const message = `No user found for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({ message });
    return;
  }

  const resetToken = await UserAccountService.createNewPasswordResetRequest(user);
  if (!resetToken) {
    const message = `No token created for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({ message });
    return;
  }
  const success = await MailService.sendPasswordResetMail(trimmedMail, user.username, resetToken);

  if (success) {
    response.status(204).json({});
  } else {
    response.status(400).json({ message: 'Could not send password reset mail.' });
  }
});

router.post('/reset-password', async (request, response) => {
  const { email, password, token } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!UserAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!UserAccountService.validatePasswordConstrains(trimmedPassword)) {
    const message = 'Password does not fulfill constrains.';
    response.status(400).json({ message });
    return;
  }

  await UserAccountService.updateUserResetPassword(trimmedMail, token, trimmedPassword);
  response.status(200).json({});
});

router.post('/login', async (request, response) => {
  const { email, password } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!UserAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!UserAccountService.validatePassword(trimmedPassword)) {
    const message = 'Password does not fullfill constains.';
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const user = await UserAccountService.getUserByEmail(trimmedMail);
  if (!user) {
    const message = `No user found for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({ message });
    return;
  }

  const match = bcrypt.compareSync(trimmedPassword, user.password);
  if (match) {
    const jwtPayload = {
      username: user.username || 'Unknown username',
      userId: user.id,
      userUuid: user.uuid,
    };
    const token = sign(user.uuid, jwtPayload);
    console.warn(`User ${user.username} logged in.`);
    response.status(200).json({ token });
  } else {
    const message = `Invalid credentials (${email}, *****).`;
    console.warn(message);
    response.status(403).json({ message });
  }
});

router.post('/logout', (request, response) => {
  console.log('Logging out...');
  response.status(200).json();
});

export default router;
