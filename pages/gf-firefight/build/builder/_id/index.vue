<template>
  <v-container v-if="warband">

    <v-toolbar>
      <span v-if="showArmyNameEditor">
        <v-text-field
          v-model="warbandName"
          dense
          append-icon="mdi-close"
          append-outer-icon="mdi-content-save"
          @click:append="showArmyNameEditor = false"
          @click:append-outer="changeArmyName"
          @keydown.esc="showArmyNameEditor = false"
          @keydown.enter="changeArmyName"
        ></v-text-field>
      </span>
      <span v-else>
        {{warband.name}} <v-icon right small @click="openArmyNameEditor">mdi-pencil</v-icon>
      </span>
      <v-spacer></v-spacer>
      / {{ warband.pointLimit }} pts.
    </v-toolbar>

    <v-row>

      <v-col cols="12" :md="6">

        <v-btn
          v-show="$vuetify.breakpoint.smAndUp"
          outlined block
          color="success"
          class="mb-4"
          @click="showAddUnitDialog = true"
        >
          <v-icon small>mdi-plus</v-icon>
          Recruit new Members
        </v-btn>

        <v-list elevation="2" v-if="units">
          <v-list-item
            v-for="unit in units" :key="unit.id"
            :class="{ 'orange lighten-4': unit.id === selectedUnitId }"
            dense
            three-line-line
          >
            <v-list-item-content>
              <v-list-item-title>
                {{unit.name}}
                <span v-if="$vuetify.breakpoint.xsOnly">- {{unit.totalCost}} pts.</span>
              </v-list-item-title>
              <v-list-item-subtitle>{{unit.unitKey}}</v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action-text v-if="$vuetify.breakpoint.smAndUp">{{unit.totalCost}} pts.</v-list-item-action-text>

            <v-list-item-action v-if="$vuetify.breakpoint.smAndUp">
              <v-btn icon @click="cloneUnit(unit.id)">
                <v-icon color="primary" small>mdi-plus-box-multiple</v-icon>
              </v-btn>
            </v-list-item-action>

            <v-list-item-action v-if="$vuetify.breakpoint.smAndUp">
              <v-btn icon @click="openUnitEditor(unit)">
                <v-icon color="success" small>mdi-pencil</v-icon>
              </v-btn>
            </v-list-item-action>

            <v-list-item-action v-if="$vuetify.breakpoint.smAndUp">
              <v-btn icon @click="removeUnit(unit.id)">
                <v-icon color="error" small>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>

            <v-list-item-action v-if="$vuetify.breakpoint.xsOnly">
              <v-menu bottom left offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    color="primary"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="openUnitEditor(unit)">
                    <v-list-item-title>Edit unit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="cloneUnit(unit.id)">
                    <v-list-item-title>Clone unit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="removeUnit(unit.id)">
                    <v-list-item-title >Remove from roster</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-action>

          </v-list-item>
        </v-list>

      </v-col>

      <v-col cols="12" :md="6" v-if="selectedUnitId">
        <opr-firefight-unit-editor
          :warband-id="warbandId"
          :unit-id="selectedUnitId"
        >
        </opr-firefight-unit-editor>
      </v-col>
    </v-row>

    <v-dialog
      v-if="armyBook"
      v-model="showAddUnitDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="add new recruit"
        @apply="addNewUnit"
        @close="showAddUnitDialog = false"
      >
        <v-container>

          <v-row>

            <v-col cols="12">
              <v-text-field
                v-model="addUnitForm.name"
                label="Name"
                dense outlined
                append-icon="mdi-dice-6"
                @click:append="getNewRandomName"
              >
              </v-text-field>
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="addUnitForm.type"
                :items="armyBook.units"
                item-text="name"
                item-value="key"
                return-object
                dense outlined
                label="Select the unit type"
              >
              </v-select>
            </v-col>

            <v-col cols="12">
              <v-switch
                v-model="addUnitForm.experienced"
                label="Experienced?"
                persistent-hint hint="Enable to start with +5 XP for +10 pts."
                dense
              >
              </v-switch>
            </v-col>

          </v-row>

        </v-container>
      </opr-dialog>
    </v-dialog>

    <v-btn
      v-show="$vuetify.breakpoint.xsOnly"
      color="success"
      dark fixed
      fab bottom right
      @click="showAddUnitDialog = true"
    >
      <v-icon>
        mdi-plus
      </v-icon>
    </v-btn>

  </v-container>
