<template>

  <v-container>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row justify-sm="center">
      <v-col>
        <v-btn
          block outlined large
          color="success"
          @click="openNewArmyBookDialog"
        >
          <v-icon left>mdi-plus-circle</v-icon>
          New Army Book
        </v-btn>
        <v-dialog
          v-model="showNewArmyBookDialog"
          width="600px"
          scrollable
          :fullscreen="$vuetify.breakpoint.xsOnly"
        >
          <opr-dialog
            title="Create new Army Book"
            @apply="createNewArmyBook()"
            @close="closeNewArmyBookDialog()"
          >
            <v-container>
              <v-row>

                <!-- build for which game system -->
                <v-col cols="12">
                  <v-select
                    v-model="newArmyBookForm.gameSystemId"
                    :items="gameSystemOptions"
                    label="Game System"
                    dense outlined
                    required
                    persistent-hint hint="Which game system is this build for?"
                  ></v-select>
                </v-col>

                <!-- army book name -->
                <v-col cols="12">
                  <v-text-field
                    v-model="newArmyBookForm.name"
                    label="Name"
                    dense outlined
                    required
                    persistent-hint hint="A shot name describing the army book"
                    append-icon="mdi-dice-6"
                    @click:append="rerollRandomArmyName"
                  ></v-text-field>
                </v-col>

                <!-- army book one-line-hint -->
                <v-col cols="12">
                  <v-text-field
                    v-model="newArmyBookForm.hint"
                    label="Hint (recommended)"
                    dense outlined
                    persistent-hint hint="One sentence describing the army"
                  ></v-text-field>
                </v-col>

                <!-- army book background -->
                <v-col cols="12">
                  <v-textarea
                    v-model="newArmyBookForm.background"
                    label="Background (optional)"
                    dense outlined
                    persistent-hint hint="Write markdown **bold** __italic__ "
                  ></v-textarea>
                </v-col>

              </v-row>
            </v-container>

          </opr-dialog>
        </v-dialog>
      </v-col>
      <v-col>
        <v-btn
          block outlined large
          color="primary"
          nuxt
          to="/my-creations/builder"
        >
          <v-icon left>mdi-file-multiple</v-icon>
          New Detachment
        </v-btn>
      </v-col>
      <v-col v-if="isAdmin">
        <v-btn
          block outlined large
          color="success"
          @click="openImportFromArmyForgeDialog"
        >
          <v-icon left>mdi-cloud-upload</v-icon>
          Import Army Forge JSON
        </v-btn>
        <v-dialog
          v-model="showImportFromArmyForgeDialog"
          width="600px"
          scrollable
          :fullscreen="$vuetify.breakpoint.xsOnly"
        >
          <opr-dialog
            title="Create new Army Book"
            @apply="createNewArmyFromImport()"
            @close="closeImportFromArmyForgeDialog()"
          >
            <v-container>
              <v-row v-if="!importArmyForm.importJson">
                <v-col>
                  <v-textarea
                    dense
                    outlined
                    v-model="importArmyForm.importJsonString"
                    @paste="parseArmyForgeString"
                  />
                </v-col>
              </v-row>

              <v-row v-if="importArmyForm.importJson">

                <v-col cols="12">
                  <v-select
                    v-model="importArmyForm.gameSystemId"
                    :items="gameSystemOptions"
                    label="Game System"
                    dense outlined
                    required
                    persistent-hint hint="Which game system is this build for?"
                  ></v-select>
                </v-col>

                <v-col cols="8">
                  <v-text-field
                    v-model="importArmyForm.name"
                    label="Name"
                    dense outlined
                  />
                </v-col>

                <v-col cols="4">
                  <v-text-field
                    v-model="importArmyForm.versionString"
                    label="Version String"
                    dense outlined
                  />
                </v-col>

                <v-col cols="4" offset="4">
                  <v-img :src="importArmyForm.coverImagePath"></v-img>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="importArmyForm.coverImagePath"
                    dense outlined
                  ></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-switch
                    inset dense
                    v-model="importArmyForm.official"
                    :label="`${importArmyForm.official ? 'official OPR' : 'fanmade'}`"
                    persistent-hint
                    hint="Enable if this is an offiical OPR Army Book"
                  ></v-switch>
                </v-col>

                <v-col cols="12">
                  <v-switch
                    inset dense
                    v-model="importArmyForm.costModeAutomatic"
                    :label="`${importArmyForm.costModeAutomatic ? 'automatic' : 'manually'}`"
                    persistent-hint
                    hint="Set to automatic to adjust costs via point calculator."
                  ></v-switch>
                </v-col>

                <v-col cols="12">
                  <span>{{importArmyForm.units.length}} units</span>
                </v-col>

                <v-col cols="12">
                  <span>{{importArmyForm.spells.length}} spells</span>
                </v-col>

                <v-col cols="12">
                  <span>{{importArmyForm.specialRules.length}} special rules</span>
                </v-col>

                <v-col cols="12">
                  <span>{{importArmyForm.upgradePackages.length}} upgrades</span>
                </v-col>

              </v-row>

            </v-container>
          </opr-dialog>
        </v-dialog>
      </v-col>
    </v-row>

    <v-item-group
      v-model="selectedGameSystems"
      multiple
    >
      <v-row justify-sm="center">
       <v-col
        cols="2"
        v-for="(gameSystem, index) in gameSystems" :key="gameSystem.key"
      >
        <v-item v-slot="{ active, toggle }">
          <v-card
            @click="toggle"
          >
            <v-img
              :class="{ 'greyscale': !active}"
              :src="`/img/game-systems/${gameSystem.slug}-cover.jpg`"
              height="75px" position="top"
            ></v-img>
          </v-card>
        </v-item>
      </v-col>
      </v-row>
    </v-item-group>

    <v-row>
      <v-col>
        <v-data-table
          :headers="headers"
          :items="filteredArmyBooks"
          :loading="vuexLoading"
          :loading-text="vuexLoadingMessage"
          dense
          :items-per-page="50"
          hide-default-footer
        >
          <template v-slot:item.name="{ item }">
            <v-list-item two-line>
              <v-list-item-avatar>
                <v-avatar size="32" tile>
                  <img alt="Avatar" :src="`/img/game-systems/${item.gameSystemSlug}-avatar.jpg`"/>
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.gameSystemShortname }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:item.isLive="{ item }">
            <v-chip small label color="primary" v-if="item.isLive">Live</v-chip>
            <v-chip small label color="warning" v-else>Draft</v-chip>
          </template>

          <template v-slot:item.public="{ item }">
            <v-chip small label color="primary" v-if="item.public">Public</v-chip>
            <v-chip small label color="warning" v-else>Private</v-chip>
          </template>

          <template v-slot:item.units.length="{ item }">
            {{ item.units.length }} <v-icon>mdi-account-multiple</v-icon>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn
              nuxt :to="`/my-creations/builder/${item.uid}`"
              icon small
              color="success"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              nuxt :to="`/army-books/view/${item.uid}/print`"
              icon small
            >
              <v-icon>mdi-printer</v-icon>
            </v-btn>
            <v-btn
              @click="openDeleteArmyBookDialog(item.uid, item.name)"
              icon small
              color="error"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

        </v-data-table>
      </v-col>

      <v-dialog
        v-model="showDeleteArmyBookDialog"
        width="350"
      >
        <v-card>
          <v-card-title style="background-color: #262e37; color: #fff;">
            <span>Confirm deletion</span>
            <v-spacer />
            <v-icon dark @click="showDeleteArmyBookDialog = false">mdi-close</v-icon>
          </v-card-title>
          <v-card-text>
            <div class="pt-2 pb-2">
              <p>Do you <strong>really</strong> want to delete the army book permanently?</p>
              <p><em>{{deleteArmyBookForm.name}}</em></p>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn block color="primary" @click="deleteArmyBook()">Delete permanently</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

  </v-container>
