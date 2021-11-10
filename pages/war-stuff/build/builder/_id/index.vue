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
      {{armyTotalCost}} / 150 pts.
    </v-toolbar>
    <v-speed-dial
      v-model="fab"
      bottom
      right
      fixed
    >
      <template v-slot:activator>
        <v-btn
          v-model="fab"
          color="success"
          dark
          fab
        >
          <v-icon v-if="fab">
            mdi-close
          </v-icon>
          <v-icon v-else>
            mdi-plus
          </v-icon>
        </v-btn>
      </template>
      <v-btn fab dark small color="green" @click="addUnit(6)">6+</v-btn>
      <v-btn fab dark small color="green" @click="addUnit(5)">5+</v-btn>
      <v-btn fab dark small color="green" @click="addUnit(4)">4+</v-btn>
      <v-btn fab dark small color="green" @click="addUnit(3)">3+</v-btn>
      <v-btn fab dark small color="green" @click="addUnit(2)">2+</v-btn>
    </v-speed-dial>
    <v-row>
      <v-col>
        <v-list elevation="2" v-if="enrichedUnits">
          <v-list-item dense two-line v-for="unit in enrichedUnits" :key="unit.id">
            <v-list-item-avatar>
              <v-avatar color="primary" size="32"><span class="white--text">{{unit.quality}}+</span></v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{unit.name}}
                <v-icon x-small @click="openEditUnitNameDialog(unit)">mdi-pencil</v-icon>
                ({{unit.baseCost}})
                <span v-if="$vuetify.breakpoint.xsOnly">- {{unit.totalCost}} pts.</span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <v-btn icon small v-if="unit.specialRules.length < 3"><v-icon small color="success" @click="openAddSpecialDialog(unit)">mdi-plus-circle</v-icon></v-btn>
                <v-btn icon small v-else-if="unit.specialRules.length >= 3"><v-icon small color="success" @click="openAddSpecialDialog(unit)">mdi-pencil</v-icon></v-btn>
                {{unit.specialRules.map((r) => `${r.label} (${r.cost})`).join(', ')}}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action-text v-if="$vuetify.breakpoint.smAndUp">{{unit.totalCost}} pts.</v-list-item-action-text>

            <v-list-item-action v-if="$vuetify.breakpoint.smAndUp">
              <v-btn icon><v-icon color="primary" small @click="cloneUnit(unit.id)">mdi-plus-box-multiple</v-icon></v-btn>
            </v-list-item-action>

            <v-list-item-action v-if="$vuetify.breakpoint.smAndUp">
              <v-btn icon><v-icon color="error" small @click="removeUnit(unit.id)">mdi-delete</v-icon></v-btn>
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
    </v-row>

    <v-dialog
      v-model="showAddSpecialRuleDialog"
      width="600px"
      scrollable
    >
      <v-card>
        <v-card-title style="background-color: #262e37; color: #fff;">
          <span>Select Special Rules ({{unitsSpecialRules.length}}/3)</span>
          <v-spacer />
          <v-icon dark @click="showAddSpecialRuleDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text>
          <v-list-item-group
            v-model="unitsSpecialRules"
            multiple
            active-class="cyan lighten-3"
          >
            <v-list-item
              v-for="rule in codex.specialRules" :key="rule.key"
              dense
              three-line
            >
              <v-list-item-content>
                <v-list-item-title>{{rule.label}} ({{rule.cost}})</v-list-item-title>
                <v-list-item-subtitle>{{rule.effect}}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="error" outlined @click="showAddSpecialRuleDialog = false">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="addSpecialRules">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showEditUnitNameDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <v-card>
        <v-card-title style="background-color: #262e37; color: #fff;">
          <span>Edit Unit name & quality</span>
          <v-spacer />
          <v-icon dark @click="showEditUnitNameDialog = false">mdi-close</v-icon>
        </v-card-title>
        <v-card-text class="pt-6">
          <v-text-field
            label="Unit Name"
            outlined
            v-model="unitName"
          ></v-text-field>
          <div>Unit Quality:</div>
          <v-slider
            class="mt-8"
            v-model="unitQuality"
            min="2" max="6"
            thumb-label="always"
          >
            <template v-slot:thumb-label="{ value }">
              {{value}}+
            </template>
          </v-slider>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="error" outlined @click="showEditUnitNameDialog = false">Close</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="changeUnitName">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import { uniqueNamesGenerator, animals } from 'unique-names-generator';

