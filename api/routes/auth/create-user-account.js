const { validateEmail, getUserByEmail, validatePasswordConstrains, createUser } = require('./user-account-service');

module.exports = async (request, response) => {

  const { username, email, password } = request.body;

  if (username === undefined || email === undefined || password === undefined) {
    const message = `Incomplete request`;
    response.status(400).json({message});
    return;
  }

  const trimmedUsername = username.trim();
  const trimmedMail = email.toLowerCase().trim();

  if (!validateEmail(trimmedMail)) {
    const message = `Input ${trimmedMail} ist not a valid email.`;
    response.status(400).json({message});
    return;
  }

  const user = await getUserByEmail(email);
  if (user) {
    const message = `An user with email:${email} already exists.`;
    response.status(400).json({message});
    return;
  }

  const trimmedPassword = password.toLowerCase().trim();
  if (!validatePasswordConstrains(trimmedPassword)) {
    const message = `Password does not fulfill constrains.`;
    response.status(400).json({message});
    return;
  }

  try {
    const uuid = await createUser(trimmedUsername, trimmedMail, trimmedPassword);
    console.log(`Created new user ${email}::${uuid}.`);
    response.status(200).json({email, uuid});
    return;
  } catch (e) {
    const message = `INSERT issue. Could not create user.`;
    console.warn(e);
    response.status(500).json({ message });
    return;
  }
}
