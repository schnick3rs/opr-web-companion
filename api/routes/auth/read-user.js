const { verifyRequest } = require('../authProvider');
const { getUserByUuid } = require('./user-account-service');

module.exports = async (request, response) => {
  const { userUuid } = verifyRequest(request);
  if (userUuid) {
    const { username, uuid, isOpa, isAdmin, createdAt }  = await getUserByUuid(userUuid);
    response.status(200).json({user: { username, uuid, isOpa, isAdmin, createdAt }});
    return;
  }
  response.status(403).json();
}