export default {
  name: "index",
  layout: 'warstuff',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/war-stuff/codex`);
    return {
      armyId: params.id,
      codex: data,
    };
  },
  data() {
    return {
      showArmyNameEditor: false,
      armyName: '',
      //
      fab: false,
      editingUnit: undefined,
      //
      showAddSpecialRuleDialog: false,
      unitsSpecialRules: [],
      //
      showEditUnitNameDialog: false,
      unitName: '',
      unitQuality: undefined,
    };
  },
  computed: {
    army() {
      return this.$store.getters['warStuff/army'](this.armyId);
    },
    armyTotalCost() {
      return this.$store.getters['warStuff/armyTotalCost'](this.armyId);
    },
    units() {
      return this.$store.getters['warStuff/units'](this.armyId);
    },
    enrichedUnits() {
      if(this.units && this.codex) {
        return this.units.map((unit) => {
          let totalCost = unit.baseCost;
          unit.specialRules.forEach((r) => totalCost += r.cost);
          const specialRules = unit.specialRules.map((rule) => this.codex.specialRules.find((r) => r.key == rule.key));
          return {
            ...unit,
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
    addUnit(quality) {
      const cost = (7-quality) * 5;
      const name = uniqueNamesGenerator({ dictionaries: [ animals ], separator: ' ', style: 'capital', length: 1 });
      this.$store.commit('warStuff/addUnit', { id: this.armyId, quality, cost, name });
    },
    cloneUnit(unitId) {
      this.$store.commit('warStuff/cloneUnit', { id: this.armyId, unitId });
    },
    removeUnit(unitId) {
      this.$store.commit('warStuff/removeUnit', { id: this.armyId, unitId });
    },
    openArmyNameEditor() {
      this.armyName = this.army.name;
      this.showArmyNameEditor = true;
    },
    changeArmyName(){
      const id = this.armyId;
      const name = this.armyName;
      this.$store.commit('warStuff/setArmyName', { id, name });
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
      this.$store.commit('warStuff/unitSetName', { id, unitId, name: this.unitName });
      const cost = (7-this.unitQuality) * 5;
      this.$store.commit('warStuff/unitSetQuality', { id, unitId, quality: this.unitQuality, cost });
      this.unitName = '';
      this.unitQuality = undefined;
      this.editingUnit = undefined;
      this.showEditUnitNameDialog = false;
    },
    addSpecialRuleToUnit(unitId, specialRuleKey) {
      const id = this.armyId;
      const { key, cost } = this.codex.specialRules.find((rule) => rule.key === specialRuleKey);
      this.$store.commit('warStuff/unitAddSpecialRule', {id, unitId, specialRuleKey, cost});
    },
    openAddSpecialDialog(unit) {
      this.editingUnit = unit.id;
      unit.specialRules.forEach((rule) => {
        const i = this.codex.specialRules.findIndex((codexRule) => codexRule.key === rule.key);
        this.unitsSpecialRules.push(i);
      });
      this.showAddSpecialRuleDialog = true;
    },
    addSpecialRules() {
      this.$store.commit('warStuff/unitClearSpecialRules', { id: this.armyId, unitId: this.editingUnit });
      this.unitsSpecialRules.forEach((ruleIndex) => {
        const rule = this.codex.specialRules[ruleIndex];
        this.addSpecialRuleToUnit(this.editingUnit, rule.key);
      });
      this.editingUnit = undefined;
      this.unitsSpecialRules = [];
      this.showAddSpecialRuleDialog = false;
    }
  },
}
</script>

<style scoped>

</style>
