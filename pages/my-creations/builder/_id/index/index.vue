<template>
  <v-container>

    <v-btn
      color="primary" outlined
      class="mt-2 mb-2"
      @click="createNewUnit()"
    >
      <v-icon left>mdi-account-plus</v-icon>
      new Unit
    </v-btn>

    <v-btn
      color="success" outlined
      class="mt-2 mb-2"
      @click="openSyncUnitDialog"
    >
      <v-icon left>mdi-dna</v-icon>
      inherit from other books
    </v-btn>

    <v-dialog
      v-model="showSyncUnitDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Add Weapon"
        @apply="addSyncedUnits(inheritanceEditor.units)"
        @close="closeSyncUnitDialog"
      >
        <div v-if="inheritanceEditor.syncUnitDialogLoading">
          <v-progress-circular
            color="success"
            size="64"
            style="margin: 0 auto;"
            indeterminate
          ></v-progress-circular>
        </div>
        <v-container v-else>
          <v-row>
            <v-col :cols="12">
              <v-autocomplete
                label="Parent army books"
                hint="Type and select army book the pick units from"
                @input="fetchParentArmyBookUnits"
                :items="inheritanceEditor.armyBooks"
                item-text="name"
                item-value="uid"
                return-object
                outlined
              ></v-autocomplete>
            </v-col>
            <v-col :cols="12">
              <v-autocomplete
                :disabled="!inheritanceEditor.parentArmyBook"
                :loading="inheritanceEditor.parentArmyBook && inheritanceEditor.parentArmyBookUnits.length <= 0"
                label="Units to sync"
                hint="Type and select army book the pick units from"
                v-model="inheritanceEditor.units"
                :items="this.inheritanceEditor.parentArmyBookUnits"
                item-text="name"
                item-value="uid"
                return-object
                outlined
                multiple
                small-chips
                deletable-chips
              >
              </v-autocomplete>
            </v-col>
          </v-row>
        </v-container>
      </opr-dialog>
    </v-dialog>

    <v-row>
      <v-col :cols="12" :md="6">

        <v-pagination v-if="false" v-show="maxPageCount" v-model="pageModel" :length="maxPageCount"></v-pagination>

        <draggable v-model="units" dragable=".item" handle=".handle">
          <template v-for="(unit, index) in units">
            <v-list-item
              :key="unit.id"
              three-line
              :class="{ 'selected': unit.id === selectedUnitId }"
              dense
              @click="openUnitEditor(unit)"
            >
              <v-list-item-avatar class="handle">
                <v-avatar style="cursor: row-resize;">
                  <v-icon>mdi-drag-horizontal</v-icon>
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>
                  {{unit.name}} [{{unit.size}}]
                  <v-icon small v-show="!!unit.sync">mdi-dna</v-icon>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ unit.equipment.map((e) => e.label || e.name).join(', ') }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{ unit.specialRules.map((e) => e.name).join(', ') }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action style="display: flex; flex-direction: row; align-content: center; align-items: center;">
                <div><v-list-item-action-text>{{unit.cost}}pts</v-list-item-action-text></div>
                <div>
                  <v-menu bottom left offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon color="primary" v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click.stop="cloneUnit(unit.id)">
                        <v-list-item-icon><v-icon color="primary">mdi-plus-box-multiple</v-icon></v-list-item-icon>
                        <v-list-item-content><v-list-item-title>Duplicate</v-list-item-title></v-list-item-content>
                      </v-list-item>
                      <v-list-item @click.stop="deleteUnit(unit.id)">
                        <v-list-item-icon><v-icon color="error">mdi-delete</v-icon></v-list-item-icon>
                        <v-list-item-content><v-list-item-title>Remove</v-list-item-title></v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-list-item-action>
            </v-list-item>
          </template>
        </draggable>

        <v-btn
          v-if="reOrderButtonLocked"
          block
          color="grey"
          outlined
          class="mt-2 mb-2"
          @click="reOrderButtonLocked = !reOrderButtonLocked"
        >
          <v-icon left>mdi-lock</v-icon>
          Re-order Units by default algorithm
        </v-btn>
        <v-btn
          v-else
          block
          color="primary"
          outlined
          class="mt-2 mb-2"
          @click="reOrderUnits()"
        >
          <v-icon left>mdi-lock-open</v-icon>
          Re-order Units by default algorithm
        </v-btn>

        <span><em>Or drag and drop to order manually</em></span>

        <v-btn
          block
          color="primary" outlined
          class="mt-2 mb-2"
          @click="resetPageSplit()"
          disabled
        >
          Reset page splits (not yet)
        </v-btn>

      </v-col>

      <v-col :cols="12" :md="6" v-if="selectedUnitId">

        <opr-army-book-unit-editor
          :army-book-id="armyBookId"
          :unit-id="selectedUnitId"
        ></opr-army-book-unit-editor>

      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import {adjectives, uniqueNamesGenerator} from 'unique-names-generator';
const OprArmyBookUnitEditor = () => import(/* webpackChunkName: "OprArmyBookUnitEditor" */ "~/components/army-book/OprArmyBookUnitEditor");
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ "~/components/shared/OprDialog");

