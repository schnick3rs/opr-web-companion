import ArmyBookRule from './ArmyBookRule';

export default class ArmyBookUnitAttachment {

  type = 'ArmyBookUnitAttachment';

  name = ''; //"Squad Weapon Attachment";
  unitId = ''; //"adn73" // the uid
  unitString = ''; //"Weapons Team model with Heavy Machinegun";
  size = 1;

  constructor(name, unitId, unitString) {
    this.name = name;
    this.unitId = unitId;
    this.unitString = unitString;
    this.label = this.toString();
  }

  static FromObject(json) {
    return new ArmyBookUnitAttachment(json.name, json.unitId, json.unitString);
  }

  // e.g. label: "Squad Weapon Attachment (add one Weapons Team model with Heavy Machinegun)",
  toString() {
    return `${this.name} (add one ${this.unitString})`;
  }

}
