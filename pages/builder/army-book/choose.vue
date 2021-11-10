<template>
  <div>
    <v-slide-group
      center-active
      show-arrows
      v-model="selectedArmyBook"
    >
      <v-slide-item
        v-for="(item, index) in items" :key="index"
        v-slot:default="{ active, toggle }"
      >
        <v-card
          :color="active ? 'primary' : 'grey lighten-1'"
          class="ma-4"
          height="200"
          width="150"
          @click="toggle"
        >
          <v-img
            style="height: inherit"
            :class="active ? 'branch-imgage' :'branch-imgage branch-imgage--inactive' "
            :src="`/img/army-books/${item.key}.png`"
          ></v-img>
        </v-card>
      </v-slide-item>
    </v-slide-group>
  </div>
</template>

<script>

export default {
  name: "choose",
  async asyncData({ params, $axios, error }) {
    const { slug } = params;

    const response = await $axios.get(`/api/army-books/`);
    const items = response.data;

    if (items === undefined ) {
      error({ statusCode: 404, message: 'Army Book not found' });
    }
    return {
      items,
    };
  },
  data() {
    return {
      selectedArmyBook: undefined,
    };
  },
  methods: {
    selectArmy(armyBook) {
      console.info(`Selected ${armyBook.faction}`);
    },
  },
}
</script>

<style scoped lang="scss">
.branch-imgage {

  &--inactive {
     filter: grayscale(100%);
   }
}
</style>
