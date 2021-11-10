const { createArmyBook, getArmyBook, setUnits, setUpgradePackages, setSpecialRules } = require('./army-book-service');

const { verifyRequest } = require('../authProvider');
const { pool } = require('../../db');

const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 7);

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { name, hint, gameSystemId, parentArmyBookId, clones, syncs } = request.body;

  // create new army book
  const newArmyBook = await createArmyBook(userId, gameSystemId, name, hint);
  console.info(`Created new army book -> ${newArmyBook.uid}`);

  // fetch units from parent
  const parentArmyBook = await getArmyBook(parentArmyBookId, userId);
  console.info(`Load parent army book -> ${parentArmyBook.uid}`);

  // set units synced from parent
  const clonedAndSyncedUnits = parentArmyBook.units
    .filter((unit) => clones.includes(unit.id))
    .map((unit) => {
      let sync = undefined;
      if (syncs.includes(unit.id)) {
        sync = {
          parentArmyBookId,
          unitId: unit.id,
          syncAutomatic: true,
        };
      }
      return {
        ...unit,
        id: nanoid(),
        clone: {
          parentArmyBookId,
          unitId: unit.id,
        },
        sync,
      };
    });

  await setUnits(newArmyBook.uid, userId, clonedAndSyncedUnits);

  // add upgrade packages
  let clonedUpgradePackages = [];
  clonedAndSyncedUnits.forEach(unit => clonedUpgradePackages.push(...unit.upgrades));
  const uniqueUpgradePackages = [ ...new Set(clonedUpgradePackages)];

  const upgradePackages = parentArmyBook.upgradePackages
    .filter((pck) => uniqueUpgradePackages.includes(pck.uid));
  await setUpgradePackages(newArmyBook.uid, userId, upgradePackages);

  // add special rules
  // TODO only used special rules
  await setSpecialRules(newArmyBook.uid, userId, parentArmyBook.specialRules)

  const updatedArmyBook = await getArmyBook(newArmyBook.uid, userId);

  response.status(200).json({...updatedArmyBook});
}
