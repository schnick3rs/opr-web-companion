<template>
  <v-container>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row justify="center">
      <v-col
        cols="12" :sm="6" :md="2"
        v-for="gameSystem in gameSystems" :key="gameSystem.fields.id"
      >
        <v-card nuxt :to="`/rules/${gameSystem.fields.slug}`">
          <v-img
            v-if="gameSystem.fields.cover && gameSystem.fields.cover.fields.file"
            :src="`${gameSystem.fields.cover.fields.file.url}?h=356`"
            min-height="178"
          ></v-img>
          <v-card-text class="text-center">
            {{ gameSystem.fields.shortname }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
export default {
  name: 'index',
  async asyncData({ $axios, params }) {
    const { slug } = params;
    const { data } = await $axios.get(`/api/content/game-systems/`);
    const gameSystems = data;
    return {
      slug,
      gameSystems,
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'Core Rules', to: '/rules', exact: true },
      ],
    }
  },
  head() {
    const title = 'Browse Core Rules';
    const description = 'Select a game system and check out the core rules.';
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', name: 'og:title', content: title },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: description },
      ],
    };
  },
}
</script>

<style scoped lang="scss">

/style>