</template>

<script>
import {mapGetters} from "vuex";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import OprDialog from "@/components/shared/OprDialog";
import OprBreadcrumbsRow from "@/components/shared/OprBreadcrumbsRow";
import OprArmyBookTable from "../../components/shared/OprArmyBookTable";

export default {
  name: 'my-army-book-creations',
  components: { OprArmyBookTable, OprBreadcrumbsRow, OprDialog },
  middleware: 'auth',
  async asyncData({ $axios }) {
    const { data } = await $axios.get('/api/game-systems/');
    const gameSystems = data.filter(gs => gs.armyBookBuilderEnabled);
    return {
      gameSystems,
    }
  },
  data() {
    return {
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'My Creations', to: '/my-creations', exact: true },
      ],
      headers: [
        {text: 'Name', align: 'start', value: 'name'},
        {text: 'Version', align: 'start', value: 'versionString'},
        {text: 'Published', align: 'start', value: 'isLive'},
        {text: 'Visibility', align: 'start', value: 'public'},
        {text: '#Units', align: 'center', value: 'units.length'},
        {text: 'Actions', align: 'center', value: 'actions'},
      ],
      selectedGameSystems: [],
      showNewArmyBookDialog: false,
      newArmyBookForm: {
        gameSystemId: undefined,
        name: '',
        hint: '',
        background: '',
      },
      showImportFromArmyForgeDialog: false,
      importArmyForm: {
        importJsonString: null,
        importJson: null,
        gameSystemId: null,
        name: null,
        coverImagePath: null,
        versionString: null,
        official: true,
        costModeAutomatic: true,
        units: [],
        upgradePackages: [],
        spells: [],
        specialRules: [],
      },
      showDeleteArmyBookDialog: false,
      deleteArmyBookForm: {
        uid: undefined,
        name: '',
      },
    };
  },
  head() {
    return {
      title: 'My Creations - Army Books',
    }
  },
  computed: {
    ...mapGetters({
      armyBookSets: 'armyBooks/armyBookSets',
    }),
    isAdmin() {
      return this.$store.state.auth.user.isAdmin;
    },
    filteredArmyBooks() {
      if (this.armyBookSets) {

        let filteredBooks = [];

        if (this.selectedGameSystems.length > 0) {
          this.selectedGameSystems.forEach(i => {
            const gameSystem = this.gameSystems[i];
            const matchedBooks = this.armyBookSets.filter(ab => ab.gameSystemSlug === gameSystem.slug);
            filteredBooks.push(...matchedBooks);
          })
        } else {
          filteredBooks = this.armyBookSets;
        }

        return filteredBooks;
      }
      return [];
    },
    vuexLoading() {
      return this.$store.getters['armyBooks/loading'];
    },
    vuexLoadingMessage() {
      return this.$store.getters['armyBooks/loadingMessage'];
    },
    gameSystemOptions() {
      if (this.gameSystems) {
        return this.gameSystems
          .filter(system => system.armyBookBuilderEnabled)
          .map(system => {
            return {
              text: system.fullname,
              value: system.id,
            };
          });
      }
      return [];
    },
  },
  watch: {
    user: {
      handler(newValue) {
        this.$store.dispatch('armyBooks/loadAll');
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  methods: {
    generateRandomArmyName() {
      const prefix = ['Space','Guardian','Battle','Robot','Mecha','Alien','Havoc','Undead','Elven','Dark'];
      const eel = ['Eel'];
      const suffix = ['Boyz','Bros','Army','Fleet','Hive','Flock','Swarm','Legion','Horde','Flock','Guild','Cult','Clans','Sisters','Force','Raiders','Guard','Daemons'];
      const config = {
        dictionaries: [ prefix, prefix, eel, suffix ],
        separator: ' ',
        style: 'capital',
        length: 4,
      };
      return uniqueNamesGenerator(config);
    },
    generateRandomArmyHint() {
      const adjective = uniqueNamesGenerator({ dictionaries: [ adjectives ], length: 1 });
      return `Those ${adjective} eels from space don't mess around.`;
    },
    rerollRandomArmyName(){
      this.newArmyBookForm.name = this.generateRandomArmyName();
    },
    openNewArmyBookDialog(){
      this.newArmyBookForm.name = this.generateRandomArmyName();
      this.newArmyBookForm.hint = this.generateRandomArmyHint();
      this.newArmyBookForm.background = '';
      this.newArmyBookForm.gameSystemId = undefined;
      this.showNewArmyBookDialog = true;
    },
    closeNewArmyBookDialog() {
      this.showNewArmyBookDialog = false;
    },
    createNewArmyBook() {
      const { name, hint, background, gameSystemId } = this.newArmyBookForm;
      this.$store.dispatch('armyBooks/create',{ name, hint, gameSystemId, background });
      this.$ga.event('Army Book', 'create', `${name}`, 10);
      this.closeNewArmyBookDialog();
    },
    openImportFromArmyForgeDialog() {
      this.showImportFromArmyForgeDialog = true;
    },
    parseArmyForgeString(evt) {
      this.importArmyForm.importJsonString = evt.clipboardData.getData('text');
      try {
        const armyJson = JSON.parse(this.importArmyForm.importJsonString);
        this.importArmyForm.importJson = armyJson;
        this.importArmyForm.name = armyJson.name;
        this.importArmyForm.gameSystemId = armyJson.gameSystemId;
        const versionPrefix = isNaN(armyJson.versionString) ? '' : 'v';
        this.importArmyForm.versionString = `${versionPrefix}${armyJson.version}`;
        this.importArmyForm.units = armyJson.units;
        this.importArmyForm.upgradePackages = armyJson.upgradePackages;
        this.importArmyForm.spells = armyJson.spells;
        this.importArmyForm.specialRules = armyJson.specialRules;
        this.importArmyForm.official = armyJson.official;
        if (this.importArmyForm.official) {
          const slug = this.importArmyForm.name.toLowerCase().replace(/\W/gm, '-');
          this.importArmyForm.coverImagePath = `https://opr-list-builder.herokuapp.com/img/army-books/${slug}.png`;
        }
        this.importArmyForm.costModeAutomatic = true;
      } catch (e) {
        console.warn(`Could not parse import string.`);
      }
    },
    createNewArmyFromImport() {
      const {
        name,
        hint,
        background,
        gameSystemId,
        versionString,
        units,
        upgradePackages,
        spells,
        specialRules,
        official,
        costModeAutomatic,
      } = this.importArmyForm;
      const payload = {
        name,
        hint,
        background,
        gameSystemId,
        versionString,
        units,
        upgradePackages,
        spells,
        specialRules,
        official,
        costModeAutomatic,
      };
      this.$store.dispatch('armyBooks/import', payload);
      this.$ga.event('Army Book', 'import from Army Forge', `${name}`, 10);
      this.closeImportFromArmyForgeDialog();
    },
    closeImportFromArmyForgeDialog() {
      this.showImportFromArmyForgeDialog = false;
      this.importArmyForm.importJson = null;
      this.importArmyForm.importJsonString = null;
    },
    openDeleteArmyBookDialog(uid, name) {
      this.deleteArmyBookForm.uid = uid;
      this.deleteArmyBookForm.name = name
      this.showDeleteArmyBookDialog = true;
    },
    deleteArmyBook() {
      const uid = this.deleteArmyBookForm.uid;
      this.$store.dispatch('armyBooks/delete', uid);
      this.$ga.event('Army Book', 'delete', `${uid}`, 1);
      this.showDeleteArmyBookDialog = false;
    },
  },
}
</script>

<style scoped scss>
.greyscale {
  filter: grayscale(100%);
}
</style>
