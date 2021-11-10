<template>
  <div>
    <v-container>

      <v-row justify-sm="center">

        <v-col cols="6" v-show="$vuetify.breakpoint.smAndUp">
          <v-btn
            text block x-large elevation="4"
            color="success"
            @click="openNewFleetDialog"
          >
            <v-icon left>mdi-plus</v-icon>
            new fleet
          </v-btn>
        </v-col>

        <v-col cols="6" v-show="$vuetify.breakpoint.smAndUp">
          <v-btn
            text block x-large elevation="4"
            color="warning"
            @click="openImportFleetDialog"
          >
            <v-icon left>mdi-cloud-upload</v-icon>
            Import Fleet
          </v-btn>
        </v-col>

        <v-col cols="12" :sm="6" :md="6" :lg="6" v-for="fleet in enrichedFleets" :key="fleet.id">
          <v-card>

            <div class="card">
              <div class="card__image-container">
                <div
                  class="card__image"
                  :style="{ backgroundImage: `url('/img/onepagerules/ftl-${fleet.faction}.png')` }"
                  loading
                />
              </div>

              <v-card-text class="pa-0">
                <div class="card__content-container pa-4">
                  <h4>{{ fleet.name }}</h4>
                  <div>{{ fleet.faction.charAt(0).toUpperCase() + fleet.faction.slice(1) }} fleet</div>
                  <div>
                    {{ fleet.cost }}/{{ fleet.pointLimit }} pts
                  </div>
                  <div>{{ fleet.ships.length }} ships & squadrons</div>
                </div>
              </v-card-text>
            </div>

            <v-divider></v-divider>

            <v-card-actions>
              <v-btn color="success" small nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/`">
                <v-icon left>mdi-pencil</v-icon>
                <span class="d-none d-md-block">Edit</span>
              </v-btn>
              <v-btn color="primary" outlined small nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/plain`">
                <v-icon left>mdi-ballot-outline</v-icon>
                <span class="d-none d-lg-block">Plain</span>
              </v-btn>
              <v-btn color="primary" outlined small nuxt :to="`/warfleets-ftl/build/builder/${fleet.id}/print`">
                <v-icon left>mdi-printer</v-icon>
                <span class="d-none d-lg-block">Print</span>
              </v-btn>
              <v-btn color="warning" outlined small @click="openExportFleetDialog(fleet.id)">
                <v-icon left>mdi-cloud-download</v-icon>
                <span class="d-none d-lg-block">Export</span>
              </v-btn>
              <v-btn color="error" outlined small @click="deleteFleet(fleet.id)">
                <v-icon left>mdi-delete</v-icon>
                <span class="d-none d-md-block">Delete</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog
      v-model="showNewFleetDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <ftl-new-fleet-card
        :selectable-factions="selectableFactions"
        @close="showNewFleetDialog = false"
        @create="createNewFleet"
      ></ftl-new-fleet-card>
    </v-dialog>

    <v-dialog
      v-model="showImportFleetDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Import Fleet"
        @apply="createNewFleetFromImport(importFleetSnippet)"
        @close="showImportFleetDialog = false"
      >
        <v-textarea
          v-model="importFleetSnippet"
          rows="10"
          class="mt-4"
          persistent-hint hint="Paste the fleet code above to import a fleet."
          dense
        ></v-textarea>
      </opr-dialog>
    </v-dialog>

    <v-dialog
      v-model="showExportFleetDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Export Fleet"
        apply-label="Copy to clipboard"
        @apply="copyExportSnippetToClipboard"
        @close="showExportFleetDialog = false"
      >
        <v-textarea
          id="exportFleetSnippetId"
          v-model="exportFleetSnippet"
          rows="10"
          readonly
          class="mt-4"
          persistent-hint hint="Save the fleet code above to export your fleet."
          dense
        ></v-textarea>
      </opr-dialog>
    </v-dialog>

    <v-fab-transition>
    <v-btn
      v-show="$vuetify.breakpoint.xsOnly"
      fab
      bottom right fixed
      style="bottom: 86px;"
      color="warning"
      @click="openImportFleetDialog"
    >
      <v-icon>mdi-cloud-upload</v-icon>
    </v-btn>
    </v-fab-transition>

    <v-fab-transition>
      <v-btn
        v-show="$vuetify.breakpoint.xsOnly"
        fab
        bottom right fixed
        color="success"
        @click="openNewFleetDialog"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import FtlNewFleetCard from "@/components/FtlNewFleetCard";
