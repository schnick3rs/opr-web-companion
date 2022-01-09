/**
 *
 * Replace one <weapon> and <weapon>
 * Replace one <weapon>
 * Take one <weapon> attachment
 *
 * Upgrade with one
 * Upgrade with two
 * Upgrade with <amount>
 * Upgrade with
 * Upgrade with{ options.length > 1 ? 'one' : ''}
 *
 * Upgrade [all|any|upto|exact] model(s) with [exact|any]
 *  upto 1...n
 *  exact 1...n
 *
 * Replace [all|any|upto|exact] [1...weapons] with [exact|any]
 *
 * [all|any|upto|exact] models may take [exact] [weapon] attachment
 *
 *
 * Upgrade <rule>
 * Upgrade all models with
 * Upgrade one model with one
 * Upgrade all models with any
 *
 * `Upgrade${unitsMaxSize > 1 ? affectsToWord[affectsAmount]+' model':''} with${options.length > 1 ? selectsAsWord[selectAmount] : ''}`
 *
 *
 * Replace [any|number] [Equipment|s]
 * Take [number] [Equipment] Attachment
 * Upgrade with [any|number]
 * Upgrade [any|number] model with [any|number]
 *
 * Options are:
 * for one model in the unit, replace n weapons > calculate for one
 * for any model in the unit, replace n weapons > calculate for one
 * for all models in the unit, replace n weapons > calculate for all
 *
 * Upgrade (add) item,weapon,
 */
const ModelType = Object.freeze({any:1, all:2, upto:3});

const affectsToWord = ['all', 'one', 'two', 'three' ];
const selectsAsWord = ['any', 'one', 'two', 'three' ];

const numberWords = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
];

export default class ArmyBookUpgradeSection {

  type = 'ArmyBookUpgradeSection';

  /**
   * > REPLACE weapons
   * > UPGRADE with weapon|rule|item
   * > TAKE weapon attachment
   *
   * @type {string}
   */
  variant = 'upgrade';

  lose = [];
  requirement = [];
  affects = [];

  affectedModels = 'any';
  optionLimitAmount = 'any';

  computeCostAsSingleModel = false;
  options = [];
  label = '';

  /**
   *
   * @param variant {string}
   * @param lose {[ArmyBookWeapon]}
   * @param affectedModels {string|number}
   * @param optionLimitAmount {string|number}
   * @param computeCostAsSingleModel {boolean}
   */
  constructor(
    variant,
    lose = [],
    affectedModels,
    optionLimitAmount,
    computeCostAsSingleModel = false,
    affects = undefined,
  ) {
    this.variant = variant;

    this.lose = lose;

    this.affectedModels = affectedModels;

    this.optionLimitAmount = optionLimitAmount;
    this.affects = affects;

    this.computeCostAsSingleModel = computeCostAsSingleModel;
    this.label = this.generateLabel();
  }

  generateLabel() {
    const label = [];

    let finalLoses = [];
    switch (this.variant) {

      case 'replace':

        label.push('Replace');

        switch (this.affectedModels) {

          case 'any':
          case 'all':
            label.push(this.affectedModels);
            break;

          default:
            if (!isNaN(this.affectedModels)) {
              if (this.affectedModels > 1) {
                label.push('up to');
                label.push(numberWords[this.affectedModels]);
              } else {
                label.push(numberWords[this.affectedModels]);
              }
            }
        }

        finalLoses = [];
        this.lose.sort().forEach(gain => {
          if (finalLoses.includes(gain)) {
            const index = finalLoses.indexOf(gain);
            finalLoses[index] = `2x ${gain}`;
          } else {
            finalLoses.push(gain);
          }
        });
        if (finalLoses.length <= 2) {
          label.push(finalLoses.join(' and '))
        } else {
          label.push(finalLoses.join(', '))
        }

        break;

      case 'upgrade':

        label.push('Upgrade');

        switch (this.affectedModels) {

          case 'any':
          case 'all':
            label.push(this.affectedModels);
            break;

          default:
            if (!isNaN(this.affectedModels)) {
              if (this.affectedModels > 1) {
                label.push('up to');
                label.push(numberWords[this.affectedModels]);
              } else {
                label.push(numberWords[this.affectedModels]);
              }
            }
        }

        if (this.affects) {
          label.push(this.affects);
        } else {
          label.push('models');
        }
        label.push('with');

        switch (this.optionLimitAmount) {
          case 'any':
            break;

          default:
            if (!isNaN(this.optionLimitAmount)) {
              if (this.optionLimitAmount > 1) {
                label.push('up to');
                label.push(numberWords[this.optionLimitAmount]);
              } else {
                label.push(numberWords[this.optionLimitAmount]);
              }
            }
        }

        break;

      case 'attachment':

        label.push('Take');
        label.push('X');
        label.push('[ITEM]');
        label.push('attachment');

        break;

      case 'model':
        label.push('Add')
        label.push('one')
        label.push('Model')
        label.push('with')
        break;
    }

    return label.join(" ");
  }

