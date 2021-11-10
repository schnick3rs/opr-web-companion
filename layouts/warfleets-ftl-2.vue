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
          nuxt
          to="/"
        >
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-toolbar-title class="caption text-center" style="flex-grow: 2;" v-if="isFleetRoute && fleet">
          <div>{{fleet.name}}</div>
          <div>{{fleet.cost}}/{{fleet.pointLimit}}pts</div>
          <v-progress-linear
            color="success"
            :value="Math.floor(fleet.cost/fleet.pointLimit*100)"
          ></v-progress-linear>
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon
          nuxt to="/warfleets-ftl/reference/ships"
          v-if="$vuetify.breakpoint.smAndUp"
        >
          <v-icon>mdi-table-eye</v-icon>
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
          <v-list-item nuxt to="/warfleets-ftl/reference/ships">
            <v-list-item-icon><v-icon>mdi-table-eye</v-icon></v-list-item-icon>
            <v-list-item-content>Ship Reference</v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container class="pl-0 pr-0">
          <nuxt />
        </v-container>
      </v-main>

      <opr-footer>
        Based on <a href="https://onepagerules.com/portfolio/warfleets-ftl/" title="Warfleets FTL Overview Page">Warfleets: FTL</a> v1.6
      </opr-footer>
    </v-app>
  </div>
</template>

<script>
import OprFooter from "@/components/OprFooter";
export default {
  components: {OprFooter},
  data () {
    return {
      clipped: false,
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
      ],
      right: true,
      title: 'Warfleets: FTL'
    }
  },
  computed:{
    isFleetRoute() {
      return this.$route.params.id || null;
    },
    fleetRaw() {
      return this.isFleetRoute ? this.$store.getters['fleets/fleet'](this.$route.params.id) : null;
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
    prime() {
      return this.$route;
    },
    theme(){
      return (this.$vuetify.theme.dark) ? 'dark' : 'light'
    }
  }
}
</script>

<style lang="scss">

</style>
