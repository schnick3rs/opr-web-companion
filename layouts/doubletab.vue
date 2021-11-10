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
        src="/img/double-tab/doubletab-toolbar-slice.jpg"
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            gradient="to top right, rgb(248 85 249 / 70%), rgb(40 163 255 / 70%)"
          ></v-img>
        </template>
        <v-btn
          icon
          nuxt :to="mainActionRoute"
        >
          <v-icon v-if="mainActionRoute === '/'">mdi-home</v-icon>
          <v-icon v-else>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title class="caption text-center" style="flex-grow: 2;" v-if="isArmyRoute && army">
          <div>{{army.name}}</div>
          <div>{{armyTotalCost}}/{{army.pointLimit}}pts</div>
          <v-progress-linear
            color="green"
            :value="Math.floor(armyTotalCost/army.pointLimit*100)"
          ></v-progress-linear>
        </v-toolbar-title>
        <v-toolbar-title v-else>Double Tab v2.1</v-toolbar-title>
        <v-spacer />
        <v-btn v-if="army" icon exact nuxt :to="`/double-tab/build/builder/${army.id}/`">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn v-if="army" icon exact nuxt :to="`/double-tab/build/builder/${army.id}/view`">
          <v-icon>mdi-ballot-outline</v-icon>
        </v-btn>
        <v-btn v-if="army" icon exact nuxt :to="`/double-tab/build/builder/${army.id}/print`">
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
    const title = 'Double Tab List Builder';
    const description = "Fast paced cyberpunk and sci-fi skirmish.";
    const image = '/img/double-tab/doubletab-twitter-wide.jpg';
    return {
      title: 'Explore',
      titleTemplate: '%s | Double Tab',
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
  computed:{
    mainActionRoute() {
      if (this.isUnitRoute) {
        return `/double-tab/build/builder/${this.$route.params.id}/`;
      }
      if (this.isArmyRoute) {
        return '/double-tab/build';
      }
      if (this.$route.name === 'double-tab') {
        return '/'
      }
      return '/double-tab';
    },
    isUnitRoute() {
      return this.$route.params.unit || null;
    },
    isArmyRoute() {
      return this.$route.params.id || null;
    },
    army() {
      return this.isArmyRoute ? this.$store.getters['doubleTab/army'](this.$route.params.id) : undefined;
    },
    armyTotalCost() {
      return this.isArmyRoute ? this.$store.getters['doubleTab/armyTotalCost'](this.$route.params.id) : undefined;
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
