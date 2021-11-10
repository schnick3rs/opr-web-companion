/**
 * (?<name>[\w\d -]+[\w\d])\(?(?<rating>[\w\d]*)\)?
 */
export default class ArmyBookDefense {

  type = 'ArmyBookDefense';
  name = 'Defense';
  rating = undefined;
  label = '';

  // used to restrict e.g. rules
  condition = '';

  /**
   * @param rating {number}
   * @param condition {string}
   */
  constructor(rating = undefined, condition = undefined) {
    this.rating = rating;
    this.condition = condition?.trim();
    this.label = this.toString();
  }

  static FromObject(json) {
    return new ArmyBookDefense(json.rating);
  }

  static Is(ruleString) {
    return !!/^Defense \+(?<rating>\d)?(?<condition>.*)$/.exec(ruleString);
  }

  static FromString(ruleString) {
    const match = /^Defense \+(?<rating>\d)?(?<condition>.*)$/.exec(ruleString);
    if (match) {
      const { rating, condition } = match.groups;
      return new ArmyBookDefense(rating, condition);
    }
    console.warn(`Could not parse ${ruleString}`);
    return null;
  }

  toString() {
    return `Defense +${this.rating}${this.condition ? ` ${this.condition}` : ''}`;
  }

}
