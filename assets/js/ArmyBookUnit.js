import ArmyBookUpgradeOption from "./ArmyBookUpgradeOption";


export default class ArmyBookUnit {

  type = 'ArmyBookUnit';

  name = '';
  size = 1;
  quality = 6;
  defense = 6;
  equipment = [];
  rules = [];
  cost = 0;

  /**
   *
   * @param name {string}
   * @param size {number}
   * @param quality {number}
   * @param defense {number}
   * @param equipment {[ArmyBookWeapon]}
   * @param rules {[ArmyBookRule]}
   * @param cost {number}
   */
  constructor(name, size, quality, defense, equipment, rules, cost) {
    this.name = name;
    this.size = size;
    this.quality = quality;
    this.defense = defense;
    this.equipment = equipment;
    this.rules = rules;
    this.cost = cost;
  }

  /**
   *
   * @param o {object}
   * @constructor
   */
  static Build(o) {
    const { name, size, quality, defense, equipment, rules, cost } = o;
    return new ArmyBookUnit(name, size, quality, defense, equipment, rules, cost);
  }

}
