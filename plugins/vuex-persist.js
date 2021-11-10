import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
  window.onNuxtReady(() => {
    new VuexPersistence({
      reducer: (state) => ({
        armyManCombat: state.armyManCombat,
        doubleTab: state.doubleTab,
        fleets: state.fleets,
        warStuff: state.warStuff,
      }),
    }).plugin(store);
  });
};
