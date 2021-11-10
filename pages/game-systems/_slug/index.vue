<template>
  <div>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row v-show="false">
      <v-col :cols="1">
        <v-img :src="`/img/game-systems/${gameSystem.slug}-cover.jpg`" contain></v-img>
      </v-col>
      <v-col :cols="8"></v-col>
    </v-row>

    <v-row>
      <v-col cols="12">

        <v-tabs
          v-model="tab"
        >
          <v-tab v-for="item in tabs" :key="item.key" :disabled="item.disabled" exact nuxt :to="item.to">{{item.name}}</v-tab>
        </v-tabs>
      </v-col>

    </v-row>

    <nuxt-child></nuxt-child>

  </div>
</template>

<script>
import OprBreadcrumbsRow from "@/components/shared/OprBreadcrumbsRow";
import OprArmyBookList from "@/components/shared/OprArmyBookList";

export default {
  name: "index",
  components: {
    OprBreadcrumbsRow,
    OprArmyBookList,
  },
  async asyncData({ $axios, params }) {
    const { slug } = params;
    const gameSystemResponse = await $axios.get(`/api/game-systems/${slug}`);
    const gameSystem = gameSystemResponse.data;
    const armyBooksResponse = await $axios.get(`/api/army-books/`, {params: {gameSystemSlug: gameSystem.slug}});
    const armyBooks = armyBooksResponse.data;
    return {
      slug,
      gameSystem,
      armyBooks,
      breadcrumbItems: [
        {text: '', to: '/', exact: true},
        {text: 'Game Systems', to: '/game-systems', exact: true},
        {text: gameSystem.fullname, to: `/game-systems/${gameSystem.slug}`, exact: false},
      ],
      tabs: [
        { key: 'opr', name: 'Army Books', to: `/army-books/${gameSystem.slug}` },
        //{ key: 'opr', name: 'Rules', disabled: true, },
        //{ key: 'homebrew', name: 'Fan Army Books', disabled: false, to: `/army-books/${gameSystem.slug}/homebrew` },
      ],
    }
  },
  data() {
    return {
      tab: undefined,
      headers: [
        {text: 'Name', align: 'start', value: 'name'},
        {text: 'Published', align: 'left', value: 'isLive'},
        {text: 'Author', align: 'start', value: 'username'},
        {text: 'Last change', align: 'start', value: 'modifiedAt'},
        {text: '#Units', align: 'center', value: 'unitCount'},
        {text: 'Actions', align: 'center', value: 'actions'},
      ]
    };
  },
}
</script>

<style scoped lang="scss">
.inverted {
  filter: invert(1);
}
</style>
