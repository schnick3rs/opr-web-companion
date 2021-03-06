import { nanoid } from 'nanoid';
import { ArmyBook, CalcHelper } from 'opr-army-book-helper';
import pluralize from 'pluralize';

export const state = () => ({
  armyBooks: [],
  loading: false,
  loadingMessage: '',
});

export const getters = {

  loading: (state) => state.loading,
  loadingMessage: (state) => state.loadingMessage,

  armyBookSets: (state) => state.armyBooks,

  armyBook: (state) => (id) => {
    return state.armyBooks.find(a => a.uid === id);
  },

  armyBookFactionKey: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.factionKey;
  },

  armyBookGameSystemId: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.gameSystemId;
  },

  armyBookGameSystemSlug: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.gameSystemSlug;
  },

  armyBookName: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.name;
  },

  armyBookGameSystemUniverse: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.universe;
  },
  armyBookGameSystemAberration: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.aberration;
  },

  armyBookVersionString: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.versionString;
  },

  armyBookHint: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.hint;
  },

  armyBookCoverImagePath: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.coverImagePath;
  },

  armyBookCoverImageCredit: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.coverImageCredit;
  },

  armyBookIsPublic: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.public;
  },

  armyBookIsLive: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.isLive;
  },

  armyBookIsOfficial: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.official;
  },

  armyBookEnabledGameSystems: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.enabledGameSystems;
  },

  armyBookBackground: (state) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    return armyBook?.background;
  },

  units: (state, getters) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const units = armyBook?.units || {};
    return Object.values(units).map((unit) => {
      return {
        ...unit,
      };
    });
  },

  upgradePackages: (state, getters) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const upgradePackages = armyBook?.upgradePackages || [];
    return [...upgradePackages];
  },

  upgradePackage: (state, getters) => (id, upgradeId) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    let upgradePackage = armyBook?.upgradePackages.find((upgrade) => upgrade.uid === upgradeId);
    return { ...upgradePackage };
  },

  specialRules: (state, getters) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const specialRules = armyBook?.specialRules || [];
    return [...specialRules];
  },

  specialRule: (state, getters) => (id, specialRuleId) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    let specialRule = armyBook?.specialRules.find((specialRule) => specialRule.id === specialRuleId);
    return { ...specialRule };
  },

  spells: (state, getters) => (id) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const spells = armyBook?.spells || [];
    return [...spells];
  },

  spell: (state, getters) => (id, spellId) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    let spell = armyBook?.spells.find((spell) => spell.id === spellId);
    return {...spell};
  },

  unit: (state, getters) => (id, unitId) => {
    const armyBook = state.armyBooks.find(a => a.uid === id);
    let unit = armyBook?.units.find((unit) => unit.id === unitId);
    return {
      ...unit,
    };
  },

}

