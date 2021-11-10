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
          nuxt to="/war-stuff"
        >
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <v-toolbar-title>Rules - WarStuff v2.0</v-toolbar-title>
        <v-spacer />
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
    const title = 'WarStuff Companion';
    const description = "A Web Builder for WarStuff";
    const image = '/img/war-stuff/warstuff-hero.jpg';
    return {
      title: 'WarStuff Companion',
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
    };
  },
  computed:{
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
