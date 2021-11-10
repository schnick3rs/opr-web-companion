<template>
  <div v-if="enrichedShip">
    <v-toolbar class="pb-4">
      <v-card-text>{{enrichedShip.faction}} • {{enrichedShip.label}}</v-card-text>
      <v-spacer></v-spacer>
      <v-card-text class="text-right">{{allCost}}pts</v-card-text>
    </v-toolbar>

    <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
      <v-row no-gutters>
        <v-col cols="12" :md="6" v-if="enrichedShip">
          <opr-ftl-ship-editor
            :fleetId="fleetId"
            :ship-id="shipId"
          ></opr-ftl-ship-editor>
        </v-col>
      </v-row>
    </v-container>

  </div>
</template>

<script>
import OprFtlShipEditor from "@/components/warfleets-ftl/OprFtlShipEditor";

export default {
  name: "ftl-ship-editor",
  layout: 'warfleets-ftl',
  components: {OprFtlShipEditor},
  async asyncData({ params }) {
    return {
      fleetId: params.id,
      shipId: params.ship,
    };
  },
  data() {
    return {
      armyBook: null,
      roster: [],
      selectedShip: null,
      tab: null,
      showAddShipDialog: false,
    };
  },
  watch: {
    fleetFactionKey: {
      handler(newValue) {
        if (newValue) {
          this.loadFactionArmyBook(newValue);
        }
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  computed: {
    fleetFactionKey() {
      return this.$store.getters['fleets/fleetKey'](this.fleetId);
    },
    fleetRaw() {
      return this.$store.getters['fleets/fleet'](this.fleetId);
    },
    fleet() {
      if (this.fleetRaw) {
        return {
          ...this.fleetRaw,
          cost: this.$store.getters['fleets/cost'](this.fleetRaw.id),
        };
      } else {
        return undefined;
      }
    },
    allCost() {
      return this.$store.getters['fleets/shipAllCost'](this.fleetId, this.ship.id);
    },
    ship() {
      return this.$store.getters['fleets/ship'](this.fleetId, this.shipId);
    },
    shipUpgrades() {
      return this.$store.getters['fleets/shipUpgrades'](this.fleetId, this.shipId);
    },
    shipUpgradesEnriched() {
      return this.$store.getters['fleets/shipUpgrades'](this.fleetId, this.shipId).map((u) => {
        if (u) {
          return {
            ...this.armyBook.upgrades.find((i) => i.key === u.shipUpgrade),
            ...u,
          };
        }
        return undefined;
      });
    },
    enrichedShip() {
      if ( this.armyBook && this.ship ) {
        const rawShip = this.armyBook.shipClasses.find((s) => s.key === this.ship.blueprintKey);
        return {
          ...rawShip,
          ...this.ship,
          upgrades: this.shipUpgradesEnriched,
        };
      } else {
        return null;
      }
    },
  },
  methods: {
    async loadFactionArmyBook(factionKey) {
      const commonResponse = await this.$axios.get(`/api/warfleets-ftl/common/`);
      let finalArmyBook = commonResponse.data;
      if (factionKey !== 'common') {
        const { data } = await this.$axios.get(`/api/warfleets-ftl/${factionKey}/`);
        finalArmyBook.shipClasses = [ ...finalArmyBook.shipClasses, ...data.shipClasses ];
        finalArmyBook.heroes = [ ...finalArmyBook.heroes, ...data.heroes ];
        finalArmyBook.titles = [ ...finalArmyBook.titles, ...data.titles ];
        finalArmyBook.upgrades = [ ...finalArmyBook.upgrades, ...data.upgrades ];
        finalArmyBook.specialRules = [ ...finalArmyBook.specialRules, ...data.specialRules ];
      }
      this.armyBook = finalArmyBook;
    },
    removeFromRoster(shipId) {
      const id = this.fleetId;
      this.$store.commit('fleets/removeShip', { id, shipId } );
    }
  },
}
</script>

<style scoped>

</style>
