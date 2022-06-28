<template>
  <v-container>
    <v-row>
      <v-col :cols="12" :md="6">
        <v-row>
          <v-col :cols="12">
            <v-chip-group
              v-model="armyBookEnabledGameSystems"
              multiple
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
                {{ gameSystem.aberration }}
              </v-chip>
            </v-chip-group>
          </v-col>

          <v-col :cols="12">
            <v-text-field
              v-model="armyBookVersionString"
              outlined
              dense
              persistent-hint
              hint="e.g. v1.2, draft, wip"
              label="Version"
            />
          </v-col>

          <v-col :cols="12">
            <v-checkbox
              v-model="armyBookIsPublic"
              inset
              dense
              label="Public"
              hint="Enable to make this visible to others"
              persistent-hint
            />
          </v-col>

          <v-col :cols="12">
            <v-checkbox
              v-model="armyBookIsLive"
              inset
              dense
              label="Ready for play"
              hint="Enable to show it is ready to play"
              persistent-hint
            />
          </v-col>

          <v-col :cols="12">
            <v-checkbox
              v-model="armyBookIsOfficial"
              inset
              dense
              label="Official Armybook"
              hint="Enable to mark this as an official OPR army book"
              persistent-hint
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col v-if="armyBookEnabledGameSystems" :cols="12" :md="6">
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
                >
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ gameSystem.shortname }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action style="display: inline;">
                <v-btn icon color="primary" @click="shareViaWebShare(gameSystem.id)">
                  <v-icon>mdi-share-variant</v-icon>
                </v-btn>
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
  name: 'SettingsTab',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get('/api/game-systems/');
    return {
      armyBookId: params.id,
      gameSystems: data.filter(system => system.armyBookBuilderEnabled),
    };
  },
  computed: {
    showPointCalcOptions() {
      return this.$config.oprPointCalculatorEnabled;
    },
    gameSystemOptions() {
      if (this.gameSystems) {
        return this.gameSystems
          .filter(system => system.armyBookBuilderEnabled)
          .map((system) => {
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
    armyBookName() {
      return this.$store.getters['armyBooks/armyBookName'](this.armyBookId);
    },
    armyBookHint() {
      return this.$store.getters['armyBooks/armyBookHint'](this.armyBookId);
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
        this.$store.commit('armyBooks/setArmyBookIsPublic', { id: this.armyBookId, value });
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
  methods: {
    saveDebounced() {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => { this.save(); }, 500);
    },
    save() {
      this.$store.dispatch('armyBooks/updateGeneralInformation', { armyBookUid: this.armyBookId });
    },
    shareViaWebShare(gameSystemId) {
      navigator.share({
        title: this.armyBookName,
        text: this.armyBookHint,
        url: `/army-books/view/${this.armyBookId}~${gameSystemId}/print`
      });
    },
  },
};
</script>

<style scoped lang="scss">
.img--greyscale {
  filter: grayscale(100%);
}
</style>
