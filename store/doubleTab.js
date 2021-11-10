export const state = () => ({
  list: [],
  armies: {},
});

export const getters = {
  armyIds: (state) => state.list,
  armySets: (state) => state.list.map((id) => state.armies[id]),

  army: (state) => (id) => { return state.armies[id]; },

  armyTotalCost: (state) => (id) => {
    let cost = 0;
    const army = state.armies[id];
    army.units.forEach((unit) => {
      unit.weapons.forEach((weapon) => {
        cost += parseInt(weapon.cost);
      });
      unit.specialRules.forEach((rule) => {
        cost += parseInt(rule.cost);
      });
    });
    return cost;
  },

  asJsonString: (state) => (id) => {
    const army = state.armies[id];
    return JSON.stringify(army);
  },

  units: (state) => (id) => {
    const army = state.armies[id];
    return army?.units || [];
  },

  unit: (state) => (id, unitId) => {
    const army = state.armies[id];
    return army?.units.find((unit) => unit.id === unitId);
  },
}

export const mutations = {

  // unit stuff
  addUnit(state, payload) {
    const { id, name, weapons, specialRules } = payload;
    let army = state.armies[id];
    army.units = [
      ...army.units,
      {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4),
        name,
        weapons,
        specialRules,
      },
    ];
  },

  cloneUnit(state, payload) {
    const { id, unitId } = payload;
    let army = state.armies[id];
    const clonedUnit = army.units.find((u) => u.id === unitId);
    army.units = [
      ...army.units,
      {
        ...clonedUnit,
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4),
      },
    ];
  },

  removeUnit(state, payload) {
    const { id , unitId } = payload;
    const army = state.armies[id];
    army.units = army.units.filter((unit) => unit.id !== unitId);
  },

  unitSetName(state, payload) {
    const {id, unitId, name } = payload;
    const army = state.armies[id];
    const unit = army.units.find((unit) => unit.id === unitId);
    unit.name = name;
  },

  unitSetWeapons(state, payload) {
    const { id, unitId, weapons } = payload;
    const army = state.armies[id];
    const unit = army.units.find((unit) => unit.id === unitId);
    unit.weapons = [
      ...weapons,
    ];
  },

  unitSetSpecialRules(state, payload) {
    const { id, unitId, specialRules } = payload;
    const army = state.armies[id];
    const unit = army.units.find((unit) => unit.id === unitId);
    unit.specialRules = [
      ...specialRules,
    ];
  },

  unitAddSpecialRule(state, payload) {
    const {id, unitId, specialRuleKey, cost } = payload;
    const army = state.armies[id];
    const unit = army.units.find((unit) => unit.id === unitId);
    unit.specialRules = [
      ...unit.specialRules,
      { key: specialRuleKey, cost },
    ];
  },

  unitClearSpecialRules(state, payload) {
    const {id, unitId } = payload;
    const army = state.armies[id];
    const unit = army.units.find((unit) => unit.id === unitId);
    unit.specialRules = [];
  },

  // army stuff
  create(state, payload) {
    const { id, name } = payload;
    state.list.push(id);
    const newArmy = {};
    Object.assign(newArmy, getDefaultArmy());

    newArmy.id = id;
    newArmy.name = name || newArmy.name;

    const newObj = {};
    newObj[id] = newArmy;
    state.armies = {
      ...state.armies,
      ...newObj,
    };
  },

  createFromString(state, payload) {
    const { id, stateSting } = payload;
    state.list.push(id);
    const newArmy = {};
    Object.assign(newArmy, JSON.parse(payload.stateString));
    newArmy.id = payload.id;
    const newObj = {};
    newObj[payload.id] = newArmy;
    state.armies = {
      ...state.armies,
      ...newObj,
    };
  },

  delete(state, id) {
    state.list.splice(state.list.indexOf(id), 1);
    delete state.armies[id];
  },

  setArmyName(state, payload) {
    const { id, name } = payload;
    const army = state.armies[id];
    army.name = name;
  },
}

const getDefaultArmy = () => ({
  id: -1,
  customName: 'Undefined Double Tab Army',
  pointLimit: 50,
  units: [],
});
