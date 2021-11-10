export const state = () => ({
  list: [],
  fleets: {},
});

export const getters = {
  fleetIds: (state) => state.list,
  fleetSets: (state) => state.list.map((charId) => state.fleets[charId]),

  fleet: (state) => (id) => {
    return state.fleets[id];
  },

  asJsonString: (state) => (id) => {
    const fleet = state.fleets[id];
    return JSON.stringify(fleet);
  },

  fleetKey: (state) => (id) => {
    return state.fleets[id]?.faction;
  },

  cost: (state, getters) => (id) => {
    let costs = 0;
    const fleet = state.fleets[id];
    fleet.ships.forEach((ship) => {
      costs += getters.shipAllCost(id, ship.id);
    });
    return costs;
  },

  heroes: (state) => (id) => {
    let heroes = [];
    const fleet = state.fleets[id];
    fleet.ships.forEach((ship) => {
      if (ship.hero) {
        heroes.push(ship.hero);
      }
    });
    return heroes;
  },

  /**
   * ships valid
   * within point limit
   * no duplicated heroes
   * only 1 hero per 300
   * not more than 2x ship count squadron count
   * @param state
   * @param getters
   * @returns {function(*)}
   */
  fleetViolations: (state, getters) => (id) => {
    let violations = [];
    const fleet = state.fleets[id];

    const cost = getters.cost(id);
    if (cost > fleet.pointLimit) {
      violations.push({ key: 'fleet-point-limit-exceeded', label: 'To much points spend.', text: `` });
    }

    const heroes = getters.heroes(id);
    if (heroes.length > Math.floor(fleet.pointLimit/300)) {
      violations.push({ key: 'fleet-hero-limit-exceeded', label: 'To much heroes selected.' });
    }

    let heroSet = new Set();
    const hasDuplicateHeroes = heroes
      .some((hero) => {
        return heroSet.size === heroSet.add(hero.key).size;
      });
    if (hasDuplicateHeroes) {
      violations.push({ key: 'ship-duplicate-heroes', label: 'Fleet contains duplicated heroes.' });
    }

    const shipCount = getters.shipCount(id);
    const squadronCount = getters.squadronCount(id);
    const upgradesCount = getters.upgradesCount(id);
    let factor = fleet?.legendary === 'morka-s-mob' ? shipCount : 0;
    if (squadronCount > (upgradesCount + factor)) {
      violations.push({ key: 'fleet-squadron-limit-exceeded', label: 'To much squadrons.' });
    }

    return violations;
  },

  shipCount: (state) => (id) => {
    const fleet = state.fleets[id];
    return fleet.ships.filter((s) => !s.blueprintKey.endsWith('squadron')).length;
  },

  squadronCount: (state) => (id) => {
    const fleet = state.fleets[id];
    return fleet.ships.filter((s) => s.blueprintKey.endsWith('squadron')).length;
  },

  upgradesCount: (state) => (id) => {
    const fleet = state.fleets[id];
    let count = 0;
    fleet.ships.forEach((s) => count += s.upgrades?.length || 0);
    return count;
  },

  ships: (state, getters) => (id) => {
    const fleet = state.fleets[id];
    const ships = fleet?.ships || [];
    return ships.map((ship) => {
      return {
        ...ship,
        violations: [...getters.shipViolations(id, ship.id)],
      }
    });
  },

  ship: (state, getters) => (id, shipId) => {
    const fleet = state.fleets[id];
    const ship = fleet?.ships.find((s) => s.id === shipId);
    if (ship) {
      return {
        ...ship,
        violations: [...getters.shipViolations(id, ship.id)],
      };
    }
    return ship;
  },

  shipAllCost: (state) => (id, shipId) => {
    let cost = 0;
    const fleet = state.fleets[id];
    const ship = fleet?.ships.find((s) => s.id === shipId);
    if (ship) {
      cost += ship.cost;
      cost += ship?.hero?.cost || 0;
      cost += ship?.title?.cost || 0;
    }
    return cost;
  },

  /**
   * ship has only unique upgrades
   * ship has no duplicated arcs
   * @param state
   * @returns {function(*, *)}
   */
  shipViolations: (state) => (id, shipId) => {
    const fleet = state.fleets[id];
    const ship = fleet?.ships.find((s) => s.id === shipId);

    let violations = [];

    const upgrades = ship?.upgrades || [];

    let upgradeSet = new Set();
    const hasDuplicateUpgrades = upgrades
      .filter((upgrade) => upgrade instanceof Object)
      .some((upgrade) => {
        return upgradeSet.size === upgradeSet.add(upgrade.shipUpgrade).size;
      });
    if (hasDuplicateUpgrades) {
      violations.push({ key: 'ship-duplicate-upgrades', label: 'Ship has duplicated upgrades.' });
    }

    let weaponArcSet = new Set();
    const hasDuplicateWeaponArcs = upgrades
      .filter((upgrade) => upgrade instanceof Object)
      .filter((upgrade) => upgrade.arc !== undefined)
      .some((upgrade) => {
        return weaponArcSet.size === weaponArcSet.add(upgrade.arc).size;
      });
    if (hasDuplicateWeaponArcs) {
      violations.push({ key: 'ship-duplicate-weapon-arcs', label: 'Weapons can´t use the same fire arc.' });
    }

    return violations;
  },

  shipUpgrades: (state) => (id, shipId) => {
    const fleet = state.fleets[id];
    const ship = fleet?.ships.find((s) => s.id === shipId);
    return ship?.upgrades || [];
  },

  shipHero: (state) => (id, shipId) => {
    const fleet = state.fleets[id];
    const ship = fleet?.ships.find((s) => s.id === shipId);
    return ship?.hero || null;
  },

  shipTitle: (state) => (id, shipId) => {
    const fleet = state.fleets[id];
    const ship = fleet?.ships.find((s) => s.id === shipId);
    return ship?.title || null;
  },

};