import OprDialog from "@/components/shared/OprDialog";

export default {
  name: "my-fleets",
  layout: 'warfleets-ftl',
  components: {OprDialog, FtlNewFleetCard},
  async asyncData({ $axios, error }) {

    const response = await $axios.get(`/api/warfleets-ftl/`);
    const items = response.data;

    if (items === undefined ) {
      error({ statusCode: 404, message: 'FTL Fleet not found' });
    }
    return {
      fleetBooks: items,
      selectableFactions: items.map((book) => {
        return {
          text: book.faction,
          value: book.key,
          hint: book.hint,
          legendaryFleets: book.legendaryFleets,
        };
      }),
    };
  },
  data() {
    return {
      showNewFleetDialog: false,
      newFleetForm: {
        name: null,
        faction: null,
        pointLimit: null,
      },
      showExportFleetDialog: false,
      exportFleetSnippet: '',
      showImportFleetDialog: false,
      importFleetSnippet: '',
    }
  },
  computed: {
    ...mapGetters({
      fleetIds: 'fleets/fleetIds',
      fleetSets: 'fleets/fleetSets',
    }),
    enrichedFleets() {
      if (this.fleetSets) {
        return this.fleetSets.map((fleet) => {
          return {
            ...fleet,
            cost: this.$store.getters['fleets/cost'](fleet.id),
          };
        });
      } else {
        return [];
      }
    },
  },
  methods: {
    openNewFleetDialog(){
      this.showNewFleetDialog = true;
    },
    closeNewFleetDialog() {
      this.showNewFleetDialog = false;
    },
    createNewFleet(name = undefined, faction = undefined, pointLimit = undefined, legendaryFleet = undefined) {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      this.$store.commit('fleets/create', { id, name, faction, pointLimit, legendaryFleet } );
      this.showNewFleetDialog = false;
      /*this.$router.push({
        name: 'fleets-id',
        params: { id },
      });*/
    },
    deleteFleet(id) {
      this.$store.commit('fleets/delete', id);
    },
    openExportFleetDialog(id) {
      const jsonString = this.$store.getters['fleets/asJsonString'](id);
      this.exportFleetSnippet = btoa(unescape(encodeURIComponent(jsonString)));
      this.showExportFleetDialog = true;
    },
    copyExportSnippetToClipboard() {
      document.getElementById('exportFleetSnippetId').select();
      document.execCommand("copy");
    },
    openImportFleetDialog() {
      this.showImportFleetDialog = true;
    },
    createNewFleetFromImport(importSnippet) {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      const payload = {
        id,
        stateString: decodeURIComponent(escape(atob(importSnippet))),
      };
      this.$store.commit('fleets/createFromString', payload);
      this.importFleetSnippet = '';
      this.showImportFleetDialog = false;
    },
  },
}
</script>

<style lang="scss" scoped>
.card {

  //max-width: 640px;
  height: 120px;
  display: flex;

  &__image-container {
    width: 120px;
    min-width: 120px;
    object-fit: contain;
    align-self: flex-start;
  }

  &__image {
    background-position: center center;
    background-size: contain;
    height: 120px;
    width: 120px;
  }

  &__content-container {
    flex: 1 1 auto;
    color: rgba(0, 0, 0, 0.54);
  }
}
</style>
