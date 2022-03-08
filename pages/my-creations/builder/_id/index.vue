<template>
  <v-container>

    <v-dialog
      v-model="vuexLoading"
      persistent
      width="300"
    >
      <v-card>
        <v-card-text>
          {{ vuexLoadingMessage }}
          <v-progress-linear
            size="64"
            style="margin: 0 auto;"
            indeterminate
            color="orange lighten-2"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <template v-if="isOwner">
      <v-row v-show="showPointCalcOptions" dense>
        <v-col>
          <v-btn
            v-if="showPointCalcOptions"
            small color="info"
            @click="recalculateArmyBook()"
          >
            <v-icon left>mdi-auto-fix</v-icon>
            CALC Army Book
          </v-btn>
        </v-col>
      </v-row>

      <v-row dense>
        <v-col>
          <v-tabs show-arrows>
            <v-tab
              v-for="child in children"
              :key="child.label"
              nuxt
              exact
              :to="`/my-creations/builder/${armyBookId}/${child.to}`"
            >
              <v-icon left small>{{child.icon}}</v-icon>
              {{ child.label }}
            </v-tab>

            <v-menu bottom offset-y v-if="false">
              <template v-slot:activator="{ on, attrs }">
                <v-tab v-bind="attrs" v-on="on">
                  <v-icon left small>mdi-printer</v-icon>
                  Print
                  <v-icon right small>mdi-launch</v-icon>
                </v-tab>
              </template>
              <v-list-item
                v-for="gameSystem in gameSystems.filter(gameSystem => armyBookEnabledGameSystems.includes(gameSystem.id))"
                :key="gameSystem.id"
                nuxt
                exact
                target="_blank"
                :to="`/army-books/view/${armyBookId}~${gameSystem.id}/print`"
              >
                <v-list-item-avatar size="32" tile>
                  <img
                    alt="Avatar"
                    :src="`/img/game-systems/${gameSystem.slug}-avatar.jpg`"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ gameSystem.shortname}}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-menu>

          </v-tabs>
        </v-col>
      </v-row>

      <v-row>
        <nuxt-child></nuxt-child>
      </v-row>
    </template>

    <template v-else>
      <v-row>
        <v-col>
          <v-alert
            type="error"
            outlined
            text
          >
            Permission denied! You have no permission to open this army in edit mode.
          </v-alert>
        </v-col>
      </v-row>
    </template>

  </v-container>
</template>

<script>
const OprBreadcrumbsRow = () => import(/* webpackChunkName: "OprBreadcrumbsRow" */ "~/components/shared/OprBreadcrumbsRow");

export default {
  name: 'index',
  components: {
    OprBreadcrumbsRow,
  },
  async asyncData({ $axios, params }) {
    const armyBookId = params.id;
    let isOwner = false;
    try {
      const { data } = await $axios.get(`/api/army-books/${armyBookId}/ownership`);
      isOwner = data.userId;
    } catch {}
    const { data } = await $axios.get('/api/game-systems/');
    return {
      armyBookId,
      gameSystems: data,
      isOwner,
    };
  },
  data() {
    return {
      commonSpecialRules: [],
      tab: undefined,
      children: [
        { label: 'Units', icon: 'mdi-account-group', to: '' },
        { label: 'Upgrades', icon: 'mdi-auto-upload', to: 'upgrades' },
        { label: 'Special Rules', icon: 'mdi-school', to: 'rules' },
        { label: 'Spells', icon: 'mdi-lightning-bolt', to: 'spells' },
        { label: 'Army Rules', icon: 'mdi-account-hard-hat', to: 'army' },
        { label: 'Flavor', icon: 'mdi-format-text', to: 'flavor' },
        { label: 'Settings', icon: 'mdi-cog', to: 'settings' },
      ],
    };
  },
  head() {
    const title = `${this.armyBookName}`
    return {
      title,
    };
  },
  computed: {
    breadcrumbItems() {
      const breadcrumbItems = [
        { text: '', to: '/', exact: true },
        { text: 'My Creations', to: '/my-creations', exact: true },
      ];
      if (this.armyBookName) {
        const item = {
          text: `${this.armyBookName}`,
          to: `/my-creations/builder/${this.armyBookId}`,
          exact: true,
        };
        breadcrumbItems.push(item);
      }
      return breadcrumbItems;
    },
    vuexLoading() {
      return this.$store.getters['armyBooks/loading'];
    },
    vuexLoadingMessage() {
      return this.$store.getters['armyBooks/loadingMessage'];
    },
    hasPointCalcRights() {
      return this.$store.state.auth?.user?.isAdmin;
    },
    showPointCalcOptions() {
      return this.$config.oprPointCalculatorEnabled && this.hasPointCalcRights;
    },
    armyBookName() {
      return this.$store.getters['armyBooks/armyBookName'](this.armyBookId);
    },
    unitCount() {
      return this.$store.getters['armyBooks/units'](this.armyBookId)?.length || '?';
    },
    armyBookEnabledGameSystems() {
      return this.$store.getters['armyBooks/armyBookEnabledGameSystems'](this.armyBookId);
    }
  },
  watch: {
    armyBookId: {
      handler(armyBookUid) {
        if (armyBookUid && this.isOwner) {
          this.$store.dispatch('armyBooks/loadOne', {armyBookUid});
        }
      },
      immediate: true,
    },
  },
  methods: {
    recalculateArmyBook() {
      if (this.$oprPointCalculator) {
        const payload = { armyBookUid: this.armyBookId };
        this.$store.dispatch('armyBooks/recalculateArmyBook', payload);
      } else {
        console.info('Point Calculator Feature disabled.');
      }
    },
    recalculateUnitCosts() {
      if (this.$oprPointCalculator) {
        const payload = { armyBookUid: this.armyBookId };
        this.$store.dispatch('armyBooks/recalculateUnitCostsArmyBookWide', payload);
      } else {
        console.info('Point Calculator Feature disabled.');
      }
    },
  },
};
</script>
