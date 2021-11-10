<template>
  <v-card>
    <v-card-text>
      <v-list>
        <template v-for="(armyBook, index) in groupedArmyBooks">

          <v-list-group v-if="armyBook._type === 'faction'" class="elevation-1">
            <template v-slot:activator>
              <v-list-item
                two-line
                class="pl-0"
              >
                <v-list-item-avatar v-if="armyBook.name" tile>
                  <img
                    v-if="armyBook.name"
                    :src="`/img/army-books/${armyBook.name.toLowerCase().replace(/\W/gm, '-')}.png`"
                  />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{armyBook.name}}</v-list-item-title>
                  <v-list-item-subtitle>{{armyBook.items.length}} Army Books</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
            <v-divider></v-divider>
            <template v-for="(item, jndex) in armyBook.items">
              <v-list-item
                :key="`${item.uid}-${item.name}`"
                three-line
              >
                <v-list-item-content>
                  <v-list-item-title>
                    {{item.name}}
                    <span class="caption">{{item.versionString}}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle>{{item.hint}}</v-list-item-subtitle>
                  <v-list-item-subtitle v-if="item.factionRelation">{{item.factionRelation}}</v-list-item-subtitle>
                  <v-list-item-subtitle v-if="!item.official">
                    by {{item.username}},
                    modified <abbr :title="item.modifiedAt">{{ item.modifiedAt | timeSince}}</abbr>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon nuxt :to="`/army-books/view/${item.uid}/print`">
                    <v-icon>mdi-printer</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider
                v-if="jndex < armyBook.items.length - 1"
                :key="jndex"
              ></v-divider>
            </template>
          </v-list-group>

          <v-list-item
            v-else
            :key="`${armyBook.uid}-${armyBook.name}`"
            three-line
          >
            <v-list-item-avatar v-if="armyBook.official" tile>
              <img
                v-if="armyBook.name"
                :src="`/img/army-books/${armyBook.name.toLowerCase().replace(/\W/gm, '-')}.png`"
              />
            </v-list-item-avatar>
            <v-list-item-avatar v-else-if="armyBook.coverImagePath" tile>
              <img
                v-if="armyBook.coverImagePath"
                :src="armyBook.coverImagePath"
              />
            </v-list-item-avatar>
            <v-list-item-avatar v-else>
              <v-icon>mdi-account-circle</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>
                <nuxt-link :to="`/army-books/view/${armyBook.uid}/print`">{{armyBook.name}}</nuxt-link>
                <span class="caption">{{armyBook.versionString}}</span>
              </v-list-item-title>
              <v-list-item-subtitle v-if="armyBook.factionRelation">{{armyBook.factionRelation}}</v-list-item-subtitle>
              <v-list-item-subtitle>{{armyBook.hint}}</v-list-item-subtitle>
              <v-list-item-subtitle v-if="!armyBook.official">
                by {{armyBook.username}},
                modified <abbr :title="armyBook.modifiedAt">{{ armyBook.modifiedAt | timeSince}}</abbr>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon nuxt :to="`/army-books/view/${armyBook.uid}/print`">
                <v-icon>mdi-printer</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>

          <v-divider
            v-if="index < armyBooks.length - 1"
            :key="index"
          ></v-divider>

        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script>
const fixedTime = new Date();

export default {
  name: 'OprArmyBookList',
  props: {
    armyBooks: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    groupedArmyBooks() {
      let armyBooks = this.armyBooks || [];

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

<style scoped>

</style>
