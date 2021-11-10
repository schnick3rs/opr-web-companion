// Grave Armor (Tough(+3)) -> Upgrade granting Rule
// Ancient Banner (Fear) -> Upgrade granting Rule
// Precision Shots -> Rule
// Combat Bike (Fast, Impact(1), Twin Rifle (30”,A4)) -> Upgrade granting Rule and Weapon
// Shred Pistol (6”, A2, Rending) -> Weapon
// Energy Sword (A2, AP(1), Rending), Energy Fist (A2, AP(3)), Fist-Pistol (12”, A3) -> [Items,Rule]

import ArmyBookRule from './ArmyBookRule';
import ArmyBookWeapon from './ArmyBookWeapon';
import ArmyBookDefense from './ArmyBookDefense';

/**
 * a combined ite, be it a renamed special rule, a vehicle, bike or mount
 */
export default class ArmyBookItem {

  type = 'ArmyBookItem';
  name = '';
  content = [];
  label = '';

  /**
   *
   * @param name {string}
   * @param content {[ArmyBookRule|ArmyBookWeapon|ArmyBookDefense]}
   */
  constructor(name, content = []) {
    this.name = name;
    this.content = content;
    this.generateLabel();
  }

  generateLabel() {
    const contentString = this.content.map(gain => gain.label).sort();
    this.label = `${this.name} (${contentString.join(", ")})`; // AoF Mount
  }

  static FromObject(json) {
    const content = json.content.map(o => {
      if (o.attacks) {
        return ArmyBookWeapon.FromObject(o);
      } else if (o.name === 'Defense') {
        return ArmyBookDefense.FromObject(o);
      } else {
        return ArmyBookRule.FromObject(o);
      }
    });
    return new ArmyBookItem(json.name, content);
  }

  static Is(string) {

    // e.g. Automa Horse - Fast, Impact(1)
    const matchAoFMount = /^(?<name>[\w -]+) - (?<items>[\w\d\(\), ”"\+]*)$/;
    const mountMatch = matchAoFMount.exec(string);

    // e.g. Combat Bike (Fast, Impact(1), Twin Assault Rifle (24”,A2))
    // e.g. Destroyer Armor (Ambush, Tough(+3))
    const matchGfUpgrade = /^(?<name>[\w -]+) \((?<items>[\w\d\(\), ”"\+]*)\)$/;
    const matchGf = matchGfUpgrade.exec(string);

    return !!mountMatch || !!matchGf;
  }

  static FromSimpleString(string) {
    const match = /^(?<name>[\w\d\s-]+) \((?<items>[\w\d\s\(\),\+]*)\)$/.exec(string);
    if (match) {
      const { name, items } = match.groups;
      const parts = items.split(';').map(item => item.trim());
      const content = [];
      parts.forEach(part => {
        if (ArmyBookDefense.Is(part)) {
          content.push(ArmyBookDefense.FromString(part));
        } else if (ArmyBookRule.Is(part)) {
          content.push(ArmyBookRule.FromString(part));
        } else {
          console.info(`Could not parse ${part}`);
        }
      });
      return new ArmyBookItem(name, content);
    }
    return false;
  }

  static FromStringSim(itemString) {
    const match = /^(?<name>[\w -]+) [\(\[](?<items>[\w\d\(\), ”"\+]*)[\)\]]$/g.exec(itemString);
    if (match) {
      const {name, items} = match.groups;
      const parts = items.split(';').map(item => item.trim());
      const content = [];
      parts.forEach(part => {
        if (ArmyBookWeapon.Is(part)) {
          content.push(ArmyBookWeapon.FromString(part));
        } else if (ArmyBookDefense.Is(part)) {
          content.push(ArmyBookDefense.FromString(part));
        } else if (ArmyBookRule.Is(part)) {
          content.push(ArmyBookRule.FromString(part));
        } else {
          console.info(`Could not parse ${part}`);
        }
      });
      return new ArmyBookItem(name, content);
    }
  }

  static FromString(itemString) {
    const match = /^(?<name>[\w -]+) [\(\[](?<items>[\w\d\(\), ”"\+]*)[\)\]]$/g.exec(itemString);
    if (match) {
      const { name, items } = match.groups;
      // content = Fast, Impact(1), Twin Rifle (30”,A4);
      const matches = items.matchAll(/(, )?(?<item>[\w\d -]+ ?\([\w\d”,\+\(\)]+\)|[\w\d -]+)/g);
      let parts = [];
      for (const match of matches) {
        parts.push(match[1]);
      }
      let content = [];
      parts.forEach(part => {
        if (ArmyBookWeapon.Is(part)) {
          content.push(ArmyBookWeapon.FromString(part));
        } else if (ArmyBookDefense.Is(part)) {
          content.push(ArmyBookDefense.FromString(part));
        } else if (ArmyBookRule.Is(part)) {
          content.push(ArmyBookRule.FromString(part));
        } else {
          console.info(`Could not parse ${part}`);
        }
      });
      return new ArmyBookItem(name, content);
    }
  }

}
