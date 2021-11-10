<template>
  <v-container>

    <v-row justify-sm="center">

      <v-col cols="6">
        <v-btn
          text block x-large elevation="2"
          color="success"
          @click="createNewArmy"
        >
          <v-icon left>mdi-plus</v-icon>
          new army
        </v-btn>
      </v-col>

      <v-col cols="6">
        <v-btn
          text block x-large elevation="2"
          color="warning"
          @click="openImportArmyDialog"
        >
          <v-icon left>mdi-cloud-upload</v-icon>
          Import Army
        </v-btn>

        <v-dialog
          v-model="showImportArmyDialog"
          width="600px"
          scrollable
          :fullscreen="$vuetify.breakpoint.xsOnly"
        >
          <opr-dialog
            title="Import Army"
            @apply="createNewArmyFromImport(importArmySnippet)"
            @close="showImportArmyDialog = false"
          >
            <v-textarea
              v-model="importArmySnippet"
              rows="10"
              class="mt-4"
              persistent-hint hint="Paste army export string and click 'apply'."
              dense
            ></v-textarea>
          </opr-dialog>
        </v-dialog>

      </v-col>

    </v-row>

    <v-row justify-sm="center">
      <v-col v-for="army in armySets" :key="army.id" cols="12" :sm="6" :md="6">
        <v-card>
          <v-card-title>{{army.name}}</v-card-title>
          <v-card-subtitle>{{army.units.length}} units / {{$store.getters['doubleTab/armyTotalCost'](army.id)}} pts</v-card-subtitle>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="success" small nuxt :to="`/double-tab/build/builder/${army.id}/`">
              <v-icon left>mdi-pencil</v-icon>
              <span class="d-none d-md-block">Edit</span>
            </v-btn>
            <v-btn color="primary" outlined small nuxt :to="`/double-tab/build/builder/${army.id}/view`">
              <v-icon left>mdi-ballot-outline</v-icon>
              <span class="d-none d-md-block">View</span>
            </v-btn>
            <v-btn color="primary" outlined small nuxt :to="`/double-tab/build/builder/${army.id}/print`">
              <v-icon left>mdi-printer</v-icon>
              <span class="d-none d-md-block">Print</span>
            </v-btn>
            <v-btn color="warning" outlined small @click="openExportArmyDialog(army.id)">
              <v-icon left>mdi-cloud-download</v-icon>
              <span class="d-none d-lg-block">Export</span>
            </v-btn>
            <v-btn color="error" outlined small @click="deleteArmy(army.id)">
              <v-icon left>mdi-delete</v-icon>
              <span class="d-none d-md-block">Delete</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showExportArmyDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Export Army"
        apply-label="Copy to clipboard"
        @apply="copyExportSnippetToClipboard"
        @close="showExportArmyDialog = false"
      >
        <v-textarea
          id="exportArmySnippetId"
          v-model="exportArmySnippet"
          rows="10"
          readonly
          class="mt-4"
          persistent-hint hint="The army is exported."
          dense
        ></v-textarea>
      </opr-dialog>
    </v-dialog>

  </v-container>

</template>

<script>
import { mapGetters } from 'vuex';
import { uniqueNamesGenerator, colors } from 'unique-names-generator';
import OprDialog from "@/components/shared/OprDialog";

export default {
  name: 'index',
  components: {OprDialog},
  layout: 'doubletab',
  head() {
    const title = 'Double Tab List Building';
    const description = "Build your Double Tab army.";
    const image = '/img/double-tab/doubletab-build.jpg';
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
      showExportArmyDialog: false,
      exportArmySnippet: '',
      showImportArmyDialog: false,
      importArmySnippet: '',
    };
  },
  computed: {
    ...mapGetters({
      armyIds: 'doubleTab/armyIds',
      armySets: 'doubleTab/armySets',
    }),
  },
  methods: {
    createNewArmy() {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      const name = uniqueNamesGenerator({ dictionaries: [ colors ], separator: ' ', style: 'capital', length: 1 });
      this.$store.commit('doubleTab/create', { id, name: `${name} Sectorial`, pointLimit: 150 } );
    },
    deleteArmy(armyId) {
      this.$store.commit('doubleTab/delete', armyId);
    },
    openExportArmyDialog(id) {
      const jsonString = this.$store.getters['doubleTab/asJsonString'](id);
      this.exportArmySnippet = btoa(unescape(encodeURIComponent(jsonString)));
      this.showExportArmyDialog = true;
    },
    copyExportSnippetToClipboard() {
      document.getElementById('exportArmySnippetId').select();
      document.execCommand("copy");
    },
    openImportArmyDialog() {
      this.showImportArmyDialog = true;
    },
    createNewArmyFromImport(importSnippet) {
      const id = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      const payload = {
        id,
        stateString: decodeURIComponent(escape(atob(importSnippet))),
      };
      this.$store.commit('doubleTab/createFromString', payload);
      this.importArmySnippet = '';
      this.showImportArmyDialog = false;
    },
  },
}
</script>

<style scoped>

</style>
