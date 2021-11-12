<template>
  <v-row align="stretch">
    <v-col
      :cols="12"
      :sm="6"
      :md="4"
      :lg="4"
      :xl="2"
      v-for="armyBook in groupedArmyBooks(armyBooks.filter(filter))"
      :key="armyBook.uid"
    >
      <v-card height="100%">
        <v-card-title class="subtitle-2">{{armyBook.name}}</v-card-title>
        <v-card-subtitle>
          <div>by {{armyBook.username}}</div>
          <div>modified <abbr :title="armyBook.modifiedAt">{{ armyBook.modifiedAt | timeSince}}</abbr></div>
        </v-card-subtitle>
        <v-card-text>
          {{armyBook.hint}}
        </v-card-text>
        <v-spacer></v-spacer>
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
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
const fixedTime = new Date();

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
    filter: (book) => { return !book.official && book.isLive; },
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
  filters: {
    timeSince(value) {
      const date = new Date(value);
      const seconds = Math.floor((fixedTime - date) / 1000);

      let interval = Math.floor(seconds / 31536000);

      interval = Math.floor(seconds / 86400);

      if (interval > 30) {
        let options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString("en-US", options);
      }

      if (interval > 1) {
        return interval + " days ago";
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + " hours ago";
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + " minutes ago";
      }
      return Math.floor(seconds) + " seconds ago";
    },
  },
}
</script>

<style scoped lang="scss">
.inverted {
  filter: invert(1);
}
</style>
