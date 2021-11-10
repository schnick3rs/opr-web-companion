import createPersistedState from 'vuex-persistedstate'

export default ({store}) => {
  createPersistedState({
    key: 'vuex',
    reducer: (state) => ({
      settings: state.settings,
      armyManCombat: state.armyManCombat,
      doubleTab: state.doubleTab,
      fleets: state.fleets,
      warStuff: state.warStuff,
    }),
  })(store)
}