export const mutations = {

  LOADING(state, payload) {
    const { status, message } = payload;
    state.loading = status;
    state.loadingMessage = message ? message : '';
  },

  SET_ARMY_BOOK(state, armyBook) {
    const { uid } = armyBook;
    const index = state.armyBooks.findIndex(armyBook => armyBook.uid = uid);
    state.armyBooks.splice(index, 1);
    state.armyBooks = [ ...state.armyBooks, armyBook ];
  },

  SET_ARMY_BOOKS(state, armyBooks) {
    state.armyBooks = armyBooks;
  },

  CREATE(state, armyBook) {
    state.armyBooks = state.armyBooks.concat(armyBook);
  },

  DELETE(state, armyBookUid) {
    state.armyBooks = state.armyBooks.filter(armyBook => armyBook.uid !== armyBookUid);
  },

  DISABLE(state, armyBookUid) {
    let armyBook = state.armyBooks.find(armyBook => armyBook.uid === armyBookUid);
    armyBook = { ...armyBook, disabled: true };
  },

  SET_UNITS(state, payload) {
    const { armyBookUid, units } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.units = [ ...units ];
  },

  ADD_UNIT(state, payload) {
    const { armyBookUid, unit } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.units = [ ...armyBook.units, unit ];
  },

  UPDATE_UNIT(state, payload) {
    const { armyBookId, unit } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookId);
    const index = armyBook.units.findIndex((a) => a.id === unit.id);
    armyBook.units.splice(index, 1, unit);
    armyBook.units = [ ...armyBook.units ];
  },

  unitsSetOrder(state, payload) {
    const { armyBookId, items } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookId);
    const { units } = armyBook;
    let orderedUnits = [];
    items.forEach((id) => {
      const found = units.find((unit) => unit.id === id);
      orderedUnits.push(found);
    });
    armyBook.units = [ ...orderedUnits ];
  },

  updateUnits(state, payload) {
    const { armyBookUid } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    this.$axios.patch(
      `/api/army-books/${armyBookUid}/units/`,
      armyBook.units
    );
  },

  cloneUnit(state, payload) {
    const { id, unitId } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === id);
    const clonedUnit = armyBook.units.find((u) => u.id === unitId);
    const cloneId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
    armyBook.units = [
      ...armyBook.units,
      {
        ...clonedUnit,
        id: cloneId,
      },
    ];
  },

  REMOVE_UNIT(state, payload) {
    const { armyBookUid, unitId } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.units = armyBook.units.filter((unit) => unit.id !== unitId);
  },

  unitSetSplitPageNumber(state, payload) {
    const { id, unitId, splitPageNumber } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.splitPageNumber = splitPageNumber;
  },

  unitSetName(state, payload) {
    const {id, unitId, name } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.name = name;
  },

  unitSetSize(state, payload) {
    const {id, unitId, size } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.size = size;
  },

  unitSetCost(state, payload) {
    const {id, unitId, cost } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.cost = cost;
  },

  unitSetQuality(state, payload) {
    const {id, unitId, quality } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.quality = quality;
  },

  unitSetDefense(state, payload) {
    const {id, unitId, defense } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.defense = defense;
  },

  unitSetCostMode(state, payload) {
    const {id, unitId, costMode, costModeAutomatic } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit['costMode'] = costMode;
    unit['costModeAutomatic'] = costModeAutomatic;
    armyBook.units = [ ...armyBook.units];
  },

  unitCalculate(state, payload) {
    const {armyBookUid, unitId } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    $axios.patch(`/api/army-books/${armyBookId}/units/${unit.id}/calculate`)
  },

  unitAddUpgrade(state, payload) {
    const { id, unitId, upgradeKey, cost, lose, gains } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);

    const upgrade = { key: upgradeKey, cost };
    unit.upgrades.push(upgrade);
    unit.upgrades = [ ...unit.upgrades ];

    console.warn(`TODO: add upgrade ${upgradeKey} for ${cost}`);

    /*
    lose.forEach((loseItem) => {
      const losingItemIndex = unit.equipment.findIndex((e) => e.label === loseItem.label);
      unit.equipment.splice(losingItemIndex, 1);
    });
    gains.forEach((gain) => {
      unit.equipment.push(gain);
    });
    unit.equipment = [ ...unit.equipment ];
    */
  },

  SET_UPGRADE_PACKAGES(state, payload) {
    const { armyBookUid, upgradePackages } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.upgradePackages = [ ...upgradePackages ];
  },

  unitAddEquipment(state, payload) {
    const { id, unitId, equipment } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.equipment = [ ...unit.equipment, { ...equipment, id: nanoid(5) } ];
  },

  unitUpdateEquipment(state, payload) {
    const { id, unitId, equipmentIndex, field, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.equipment[equipmentIndex][field] = value;
    unit.equipment[equipmentIndex] = { ...unit.equipment[equipmentIndex] };
    unit.equipment = [ ...unit.equipment ];
  },

  unitEquipmentSetCount(state, payload) {
    const { id, unitId, equipmentIndex, count } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.equipment[equipmentIndex].count = count;
  },

  unitRemoveEquipment(state, payload) {
    const { id, unitId, equipmentIndex } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    //this.unit.equipment.splice(index, 1);
    let newEquip = [...unit.equipment];
    newEquip.splice(equipmentIndex, 1);
    unit.equipment = [ ...newEquip ];
  },

  unitAddSpecialRule(state, payload) {
    const { id, unitId, rule } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.specialRules.push(rule);
    const sortedRules = unit.specialRules.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
    });
    unit.specialRules = [ ...sortedRules ];
    if (unit.sync && rule.additional) {
      if (!unit.sync.patch) {
        unit.sync = {
          ...unit.sync,
          patch: [],
        };
      }
      unit.sync.patch.push({op: 'add', path: '/specialRules/-', value: rule});
      unit.sync = {...unit.sync};
    }
  },

  unitRemoveSpecialRule(state, payload) {
    const { id, unitId, specialRulesIndex } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    let changedRulesSet = [...unit.specialRules];
    const [removedRule] = changedRulesSet.splice(specialRulesIndex, 1);
    unit.specialRules = [ ...changedRulesSet ];
    if (unit.sync) {
      if (removedRule.additional) {
        unit.sync.patch = unit.sync.patch.filter((ptc) => {
          return ptc.op !== 'add' || ptc.value.name !== removedRule.name;
        });
      } else {
        if (!unit.sync.patch) {
          unit.sync = {
            ...unit.sync,
            patch: [],
          };
        }
        unit.sync.patch.push({op: 'remove', path: '/specialRules', value: removedRule});
      }
      unit.sync = {...unit.sync};
    }
  },

  unitSetUpgrades(state, payload) {
    const { armyBookUid, unitId, upgrades } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.upgrades = [ ...upgrades ];
  },

  unitAddUpgradePackage(state, payload) {
    const { armyBookUid, unitId, upgradePackageUid } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.upgrades = [ ...unit.upgrades, upgradePackageUid ];
  },

  unitRemoveUpgradePackage(state, payload) {
    const { armyBookUid, unitId, upgradePackageUid } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    const unit = armyBook.units.find((unit) => unit.id === unitId);
    unit.upgrades = [ ...unit.upgrades.filter(u => u !== upgradePackageUid) ];
  },

  unitRemoveUpgrade(state, payload) {
    const {id, unitId, upgradeKey} = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const unit = armyBook.units.find((unit) => unit.id === unitId);

    const upgradeIndex = unit.upgrades.findIndex((upgrade) => upgrade.key === upgradeKey);
    unit.upgrades.splice(upgradeIndex, 1);
    unit.upgrades = [...unit.upgrades];
  },

  setArmyBookName(state, payload) {
    const { id, name } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.name = name;
  },

  setArmyBookVersionString(state, payload) {
    const { id, versionString } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.versionString = versionString;
  },

  setArmyBookHint(state, payload) {
    const { id, hint } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.hint = hint;
  },

  setArmyBookCoverImagePath(state, payload) {
    const { id, coverImagePath } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.coverImagePath = coverImagePath;
  },

  setArmyBookCoverImageCredit(state, payload) {
    const { id, coverImageCredit } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.coverImageCredit = coverImageCredit;
  },

  setArmyBookIsLive(state, payload) {
    const { id, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.isLive = value;
  },

  setArmyBookIsOfficial(state, payload) {
    const { id, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.official = value;
  },

  setArmyBookEnabledGameSystems(state, payload) {
    const { id, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.enabledGameSystems = value;
  },

  setArmyBookIsPublic(state, payload) {
    const { id, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.public = value;
  },

  setArmyBookBackground(state, payload) {
    const { id, background } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.background = background;
  },

  setArmyBookCoverImage(state, payload) {
    const { id, coverImagePath } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    armyBook.coverImagePath = coverImagePath;
  },

  addUpgradePackage(state, payload) {
    const { id, type, limit, amount, lose } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const upgradePackageId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
    const upgradePackage = {};
    Object.assign(upgradePackage, getDefaultUpgradeSection(upgradePackageId, type, limit, amount, lose));
    armyBook.upgradePackages = [ ...armyBook.upgradePackages, upgradePackage ];
  },

  ADD_UPGRADE_PACKAGE(state, payload) {
    const { armyBookUid, upgradePackage } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.upgradePackages = [ ...armyBook.upgradePackages, upgradePackage ];
  },

  REMOVE_UPGRADE_PACKAGE(state, payload) {
    const { armyBookUid, upgradePackageUid } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.upgradePackages = armyBook.upgradePackages.filter((upgradePackage) => upgradePackage.uid !== upgradePackageUid);
  },

  addUpgradePackageSection(state, payload) {
    const { armyBookUid, upgradePackageUid, section } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);
    upgradePackage.sections.push({
      ...section,
      uid: nanoid(5),
      parentPackageUid: upgradePackageUid,
    });
    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  patchUpgradePackageHint(state, payload) {
    const { armyBookUid, upgradePackageUid, hint } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);

    upgradePackage.hint = hint;

    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  patchUpgradePackageSectionLabel(state, payload) {
    const { armyBookUid, upgradePackageUid, sectionIndex, label } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);

    upgradePackage.sections[sectionIndex].label = label;

    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  moveUpgradePackageSection(state, payload) {
    const { armyBookUid, upgradePackageUid, currentSectionIndex, newSectionIndex } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);

    const arraymove = (arr, fromIndex, toIndex) => {
      let element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    arraymove(upgradePackage.sections, currentSectionIndex, newSectionIndex);

    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  removeUpgradePackageSection(state, payload) {
    const { armyBookUid, upgradePackageUid, sectionIndex } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    upgradePackage.sections.splice(sectionIndex, 1);
    armyBook.upgradePackages[upgradePackageUid] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  addUpgradePackageOption(state, payload) {
    const { armyBookUid, upgradePackageUid, option, sectionIndex } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);
    upgradePackage.sections[sectionIndex].options.push({
      ...option,
      uid: nanoid(5),
      parentPackageUid: upgradePackageUid,
      parentSectionUid: upgradePackage.sections[sectionIndex].uid,
    });
    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  moveUpgradePackageOption(state, payload) {
    const { armyBookUid, upgradePackageUid, sectionIndex, currentOptionIndex, newOptionIndex } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);

    const arraymove = (arr, fromIndex, toIndex) => {
      let element = arr[fromIndex];
      arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, element);
    }

    arraymove(upgradePackage.sections[sectionIndex].options, currentOptionIndex, newOptionIndex);

    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [...armyBook.upgradePackages];
  },

  removeUpgradePackageOption(state, payload) {
    const { armyBookUid, upgradePackageUid, sectionIndex, optionIndex } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);
    upgradePackage.sections[sectionIndex].options.splice(optionIndex, 1);
    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [ ...armyBook.upgradePackages];
  },

  alterUpgradePackageOption(state, payload) {
    const { armyBookUid, upgradePackageUid, sectionIndex, optionIndex, option } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    let upgradePackage = armyBook.upgradePackages.find(up => up.uid === upgradePackageUid);
    let upgradePackageIndex = armyBook.upgradePackages.findIndex(up => up.uid === upgradePackageUid);

    upgradePackage.sections[sectionIndex].options[optionIndex] = option;

    armyBook.upgradePackages[upgradePackageIndex] = upgradePackage;
    armyBook.upgradePackages = [ ...armyBook.upgradePackages];
  },

  ADD_SPECIAL_RULE(state, payload) {
    const { armyBookUid, specialRule } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.specialRules = [ ...armyBook.specialRules, specialRule ];
  },

  REMOVE_SPECIAL_RULE(state, payload) {
    const { armyBookUid, specialRuleUid } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.specialRules = armyBook.specialRules.filter((rule) => rule.id !== specialRuleUid);
  },

  setSpecialRuleField(state, payload) {
    const {id, specialRuleId, field, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const specialRule = armyBook.specialRules.find((specialRule) => specialRule.id === specialRuleId);
    specialRule[field] = value;
  },

  ADD_SPELL(state, payload) {
    const { armyBookUid, spell } = payload;
    let armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.spells = [ ...armyBook.spells, spell ];
  },

  REMOVE_SPELL(state, payload) {
    const { armyBookUid, spellUid } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === armyBookUid);
    armyBook.spells = armyBook.spells.filter((spell) => spell.id !== spellUid);
  },

  setSpellField(state, payload) {
    const {id, spellId, field, value } = payload;
    const armyBook = state.armyBooks.find(a => a.uid === id);
    const spell = armyBook.spells.find((spell) => spell.id === spellId);
    spell[field] = value;
  },

}

export const actions = {

  async loadOne({commit}, payload) {
    const { armyBookUid } = payload;
    commit('LOADING', { status: true, message: 'Loading army book...' });
    try {
      let { data, status } = await this.$axios.get(`/api/army-books/${armyBookUid}/mine`);
      commit('SET_ARMY_BOOK', data );
      commit('LOADING', { status: false });
    } catch (e) {
      commit('LOADING', { status: false });
    }
  },

  async loadAll({commit}) {
    commit('LOADING', { status: true, message: 'Loading your army books...' });
    let { data } = await this.$axios.get(`/api/army-books/mine`);
    commit('SET_ARMY_BOOKS', data);
    commit('LOADING', { status: false });
  },

  async create({commit}, payload) {
    commit('LOADING', { status: true, message: 'Create blueprint...' });
    const { name, hint, background, gameSystemId } = payload;
    const freshArmyBook = getDefaultArmyBook(-1, gameSystemId, name, hint, background);
    let { data } = await this.$axios.post(`/api/army-books/`, freshArmyBook)
    let newArmyBook = data;
    commit('CREATE', newArmyBook)
    commit('LOADING', { status: false });
  },

  async createWithClones({commit}, payload) {
    commit('LOADING', { status: true, message: 'Create blueprint...' });
    const { name, hint, gameSystemId, parentArmyBookId, clones, syncs } = payload;
    let { data } = await this.$axios.post(`/api/army-books/detachment`, { name, hint, gameSystemId, parentArmyBookId, clones, syncs })
    let newArmyBook = data;
    commit('CREATE', newArmyBook)
    commit('LOADING', { status: false });
    return data.uid;
  },

  async import({commit}, payload) {
    commit('LOADING', { status: true, message: 'Create blueprint...' });
    const {
      name,
      hint,
      background,
      gameSystemId,
      versionString,
      units,
      upgradePackages,
      spells,
      specialRules,
      official,
      costModeAutomatic,
    } = payload;
    const freshArmyBook = getDefaultArmyBook(-1, gameSystemId, name, hint, background);
    freshArmyBook.versionString = versionString;
    freshArmyBook.units = units;
    freshArmyBook.upgradePackages = upgradePackages;
    freshArmyBook.spells = spells;
    freshArmyBook.specialRules = specialRules;
    freshArmyBook.official = official;
    freshArmyBook.costModeAutomatic = costModeAutomatic;
    let { data } = await this.$axios.post(`/api/army-books/import`, freshArmyBook)
    let newArmyBook = data;
    commit('CREATE', newArmyBook)
    commit('LOADING', { status: false });
  },

  async delete({commit}, uid) {
    //commit('DISABLE', uid);
    let { status } = await this.$axios.delete(`/api/army-books/${uid}`);
    if (status === 200 || status === 204) {
      commit('DELETE', uid);
    }
  },

  async SORT_UNITS({ commit, getters }, armyBookUid) {
    commit('LOADING', { status: true, message: 'Sorting units...' });
    let { data, status } = await this.$axios.post(`/api/army-books/${armyBookUid}/units/sort`)
    commit('SET_UNITS', { armyBookUid, units: data });
    commit('LOADING', { status: false });
  },

  async createUnit({ commit, getters }, payload) {
    let unitId = undefined;
    commit('LOADING', { status: true, message: 'Adding new unit...' });
    const { armyBookUid, name, quality, defense, costMode, costModeAutomatic } = payload;
    const freshUnit = getDefaultUnit(nanoid(7), name, costMode, costModeAutomatic, 1, quality, defense);
    let { data, status } = await this.$axios.post(`/api/army-books/${armyBookUid}/units/`, freshUnit);
    if (status === 200) {
      let unit = data;
      commit('ADD_UNIT', { armyBookUid, unit });
      unitId = unit;
    }
    // todo error snackbar
    commit('LOADING', { status: false });
    return unitId;
  },


  async unitResync({ commit, getteres }, payload) {
    commit('LOADING', { status: true, message: 'Resync unit from parent...' });
    const { armyBookId, unitId } = payload;
    const { data } = await this.$axios.patch(`/api/army-books/${armyBookId}/units/${unitId}/resync`);
    let unit = data;
    commit('UPDATE_UNIT', { armyBookId, unit });
    commit('LOADING', { status: false });
    return unit;
  },

  async cloneUnit({ commit, getters }, payload) {
    let newUnitId = undefined;
    commit('LOADING', { status: true, message: 'Cloning unit...' });
    const { armyBookUid, unitId } = payload;
    const unit = getters.unit(armyBookUid, unitId);
    const clone = {
      ...unit,
      name: `Copy of ${unit.name}`,
      id: nanoid(7),
    };
    let { data, status } = await this.$axios.post(`/api/army-books/${armyBookUid}/units/`, clone);
    if (status === 200) {
      let unit = data;
      commit('ADD_UNIT', { armyBookUid, unit });
      newUnitId = unit;
    }
    commit('LOADING', { status: false });
    return newUnitId;
  },

  async inheritUnits({ commit, getters }, payload) {
    commit('LOADING', { status: true, message: 'Cloning units...' });
    const { armyBookUid, units } = payload;
    let { data, status } = await this.$axios.post(`/api/army-books/${armyBookUid}/units/clone`, units);
    if (status === 200) {
      let { units } = data;
      units.forEach((unit) => {
        commit('LOADING', { status: true, message: `Adding ${unit.name}...` });
        commit('ADD_UNIT', { armyBookUid, unit });
      });
      commit('LOADING', { status: false });
      return units;
    } else {
      commit('LOADING', { status: false });
      return [];
    }
  },

  async deleteUnit({ commit }, payload) {
    commit('LOADING', { status: true, message: 'Deleting unit...' });
    const { armyBookUid, unitId } = payload;
    let { status } = await this.$axios.delete(`/api/army-books/${armyBookUid}/units/${unitId}`);
    commit('REMOVE_UNIT', { armyBookUid, unitId });
    commit('LOADING', { status: false });
  },

  updateUnit({getters}, payload) {
    const { armyBookUid, unitId } = payload;
    const unit = getters.unit(armyBookUid, unitId);
    return this.$axios.patch(`/api/army-books/${armyBookUid}/units/${unit.id}`, unit);
  },

  async updateGeneralInformation({getters}, payload) {
    const { armyBookUid } = payload;
    const armyBook = getters.armyBook(armyBookUid);
    if (armyBook) {
      const patch = {
        name: armyBook.name,
        hint: armyBook.hint,
        version_string: armyBook.versionString,
        background: armyBook.background,
        cover_image_path: armyBook.coverImagePath,
        cover_image_credit: armyBook.coverImageCredit,
        is_live: armyBook.isLive,
        public: armyBook.public,
        official: armyBook.official,
        enabled_game_systems: armyBook.enabledGameSystems,
      };
      const { data } = await this.$axios.patch(`/api/army-books/${armyBookUid}/`, patch);
    }
  },

  async createUpgradePackage({ getters, commit }, payload) {
    const { armyBookUid, hint, letter } = payload;
    const upgradePackage = getMinimalUpgradePackage(nanoid(5), hint, letter.toUpperCase());
    commit('ADD_UPGRADE_PACKAGE', { armyBookUid, upgradePackage });
    let { data } = await this.$axios.post(`/api/army-books/${armyBookUid}/upgrade-packages/`, upgradePackage);
    return data;
  },

  async updateUpgradePackage({getters}, payload) {
    const { armyBookUid, upgradePackageUid } = payload;
    const upgradePackage = getters.upgradePackage(armyBookUid, upgradePackageUid);
    await this.$axios.patch(
      `/api/army-books/${armyBookUid}/upgrade-packages/${upgradePackage.uid}`,
      upgradePackage
    );
  },

  async deleteUpgradePackage({commit}, payload) {
    const { armyBookUid, upgradePackageUid } = payload;
    commit('REMOVE_UPGRADE_PACKAGE', { armyBookUid, upgradePackageUid });
    await this.$axios.delete(`/api/army-books/${armyBookUid}/upgrade-packages/${upgradePackageUid}`)
  },

  async createSpecialRule({commit}, payload) {
    const { armyBookUid, name, effect, hasRating, forUnit, forWeapon } = payload;
    const specialRule = getDefaultSpecialRule(nanoid(5), name, effect, hasRating, forUnit, forWeapon);
    commit('ADD_SPECIAL_RULE', { armyBookUid, specialRule });
    let { data } = await this.$axios.post(`/api/army-books/${armyBookUid}/special-rules/`, specialRule)
    return data;
  },

  async deleteSpecialRule({commit}, payload) {
    const { armyBookUid, specialRuleUid } = payload;
    commit('REMOVE_SPECIAL_RULE', { armyBookUid, specialRuleUid });
    await this.$axios.delete(`/api/army-books/${armyBookUid}/special-rules/${specialRuleUid}`)
  },

  async updateSpecialRule({getters}, payload) {
    const { armyBookUid, specialRuleId } = payload;
    const specialRule = getters.specialRule(armyBookUid, specialRuleId);
    await this.$axios.patch(
      `/api/army-books/${armyBookUid}/special-rules/${specialRule.id}`,
      specialRule
    );
  },

  async createSpell({commit}, payload) {
    const { armyBookUid, name, effect, threshold } = payload;
    const spell = getDefaultSpell(nanoid(5), name, effect, threshold);
    commit('ADD_SPELL', { armyBookUid, spell });
    let { data } = await this.$axios.post(`/api/army-books/${armyBookUid}/spells/`, spell);
    return data;
  },

  async updateSpell({getters}, payload) {
    const { armyBookUid, spellId } = payload;
    const spell = getters.spell(armyBookUid, spellId);
    await this.$axios.patch(
      `/api/army-books/${armyBookUid}/spells/${spell.id}`,
      spell
    );
  },

  async deleteSpell({commit}, payload) {
    const { armyBookUid, spellUid } = payload;
    commit('REMOVE_SPELL', { armyBookUid, spellUid });
    await this.$axios.delete(`/api/army-books/${armyBookUid}/spells/${spellUid}`);
  },

  async recalculateArmyBook({ getters, commit, dispatch }, payload) {
    const { armyBookUid } = payload;
    commit('LOADING', { status: true, message: 'Recalculate army book ...' });
    const { data, status } = await this.$axios.post(`/api/army-books/${armyBookUid}/calculate`);
    commit('LOADING', { status: true, message: 'Updating units ...' });
    commit('SET_UNITS', { armyBookUid, units: data.units });
    commit('LOADING', { status: true, message: 'Updating upgrade packages ...' });
    commit('SET_UPGRADE_PACKAGES', { armyBookUid, upgradePackages: data.upgradePackages });
    commit('LOADING', { status: true, message: 'Done.' });
    commit('LOADING', { status: false });
  },

  async recalculateUnitCostsArmyBookWide({ getters, commit, dispatch }, payload) {
    const { armyBookUid } = payload;
    commit('LOADING', { status: true, message: 'Recalculate units...' });
    const { data, status } = await this.$axios.post(`/api/army-books/${armyBookUid}/units/calculate`);
    commit('SET_UNITS', { armyBookUid, units: data });
    commit('LOADING', { status: false });
  },

  async recalculateUpgradeCostsArmyBookWide({ getters, commit, dispatch }, payload) {
    const { armyBookUid } = payload;
    getters.upgradePackages(armyBookUid).forEach(up => {
      dispatch('recalculateUpgradeCosts', { armyBookUid, upgradePackageUid: up.uid });
    });
  },

  async recalculateUpgradeCosts({ getters, commit, dispatch }, payload) {
    const { armyBookUid, upgradePackageUid } = payload;
    const upgradePackage = getters.upgradePackage(armyBookUid, upgradePackageUid);
    const units = getters.units(armyBookUid).filter(unit => unit.upgrades.includes(upgradePackageUid));

    CalcHelper.recalculateUpgradePackage(armyBookUid, upgradePackage, units, this.$oprPointCalculator).forEach((payload) => {
      commit('alterUpgradePackageOption', payload);
    });

    dispatch('updateUpgradePackage', payload);
  },

  // TODO
  async recalculateUpgradeCostsOption({ getters }, payload) {
    const { armyBookUid, upgradePackageUid, sectionIndex, optionIndex } = payload;
  },

};

const getDefaultUnit = (
  id = -1,
  name = 'Glorius Eel Boy',
  costMode = 'automatic',
  costModeAutomatic = true,
  size = 1,
  quality = 4,
  defense = 4,
  specialRules = [],
  upgrades = [],
  cost = 15,
  splitPageNumber = 0,
) => ({
  id,
  key: name.toLowerCase().replace(/\W/gm, '-'),
  name,
  size,
  quality,
  defense,
  equipment: [
    { label: 'CCW', range: 0, attacks: 1, specialRules: [] },
  ],
  specialRules,
  upgrades,
  cost,
  splitPageNumber,
  costMode,
  costModeAutomatic,
});

const getDefaultUpgradeSection = (
  id,
  type = 'replacement',
  limit = 'one',
  amount = undefined,
  lose = [],
) => {
  return {
    id,
    type,
    limit,
    amount,
    lose,
    options: [],
  };
};

const getMinimalUpgradePackage = (
  uid,
  hint,
) => {
  return {
    uid,
    hint,
    sections: [],
  };
};

const getDefaultSpecialRule = (
  id = -1,
  name,
  description,
  hasRating,
  forUnit,
  forWeapon,
  tags = [],
) => ({
  id,
  key: name.toLowerCase().replace(/\W/gm, '-'),
  label: name,
  name,
  hint: description,
  description,
  hasRating,
  forUnit,
  forWeapon,
  tags,
});

const getDefaultSpell = (
  id = -1,
  name = 'Eel Magic',
  effect,
  threshold,
) => ({
  id,
  name,
  effect,
  threshold,
});

const getDefaultArmyBook = (
  id = -1,
  gameSystemId = 2,
  name = 'The Crimson Animals',
  hint = '',
  background = '',
) => ({
  id,
  name,
  gameSystemId,
  hint,
  background,
  version: {
    label: 'v1.0',
    major: 1,
    minor: 0,
  },
  units: {},
  upgradePackages: {},
  specialRules: {},
  spells: {},
});