export const mutations = {

  addShip(state, payload) {
    const { id, name, blueprintKey, cost } = payload;
    let fleet = state.fleets[id];
    fleet.ships = [
      ...fleet.ships,
      {
        id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4),
        name,
        blueprintKey,
        cost,
        upgrades: [],
        hero: undefined,
        title: undefined,
      },
    ];
  },

  cloneShip(state, payload) {
    const { id, shipId } = payload;
    let fleet = state.fleets[id];
    const ship = fleet.ships.find((u) => u.id === shipId);
    const clone = {
      ...ship,
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 4),
    };
    clone.hero = undefined;
    fleet.ships = [
      ...fleet.ships,
      clone,
    ];
  },

  removeShip(state, payload) {
    const { id , shipId } = payload;
    const fleet = state.fleets[id];
    fleet.ships = fleet.ships.filter((ship) => ship.id !== shipId);
  },

  shipSetName(state, payload) {
    const { id , shipId, name } = payload;
    const fleet = state.fleets[id];
    const ship = fleet.ships.find((ship) => ship.id === shipId);
    ship.name = name;
  },

  shipSetUpgrade(state, payload) {
    const { id , shipId, shipUpgrade, slotIndex } = payload;
    const fleet = state.fleets[id];
    const ship = fleet.ships.find((ship) => ship.id === shipId);
    if (shipUpgrade) {
      ship.upgrades[slotIndex] = { slotIndex, shipUpgrade };
    } else {
      delete ship.upgrades[slotIndex];
      //ship.upgrades.splice(slotIndex, 1);
    }
    ship.upgrades = [...ship.upgrades];
  },

  shipSetWeaponArc(state, payload) {
    const { id, shipId, slotIndex, weaponKey, weaponArc } = payload;
    const fleet = state.fleets[id];
    const ship = fleet.ships.find((ship) => ship.id === shipId);
    const upgrade = ship.upgrades.filter((u) => u).find((u) => u.shipUpgrade === weaponKey && u.slotIndex === slotIndex);
    if (upgrade) {
      ship.upgrades[slotIndex] = { ...ship.upgrades[slotIndex], arc: weaponArc };
      ship.upgrades = [...ship.upgrades];
    }
  },

  shipSetHero(state, payload) {
    const { id , shipId, heroKey, cost } = payload;
    const fleet = state.fleets[id];
    const ship = fleet.ships.find((ship) => ship.id === shipId);
    const hero = { key: heroKey, cost: cost};
    ship.hero = { ...hero };
  },

  shipSetTitle(state, payload) {
    const { id , shipId, titleKey, cost } = payload;
    const fleet = state.fleets[id];
    const ship = fleet.ships.find((ship) => ship.id === shipId);
    const title = { key: titleKey, cost: cost };
    ship.title = { ...title };
  },

  // fleet handling
  create(state, payload) {
    const { id, name, faction, pointLimit, legendaryFleet } = payload;
    state.list.push(id);
    const newFleet = {};
    Object.assign(newFleet, getDefaultFleet(id, faction, name, pointLimit));

    newFleet.legendary = legendaryFleet || newFleet.legendaryFleet;

    const newObj = {};
    newObj[id] = newFleet;
    state.fleets = {
      ...state.fleets,
      ...newObj,
    };
  },

  createFromString(state, payload) {
    const { id, stateSting } = payload;
    state.list.push(id);
    const newFleet = {};
    Object.assign(newFleet, JSON.parse(payload.stateString));
    newFleet.id = payload.id;
    const newObj = {};
    newObj[payload.id] = newFleet;
    state.fleets = {
      ...state.fleets,
      ...newObj,
    };
  },

  delete(state, id) {
    state.list.splice(state.list.indexOf(id), 1);
    delete state.fleets[id];
  },

  setName(state, payload) {
    const { id , name } = payload;
    const fleet = state.fleets[id];
    fleet.name = name;
  },

  setPointLimit(state, payload) {
    const { id , pointLimit } = payload;
    const fleet = state.fleets[id];
    fleet.pointLimit = pointLimit;
  },

  setLegendary(state, payload) {
    const { id , legendaryFleetKey } = payload;
    const fleet = state.fleets[id];
    fleet.legendary = legendaryFleetKey;
    state.fleets[id] = { ...fleet };
  },

};

const getDefaultFleet = (
  id = -1,
  faction = 'common',
  name = 'Some Fleety Name',
  pointLimit = 300
) => ({
  id,
  name,
  faction,
  pointLimit,
  systemVersion: 'v1.1',
  armyBookVersion: 'v1.1',
  legendary: undefined,
  ships: [],
});