export default {
  name: 'units',
  components: {
    OprArmyBookUnitEditor,
    OprDialog,
  },
  async asyncData({ params }) {
    return {
      armyBookId: params.id,
    };
  },
  data() {
    return {
      selectedUnitId: undefined,
      pageModel: 1,
      reOrderButtonLocked: true,
      /* unit editor */
      showCreateUnitEditor: false,
      unitEditor: {
        name: '',
        type: '',
        equipment: [],
        specialRules: [],
        inputString: '',
        typeTemplates: {
          gf: [
            { name: 'hero', size: 1, equipment: 'CCW (A2)', specialRules: 'Hero, Tough(3)' },
            { name: 'unit', size: 5, equipment: 'CCW (A1)', specialRules: null },
            { name: 'biker', size: 3, specialRules: 'Fast, Tough(3)' },
            { name: 'vehicle', size: 1, defense: 2, specialRules: 'Fast, Impact(6), Tough(6)' },
            { name: 'walker', size: 1, defense: 2, equipment: 'Stomp (A2, AP(1))', specialRules: 'Tough(6)' },
            { name: 'flyer', size: 1, defense: 2, specialRules: 'Aircraft, Tough(6)' },
          ],
        },
      },
      /* inheritance editor */
      showSyncUnitDialog: false,
      inheritanceEditor: {
        syncUnitDialogLoading: false,
        // inheritance
        armyBooks: [],
        parentArmyBook: undefined,
        parentArmyBookUnits: [],
        units: [],
      }
    };
  },
  methods: {
    createNewUnit(){
      const armyBookUid = this.armyBookId;
      const name = this.generateRandomUnitName();
      const quality = Math.ceil(this.median(this.units.map(u => u.quality))) || 4;
      const defense = Math.ceil(this.median(this.units.map(u => u.defense))) || 4;
      const costMode = this.hasPointCalcRights ? 'automatic' : 'manually';
      const costModeAutomatic = this.hasPointCalcRights;
      const payload = { armyBookUid, name, quality, defense, costMode, costModeAutomatic };
      this.$store.dispatch('armyBooks/createUnit', payload)
        .then(unit => this.openUnitEditor(unit));
    },
    generateRandomUnitName() {
      const eel = ['Eel'];
      const champ = ['Boy','Brother','Sister','Warrior','Veteran','Champion','Rookie','Pal'];
      const squad = ['Squad','Brothers','Sisters','Warriors','Veterans','Gang','Mob','Boyz'];
      const config = {
        dictionaries: [ adjectives, eel, champ ],
        separator: ' ',
        style: 'capital',
        length: 3,
      };
      return uniqueNamesGenerator(config);
    },
    openUnitEditor(unit) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUnitId = unit.id;
      } else {
        this.$router.push(`/my-creations/builder/${this.armyBookId}/units/${unit.id}`);
      }
    },
    openSyncUnitDialog() {
      this.showSyncUnitDialog = true;
      this.inheritanceEditor.syncUnitDialogLoading = true;
      const gameSystemSlug = this.armyBookGameSystemSlug;
      this.$axios.get('/api/army-books/', {params: { gameSystemSlug }})
      .then(({data}) => {
        this.inheritanceEditor.armyBooks = data;
        this.inheritanceEditor.syncUnitDialogLoading = false;
      });
    },
    async fetchParentArmyBookUnits(armyBook) {
      this.inheritanceEditor.parentArmyBook = armyBook;
      const { data } = await this.$axios.get(`/api/army-books/${armyBook.uid}`);
      this.inheritanceEditor.parentArmyBookUnits = data.units;
    },
    closeSyncUnitDialog() {
      this.showSyncUnitDialog = false;
    },
    addSyncedUnits(unitz) {
      const units = unitz.map((unit) => {
        return {
          parentArmyBookId: this.inheritanceEditor.parentArmyBook.uid,
          unitId: unit.id,
          sync: true,
        }
      });
      const payload = { armyBookUid: this.armyBookId, units };
      this.$store.dispatch('armyBooks/inheritUnits', payload);
      this.closeSyncUnitDialog();
    },
    cloneUnit(unitId){
      this.selectedUnitId = undefined;
      const armyBookUid = this.armyBookId;
      this.$store.dispatch('armyBooks/cloneUnit', { armyBookUid, unitId })
        .then(unit => this.openUnitEditor(unit));
    },
    deleteUnit(unitId){
      this.selectedUnitId = undefined;
      const armyBookUid = this.armyBookId;
      this.$store.dispatch('armyBooks/deleteUnit', { armyBookUid, unitId });
    },
    reOrderUnits() {
      this.$store.dispatch('armyBooks/SORT_UNITS', this.armyBookId);
    },
    resetPageSplit() {
    },
    median(values){
      if(values.length ===0) return 0;

      values.sort(function(a,b){
        return a-b;
      });

      let half = Math.floor(values.length / 2);

      if (values.length % 2)
        return values[half];

      return (values[half - 1] + values[half]) / 2.0;
    },
  },
  computed: {
    units: {
      get() {
        return this.$store.getters['armyBooks/units'](this.armyBookId);
      },
      set(items) {
        console.info(items)
        const itemIds = items.map((item, index) => {
          if (!item) {
            console.info('item undefined at index', index);
          }
          return item.id;
        });
        const {armyBookId} = this;
        this.$store.commit('armyBooks/unitsSetOrder', {armyBookId, items: itemIds});
        //this.$store.commit('armyBooks/LOADING', { status: true, message: 'reorder units...' });
        this.$store.commit('armyBooks/updateUnits', {armyBookUid: armyBookId});
        //this.$store.commit('armyBooks/LOADING', { status: false });
      },
    },
    maxPageCount() {
      if (this.units) {
        const pages = this.units.map((unit) => unit.splitPageNumber).filter((page) => !isNaN(page));
        return Math.max(...pages);
      }
      return 1;
    },
    armyBookGameSystemSlug() {
      return this.$store.getters['armyBooks/armyBookGameSystemSlug'](this.armyBookId);
    },
  }
}
</script>


<style scoped lang="scss">
.selected {
  border-left: 4px solid var(--v-primary-base);
  background-color: var(--v-secondary-lighten5);

  &.theme--dark {
    background-color: var(--v-accent-darken3);
  }
}

</style>
