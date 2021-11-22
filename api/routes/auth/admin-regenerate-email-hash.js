import { getAllUsersWithoutHash, updateUserEmailHash } from './user-account-service';

export default async (request, response) => {

  try {
    const users = await getAllUsersWithoutHash();
    users.forEach(user => updateUserEmailHash(user));
    response.status(200).json({message: `Updated ${users.length} users email hash.`});
    return;
  } catch (e) {
    const message = `INSERT issue. Could not create user. -> ${e.message}`;
    response.status(500).json({ message });
    return;
  }
}
