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
      <v-hover v-slot="{ hover }">
        <v-card style="height: 100%" :elevation="hover ? 6 : 2">
          <div class="pa-2">
            <v-img
              contain
              height="200px"
              max-height="200px"
              class="align-end cover-image"
              :class="{ inverted: $vuetify.theme.dark, 'on-hover': hover }"
              style="position: relative;"
              :src="`/img/army-books/400/${armyBook.name.toLowerCase().replace(/\W/gm, '-')}.png`"
            >
              <v-row justify="center" align="start" dense v-show="hover">
                <v-col :cols="6" class="text-center">
                  <v-btn
                    color="primary"
                    fab
                    nuxt
                    :to="`/army-books/view/${armyBook.uid}/print`"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                  <div class="caption font-weight-medium" style="position: relative">View</div>
                </v-col>
                <v-col :cols="6" class="text-center">
                  <v-btn
                    color="primary"
                    fab
                    download
                    :href="`/api/army-books/${armyBook.uid}/pdf`"
                  >
                    <v-icon dark>mdi-download</v-icon>
                  </v-btn>
                  <div class="caption font-weight-medium" style="position: relative">Download</div>
                </v-col>
                <v-col :cols="6" class="text-center" v-if="armyBook.aberration">
                  <v-btn
                    color="white"
                    fab
                    target="_blank"
                    :href="`https://army-forge.onepagerules.com/files?gameSystem=${armyBook.aberration.toLowerCase()}&armyId=${armyBook.uid}`"
                  >
                    <v-icon >$forge</v-icon>
                  </v-btn>
                  <div class="caption font-weight-medium" style="position: relative">Army Forge</div>
                </v-col>
              </v-row>
            </v-img>
            <v-card-text v-text="armyBook.name" class="text-center font-weight-bold"></v-card-text>
          </div>
        </v-card>
      </v-hover>
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


<style scoped lang="scss">
.inverted {
  filter: invert(1);
}

.cover-image.on-hover {

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    //background-color: rgba(0,0,0,0.25);
    background-color: hsla(0,0%,100%,.5);
  }
}

.ctas.on-hover {
  background: hsla(0,0%,100%,.7);
}
</style>
