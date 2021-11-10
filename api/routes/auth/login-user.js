const bcrypt = require("bcrypt");

const { sign } = require('../authProvider');
const { getUserByEmail, validateEmail, validatePassword } = require('./user-account-service');

module.exports = async (request, response) => {

  const { email, password } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({message});
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!validatePassword(trimmedPassword)) {
    const message = `Password does not fullfill constains.`;
    console.warn(message);
    response.status(400).json({message});
    return;
  }

  const user = await getUserByEmail(trimmedMail);
  if (!user) {
    const message = `No user found for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({message});
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
    response.status(200).json({token});
  } else {
    const message = `Invalid credentials (${email}, *****).`;
    console.warn(message);
    response.status(403).json({message});
  }
}
