const getAllSpecialRulesFromUpgradePackages = (upgradePackages = []) => {
  let upgradesSpecialRules = [];
  upgradePackages.forEach((pack) => {
    const rules = getAllSpecialRulesFromUpgradePackage(pack);
    if (rules && rules.length > 0) {
      upgradesSpecialRules.push(...rules);
    }
  });
  return upgradesSpecialRules;
}

const getAllSpecialRulesFromUpgradePackage = (upgradePackage = {}) => {
  let upgradesSpecialRules = [];
  upgradePackage.sections.forEach(section => {
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
  return upgradesSpecialRules;
};

export {
  getAllSpecialRulesFromUpgradePackages,
  getAllSpecialRulesFromUpgradePackage,
}

