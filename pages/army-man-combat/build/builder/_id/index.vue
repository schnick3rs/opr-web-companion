<template>
  <v-container v-if="army">
    <v-toolbar>
      <span v-if="showArmyNameEditor">
        <v-text-field
          v-model="armyName"
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
        {{army.name}} <v-icon right small @click="openArmyNameEditor">mdi-pencil</v-icon>
      </span>
      <v-spacer></v-spacer>
      {{armyTotalCost}} / {{ army.pointLimit }} pts.
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
          Add Unit
        </v-btn>

        <v-list elevation="2" v-if="enrichedUnits">
          <v-list-item
            v-for="unit in enrichedUnits" :key="unit.id"
            :class="{ 'green lighten-4': unit.id === selectedUnitId }"
            dense
            two-line
          >
            <v-list-item-content>
              <v-list-item-title>
                {{unit.name}}
                <span v-if="$vuetify.breakpoint.xsOnly">- {{unit.totalCost}} pts.</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ unit.totalSize }} {{unit.label}}
              </v-list-item-subtitle>
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

      <v-col cols="12" :md="6" v-if="editableUnit">
        <amc-unit-editor
          :army-id="armyId"
          :unit-id="editableUnit.id"
          :unit="editableUnit"
          :codex-unit="codex.units.find((u) => u.key === editableUnit.key )"
          :codex-weapons="codex.weapons"
        ></amc-unit-editor>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showAddUnitDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Add a new Unit"
        @close="showAddUnitDialog = false"
        @apply="addNewUnit"
      >

        <v-text-field
          class="mt-4"
          label="Name"
          dense outlined
          v-model="addUnitName"
          append-icon="mdi-dice-6"
          @click:append="getNewRandomName"
        >
        </v-text-field>

        <v-select
          class="mt-4"
          label="Unit Type"
          dense outlined
          :items="codex.units"
          item-text="label"
          item-value="key"
          v-model="addUnitType"
        >
        </v-select>

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
import OprDialog from "@/components/shared/OprDialog";
import AmcUnitEditor from "@/components/armymancombat/AmcUnitEditor";

export default {
  name: 'index',
  layout: 'armymancombat',
  components: {AmcUnitEditor, OprDialog},
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/army-man-combat/codex`);
    return {
      armyId: params.id,
      codex: data,
    };
  },
  data() {
    return {
      showArmyNameEditor: false,
      armyName: '',
      fab: false,
      showAddUnitDialog: false,
      addUnitName: this.getRandomUnitName(),
      addUnitType: undefined,
      selectedUnitId: undefined,
    };
  },
  computed: {
    army() {
      return this.$store.getters['armyManCombat/army'](this.armyId);
    },
    armyTotalCost() {
      return this.$store.getters['armyManCombat/armyTotalCost'](this.armyId);
    },
    units() {
      return this.$store.getters['armyManCombat/units'](this.armyId);
    },
    editableUnit() {
      if (this.selectedUnitId) {
        return this.$store.getters['armyManCombat/unit'](this.armyId, this.selectedUnitId);
      }
      return undefined;
    },
    enrichedUnits() {
      if(this.units && this.codex) {
        return this.units.map((unit) => {
          let totalCost = unit.cost * unit.sizeFactor;
          let totalSize = unit.size * unit.sizeFactor
          unit.upgrades.forEach((u) => totalCost += u.cost);
          const codexUnit = this.codex.units.find((u) => u.key === unit.key);
          return {
            ...unit,
            ...codexUnit,
            totalCost,
            totalSize,
          };
        });
      } else {
        return [];
      }
    },
  },
  methods: {
    getRandomUnitName(){
      const random = uniqueNamesGenerator({ dictionaries: [ colors ], separator: ' ', style: 'capital', length: 1 });
      return `${random} Squad`;
    },
    getNewRandomName() {
      this.addUnitName = this.getRandomUnitName();
    },
    addNewUnit() {
      const id = this.armyId;
      const name = this.addUnitName;
      const { key, cost, size } = this.codex.units.find((unit) => unit.key === this.addUnitType)
      this.$store.commit('armyManCombat/addUnit', { id, name, key, cost, size });
      this.addUnitName = this.getRandomUnitName();
      this.addUnitType = undefined;
      this.showAddUnitDialog = false;
    },
    cloneUnit(unitId) {
      this.$store.commit('armyManCombat/cloneUnit', { id: this.armyId, unitId });
    },
    removeUnit(unitId) {
      this.$store.commit('armyManCombat/removeUnit', { id: this.armyId, unitId });
    },
    openUnitEditor(unit) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUnitId = unit.id;
      } else {
        this.$router.push(`/army-man-combat/build/builder/${this.armyId}/units/${unit.id}`);
      }
    },
    openArmyNameEditor() {
      this.armyName = this.army.name;
      this.showArmyNameEditor = true;
    },
    changeArmyName(){
      const id = this.armyId;
      const name = this.armyName;
      this.$store.commit('armyManCombat/setArmyName', { id, name });
      this.showArmyNameEditor = false;
    },
  },
}
</script>

<style scoped lang="scss">


</style>