</template>

<script>
import { uniqueNamesGenerator, animals, colors } from 'unique-names-generator';
import DtUnitEditor from "@/components/doubletab/DtUnitEditor";
import OprDialog from "@/components/shared/OprDialog";
import OprFirefightUnitEditor from "@/components/gf-firefight/OprFirefightUnitEditor";

export default {
  name: "index",
  components: {OprFirefightUnitEditor, OprDialog, DtUnitEditor},
  layout: 'gf-firefight',
  async asyncData({ params }) {
    return {
      warbandId: params.id,
    };
  },
  data() {
    return {
      armyBook: undefined,
      showArmyNameEditor: false,
      warbandName: '',
      fab: false,
      showAddUnitDialog: false,
      addUnitForm: {
        name: this.getRandomUnitName(),
        type: undefined,
        experienced: false,
      },
      selectedUnitId: undefined,
      editableUnit: undefined,
    };
  },
  computed: {
    warband() {
      return this.$store.getters['gfFirefight/warband'](this.warbandId);
    },
    warbandFactionKey() {
      return this.$store.getters['gfFirefight/warbandFactionKey'](this.warbandId);
    },
    units() {
      return this.$store.getters['gfFirefight/units'](this.warbandId);
    },
    selectedUnit() {
      return this.$store.getters['gfFirefight/unit'](this.warbandId, this.selectedUnitId);
    },
  },
  watch: {
    warbandFactionKey: {
      handler(newValue) {
        if (newValue) {
          this.loadFactionArmyBook(newValue);
        }
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  methods: {
    async loadFactionArmyBook(factionKey) {
      const { data } = await this.$axios.get(`/api/gf-firefight/army-books/${factionKey}`);
      this.armyBook = data;
    },
    getRandomUnitName(){
      return uniqueNamesGenerator({ dictionaries: [ colors, animals ], separator: ' ', style: 'capital', length: 2 });
    },
    getNewRandomName() {
      this.addUnitName = this.getRandomUnitName();
    },
    addNewUnit() {
      const id = this.warbandId;
      const name = this.addUnitForm.name;
      const { key, equipment, specialRules, cost } = this.armyBook.units.find((unit) => unit.key === this.addUnitForm.type.key);
      const unitCost = cost + (this.addUnitForm.experienced ? 10 : 0);
      const unitXp = this.addUnitForm.experienced ? 5 : 0;
      this.$store.commit('gfFirefight/addUnit', { id, key, name, equipment, specialRules, unitCost, unitXp });
      this.showAddUnitDialog = false;
    },
    cloneUnit(unitId) {
      this.$store.commit('gfFirefight/cloneUnit', { id: this.warbandId, unitId });
    },
    removeUnit(unitId) {
      this.$store.commit('gfFirefight/removeUnit', { id: this.warbandId, unitId });
    },
    openUnitEditor(unit) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUnitId = unit.id;
      } else {
        this.$router.push(`/gf-firefight/build/builder/${this.warbandId}/units/${unit.id}`);
      }
    },
    openArmyNameEditor() {
      this.warbandName = this.warband.name;
      this.showArmyNameEditor = true;
    },
    changeArmyName(){
      const id = this.warbandId;
      const name = this.warbandName;
      this.$store.commit('gfFirefight/setWarbandName', { id, name });
      this.showArmyNameEditor = false;
    },
    openEditUnitNameDialog(unit) {
      this.editingUnit = unit.id;
      this.unitName = unit.name;
      this.unitQuality = unit.quality;
      this.showEditUnitNameDialog = true;
    },
    changeUnitName() {
      const id = this.warbandId;
      const unitId = this.editingUnit;
      this.$store.commit('gfFirefight/unitSetName', { id, unitId, name: this.unitName });
      this.showEditUnitNameDialog = false;
    },
    addSpecialRuleToUnit(unitId, specialRuleKey) {
      const id = this.warbandId;

    },
    openAddSpecialDialog(unit) {
      this.editingUnit = unit.id;
      this.showAddSpecialRuleDialog = true;
    },
  },
}
</script>

<style scoped lang="scss">


</style>
