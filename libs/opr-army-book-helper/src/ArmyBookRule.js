/**
 * A rule is a plain special Rule that is part of a unit or weapon
 */
export default class ArmyBookRule {

  type = 'ArmyBookRule';

  key = '';
  name = '';
  rating = undefined;
  modify = false;
  label = '';

  // used to restrict e.g. rules
  condition = '';

  /**
   *
   * @param name {string}
   * @param rating {string|number}
   * @param modify {boolean}
   */
  constructor(name, rating = undefined, modify = false, condition = undefined) {
    this.key = name.toLowerCase();
    this.name = name;
    this.rating = rating;
    this.modify = modify;
    this.condition = condition;
    this.label = this.toString();
  }

  static FromObject(json) {
    return new ArmyBookRule(json.name, json.rating, json.modify, json.condition);
  }

  static FromString(ruleString) {
    const match = /^(?<name>[\w\d \-&\\']+?[\w\d])\(?(?<modify>\+?)(?<rating>[\d]*)\)?\s?(?<condition>in melee|when shooting)?$/gmi.exec(ruleString);
    if (match) {
      const { name, rating, modify, condition} = match.groups;
      return new ArmyBookRule(name, rating, !!modify, condition);
    }
    console.warn(`Could not parse ${ruleString}`);
    return null;
  }

  static Is(ruleString) {
    return !!/^(?<name>[\w\d \-&\\']+?[\w\d])\(?(?<modify>\+?)(?<rating>[\d]*)\)?\s?(?<condition>in melee|when shooting)?$/gmi.exec(ruleString);
  }

  toString() {
    return `${this.name}${this.rating ? `(${this.modify ? '+' : ''}${this.rating})` : '' }${this.condition ? ` ${this.condition}` : ''}`;
  }

}
