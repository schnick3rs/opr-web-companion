import ArmyBookRule from './ArmyBookRule';
import ArmyBookWeapon from './ArmyBookWeapon';
import ArmyBookItem from './ArmyBookItem';
import ArmyBookDefense from './ArmyBookDefense';

// Grave Armor (Tough(+3)) -> Upgrade granting Rule
// Ancient Banner (Fear) -> Upgrade granting Rule
// Precision Shots -> Rule
// Combat Bike (Fast, Impact(1), Twin Rifle (30”,A4)) -> Upgrade granting Rule and Weapon
// Shred Pistol (6”, A2, Rending) -> Weapon
// Energy Sword (A2, AP(1), Rending), Energy Fist (A2, AP(3)), Fist-Pistol (12”, A3) -> [Items,Rule]

export default class ArmyBookUpgradeOption {

  type = 'ArmyBookUpgradeOption';

  gains = [];
  cost = 0;
  label = ''; // the display or to string representation

  /**
   *
   * @param gains {[ArmyBookItem|ArmyBookRule|ArmyBookWeapon|ArmyBookDefense]}
   * @param cost {number}
   */
  constructor(gains = [], cost = 0) {
    this.gains = gains;
    this.cost = cost;
    this.generateLabel();
  }

  generateLabel() {
    const gainsStrings = this.gains.map(gain => {
      return gain?.label || gain;
    }).sort();
    const finalGains = [];
    gainsStrings.forEach(gain => {
      if (finalGains.includes(gain)) {
        const index = finalGains.indexOf(gain);
        finalGains[index] = `2x ${gain}`;
      } else {
        finalGains.push(gain);
      }
    });
    this.label = finalGains.join(", ");
  }

  /**
   *
   * @param gainsString {string}
   * @returns {*[]}
   * @constructor
   */
  static ParseGains(gainsString) {
    const optionGains = [...gainsString.split(' and ')];
    const gains = [];
    optionGains.forEach(gain => {
      if (gain.startsWith('2x')) {
        const doubleWeapon = ArmyBookWeapon.FromString(gain.substring(3));
        gains.push(doubleWeapon, doubleWeapon);
      } else if (ArmyBookItem.Is(gain)) {
        gains.push(ArmyBookItem.FromStringSim(gain));
      } else if (ArmyBookWeapon.Is(gain)) {
        gains.push(ArmyBookWeapon.FromString(gain));
      } else if (ArmyBookRule.Is(gain)) {
        gains.push(ArmyBookRule.FromString(gain));
      } else {
        gains.push(ArmyBookItem.FromStringSim(gain));
      }
    });
    return gains;
  }

  static ExtractGains(option) {
    let gains = [];
    if (option.gains instanceof Array) {
      option.gains.forEach(gain => {
        if (gain instanceof ArmyBookItem) {
          gain.content.forEach(content => {gains.push(content)});
        } else if (gain instanceof Object) {
          switch(gain.type) {

            case 'ArmyBookDefense':
              gains.push(ArmyBookDefense.FromObject(gain));
              break;

            case 'ArmyBookItem':
              ArmyBookItem.FromObject(gain).content.forEach(content => {gains.push(content)});
              break;

            case 'ArmyBookWeapon':
              gains.push(ArmyBookWeapon.FromObject(gain));
              break;

            case 'ArmyBookRule':
              gains.push(ArmyBookRule.FromObject(gain));
              break;

            default:
              if (gain.content instanceof Array) {
                console.warn(`${gain.label} > detect item.`);
                ArmyBookItem.FromObject(gain).forEach(content => {gains.push(content)});
              } else if (ArmyBookWeapon.Is(gain.label)) {
                console.warn(`${gain.label} > detect weapon.`);
                gains.push(ArmyBookWeapon.FromObject(gain));
              } else {
                console.warn(`${gain.label} > Unknown type(${gain.type}).`);
              }
          }
        } else {
          console.warn(`${gain} > unexpected instance.`);
        }
      });
    } else if (option.label instanceof String) {
      console.info(`try parsing UpgradeOption from string ${option.label}.`);
      console.info(this.ParseGains(option.label));
    } else {
      console.warn(`Unexpected instance for ${option.label}.`);
    }
    return gains;
  }

}
