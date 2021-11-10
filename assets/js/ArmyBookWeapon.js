import ArmyBookRule from './ArmyBookRule';

export default class ArmyBookWeapon {

  type = 'ArmyBookWeapon';

  name = null;
  range = 0;
  attacks = 1;
  specialRules = [];
  label = '';

  condition = '';

  /**
   *
   * @param name {string}
   * @param range {number}
   * @param attacks {number}
   * @param specialRules {[ArmyBookRule]}
   */
  constructor(name, range, attacks, specialRules = []) {
    this.name = name;
    this.range = parseInt(range);
    this.attacks = parseInt(attacks);
    this.specialRules = specialRules;
    this.label = this.toString();
  }

  static Is(string) {
    return !!/^([\d\w][\d\w\s\-&\\']+[\d\w])\s?\((\d+["”]|A\d\d?).*\)$/gi.exec(string);
  }

  static FromObject(json) {
    return new ArmyBookWeapon(json.name, json.range, json.attacks, json.specialRules);
  }

  /**
   *
   * @param weaponString
   * @returns {ArmyBookWeapon}
   * @constructor
   */
  static FromString(weaponString) {
    const equipmentMatch = /^(?<name>[\d\w][\d\w\s\-&\\']+[\d\w])\s?\((?<props>.*)\)$/gi.exec(weaponString);
    const name = equipmentMatch.groups.name;
    const props = equipmentMatch.groups.props.split(',').map(prop => prop.trim());
    let range = 0;
    let attacks = 1;
    let specialRules = [];
    props.forEach(prop => {
      const rangeMatch = /^(?<range>\d+)[”"]$/g.exec(prop);
      const attacksMatch = /^A(?<attacks>\d+)$/g.exec(prop);
      if (rangeMatch && rangeMatch.groups.range) {
        range = rangeMatch.groups.range;
      } else if (attacksMatch && attacksMatch.groups.attacks) {
        attacks = attacksMatch.groups.attacks;
      } else {
        const rule = ArmyBookRule.FromString(prop);
        if (rule) {
          specialRules.push(rule);
        } else {
          console.warn(`Could not parse ${prop}`);
        }
      }
    });
    return new ArmyBookWeapon(name, range, attacks, specialRules);
  }

  static CcwShorthand(string) {
    const ccwMatch = /^CCW(?<attacks>[\d]+)$/ig.exec(string.trim());
    if (ccwMatch && ccwMatch.groups) {
      return new ArmyBookWeapon('CCW', 0, ccwMatch.groups.attacks, []);
    }
  }

  toString() {
    let props = [];
    if (this.range && this.range > 0) props.push(`${this.range}"`);
    if (this.attacks) props.push(`A${this.attacks}`);
    if (this.specialRules && this.specialRules.length > 0) {
      this.specialRules.forEach(sr => {
        props.push(sr.label);
      });
    }
    return `${this.name} (${props.join(', ')})`;
  }

}
