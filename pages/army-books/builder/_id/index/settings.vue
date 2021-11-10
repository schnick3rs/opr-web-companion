<template>
  <v-container>
    <v-row>
      <v-col :cols="12" :md="6">
        <v-row>

          <v-col :cols="12">
            <v-select
              outlined dense
              v-model="armyBookGameSystemId"
              :items="gameSystemOptions"
              label="Game System"
              persistent-hint hint="Can`t be changed"
              readonly
            ></v-select>
          </v-col>

          <v-col :cols="12">
            <v-text-field
              outlined dense
              v-model="armyBookVersionString"
              persistent-hint hint="e.g. v1.2, draft, wip"
              label="Version"
            ></v-text-field>
          </v-col>

          <v-col :cols="12">
            <v-switch
              inset dense
              v-model="armyBookIsPublic"
              :label="`${armyBookIsPublic ? 'Public' : 'Private'}`"
              hint="Show others the state of your Army Book"
              persistent-hint
            ></v-switch>
          </v-col>

          <v-col :cols="12">
            <v-switch
              inset dense
              v-model="armyBookIsLive"
              :label="`${armyBookIsLive ? 'Ready for play' : 'Still being worked on'}`"
              hint="Show others the state of your Army Book"
              persistent-hint
            ></v-switch>
          </v-col>

          <v-col :cols="12">
            <v-switch
              inset dense
              v-model="armyBookIsOfficial"
              :label="`${armyBookIsOfficial ? 'Official OPR' : 'Homebrew'}`"
              hint="Show others the state of your Army Book"
              persistent-hint
            ></v-switch>
          </v-col>

        </v-row>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>

export default {
  name: 'settings',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get('/api/game-systems/');
    return {
      armyBookId: params.id,
      gameSystems: data,
    };
  },
  methods: {
    saveDebounced() {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => {this.save()}, 500);
    },
    save() {
      this.$store.dispatch('armyBooks/updateGeneralInformation', { armyBookUid: this.armyBookId });
    },
  },
  computed: {
    hasPointCalcRights() {
      return this.$store.state.auth?.user?.isAdmin;
    },
    showPointCalcOptions() {
      return this.$config.oprPointCalculatorEnabled && this.hasPointCalcRights;
    },
    gameSystemOptions() {
      if (this.gameSystems) {
        return this.gameSystems
          .filter(system => system.armyBookBuilderEnabled)
          .map(system => {
            return {
              text: system.fullname,
              value: system.id,
            };
          });
      }
      return [];
    },
    armyBookGameSystemId() {
      return this.$store.getters['armyBooks/armyBookGameSystemId'](this.armyBookId);
    },
    armyBookVersionString: {
      get() {
        return this.$store.getters['armyBooks/armyBookVersionString'](this.armyBookId);
      },
      set(versionString) {
        this.$store.commit('armyBooks/setArmyBookVersionString', { id: this.armyBookId, versionString });
        this.saveDebounced();
      },
    },
    armyBookIsLive: {
      get() {
        return this.$store.getters['armyBooks/armyBookIsLive'](this.armyBookId);
      },
      set(value) {
        this.$store.commit('armyBooks/setArmyBookIsLive', { id: this.armyBookId, value });
        this.saveDebounced();
      },
    },
    armyBookIsPublic: {
      get() {
        return this.$store.getters['armyBooks/armyBookIsPublic'](this.armyBookId);
      },
      set(value) {
        this.$store.commit('armyBooks/setArmyBookIsPublic', {id: this.armyBookId, value});
        this.saveDebounced();
      },
    },
    armyBookIsOfficial: {
      get() {
        return this.$store.getters['armyBooks/armyBookIsOfficial'](this.armyBookId);
      },
      set(value) {
        this.$store.commit('armyBooks/setArmyBookIsOfficial', { id: this.armyBookId, value });
        this.saveDebounced();
      },
    },
  },
}
</script>

<style scoped>

</style>
