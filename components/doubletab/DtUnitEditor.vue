<template>
  <v-card
    :elevation="elevation"
  >
    <v-card-title>{{enrichedUnit.name}}</v-card-title>
    <v-card-subtitle>{{enrichedUnit.totalCost}}pts</v-card-subtitle>

    <v-card-text>
      <dt-range-band :weapons="enrichedUnit.weapons" :show-cost="true"></dt-range-band>
      <v-btn small outlined color="blue" @click="openEditWeaponsDialog">
        edit weapon loadout
      </v-btn>
    </v-card-text>

    <v-card-text>
      <div v-for="(rule, i) in enrichedUnit.specialRules" :key="i">
        <strong>{{rule.label}}</strong> <em>({{rule.cost}}pts)</em>
        <p>{{rule.effect}}</p>
      </div>
      <v-btn small outlined color="blue" @click="openEditSpecialRulesDialog">edit special rules</v-btn>
    </v-card-text>

    <v-dialog
      v-model="showEditWeaponsDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Select weapon loadout"
        @close="showEditWeaponsDialog = false"
        @apply="updateWeapons()"
      >
        <v-alert dense outlined type="info">Each unit must have at least one melee weapon.</v-alert>
        <v-list-item>
          <v-list-item-content>
            <dt-range-band-header></dt-range-band-header>
          </v-list-item-content>
        </v-list-item>
        <v-list-item-group
          v-model="unitWeapons"
          multiple
          active-class="cyan lighten-3"
        >
          <v-list-item
            v-for="(weapon, i) in codexWeapons" :key="weapon.key"
            dense
          >
            <v-list-item-content>
              <dt-range-band-row :weapon="weapon" :show-cost="true"></dt-range-band-row>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </opr-dialog>
    </v-dialog>

    <v-dialog
      v-model="showEditSpecialRulesDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Select special rules"
        @close="showEditSpecialRulesDialog = false"
        @apply="updateSpecialRules()"
      >
        <v-list-item-group
          v-model="unitSpecialRules"
          multiple
          active-class="cyan lighten-3"
        >
          <v-list-item
            v-for="(rule, i) in codexSpecialRules" :key="rule.key"
            dense
          >
            <v-list-item-content>
              <v-list-item-title>{{rule.label}} ({{rule.cost}})</v-list-item-title>
              <v-list-item-subtitle>{{rule.effect}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </opr-dialog>
    </v-dialog>

  </v-card>
</template>

<script>
export default {
  name: "DtUnitEditor",
  props: {
    armyId: String,
    unitId: String,
    unit: Object,
    codexWeapons: Array,
    codexSpecialRules: Array,
  },
  data() {
    return {
      showEditWeaponsDialog: false,
      unitWeapons: [],
      showEditSpecialRulesDialog: false,
      unitSpecialRules: [],
    };
  },
  computed: {
    enrichedUnit() {
      let totalCost = 0;
      this.unit.weapons.forEach((r) => totalCost += parseInt(r.cost));
      this.unit.specialRules.forEach((r) => totalCost += parseInt(r.cost));
      const weapons = this.unit.weapons
        .map((weapon) => this.codexWeapons.find((w) => w.key === weapon.key))
        .sort((a,b) => a.order - b.order);
      const specialRules = this.unit.specialRules.map((rule) => this.codexSpecialRules.find((r) => r.key === rule.key));
      return {
        ...this.unit,
        weapons,
        specialRules,
        totalCost,
      };
    },
    elevation(){
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
  },
  methods: {
    openEditWeaponsDialog() {
      this.unitWeapons = [];
      this.unit.weapons.forEach((weapon) => {
        const i = this.codexWeapons.findIndex((item) => item.key === weapon.key);
        this.unitWeapons.push(i);
      });
      this.showEditWeaponsDialog = true;
    },
    updateWeapons() {
      const id = this.armyId;
      const unitId = this.unit.id;

      const weapons = this.unitWeapons.map((index) => {
        const { key, cost } = this.codexWeapons[index];
        return { key, cost };
      });

      this.$store.commit('doubleTab/unitSetWeapons', { id, unitId, weapons })
      this.showEditWeaponsDialog = false;
    },
    openEditSpecialRulesDialog() {
      this.unitSpecialRules = [];
      this.unit.specialRules.forEach((weapon) => {
        const i = this.codexSpecialRules.findIndex((item) => item.key === weapon.key);
        this.unitSpecialRules.push(i);
      });
      this.showEditSpecialRulesDialog = true;
    },
    updateSpecialRules() {
      const id = this.armyId;
      const unitId = this.unit.id;

      const specialRules = this.unitSpecialRules.map((index) => {
        const { key, cost } = this.codexSpecialRules[index];
        return { key, cost };
      });

      this.$store.commit('doubleTab/unitSetSpecialRules', { id, unitId, specialRules })
      this.showEditSpecialRulesDialog = false;
    },
  }
}
</script>

<style scoped>

</style>
