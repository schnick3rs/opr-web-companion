<template>
  <div>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row justify="center">
      <v-col
        cols="6" :sm="6" :md="2"
        v-for="gameSystem in gameSystems" :key="gameSystem.id"
      >
        <v-card nuxt :to="`/army-books/${gameSystem.slug}`">
          <v-img :src="`/img/game-systems/${gameSystem.slug}-cover.jpg`" min-height="178"></v-img>
          <v-card-text class="text-center">
            {{gameSystem.shortname}}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" :md="10">
        <v-card nuxt :to="`/army-books/my-creations`" max-height="200">
          <v-img :src="`/img/origins/mockup-schnickers-fantasy.jpg`" max-height="200"></v-img>
          <span
            style="position:absolute; left:50%; top:50%; transform: translate(-50%, -50%);"
          >
            <v-btn color="green lighten-2">Create your own</v-btn>
          </span>
        </v-card>
      </v-col>
    </v-row>

  </div>
</template>

<script>
import OprBreadcrumbsRow from "@/components/shared/OprBreadcrumbsRow";
export default {
  name: 'index',
  components: {OprBreadcrumbsRow},
  async asyncData({ $axios }) {
    const { data } = await $axios.get(`/api/game-systems/`);
    const gameSystems = data.filter(gs => gs.armyBookBuilderEnabled);
    return {
      gameSystems,
    };
  },
  data() {
    return {
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'Army Books', to: '/army-books', exact: true },
      ],
    }
  },
  head() {
    const title = 'Browse army books';
    const description = 'Browser official and fanmade army books for Grimdark Future and Age of Fantasy.';
    const image = `/img/army-books-grimdark-future.jpg`;
    return {
      title: title,
      meta: [
        {hid: 'description', name: 'description', content: description},
        {hid: 'og:title', name: 'og:title', content: title},
        {hid: 'og:description', name: 'og:description', content: description},
        {hid: 'og:image', name: 'og:image', content: image},
        {hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image'},
        {hid: 'twitter:title', name: 'twitter:title', content: title},
        {hid: 'twitter:description', name: 'twitter:description', content: description},
        {hid: 'twitter:image', name: 'twitter:image', content: image},
      ],
    }
  },
}
</script>

<style scoped>

</style>
