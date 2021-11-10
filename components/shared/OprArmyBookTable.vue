<template>
  <v-data-table
    :headers="headers"
    :items="armyBooks"
    :items-per-page="-1"
    dense
    hide-default-footer
  >

    <template v-slot:item.name="{ item }">
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.versionString }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </template>

    <template v-slot:item.username="{ item }">
      <v-list-item two-line>
        <v-list-item-avatar>
          <v-avatar size="32">
            <img v-if="item.official" alt="Avatar" src="/img/onepagerules_round.png"/>
            <v-icon v-else>mdi-account</v-icon>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ item.username }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <template v-slot:item.modifiedAt="{ item }">
      {{ item.modifiedAt | asDate }}
    </template>

    <template v-slot:item.isLive="{ item }">
      <v-chip small label color="primary" v-if="item.isLive">Published</v-chip>
      <v-chip small label color="warning" v-else>Draft</v-chip>
    </template>

    <template v-slot:item.unitCount="{ item }">
      {{ item.unitCount }} <v-icon>mdi-account-multiple</v-icon>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-btn
        nuxt :to="`/army-books/view/${item.uid}`"
        icon small
      >
        <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-btn
        nuxt :to="`/army-books/view/${item.uid}/print`"
        icon small
      >
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    </template>

  </v-data-table>
</template>

<script>
export default {
  name: "OprArmyBookTable",
  props: {
    armyBooks: Array,
    headers: {
      type: Array,
      default: () => {
        return [
          {text: 'Name', align: 'start', value: 'name'},
          {text: 'System', align: 'start', value: 'shortname'},
          {text: 'Author', align: 'start', value: 'username'},
          {text: 'Last change', align: 'start', value: 'modifiedAt'},
          //{ text: '#Units', align: 'end', value: 'units.length' },
          {text: 'Actions', align: 'center', value: 'actions'},
        ];
      }
    }
  },
  filters: {
    asDate: function (value) {
      if (!value) return ''
      return new Date(value).toLocaleDateString();
    },
  }
}
</script>

<style scoped>

</style>
