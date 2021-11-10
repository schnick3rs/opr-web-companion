const { validateEmail, validatePasswordConstrains, updateUserResetPassword } = require('./user-account-service');

module.exports = async (request, response) => {

  const { email, password, token } = request.body;

  const trimmedMail = email.toLowerCase().trim();
  if (!validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    console.warn(message);
    response.status(400).json({message});
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!validatePasswordConstrains(trimmedPassword)) {
    const message = `Password does not fulfill constrains.`;
    response.status(400).json({message});
    return;
  }

  await updateUserResetPassword(trimmedMail, token, trimmedPassword);
  response.status(200).json({});
}
