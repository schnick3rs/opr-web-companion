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

        <v-list v-if="enrichedUnits" elevation="2">
          <template
            v-for="(unit, unitIndex) in enrichedUnits"
          >
            <v-list-item
              :key="unit.id"
              :class="{ 'purple lighten-4': unit.id === selectedUnitId }"
              dense
              three-line-line
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{unit.name}}
                  <span v-if="$vuetify.breakpoint.xsOnly">- {{unit.totalCost}} pts.</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{unit.weapons.map((r) => `${r.label} (${r.cost}pts)`).join(', ')}}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  {{unit.specialRules.map((r) => `${r.label} (${r.cost}pts)`).join(', ')}}
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
            <v-divider v-if="unitIndex < enrichedUnits.length-1"></v-divider>
          </template>
        </v-list>

      </v-col>

      <v-col cols="12" :md="6" v-if="editableUnit">
        <dt-unit-editor
          :army-id="armyId"
          :unit-id="editableUnit.id"
          :unit="editableUnit"
          :codex-weapons="codex.weapons"
          :codex-special-rules="codex.specialRules"
        ></dt-unit-editor>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showAddUnitDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title style="background-color: #262e37; color: #fff;">
          <span>Add new unit</span>
          <v-spacer />
          <v-icon dark @click="showAddUnitDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text>

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
            label="Weapons"
            dense outlined
            :items="codex.weapons"
            item-text="label"
            item-value="key"
            multiple
            v-model="addUnitWeapons"
          >
          </v-select>

          <v-select
            class="mt-4"
            label="Special Rules"
            dense outlined
            :items="codex.specialRules"
            item-text="label"
            item-value="key"
            multiple
            v-model="addUnitSpecialRules"
          >
          </v-select>


        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="error" outlined @click="showAddUnitDialog = false">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="addNewUnit">Apply</v-btn>
        </v-card-actions>
      </v-card>
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

export default {
  name: "index",
  components: {DtUnitEditor},
  layout: 'doubletab',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/double-tab/codex`);
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
      addUnitWeapons: [ 'knife' ],
      addUnitSpecialRules: [],
      selectedUnitId: undefined,
    };
  },
  computed: {
    army() {
      return this.$store.getters['doubleTab/army'](this.armyId);
    },
    armyTotalCost() {
      return this.$store.getters['doubleTab/armyTotalCost'](this.armyId);
    },
    units() {
      return this.$store.getters['doubleTab/units'](this.armyId);
    },
    editableUnit() {
      if (this.selectedUnitId) {
        return this.$store.getters['doubleTab/unit'](this.armyId, this.selectedUnitId);
      }
      return undefined;
    },
    enrichedUnits() {
      if(this.units && this.codex) {
        return this.units.map((unit) => {
          let totalCost = 0;
          unit.weapons.forEach((r) => totalCost += parseInt(r.cost));
          unit.specialRules.forEach((r) => totalCost += parseInt(r.cost));
          const weapons = unit.weapons
            .map((weapon) => this.codex.weapons.find((w) => w.key == weapon.key))
            .sort((a,b) => a.order - b.order);
          const specialRules = unit.specialRules.map((rule) => this.codex.specialRules.find((r) => r.key == rule.key));
          return {
            ...unit,
            weapons,
            specialRules,
            totalCost,
          };
        });
      } else {
        return [];
      }
    },
  },
  methods: {
    getRandomUnitName(){
      return uniqueNamesGenerator({ dictionaries: [ colors, animals ], separator: ' ', style: 'capital', length: 2 });
    },
    getNewRandomName() {
      this.addUnitName = this.getRandomUnitName();
    },
    addNewUnit() {
      const id = this.armyId;
      const name = this.addUnitName;
      const weapons = this.addUnitWeapons.map((w) => {
        const weapon = this.codex.weapons.find((i) => i.key === w);
        return { key: weapon.key, cost: weapon.cost };
      });
      const specialRules = this.addUnitSpecialRules.map((s) => {
        const specialRules = this.codex.specialRules.find((i) => i.key === s);
        return { key: specialRules.key, cost: specialRules.cost };
      });
      this.$store.commit('doubleTab/addUnit', { id, name, weapons, specialRules });
      this.addUnitName = this.getRandomUnitName();
      this.addUnitWeapons= [ 'knife' ];
      this.addUnitSpecialRules= [];
      this.showAddUnitDialog = false;
    },
    cloneUnit(unitId) {
      this.$store.commit('doubleTab/cloneUnit', { id: this.armyId, unitId });
    },
    removeUnit(unitId) {
      this.$store.commit('doubleTab/removeUnit', { id: this.armyId, unitId });
    },
    openUnitEditor(unit) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUnitId = unit.id;
      } else {
        this.$router.push(`/double-tab/build/builder/${this.armyId}/units/${unit.id}`);
      }
    },
    openArmyNameEditor() {
      this.armyName = this.army.name;
      this.showArmyNameEditor = true;
    },
    changeArmyName(){
      const id = this.armyId;
      const name = this.armyName;
      this.$store.commit('doubleTab/setArmyName', { id, name });
      this.showArmyNameEditor = false;
    },
    openEditUnitNameDialog(unit) {
      this.editingUnit = unit.id;
      this.unitName = unit.name;
      this.unitQuality = unit.quality;
      this.showEditUnitNameDialog = true;
    },
    changeUnitName() {
      const id = this.armyId;
      const unitId = this.editingUnit;
      this.$store.commit('doubleTab/unitSetName', { id, unitId, name: this.unitName });
      const cost = (7-this.unitQuality) * 5;
      this.$store.commit('doubleTab/unitSetQuality', { id, unitId, quality: this.unitQuality, cost });
      this.unitName = '';
      this.unitQuality = undefined;
      this.editingUnit = undefined;
      this.showEditUnitNameDialog = false;
    },
    addSpecialRuleToUnit(unitId, specialRuleKey) {
      const id = this.armyId;
      const { key, cost } = this.codex.specialRules.find((rule) => rule.key === specialRuleKey);
      this.$store.commit('doubleTab/unitAddSpecialRule', {id, unitId, specialRuleKey, cost});
    },
    openAddSpecialDialog(unit) {
      this.editingUnit = unit.id;
      unit.specialRules.forEach((rule) => {
        const i = this.codex.specialRules.findIndex((codexRule) => codexRule.key === rule.key);
        this.unitsSpecialRules.push(i);
      });
      this.showAddSpecialRuleDialog = true;
    },
  },
}
</script>

<style scoped lang="scss">


</style>