  static FromObject(origin) {
    let o = JSON.parse(JSON.stringify(origin));
    return new ArmyBookUpgradeSection(
      o.variant,
      o.lose,
      o.affectedModels,
      o.optionLimitAmount,
      o.computeCostAsSingleModel,
      o.affects,
    );
  }

  /**
   *
   * @param parsableString {string}
   * @constructor
   */
  static FromString(parsableString) {

    // Any model may replace one Razor Claws
    if (parsableString.startsWith('Any model may replace')) {
      const regAnyModelReplaceOne = /^(?<affected>All|Any|One|Up to \w+) models? may replace (\w*) ?(?<lose>.+)$/gmi;
      if (parsableString.match(regAnyModelReplaceOne)) {
        const { groups: { affected, lose } }
          = /^(?<affected>All|Any|One|Up to \w+) models? may replace (\w*) ?(?<lose>.+)$/gmi
          .exec(parsableString);

        return this.BuildReplace(affected.toLowerCase(), [lose]);
      }
    }

    // Replace *
    if (parsableString.startsWith('Replace')) {

      const regReplaceAllAnyOneUpTo = /^Replace (?<affected>all|any|one|up to \w+) ?(?<lose>.+)$/gm;
      if (parsableString.match(regReplaceAllAnyOneUpTo)) {
        const { groups: { affected, lose } }
          = /^Replace (?<affected>all|any|one|up to \w+) ?(?<lose>.+)$/gm.exec(parsableString);

        let affectedModels = 1;

        if (affected.startsWith('up to')) {
          const wordNumberMatch = /^up to (?<wordnumber>\w+)$/gm.exec(affected);
          const { wordnumber } = wordNumberMatch.groups;
          affectedModels = numberWords.findIndex(word => word === wordnumber)
        } else if (affected === 'one') {
          affectedModels = 1;
        } else {
          affectedModels = affected;
        }

        const loses = lose
          .split(' and ').map(s => s.trim())
          // remove trailing s indicating plural weapons
          .map(lostItem => {
            if (lostItem.endsWith('s')) {
              lostItem = lostItem.slice(0, -1);
            }
            return lostItem;
          });

        return this.BuildReplace(affectedModels, loses);
      }

      const regReplacePlain = /^Replace (?<lose>.+)$/gm;
      if (parsableString.match(regReplacePlain)) {
        const { groups: { lose } } = /^Replace (?<lose>.+)$/gm.exec(parsableString);

        const loses = lose
          .split(/,| and /)
          .map(s => s.trim())
          .reduce((prev, current, index, arr) => {
            if (current.match(/^(?<count>\d+)x\s(?<weapon>.+)$/gm)) {
              const { groups: { count, weapon } } = /^(?<count>\d+)x\s(?<weapon>.+)$/gm.exec(current);
              [...Array(parseInt(count)).keys()].forEach(x => prev.push(weapon));
            } else {
              prev.push(current);
            }
            return prev;
          }, [])
          // remove trailing s indicating plural weapons
          .map(lostItem => lostItem.endsWith('s') ? lostItem.slice(0, -1) : lostItem);

        return this.BuildReplace('any', loses);
      }
    }

    // Upgrades *
    if (parsableString.startsWith('Upgrade')) {

      const regUpgradeAllAnyOneUpTo = /^Upgrade (?<affected>any|one|all|up to \w+) (models?) with ?(?<limit>.*)$/gm;
      if (parsableString.match(regUpgradeAllAnyOneUpTo)) {
        const { groups: { affected, limit } }
          = /^Upgrade (?<affected>any|one|all|up to \w+) (models?) with ?(?<limit>.*)$/gm.exec(parsableString);

        let affectedModels = 'any';
        if (affected.startsWith('up to')) {
          const { groups: { wordnumber } } = /up to (?<wordnumber>\w+)/gm.exec(affected);
          affectedModels = numberWords.findIndex(word => word === wordnumber)
        } else if (affected === 'one') {
          affectedModels = 1;
        } else {
          affectedModels = affected;
        }

        let optionLimit = 'any';
        if (limit === 'any' || limit ===  undefined) {
          optionLimit = 'any';
        } else {
          optionLimit = numberWords.findIndex(word => word === optionLimit)
        }

        return this.BuildUpgrade(affectedModels, optionLimit);
      }

      const regUpgradeWeapons = /^Upgrade (?<affected>any|one|all|up to \w+) (?<weapon>.*) with ?(?<limit>\w+)?:?$/gm;
      if (parsableString.match(regUpgradeWeapons)) {
        const { groups: { affected, weapon, limit } }
          = /^Upgrade (?<affected>any|one|all|up to \w+) (?<weapon>.*) with ?(?<limit>\w+)?:?$/gm.exec(parsableString);

        let affectedModels = 'any';
        if (affected.startsWith('up to')) {
          const { groups: { wordnumber } } = /up to (?<wordnumber>\w+)/gm.exec(affected);
          affectedModels = numberWords.findIndex(word => word === wordnumber)
        } else if (affected === 'one') {
          affectedModels = 1;
        } else {
          affectedModels = affected;
        }

        let optionLimit = 'any';
        if (limit === 'any' || limit ===  undefined) {
          optionLimit = 'any';
        } else {
          optionLimit = numberWords.findIndex(word => word === limit)
        }

        return this.BuildUpgrade(affectedModels, optionLimit, weapon);
      }

      const regUpgradePlain = /^Upgrade with ?(?<limit>.*)$/gm;
      if (parsableString.match(regUpgradePlain)) {
        const { groups: { limit } } = /^Upgrade with ?(?<limit>.*)$/gm.exec(parsableString);

        let optionLimit = 'any';
        if (limit === 'any' && limit ===  undefined) {
          optionLimit = 'any';
        } else {
          optionLimit = numberWords.findIndex(word => word === optionLimit)
        }
        return this.BuildUpgrade('all', optionLimit);
      }
    }

    // TODO Upgrade replacing special rules

    // Attachment
    if (parsableString.startsWith('Take')) {
      const regUpgradeAttachment = /^Take (?<affects>all|any|one|up to \w+)? ?(?<weapon>.*) (attachment|upgrade).*/gm;
      if (parsableString.match(regUpgradeAttachment)) {
        const { groups: { affects, weapon } } = regUpgradeAttachment.exec(parsableString);

        // TODO handle affected weapon (low priority)

        let affectedModels = 1;

        if (affects !== undefined) {
          if (affects.startsWith('up to')) {
            const wordNumberMatch = /^up to (?<wordnumber>\w+)$/gm.exec(affects);
            const {wordnumber} = wordNumberMatch.groups;
            affectedModels = numberWords.findIndex(word => word === wordnumber)
          } else if (affects === 'one') {
            affectedModels = 1;
          } else {
            affectedModels = affects;
          }
        }

        return this.BuildUpgrade(affectedModels, 'any');
      }
    }

    // Attachment / item upgrade extended
    if (
      parsableString.toLowerCase().includes('take') &&
      (parsableString.toLowerCase().includes('attachment') || parsableString.toLowerCase().includes('upgrade'))
    ) {
      const regUpgradeAttachment = /^(?<affects>Any|One) ?(models? may )?Take (?<limit>all|any|one|up to \w+) (?<weapon>.*) (attachment|upgrade).*/gim;
      if (parsableString.match(regUpgradeAttachment)) {
        const { groups: { affects, weapon, limit } } = regUpgradeAttachment.exec(parsableString);

        // TODO handle affected weapon (low priority)

        let affectedModels = 1;
        let optionLimit = 'any';

        if (limit.startsWith('up to')) {
          const wordNumberMatch = /^up to (?<wordnumber>\w+)$/gm.exec(limit);
          const { wordnumber } = wordNumberMatch.groups;
          optionLimit = numberWords.findIndex(word => word === wordnumber)
        } else if (limit === 'one') {
          optionLimit = 1;
        } else {
          optionLimit = affects;
        }

        return this.BuildUpgrade(affectedModels, 'any');
      }
    }

    // Mount *
    if (parsableString.startsWith('Mount on')) {
      const regMount = /^Mount on.*$/gm;
      return this.BuildUpgrade('any', 'any');
    }

    if (parsableString.startsWith('Add one model')) {
      return this.BuildSquadAttachment();
    }

    console.warn(`could not parse upgrade section from: ${parsableString}`);
    return undefined;
  }

  static BuildReplace(affectedModels, lose) {
    return new ArmyBookUpgradeSection(
      'replace',
      lose,
      affectedModels,
      'any',
      (affectedModels !== 'all'),
    );
  }

  static BuildUpgrade(affectedModels, optionLimitAmount, weapon) {
    return new ArmyBookUpgradeSection(
      'upgrade',
      [],
      affectedModels,
      optionLimitAmount,
      (affectedModels !== 'all'),
      weapon,
    );
  }

  static BuildAttachment(affectedModels) {
    return new ArmyBookUpgradeSection(
      'attachment',
      [],
      affectedModels,
      'any',
      false,
    );
  }

  static BuildSquadAttachment() {
    return new ArmyBookUpgradeSection(
      'model',
      [],
      1,
      'one',
      true,
    );
  }
}
