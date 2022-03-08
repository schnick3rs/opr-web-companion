<template>
  <v-container>
    <v-row>
      <v-col :cols="12" :md="6">
        <v-row>

          <v-col :cols="12">
            <v-chip-group
              multiple
              v-model="armyBookEnabledGameSystems"
              active-class="info"
            >
              <v-chip
                v-for="gameSystem in gameSystems"
                :key="gameSystem.id"
                :value="gameSystem.id"
              >
                <v-avatar left>
                  <v-img
                    alt="Avatar"
                    :src="`/img/game-systems/${gameSystem.slug}-avatar.jpg`"
                  />
                </v-avatar>
                {{ gameSystem.aberration}}
              </v-chip>
            </v-chip-group>
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
            <v-checkbox
              inset dense
              v-model="armyBookIsPublic"
              label="Public"
              hint="Enable to make this visible to others"
              persistent-hint
            ></v-checkbox>
          </v-col>

          <v-col :cols="12">
            <v-checkbox
              inset dense
              v-model="armyBookIsLive"
              label="Ready for play"
              hint="Enable to show it is ready to play"
              persistent-hint
            ></v-checkbox>
          </v-col>

          <v-col :cols="12">
            <v-checkbox
              inset dense
              v-model="armyBookIsOfficial"
              label="Official Armybook"
              hint="Enable to mark this as an official OPR army book"
              persistent-hint
            ></v-checkbox>
          </v-col>

        </v-row>
      </v-col>

      <v-col :cols="12" :md="6" v-if="armyBookEnabledGameSystems">
        <v-card>
          <v-list>
            <v-list-item
              v-for="gameSystem in gameSystems.filter(gameSystem => armyBookEnabledGameSystems.includes(gameSystem.id))"
              :key="gameSystem.id"
              :value="gameSystem.id"
              :disabled="!armyBookEnabledGameSystems.includes(gameSystem.id)"
            >
              <v-list-item-avatar size="32" tile>
                <img
                  alt="Avatar"
                  :src="`/img/game-systems/${gameSystem.slug}-avatar.jpg`"
                  :class="{ 'img--greyscale': !armyBookEnabledGameSystems.includes(gameSystem.id) }"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ gameSystem.shortname}}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  color="info"
                  :disabled="!armyBookEnabledGameSystems.includes(gameSystem.id)"
                  nuxt
                  target="_blank"
                  :to="`/army-books/view/${armyBookId}~${gameSystem.id}/print`"
                >
                  <v-icon>mdi-printer</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
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
      gameSystems: data.filter(system => system.armyBookBuilderEnabled),
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
    armyBookEnabledGameSystems: {
      get() {
        return this.$store.getters['armyBooks/armyBookEnabledGameSystems'](this.armyBookId);
      },
      set(value) {
        this.$store.commit('armyBooks/setArmyBookEnabledGameSystems', { id: this.armyBookId, value });
        this.saveDebounced();
      },
    },
  },
}
</script>

<style scoped lang="scss">
.img--greyscale {
  filter: grayscale(100%);
}
</style>
