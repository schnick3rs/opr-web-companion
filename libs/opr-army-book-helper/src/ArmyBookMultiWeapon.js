import ArmyBookWeapon from './ArmyBookWeapon';

export default class ArmyBookMultiWeapon {

  type = 'ArmyBookMultiWeapon';

  name = null;
  profiles = [];

  /**
   *
   * @param name {string}
   * @param profiles {[ArmyBookWeapon]}
   */
  constructor(name, profiles = []) {
    this.name = name;
    this.profiles = profiles;
    this.label = this.toString();
  }

  static Is(string) {
    return !!/([\w]+)\s?(-\spick\sone\sto\sfire):\s?(.*)/gi.exec(string);
  }

  static FromObject(json) {
    return new ArmyBookMultiWeapon(json.name, json.profiles);
  }

  /**
   *
   * @param multiWeaponString
   * @returns {ArmyBookMultiWeapon}
   * @constructor
   */
  static FromString(multiWeaponString) {
    const equipmentMatch = /(?<name>[\d\w\- ]+)\s?(-\spick\sone\sto\sfire):\s?(?<weapons>.*)/gi.exec(multiWeaponString);
    const name = equipmentMatch.groups.name;
    const weapons = equipmentMatch.groups.weapons.split(') ').map(prop => prop.trim());
    let profiles = [];
    weapons.forEach(weapon => {

    });
    return new ArmyBookMultiWeapon(name, profiles);
  }

  toString() {
    return `${this.name}-pick one to fire: ${this.profiles.label.join(' ')})`;
  }

}
