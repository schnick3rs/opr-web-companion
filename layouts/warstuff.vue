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
        src="/img/war-stuff/warstuff-hero.jpg"
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            gradient="to top right, rgb(237 81 81 / 70%), rgb(57 143 32 / 70%)"
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
            color="blue"
            :value="Math.floor(armyTotalCost/army.pointLimit*100)"
          ></v-progress-linear>
        </v-toolbar-title>
        <v-toolbar-title v-else>WarStuff v2.0</v-toolbar-title>
        <v-spacer />
        <v-btn v-if="army" icon exact nuxt :to="`/war-stuff/build/builder/${army.id}/`">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn v-if="army" icon exact nuxt :to="`/war-stuff/build/builder/${army.id}/view`">
          <v-icon>mdi-ballot-outline</v-icon>
        </v-btn>
        <v-btn v-if="army" icon exact nuxt :to="`/war-stuff/build/builder/${army.id}/print`">
          <v-icon>mdi-printer</v-icon>
        </v-btn>
      </v-app-bar>

      <v-main>
        <v-container class="pl-0 pr-0 pt-0">
          <nuxt />
        </v-container>
      </v-main>

      <opr-footer>
        Based on <a href="https://onepagerules.com/portfolio/one-off-games/" title="WarStuff">WarStuff</a> v2.0
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
      title: 'War Stuff'
    }
  },
  head() {
    const title = 'WarStuff List Builder';
    const description = "Turn your toys into a playable army.";
    const image = '/img/war-stuff/warstuff-twitter-wide.jpg';
    return {
      title: 'Explore',
      titleTemplate: '%s | WarStuff',
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
        //{ rel: 'manifest', href: '/manifest.warstuff.webmanifest' },
      ],
    };
  },
  computed:{
    mainActionRoute() {
      if (this.isArmyRoute) {
        return '/war-stuff/build';
      }
      if (this.$route.name === 'war-stuff') {
        return '/';
      }
      return '/war-stuff';
    },
    isArmyRoute() {
      return this.$route.params.id || null;
    },
    army() {
      return this.isArmyRoute ? this.$store.getters['warStuff/army'](this.$route.params.id) : undefined;
    },
    armyTotalCost() {
      return this.isArmyRoute ? this.$store.getters['warStuff/armyTotalCost'](this.$route.params.id) : undefined;
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
