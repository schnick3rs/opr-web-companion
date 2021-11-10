<template>
  <div>
    <v-app
      :style="{background: $vuetify.theme.themes[theme].background}"
    >
      <v-app-bar
        fixed
        app
        dark
        dense
        src="/img/product-warfleets-ftl-parallax.png"
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            gradient="to top right, rgba(100,115,201,.7), rgba(25,32,72,.7)"
          ></v-img>
        </template>
        <v-btn
          icon
          nuxt :to="mainActionRoute"
        >
          <v-icon v-if="mainActionRoute === '/'">mdi-home</v-icon>
          <v-icon v-else>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title
          class="caption text-center"
          style="flex-grow: 2;"
          v-if="isFleetRoute && fleet"
        >
          <div>{{fleet.name}}</div>
          <div>{{fleet.cost}}/{{fleet.pointLimit}}pts</div>
          <v-progress-linear
            color="success"
            :value="Math.floor(fleet.cost/fleet.pointLimit*100)"
          ></v-progress-linear>
        </v-toolbar-title>
        <v-btn
          v-if="isFleetRoute && fleet"
          icon
          @click="openFleetEditor()"
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-spacer />
        <v-btn
          v-if="isFleetRoute && fleet"
          v-show="false"
          icon
          nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/view`"
        >
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn
          v-if="isFleetRoute && fleet"
          icon
          nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/print`"
          v-show="$vuetify.breakpoint.smAndUp"
        >
          <v-icon>mdi-printer</v-icon>
        </v-btn>
        <v-btn
          v-if="isFleetRoute && fleet"
          icon
          nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/plain`"
          v-show="$vuetify.breakpoint.smAndUp"
        >
          <v-icon>mdi-ballot-outline</v-icon>
        </v-btn>
        <v-btn
          icon
          @click.stop="drawer = !drawer"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </v-app-bar>

      <v-navigation-drawer
        v-model="drawer"
        fixed
        app
        right
      >
        <v-list dense nav>
          <v-list-item
            v-if="isFleetRoute && fleet"
            v-show="false"
            icon
            nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/view`"
          >
            <v-list-item-icon><v-icon>mdi-eye</v-icon></v-list-item-icon>
            <v-list-item-content>View roster</v-list-item-content>
          </v-list-item>
          <v-list-item
            v-if="isFleetRoute && fleet"
            icon
            nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/print`"
          >
            <v-list-item-icon><v-icon>mdi-printer</v-icon></v-list-item-icon>
            <v-list-item-content>Print View</v-list-item-content>
          </v-list-item>
          <v-list-item
            v-if="isFleetRoute && fleet"
            icon
            nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/plain`"
          >
            <v-list-item-icon><v-icon>mdi-ballot-outline</v-icon></v-list-item-icon>
            <v-list-item-content>Plain View</v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item nuxt to="/warfleets-ftl/reference/ships">
            <v-list-item-icon><v-icon>mdi-table-eye</v-icon></v-list-item-icon>
            <v-list-item-content>Ship Reference</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container class="pl-0 pr-0 pt-0">
          <nuxt />
        </v-container>
      </v-main>

      <opr-footer>
        Based on <a href="https://onepagerules.com/portfolio/warfleets-ftl/" title="Warfleets FTL Overview Page">Warfleets: FTL</a> v1.6
      </opr-footer>
    </v-app>

    <v-dialog
      v-model="showEditFleetDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Edit fleet"
        @close="closeFleetEditor()"
        @apply="updateFleetDetails()"
      >
        <v-text-field
          dense outlined
          label="Fleet Name"
          v-model="editFleetName"
        ></v-text-field>

        <v-text-field
          v-model="editFleetPointLimit"
          type="number"
          label="Point Limit"
          dense outlined
          persistent-hint hint="Press + to increase by 300pts."
          prepend-icon="mdi-minus-box"
          @click:prepend="editFleetPointLimit = (Math.ceil(editFleetPointLimit/300)-1)*300"
          append-outer-icon="mdi-plus-box"
          @click:append-outer="editFleetPointLimit = (Math.floor(editFleetPointLimit/300)+1)*300"
        >
        </v-text-field>
        <div class="caption pl-4 pr-4">
          <v-icon small color="primary">mdi-information</v-icon>
          Your fleet may contain {{heroAmountString}}.
        </div>

        <v-select
          class="mt-4"
          v-model="editFleetLegendary"
          dense outlined
          :items="editFleetLegendaryItems"
          label="Legendary Fleet (Optional)"
          item-text="name"
          item-value="key"
          return-object
          clearable
        ></v-select>
        <div class="caption pl-4" v-if="editFleetLegendary">
          <p><strong>Pro:</strong> {{ editFleetLegendary.pro }}</p>
          <p><strong>Con:</strong> {{ editFleetLegendary.con }}</p>
        </div>

      </opr-dialog>
    </v-dialog>

  </div>
