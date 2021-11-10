const { verifyRequest } = require('../../authProvider');
const { getUnit, addUnit, getSpecialRules, addSpecialRule, getUpgradePackages, addUpgradePackage } = require('../army-book-service');

const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 7);

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const toClone = request.body;

  // fetch units from army books
  const clonedAndSyncedUnits = toClone.map(async (clone) => {
    const { parentArmyBookId, unitId } = clone;
    let unit = await getUnit(parentArmyBookId, userId, unitId);
    let newUnit = {
      ...unit,
      id: nanoid(),
      clone: {
        parentArmyBookId,
        unitId: unit.id,
      },
    };
    if (clone.sync) {
      newUnit.sync = {
        parentArmyBookId,
        unitId: unit.id,
        syncAutomatic: true,
      };
    }
    await addUnit(armyBookUid, userId, unit);

    // add upgrade packages
    const parentUpgradePackages = await getUpgradePackages(parentArmyBookId, userId);
    console.info('parentUpgradePackages', parentUpgradePackages);
    const targetUpgradePackages = await getUpgradePackages(armyBookUid, userId);
    console.info('targetUpgradePackages', targetUpgradePackages);
    const unitUpgradePackages = unit.upgrades.map(uid => {
      return parentUpgradePackages.find(u => u.uid === uid);
    });
    const newPackages = unitUpgradePackages.filter(parentUnitPck => {
      return targetUpgradePackages.every(targetPck => targetPck.uid !== parentUnitPck);
    });
    console.info('Add Packages', newPackages);
    //await Promise.all(newPackages.forEach(async (pck) => await addUpgradePackage(armyBookUid, userId, pck)));

    // add special rules
    /**
     * 1. fetch parent special rules
     * 2. fetch target special rules
     * 3. check which rules this unit uses and
     */
    const parentUnitSpecialRules = unit.specialRules;
    const parentSpecialRules = await getSpecialRules(parentArmyBookId, userId);
    console.info('parentSpecialRules', parentSpecialRules);
    const targetSpecialRules = await getSpecialRules(armyBookUid, userId);
    console.info('targetSpecialRules', targetSpecialRules);
    const newRules = parentSpecialRules.filter(parentRule => {
      return targetSpecialRules.every(targetRule => targetRule.name !== parentRule);
    })
    console.info('Add rule', newRules);
    //await Promise.all(newRules.forEach(async (rule) => await addSpecialRule(armyBookUid, userId, rule)));

    return newUnit;
  });

  const units = await Promise.all(clonedAndSyncedUnits);

  response.status(200).json(units);

  // response.status(400).json({message: 'Could not clone units.'});
}
