<template>
  <v-row align="stretch">
    <v-col
      :cols="6"
      :sm="4"
      :md="4"
      :lg="3"
      :xl="2"
      v-for="armyBook in groupedArmyBooks(armyBooks.filter(filter))"
      :key="armyBook.uid"
    >
      <v-card style="height: 100%">
        <div class="pa-2">
          <template v-if="armyBook._type === 'faction'">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-img
                  contain
                  height="100px"
                  max-height="100px"
                  class="align-end"
                  :class="{ inverted: $vuetify.theme.dark }"
                  :src="`/img/army-books/400/${armyBook.name.toLowerCase().replace(/\W/gm, '-')}.png`"
                  style="cursor: pointer"
                  v-bind="attrs" v-on="on"
                >
                </v-img>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in armyBook.items"
                  :key="index"
                  nuxt
                  :to="`/army-books/view/${item.uid}/print`"
                >
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <v-img
            v-else
            contain
            height="100px"
            max-height="100px"
            class="align-end"
            :class="{ inverted: $vuetify.theme.dark }"
            :src="`/img/army-books/400/${armyBook.name.toLowerCase().replace(/\W/gm, '-')}.png`"
            @click="$router.push(`/army-books/view/${armyBook.uid}/print`)"
            style="cursor: pointer"
          >
          </v-img>
        </div>
        <v-card-text v-text="armyBook.name"></v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <template v-if="armyBook._type === 'faction'">
            <v-menu offset-y>
              <template v-slot:activator="{ on, attrs }">
                <v-btn text group small color="primary" v-bind="attrs" v-on="on"><v-icon left>mdi-printer</v-icon>pdf<v-icon right>mdi-chevron-down</v-icon></v-btn>
              </template>
              <v-list>
                <v-list-item
                  v-for="(item, index) in armyBook.items"
                  :key="index"
                  nuxt
                  :to="`/army-books/view/${item.uid}/print`"
                >
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <v-btn v-else text small color="primary" nuxt :to="`/army-books/view/${armyBook.uid}/print`"><v-icon left>mdi-printer</v-icon>pdf</v-btn>
          <v-spacer></v-spacer>
          <v-btn text small color="error" href="https://opr-army-forge.vercel.app/"><v-icon left>mdi-wrench</v-icon><span v-show="$vuetify.breakpoint.smAndUp">army forge</span></v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "index",
  async asyncData({ $axios, params }) {
    const { slug } = params;
    const gameSystemResponse = await $axios.get(`/api/game-systems/${slug}`);
    const gameSystem = gameSystemResponse.data;
    const armyBooksResponse = await $axios.get(`/api/army-books/`, {params: {gameSystemSlug: gameSystem.slug}});
    const armyBooks = armyBooksResponse.data;
    return {
      gameSystem,
      armyBooks,
      breadcrumbItems: [
        {text: '', to: '/', exact: true},
        {text: 'Army Books', to: '/army-books', exact: true},
        {text: gameSystem.fullname, to: `/army-books/${gameSystem.slug}`, exact: true},
      ],
    }
  },
  methods: {
    filter: (book) => { return book.official && book.isLive; },
    groupedArmyBooks(armyBooks = []) {

      armyBooks = armyBooks.reduce((previousValue, currentValue, currentIndex, array) => {
        if (currentValue.factionName) {
          let faction = previousValue.find((item) => item._type === 'faction' && item.name === currentValue.factionName);
          let index = previousValue.findIndex((item) => item._type === 'faction' && item.name === currentValue.factionName);
          if (faction === undefined) {
            faction = {
              _type: 'faction',
              name: currentValue.factionName,
              items: [],
            };
          }
          faction.items.push(currentValue);
          faction.items.sort((a, b) => a.name.localeCompare(b.name));
          if (index >= 0) {
            previousValue.splice(index, 1, faction);
          } else {
            previousValue.push(faction);
          }
        } else {
          previousValue.push(currentValue);
        }
        return previousValue;
      }, []);

      // sort by name alphanumeric
      armyBooks.sort((a, b) => a.name.localeCompare(b.name));

      return armyBooks;
    },
  },
}
</script>

<style scoped>

</style>
