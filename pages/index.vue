<template>
  <div>

    <v-row justify-sm="center">
      <v-col
        cols="12" :sm="6" :md="6"
        v-for="(section, index) in cloudSections" :key="index"
      >
        <v-card nuxt :to="section.link.route" max-height="200">
          <v-img :src="section.imageSrc" min-height="200" max-height="200"></v-img>
          <span
            style="position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);"
          >
            <v-btn :color="section.color">{{ section.title }}</v-btn>
          </span>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12"><v-divider></v-divider></v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-alert color="success" elevation="4" text class="text-center">
          <strong>Check out the Core rules for the different systems</strong>
        </v-alert>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col
        cols="6" :sm="4" :md="2"
        v-for="gameSystem in gameSystems" :key="gameSystem.fields.id"
      >
        <v-card nuxt :to="`/rules/${gameSystem.fields.slug}`">
          <v-img
            v-if="gameSystem.fields.cover && gameSystem.fields.cover.fields.file"
            :src="`${gameSystem.fields.cover.fields.file.url}?h=356`"
            min-height="178"
          ></v-img>
          <v-card-text class="text-center">
            {{gameSystem.fields.shortname}}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12"><v-divider></v-divider></v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-alert color="primary" elevation="4" text class="text-center">
          <strong>
            The sections below can be used without having an account. Their respective data is stored in the local storage or your browser.
          </strong>
        </v-alert>
      </v-col>
    </v-row>

    <v-row justify-sm="center">
      <v-col
        cols="12" :sm="6" :md="4"
        v-for="(section, index) in sections" :key="index"
      >
        <opr-section-card :section="section"></opr-section-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import OprSectionCard from "@/components/shared/OprSectionCard";

export default {
  name: "home",
  async asyncData({ $axios }) {
    const { data } = await $axios.get(`/api/content/game-systems/`);
    const gameSystems = data;
    return {
      gameSystems,
    }
  },
  head() {
    const title = 'Web Companion for OnePageRules';
    const description = "A Companion Website to support army building for FTL, WarStuff and Double Tab.";
    const image = '/img/army-books-grimdark-future-tile.jpg';
    return {
      title: 'Select your game system',
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
  components: { OprSectionCard },
  data() {
    return {
      cloudSections: [
        {
          title: 'Browse Army Books',
          subtitle: '',
          imageSrc: '/img/army-books-grimdark-future-tile.jpg',
          htmlText: '',
          link: { text: 'Browse', route: '/army-books' },
          isActive: true,
          classes: [],
          color: 'orange lighten-2',
        },
        {
          title: 'Create an Army Book',
          subtitle: '',
          imageSrc: '/img/army-books-age-of-fantasy-tile.jpg',
          htmlText: '',
          link: { text: 'Create', route: '/army-books/my-creations' },
          isActive: this.$auth.loggedIn,
          classes: [],
          color: 'green lighten-2',
        },
      ],
      sections: [
        {
          title: 'Warfleets: FTL',
          subtitle: '',
          imageSrc: '/img/warfleets-ftl/opr-warfleets-ftl-2-twitter-wide.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/warfleets-ftl' },
          isActive: true,
          classes: [],
          color: 'blue lighten-2',
        },
        {
          title: 'WarStuff',
          subtitle: '',
          imageSrc: '/img/war-stuff/warstuff-hero.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/war-stuff' }, isActive: true,
          classes: [],
          color: 'red lighten-2',
        },
        {
          title: 'Double Tab',
          subtitle: '',
          imageSrc: '/img/double-tab/doubletab-hero.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/double-tab' },
          isActive: true,
          classes: [],
          color: 'purple lighten-2',
        },
        {
          title: 'Army Man Combat',
          subtitle: '',
          imageSrc: '/img/army-man-combat/hero.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/army-man-combat' },
          isActive: true,
          classes: [],
          color: 'green lighten-2',
        },
        {
          title: 'GF: Firefight',
          subtitle: '',
          imageSrc: '/img/gf-firefight/gf-firefight-twitter-wide.jpg',
          htmlText: '',
          link: { text: 'Gang Builder', route: '/gf-firefight/' },
          isActive: true,
          beta: true,
          classes: [],
          color: 'orange lighten-2',
        },
        {
          title: 'GF: Arena',
          subtitle: '',
          imageSrc: '/img/gf-arena/gf-arena-twitter-wide.jpg',
          htmlText: '',
          link: { text: 'Card Library', route: '/gf-arena/reference/upgrades' },
          isActive: true,
          beta: true,
          classes: [],
          color: 'cyan lighten-2',
        },
      ]
    }
  }
}
</script>

<style scoped>

</style>
