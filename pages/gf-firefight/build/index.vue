<template>
  <v-container>

    <v-row justify-sm="center">
      <v-col>
        <v-btn
          block outlined
          color="success"
          @click="openNewWarbandDialog"
        >
          <v-icon>mdi-plus</v-icon>
          New Warband
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify-sm="center">

      <v-col v-for="warband in warbandSets" :key="warband.id" cols="12" :sm="6" :md="6">
        <v-card>
          <v-card-title>{{ warband.name }}</v-card-title>
          <v-card-subtitle>{{ warband.factionName }}</v-card-subtitle>
          <v-card-subtitle>{{warband.units.length}} units / {{$store.getters['gfFirefight/warbandTotalCost'](warband.id)}} pts</v-card-subtitle>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="success" small nuxt :to="`/gf-firefight/build/builder/${warband.id}/`">
              <v-icon left>mdi-pencil</v-icon>
              <span class="d-none d-md-block">Edit</span>
            </v-btn>
            <v-btn color="primary" outlined small nuxt :to="`/gf-firefight/build/builder/${warband.id}/view`">
              <v-icon left>mdi-ballot-outline</v-icon>
              <span class="d-none d-md-block">View</span>
            </v-btn>
            <v-btn color="primary" outlined small nuxt :to="`/gf-firefight/build/builder/${warband.id}/print`">
              <v-icon left>mdi-printer</v-icon>
              <span class="d-none d-md-block">Print</span>
            </v-btn>
            <v-btn color="error" outlined small @click="deleteArmy(warband.id)">
              <v-icon left>mdi-delete</v-icon>
              <span class="d-none d-md-block">Delete</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

    </v-row>

    <v-dialog
      v-model="showNewWarbandDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="New Warband"
        @apply="createNewWarband()"
        @close="showNewWarbandDialog = false"
      >
        <v-container>
          <v-row>

            <v-col cols="12">
              <v-text-field
                v-model="newWarbandForm.name"
                label="Warband Name"
                dense outlined
                persistent-hint hint="Select a unique warband or gang name."
                append-icon="mdi-dice-6"
                @click:append="rerollRandomWarbandName"
              ></v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="newWarbandForm.faction"
                label="Faction / Gang"
                :items="selectableFactions"
                return-object
                dense outlined
                persistent-hint hint="Choose the warbands army book."
              >
                <template v-slot:item="{ item }">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.text }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ item.hint }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="newWarbandForm.points"
                type="Number"
                label="Starting Points"
                dense outlined
                persistent-hint hint="Usually, you start with 150 points."
                prepend-icon="mdi-minus-box"
                append-outer-icon="mdi-plus-box"
              ></v-text-field>
            </v-col>

          </v-row>
        </v-container>

      </opr-dialog>
    </v-dialog>

  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { uniqueNamesGenerator, colors, animals, adjectives } from 'unique-names-generator';
import OprDialog from "@/components/shared/OprDialog";

export default {
  name: 'index',
  components: {OprDialog},
  layout: 'gf-firefight',
  head() {
    const title = 'GF: Firefight List Building';
    const description = "Build your GF: Firefight army.";
    const image = '/img/gf-firefight/gf-firefight-twitter-wide.jpg';
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
  async asyncData({ $axios, error }) {
    const { data } = await $axios.get(`/api/gf-firefight/army-books/`);

    if (data === undefined ) {
      error({ statusCode: 404, message: 'GF: Firefight data not found' });
    }

    return {
      selectableFactions: data.map((item) => {
        return {
          text: item.name,
          value: item.key,
          hint: item.hint,
        };
      }),
    };
  },
  data() {
    return {
      fab: false,
      showNewWarbandDialog: false,
      newWarbandForm: {
        name: '',
        faction: undefined,
        points: 150,
      },
    };
  },
  computed: {
    ...mapGetters({
      warbandIds: 'gfFirefight/warbandIds',
      warbandSets: 'gfFirefight/warbandSets',
    }),
  },
  methods: {
    randomWarbandName() {
      const prefix = uniqueNamesGenerator({ dictionaries: [ [...colors, ...adjectives] ], separator: ' ', style: 'capital', length: 1 });
      const sufix = uniqueNamesGenerator({ dictionaries: [ animals ], separator: ' ', style: 'capital', length: 1 });
      return `The ${prefix} ${sufix}s`;
    },
    openNewWarbandDialog(){
      this.rerollRandomWarbandName();
      this.showNewWarbandDialog = true;
    },
    rerollRandomWarbandName() {
      this.newWarbandForm.name = this.randomWarbandName();
    },
    closeNewWarbandDialog() {
      this.showNewWarbandDialog = false;
    },
    createNewWarband() {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      const name = this.newWarbandForm.name;
      const { text, value } = this.newWarbandForm.faction;
      const faction = { key: value, name: text };
      this.$store.commit('gfFirefight/create', { id, name, faction, pointLimit: 150 } );
      this.closeNewWarbandDialog();
    },
    deleteArmy(warbandId) {
      this.$store.commit('gfFirefight/delete', warbandId);
    },
  },
}
</script>

<style scoped>

</style>