</template>

<script>
import OprFooter from "@/components/OprFooter";
export default {
  components: {OprFooter},
  data () {
    return {
      drawer: false,
      title: 'Warfleets: FTL',
      showEditFleetDialog: false,
      editFleetName: '',
      editFleetPointLimit: 300,
      editFleetLegendary: undefined,
      editFleetLegendaryItems: [],
    }
  },
  computed:{
    mainActionRoute() {
      if (this.isShipRoute) {
        return `/warfleets-ftl/build/builder/${this.$route.params.id}/`;
      }
      if (this.isFleetRoute) {
        return '/warfleets-ftl/build';
      }
      return '/';
    },
    isFleetRoute() {
      return this.$route.params.id || null;
    },
    isShipRoute() {
      return this.$route.params.ship || null;
    },
    fleetRaw() {
      return this.isFleetRoute ? this.$store.getters['fleets/fleet'](this.$route.params.id) : undefined;
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
    fleetFactionKey() {
      return this.fleetRaw ? this.$store.getters['fleets/fleetKey'](this.fleetRaw.id) : undefined;
    },
    prime() {
      return this.$route;
    },
    theme(){
      return (this.$vuetify.theme.dark) ? 'dark' : 'light'
    },
    full300() {
      return Math.floor(this.editFleetPointLimit/300);
    },
    heroAmountString() {
      if (this.full300 > 1) {
        return `${this.full300} heroes`;
      }
      return '1 hero';
    },
  },
  watch: {
    fleetFactionKey: {
      handler(newValue) {
        this.loadFactionLegendaryFleets(newValue);
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  methods: {
    async loadFactionLegendaryFleets(factionKey = undefined) {
      if (factionKey) {
        const start = new Date();
        const { data } = await this.$axios.get(`/api/warfleets-ftl/${factionKey}/legendary-fleets`);
        this.editFleetLegendaryItems = data;
        const elapsed = new Date() - start;
        console.info(`Loaded ${data.length} legendary fleets for ${factionKey} in ${elapsed} ms.`);
      } else {
        this.editFleetLegendaryItems = [];
        console.info(`Clean legendary fleet options.`);
      }
    },
    openFleetEditor() {
      this.editFleetName = this.fleet.name;
      this.editFleetPointLimit = this.fleet.pointLimit;
      this.editFleetLegendary = this.editFleetLegendaryItems.find((item) => item.key === this.fleet.legendary);
      this.showEditFleetDialog = true;
    },
    closeFleetEditor() {
      this.showEditFleetDialog = false;
    },
    updateFleetDetails(){
      const id = this.fleet.id;
      this.$store.commit('fleets/setName', { id, name: this.editFleetName });
      this.$store.commit('fleets/setPointLimit', { id, pointLimit: this.editFleetPointLimit });
      const legendaryFleetKey = this.editFleetLegendary?.key;
      this.$store.commit('fleets/setLegendary', { id, legendaryFleetKey });
      this.closeFleetEditor();
    },
  }
}
</script>

<style lang="scss">

</style>
