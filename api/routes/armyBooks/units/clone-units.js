const { verifyRequest } = require('../../authProvider');
const { getUnit, addUnit, getSpecialRules, addSpecialRule, getUpgradePackages, addUpgradePackage } = require('../army-book-service');

const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 7);

module.exports = async (request, response) => {
  const { userId } = verifyRequest(request);
  const { armyBookUid } = request.params;
  const toClone = request.body;

  // fetch units from army books
  let units = [];
  for (let i = 0; i < toClone.length; i++) {
    const clone = toClone[i];
    const { parentArmyBookId, unitId } = clone;
    let parentUnit = await getUnit(parentArmyBookId, userId, unitId);
    let newUnit = {
      ...parentUnit,
      id: nanoid(),
      clone: {
        parentArmyBookId,
        unitId: parentUnit.id,
      },
    };
    if (clone.sync) {
      newUnit.sync = {
        parentArmyBookId,
        unitId: parentUnit.id,
        syncAutomatic: true,
      };
    }
    await addUnit(armyBookUid, userId, newUnit);
    units.push(newUnit);
  }

  // add upgrade packages
  let newUpgradePackages = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const parentUpgradePackages = await getUpgradePackages(unit.clone.parentArmyBookId, userId);
    const targetUpgradePackages = await getUpgradePackages(armyBookUid, userId);
    const unitUpgradePackages = unit.upgrades.map(uid => {
      return parentUpgradePackages.find(u => u.uid === uid);
    });
    const newPackages = unitUpgradePackages.filter(parentUnitPck => {
      return !targetUpgradePackages.some(targetPck => targetPck.uid === parentUnitPck.uid);
    });
    for (let j = 0; j < newPackages.length; j++) {
      const newPackage = newPackages[j];
      await addUpgradePackage(armyBookUid, userId, newPackage);
      newUpgradePackages.push(newPackage);
    }
  }

  // add special rules
  /**
   * 1. fetch parent special rules
   * 2. fetch target special rules
   * 3. check which rules this unit uses and
   */
  let newSpecialRules = [];
  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    const unitSpecialRules = unit.specialRules;
    const parentSpecialRules = await getSpecialRules(unit.clone.parentArmyBookId, userId);
    const targetSpecialRules = await getSpecialRules(armyBookUid, userId);
    const newRules = parentSpecialRules.filter((parentRule) => {
      // only rules that the unit uses
      return unitSpecialRules.some((unitRule) => unitRule.key === parentRule.key);
    }).filter((unitRule) => {
      return !targetSpecialRules.some((targetRule) => targetRule.key === unitRule.key);
    });

    for (let j = 0; j < newRules.length; j++) {
      let newRule = newRules[j];
      await addSpecialRule(armyBookUid, userId, newRule);
      newSpecialRules.push(newRule);
    }

    /**
     * we iterate over each upgrade package and extract all special rules
     * 2. remove duplicates
     * 3. check missing
     * 4. add to army book
     */
    const newPackageRules = [];
    let upgradesSpecialRules = [];
    newUpgradePackages.forEach(up => {
      up.sections.forEach(section => {
        section.options.forEach(option => {
          if (option.gains) {
            option.gains.forEach(gain => {
              switch (gain.type) {

                case 'ArmyBookRule':
                  upgradesSpecialRules.push(gain);
                  break;

                case 'ArmyBookMultiWeapon':
                  gain.profiles.forEach(weapon =>
                    weapon.specialRules.forEach(weaponRule =>
                      upgradesSpecialRules.push(weaponRule)
                    )
                  );
                  break;

                case 'ArmyBookWeapon':
                  gain.specialRules.forEach(weaponRule => upgradesSpecialRules.push(weaponRule));
                  break;

                case 'ArmyBookItem':
                  gain.content?.forEach(content => {
                    switch (content.type) {
                      case 'ArmyBookRule':
                        upgradesSpecialRules.push(content);
                        break;
                      case 'ArmyBookWeapon':
                        content.specialRules.forEach(weaponRule=> upgradesSpecialRules.push(weaponRule));
                        break;
                    }
                  });
                  break;
                default:
                  console.info(`Unexpected type ${gain.type}`);
              }
            });
          }
        });
      });
    });
    // remove duplicates
    upgradesSpecialRules = upgradesSpecialRules.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);

    const freshTargetSpecialRules = await getSpecialRules(armyBookUid, userId);
    parentSpecialRules.filter((parentRule) => {
      // only rules that the unit uses
      return unitSpecialRules.some((unitRule) => unitRule.key === parentRule.key);
    }).filter((unitRule) => {
      return !freshTargetSpecialRules.some((targetRule) => targetRule.key === unitRule.key);
    });

    for (let j = 0; j < newPackageRules.length; j++) {
      let newRule = newPackageRules[j];
      await addSpecialRule(armyBookUid, userId, newRule);
      newSpecialRules.push(newRule);
    }

  }


  response.status(200).json({units, upgradePackages: newUpgradePackages, specialRules: newSpecialRules});

  // response.status(400).json({message: 'Could not clone units.'});
}
