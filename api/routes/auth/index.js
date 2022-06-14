import Router from 'express-promise-router';

import bcrypt from 'bcryptjs';
import { sign } from '../authProvider';
import * as userAccountService from './user-account-service';
import { sendPasswordResetMail } from './mail-service';

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

  if (!userAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    response.status(400).json({ message });
    return;
  }

  const user = await userAccountService.getUserByEmail(email);
  if (user) {
    const message = `An user with email:${email} already exists.`;
    response.status(400).json({ message });
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!userAccountService.validatePasswordConstrains(trimmedPassword)) {
    const message = 'Password does not fulfill constrains.';
    response.status(400).json({ message });
    return;
  }

  try {
    const uuid = await userAccountService.createUser(trimmedUsername, trimmedMail, trimmedPassword);
    console.log(`Created new user ${email}::${uuid}.`);
    response.status(200).json({ email, uuid });
    return;
  } catch (e) {
    const message = 'INSERT issue. Could not create user.';
    console.warn(e);
    response.status(500).json({ message });
  }
});

router.get('/user', async (request, response) => {
  const { userUuid } = request.me;
  if (userUuid) {
    const { username, uuid, createdAt, roles, patreon } = await userAccountService.getUserByUuid(userUuid);
    response.status(200).json({ user: { username, uuid, createdAt, roles, scope: roles, patreon } });
    return;
  }
  response.status(403).json();
});

router.post('/reset-password-request', async (request, response) => {
  const { email } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!userAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const user = await userAccountService.getUserByEmail(trimmedMail);
  if (!user) {
    const message = `No user found for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({ message });
    return;
  }

  const resetToken = await userAccountService.createNewPasswordResetRequest(user);
  if (!resetToken) {
    const message = `No token created for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({ message });
    return;
  }
  sendPasswordResetMail(trimmedMail, resetToken);

  response.status(204).json({});
});

router.post('/reset-password', async (request, response) => {
  const { email, password, token } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!userAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!userAccountService.validatePasswordConstrains(trimmedPassword)) {
    const message = 'Password does not fulfill constrains.';
    response.status(400).json({ message });
    return;
  }

  await userAccountService.updateUserResetPassword(trimmedMail, token, trimmedPassword);
  response.status(200).json({});
});

router.post('/login', async (request, response) => {
  const { email, password } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!userAccountService.validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!userAccountService.validatePassword(trimmedPassword)) {
    const message = 'Password does not fullfill constains.';
    console.warn(message);
    response.status(400).json({ message });
    return;
  }

  const user = await userAccountService.getUserByEmail(trimmedMail);
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
