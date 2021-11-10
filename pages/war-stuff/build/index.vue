<template>
  <v-container>
    <v-row justify-sm="center">
      <v-col>
        <v-btn block large outlined color="success" @click="createNewArmy">new army</v-btn>
      </v-col>
    </v-row>
    <v-row justify-sm="center">
      <v-col v-for="army in armySets" :key="army.id" cols="12" :sm="6" :md="6">
        <v-card>
          <v-card-title>{{army.name}}</v-card-title>
          <v-card-subtitle>{{army.units.length}} units / {{$store.getters['warStuff/armyTotalCost'](army.id)}} pts</v-card-subtitle>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="success" small nuxt :to="`/war-stuff/build/builder/${army.id}/`">
              <v-icon left>mdi-pencil</v-icon>
              <span class="d-none d-md-block">Edit</span>
            </v-btn>
            <v-btn color="primary" outlined small nuxt :to="`/war-stuff/build/builder/${army.id}/view`">
              <v-icon left>mdi-ballot-outline</v-icon>
              <span class="d-none d-md-block">View</span>
            </v-btn>
            <v-btn color="primary" outlined small nuxt :to="`/war-stuff/build/builder/${army.id}/print`">
              <v-icon left>mdi-printer</v-icon>
              <span class="d-none d-md-block">Print</span>
            </v-btn>
            <v-btn color="error" outlined small @click="deleteArmy(army.id)">
              <v-icon left>mdi-delete</v-icon>
              <span class="d-none d-md-block">Delete</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>


  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { uniqueNamesGenerator, colors } from 'unique-names-generator';

export default {
  name: 'index',
  layout: 'warstuff',
  head() {
    const title = 'WarStuff List Building';
    const description = "Build your WarStuff army.";
    const image = '/img/war-stuff/warstuff-build.jpg';
    return {
      title,
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
  data() {
    return {
      fab: false,
    };
  },
  computed: {
    ...mapGetters({
      armyIds: 'warStuff/armyIds',
      armySets: 'warStuff/armySets',
    }),
  },
  methods: {
    createNewArmy() {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      const name = uniqueNamesGenerator({ dictionaries: [ colors ], separator: ' ', style: 'capital', length: 1 });
      this.$store.commit('warStuff/create', { id, name: `${name} Ribbon Army`, pointLimit: 150 } );
      //this.$router.push({ name: 'war-stuff-build-builder-id', params: { id } });
    },
    deleteArmy(armyId) {
      this.$store.commit('warStuff/delete', armyId);
    },
  },
}
</script>

<style scoped>

</style>
