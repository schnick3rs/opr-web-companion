const { getUserByEmail, validateEmail, createNewPasswordResetRequest } = require('./user-account-service');
const { sendPasswordResetMail } = require('./mailService');

module.exports = async (request, response) => {

  const { email } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
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

  console.info(user);
  const resetToken = await createNewPasswordResetRequest(user);
  if (!resetToken) {
    const message = `No token created for email:${trimmedMail}.`;
    console.warn(message);
    response.status(401).json({message});
    return;
  }
  console.info('xxxx');
  sendPasswordResetMail(trimmedMail, resetToken);

  response.status(204).json({});
}
