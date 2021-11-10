const { applyPatch } = require('rfc6902');
const { verifyRequest } = require('../../authProvider');
const { getUnit, updateUnit } = require('../army-book-service');
const { getUserByUuid } = require('../../auth/user-account-service');

module.exports = async (request, response) => {
  const { userId, userUuid } = verifyRequest(request);
  const { isAdmin }  = await getUserByUuid(userUuid);

  // only admins are allowed to recalculate
  if (isAdmin === false) {
    response.status(403).json({message: 'Your account does not allow to import army books.'});
    return;
  }

  const { armyBookUid, unitId } = request.params;

  const currentUnit = await getUnit(armyBookUid, userId, unitId);
  if (!currentUnit.sync) {
    response.status(404).json({message: 'Unit has no sync.'});
    return;
  }

  const parent = await getUnit(currentUnit.sync.parentArmyBookId, userId, currentUnit.sync.unitId);

  // new Set([...parent.upgrades, ...currentUnit.upgrades].filter(i => typeof i === 'string'))
  let updatedUnit = {
    ...currentUnit,
    size: parent.size,
    quality: parent.quality,
    defense: parent.defense,
    upgrades: parent.upgrades,
    equipment: parent.equipment,
    specialRules: parent.specialRules,
  };

  if (currentUnit?.sync?.patch) {
    let { patch } = currentUnit.sync;
    patch.forEach((pat) => {
      if (pat.op === 'remove') {
        const i = updatedUnit.specialRules.findIndex((sr) => sr.name === pat.value.name);
        const patchRemove = { op: 'remove', path: `/specialRules/${i}`, value: i };
        applyPatch(updatedUnit, [patchRemove]);
      } else {
        applyPatch(updatedUnit, [pat]);
      }
    });
  }

  // const associatedPackages = await getUpgradePackage(armyBookUid, userId, upgradePackageId);
  // fetch used special rules

  await updateUnit(armyBookUid, userId, updatedUnit.id, updatedUnit);

  response.status(200).json({...updatedUnit});
}
