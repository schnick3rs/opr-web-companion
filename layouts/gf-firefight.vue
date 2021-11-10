<template>
  <div>

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

    <v-app
      :style="{background: $vuetify.theme.themes[theme].background}"
    >
      <v-app-bar
        fixed
        app
        dark
        dense
        src="/img/gf-firefight/gf-firefight-twitter-wide.jpg"
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            gradient="to top right, rgb(255 120 0), rgb(255 0 0 / 70%)"
          ></v-img>
        </template>
        <v-btn
          icon
          nuxt :to="mainActionRoute"
        >
          <v-icon v-if="mainActionRoute === '/'">mdi-home</v-icon>
          <v-icon v-else>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title class="caption text-center" style="flex-grow: 2;" v-if="isWarbandRoute && warband">
          <div>{{ warband.name }}</div>
          <div>{{ warbandTotalCost }}/{{ warband.pointLimit }}pts</div>
          <v-progress-linear
            color="green"
            :value="Math.floor(warbandTotalCost/warband.pointLimit*100)"
          ></v-progress-linear>
        </v-toolbar-title>
        <v-toolbar-title v-else>GF: Firefight v2.10</v-toolbar-title>
        <v-spacer />
        <v-btn v-if="warband" icon exact nuxt :to="`/double-tab/build/builder/${warband.id}/`">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn v-if="warband" icon exact nuxt :to="`/double-tab/build/builder/${warband.id}/view`">
          <v-icon>mdi-ballot-outline</v-icon>
        </v-btn>
        <v-btn v-if="warband" icon exact nuxt :to="`/double-tab/build/builder/${warband.id}/print`">
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container class="pl-0 pr-0 pt-0">
          <nuxt />
        </v-container>
      </v-main>

      <opr-footer>
        Based on <a href="https://onepagerules.com/portfolio/one-off-games/" title="Double Tab by OnePageRles">Double Tab</a> v2.1
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
      drawer: false,
      title: 'Double Tab'
    }
  },
  head() {
    const title = 'Grimdark Future Firefight List Builder';
    const description = "Fast paced cyberpunk and sci-fi skirmish.";
    const image = '/img/gf-firefight/gf-firefight-twitter-wide.jpg';
    return {
      title: 'Explore',
      titleTemplate: '%s | GF Firefight',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', name: 'og:title', content: title },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'og:image', name: 'og:image', content: image },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: description },
        { hid: 'twitter:image', name: 'twitter:image', content: image },
      ],
      link: [
        //{ rel: 'manifest', href: '/manifest.doubletab.webmanifest' },
      ],
    };
  },
  computed: {
    vuexLoading() {
      return this.$store.getters['armyBooks/loading'];
    },
    vuexLoadingMessage() {
      return this.$store.getters['armyBooks/loadingMessage'];
    },
    mainActionRoute() {
      if (this.isShipRoute) {
        return `/gf-firefight/build/builder/${this.$route.params.id}/`;
      }
      if (this.isWarbandRoute) {
        return '/gf-firefight/build';
      }
      return '/';
    },
    isUnitRoute() {
      return this.$route.params.unit || null;
    },
    isWarbandRoute() {
      return this.$route.params.id || null;
    },
    warband() {
      return this.isWarbandRoute ? this.$store.getters['gfFirefight/warband'](this.$route.params.id) : undefined;
    },
    warbandTotalCost() {
      return this.isWarbandRoute ? this.$store.getters['gfFirefight/warbandTotalCost'](this.$route.params.id) : undefined;
    },
    prime() {
      return this.$route;
    },
    theme(){
      return (this.$vuetify.theme.dark) ? 'dark' : 'light'
    },
    user() {
      this.$auth.user;
    }
  },
  watch: {
    user: {
      handler(newValue) {
        this.$store.dispatch('armyBooks/loadAll');
      },
      immediate: true, // make this watch function is called when component created
    },
  },
}
</script>

<style lang="scss">

</style>
