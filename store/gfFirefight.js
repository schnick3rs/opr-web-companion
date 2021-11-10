export const state = () => ({
  list: [],
  warbands: {},
});

export const getters = {
  warbandIds: (state) => state.list,
  warbandSets: (state) => state.list.map((id) => state.warbands[id]),

  warband: (state) => (id) => { return state.warbands[id]; },

  warbandFactionKey: (state) => (id) => {
    const warband = state.warbands[id];
    return warband?.factionKey;
  },

  warbandTotalCost: (state) => (id) => {
    let cost = 0;
    const warband = state.warbands[id];
    warband.units.forEach((unit) => {
      cost += unit.baseCost;
      unit.upgrades.forEach((upgrade) => {
        cost += upgrade.cost;
      });
    });
    return cost;
  },

  units: (state, getters) => (id) => {
    const warband = state.warbands[id];
    const units = warband?.units || [];
    return units.map((unit) => {
      return {
        ...unit,
        totalCost: getters.unitCost(id, unit.id),
      };
    });
  },

  unit: (state, getters) => (id, unitId) => {
    const warband = state.warbands[id];
    let unit = warband?.units.find((unit) => unit.id === unitId);
    return {
      ...unit,
      totalCost: getters.unitCost(id, unitId),
    };
  },

  unitCost: (state) => (id, unitId) => {
    const warband = state.warbands[id];
    const unit = warband?.units.find((unit) => unit.id === unitId);
    let totalCost = unit.baseCost;
    unit.upgrades.forEach((upgrade) => { totalCost += upgrade.cost; });
    return totalCost;
  }
}


export const mutations = {

  // unit stuff
  addUnit(state, payload) {
    const { id, key, name, equipment, specialRules, unitCost, unitXp } = payload;
    let warband = state.warbands[id];
    const unitId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
    const unit = {};
    Object.assign(unit, getDefaultUnit(unitId, name, key, unitXp, unitCost));
    unit.equipment = equipment;
    unit.specialRules = specialRules;
    warband.units = [ ...warband.units, unit ];
  },

  cloneUnit(state, payload) {
    const { id, unitId } = payload;
    let warband = state.warbands[id];
    const clonedUnit = warband.units.find((u) => u.id === unitId);
    const cloneId = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4);
    warband.units = [
      ...warband.units,
      {
        ...clonedUnit,
        id: cloneId,
      },
    ];
  },

  removeUnit(state, payload) {
    const { id , unitId } = payload;
    const warband = state.warbands[id];
    warband.units = warband.units.filter((unit) => unit.id !== unitId);
  },

  unitSetName(state, payload) {
    const {id, unitId, name } = payload;
    const warband = state.warbands[id];
    const unit = warband.units.find((unit) => unit.id === unitId);
    unit.name = name;
  },

  unitAddUpgrade(state, payload) {
    const { id, unitId, upgradeKey, cost, lose, gains } = payload;
    const warband = state.warbands[id];
    const unit = warband.units.find((unit) => unit.id === unitId);

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

  unitRemoveUpgrade(state, payload) {
    const {id, unitId, upgradeKey} = payload;
    const warband = state.warbands[id];
    const unit = warband.units.find((unit) => unit.id === unitId);

    const upgradeIndex = unit.upgrades.findIndex((upgrade) => upgrade.key === upgradeKey);
    unit.upgrades.splice(upgradeIndex, 1);
    unit.upgrades = [...unit.upgrades];
  },

  // warband stuff
  create(state, payload) {
    const { id, name, faction, pointLimit } = payload;
    state.list.push(id);

    const newWarband = {};
    Object.assign(newWarband, getDefaultWarband(id, name, faction.key, faction.name, pointLimit));

    const newObj = {};
    newObj[id] = newWarband;
    state.warbands = {
      ...state.warbands,
      ...newObj,
    };
  },

  delete(state, id) {
    state.list.splice(state.list.indexOf(id), 1);
    delete state.warbands[id];
  },

  setArmyName(state, payload) {
    const { id, name } = payload;
    const warband = state.warbands[id];
    warband.name = name;
  },
}

const getDefaultUnit = (
  id = -1,
  name = 'Barakuda',
  unitKey = undefined,
  xp = 0,
  baseCost = 0,
) => ({
  id,
  unitKey,
  name,
  baseCost,
  equipment: [],
  specialRules: [],
  upgrades: [],
  xp,
  traits: [],
  expertise: undefined,
});

const getDefaultWarband = (
  id = -1,
  name = 'The Crimson Animals',
  factionKey= undefined,
  factionName= undefined,
  pointsGained = 150
) => ({
  id,
  factionKey,
  factionName,
  name,
  pointsGained,
  pointsSpend: 0,
  units: [],
  missionLog: [],
});
