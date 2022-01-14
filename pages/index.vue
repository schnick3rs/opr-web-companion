<template>
  <div>

    <v-row justify="center">
      <v-col
        cols="6" :sm="4" :md="2"
        v-for="gameSystem in gameSystems" :key="gameSystem.shortname"
      >
        <v-card
          :disabled="gameSystem.disabled"
          nuxt :to="`/game-systems/${gameSystem.slug}`"
        >
          <v-img
            :src="`/img/game-systems/${gameSystem.slug}-cover.jpg`"
            min-height="178"
            :class="{ 'img--greyscale': gameSystem.disabled}"
          ></v-img>
          <v-card-text class="text-center">
            {{gameSystem.shortname}}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify-sm="center" v-if="isAdmin">
      <v-col
        :cols="10"
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

    <v-row justify="center" v-if="false">
      <v-col
        cols="6" :sm="4" :md="2"
        v-for="gameSystem in oneOffSystems" :key="gameSystem.name"
      >
        <v-card nuxt :to="gameSystem.link.route">
          <v-img
            v-if="gameSystem.imageSrc"
            :src="gameSystem.imageSrc"
            min-height="178"
            height="178"
            max-height="178"
          ></v-img>
          <v-card-text class="text-center">
            {{gameSystem.shortname}}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import OprSectionCard from "@/components/shared/OprSectionCard";

export default {
  name: "home",
  async asyncData({ $axios }) {
    const { data } = await $axios.get(`/api/game-systems/`);
    const gameSystems = data
      .filter(gs => gs.armyBookBuilderEnabled)
      .map(gs => {
        gs.disabled = !(gs.officialArmyBookCount > 0);
        if (gs.slug === 'grimdark-future-firefight') {
          gs.disabled = false;
        }
        return gs;
      });
    return {
      gameSystems,
    }
  },
  head() {
    const title = 'WebApp for OnePageRules';
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
          title: 'Create an Army Book',
          subtitle: '',
          imageSrc: '/img/army-books-age-of-fantasy-tile.jpg',
          htmlText: '',
          link: { text: 'Create', route: '/my-creations' },
          isActive: this.$auth.loggedIn,
          classes: [],
          color: 'green lighten-2',
        },
      ],
      oneOffSystems: [
        {
          shortname: 'Warfleets: FTL',
          subtitle: '',
          imageSrc: '/img/warfleets-ftl/opr-warfleets-ftl-2-twitter-wide.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/warfleets-ftl' },
          isActive: true,
          classes: [],
          color: 'blue lighten-2',
        },
        {
          shortname: 'WarStuff',
          subtitle: '',
          imageSrc: '/img/war-stuff/warstuff-hero.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/war-stuff' }, isActive: true,
          classes: [],
          color: 'red lighten-2',
        },
        {
          shortname: 'Double Tab',
          subtitle: '',
          imageSrc: '/img/double-tab/doubletab-hero.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/double-tab' },
          isActive: true,
          classes: [],
          color: 'purple lighten-2',
        },
        {
          shortname: 'Army Man Combat',
          subtitle: '',
          imageSrc: '/img/army-man-combat/hero.jpg',
          htmlText: '',
          link: { text: 'explore', route: '/army-man-combat' },
          isActive: true,
          classes: [],
          color: 'green lighten-2',
        },
      ]
    }
  },
  computed: {
    isAdmin() {
      try {
        return this.$auth?.user?.isAdmin;
      } catch (e) {
        return false;
      }
    },
  },
}
</script>

<style scoped class="scss">
.img--greyscale {
  filter: grayscale(100%);
}
</style>
