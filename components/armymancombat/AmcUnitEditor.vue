<template>
  <v-card
    :elevation="elevation"
  >
    <v-card-title>{{enrichedUnit.name}}</v-card-title>
    <v-card-subtitle>
      {{ unitSize }} {{ enrichedUnit.label }} • {{ unitCost }} pts
      <v-btn
        color="blue"
        x-small outlined
        v-if="enrichedUnit.scale > 1 && unit.sizeFactor === 1"
        @click="unitScaleUp(enrichedUnit.scale)"
      >
        Grow Squad (x{{enrichedUnit.scale}})
      </v-btn>
      <v-btn
        color="red"
        x-small outlined
        v-if="enrichedUnit.scale > 1 && unit.sizeFactor > 1"
        @click="unitScaleUp(1)"
      >
        Shrink Squad
      </v-btn>
    </v-card-subtitle>

    <v-card-text>

      <div class="mb-4" v-if="unitArmor">
        <div>
          <strong>Armor ({{unitArmor.value}}):</strong> {{unitArmor.text}}
        </div>
      </div>

      <div class="mb-4">
        <div v-for="equipment in unitEquipment" :key="equipment.key">
          <strong>{{equipment.label}} - </strong>
          Range: {{ equipment.range > 0 ? `${equipment.range}"` : 'Melee' }}
          / Attacks: {{ equipment.attacks }}
          <em v-if="equipment.isAntiVehicle">(x2 vs Vehicles)</em>
          <v-btn icon x-small v-if="equipment.upgrade" @click="removeUnitUpgrade(equipment.upgrade)">
            <v-icon color="red">mdi-minus-box</v-icon>
          </v-btn>
        </div>

        <v-divider v-if="hasInfantryUpgrades"></v-divider>

        <div v-if="hasInfantryUpgrades">
          <div class="caption" v-if="!hasBajonetsUpgradeSelected">
            <strong>Bajonets:</strong> All soldiers may take bayonets
            <v-btn icon x-small @click="addUnitUpgrade('bajonets', 10)">
              <v-icon color="green">mdi-plus-box-multiple</v-icon>
            </v-btn>
            for +10pts.
          </div>
          <div class="caption" v-if="!(hasGrenadiersGrenadesUpgradeSelected || hasGrenadiersC4UpgradeSelected)">
            <strong>Grenadiers:</strong> One soldier may take grenades
            <v-btn icon x-small @click="addUnitUpgrade('grenade', 5)"><v-icon color="green">mdi-plus-circle</v-icon></v-btn>
            for +5pts or C4
            <v-btn icon x-small @click="addUnitUpgrade('c4', 10)"><v-icon color="green">mdi-plus-circle</v-icon></v-btn>
            for +10pts.
          </div>
          <div class="caption" v-if="!(hasSpecialistsFlamethrowerUpgradeSelected || hasSpecialistsBazookaSelected)">
            <strong>Specialists:</strong> Replace one Rifle with a Flamethrower
            <v-btn icon x-small @click="addUnitUpgrade('flamethrower', 10)"><v-icon color="green">mdi-plus-circle</v-icon></v-btn>
            or a Bazooka
            <v-btn icon x-small @click="addUnitUpgrade('bazooka', 10)"><v-icon color="green">mdi-plus-circle</v-icon></v-btn>
            for +10pts.
          </div>
        </div>

        <div v-if="hasMgUpgrade && !hasMgUpgradeSelected">
          <div class="caption">
            <v-btn @click="addUnitUpgrade('machinegun', 10)" icon x-small><v-icon color="green">mdi-plus-box</v-icon></v-btn>
            <strong>MG:</strong> Take a machinegun (36", 3A) for +10pts.
          </div>
        </div>

      </div>

      <div class="mb-4" v-if="unitSpecials">
        <p><strong>Special:</strong> {{unitSpecials}}</p>
      </div>

    </v-card-text>

  </v-card>
</template>

<script>
export default {
  name: "AmcUnitEditor",
  props: {
    armyId: String,
    unitId: String,
    unit: Object,
    codexUnit: Object,
    codexWeapons: Array,
  },
  data() {
    return {
      unitWeapons: [],
      showEditSpecialRulesDialog: false,
      unitSpecialRules: [],
    };
  },
  computed: {
    elevation(){
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    enrichedUnit() {
      return {
        ...this.codexUnit,
        ...this.unit,
      };
    },
    unitCost() {
      let cost = this.enrichedUnit.cost * this.unit.sizeFactor;
      this.unit.upgrades.forEach((u) => cost += u.cost);
      return cost;
    },
    unitSize() {
      return this.enrichedUnit.size * this.unit.sizeFactor;
    },
    unitArmor() {
      let armor = this.enrichedUnit.armour;
      if (armor) {
        return { value: armor, text: `Rolls +${armor} dice to block hits.`};
      }
      return undefined;
    },
    unitEquipment() {
      const core = [];
      if (this.hasBajonetsUpgradeSelected) {
        core.push({ ...this.bajonet, upgrade: 'bajonets' });
      }
      core.push(...this.enrichedUnit?.equipment.map((e) => this.codexWeapons.find((w) => w.key === e)));
      if (this.hasGrenadiersGrenadesUpgradeSelected) { core.push({ ...this.grenade, upgrade: 'grenade' }); }
      if (this.hasGrenadiersC4UpgradeSelected) { core.push({ ...this.c4, upgrade: 'c4' }); }
      if (this.hasSpecialistsFlamethrowerUpgradeSelected) { core.push({ ...this.flamethrower, upgrade: 'flamethrower' }); }
      if (this.hasSpecialistsBazookaSelected) { core.push({ ...this.bazooka, upgrade: 'bazooka' }); }

      if (this.hasMgUpgradeSelected) {
        core.push({ ...this.mg, upgrade: 'machinegun' });
      }
      return core;
    },
    unitSpecials() {
      return this.enrichedUnit?.special;
    },
    hasUpgrades() {
      return ['recruits','rifleman','veterans','jeep'].includes(this.unit.key);
    },
    hasInfantryUpgrades() {
      return ['recruits','rifleman','veterans'].includes(this.unit.key);
    },
    hasMgUpgrade() {
      return ['jeep','truck','apc','tank','medium-tank','heavy-tank'].includes(this.unit.key);
    },
    hasMgUpgradeSelected() {
      return this.unit.upgrades.find((u) => u.key === 'machinegun');
    },
    hasBajonetsUpgradeSelected() {
      return this.unit.upgrades.find((u) => u.key === 'bajonets');
    },
    hasGrenadiersGrenadesUpgradeSelected() {
      return this.unit.upgrades.find((u) => u.key === 'grenade');
    },
    hasGrenadiersC4UpgradeSelected() {
      return this.unit.upgrades.find((u) => u.key === 'c4');
    },
    hasSpecialistsFlamethrowerUpgradeSelected() {
      return this.unit.upgrades.find((u) => u.key === 'flamethrower');
    },
    hasSpecialistsBazookaSelected() {
      return this.unit.upgrades.find((u) => u.key === 'bazooka');
    },
    mg() {
      return this.codexWeapons.find((w) => w.key === 'machinegun');
    },
    bajonet() {
      return this.codexWeapons.find((w) => w.key === 'bajonet');
    },
    grenade() {
      return this.codexWeapons.find((w) => w.key === 'grenade');
    },
    c4() {
      return this.codexWeapons.find((w) => w.key === 'c4');
    },
    flamethrower() {
      return this.codexWeapons.find((w) => w.key === 'flamethrower');
    },
    bazooka() {
      return this.codexWeapons.find((w) => w.key === 'bazooka');
    },
  },
  methods: {
    addUnitUpgrade(upgradeKey, cost) {
      const id = this.armyId;
      const unitId = this.unit.id;
      this.$store.commit('armyManCombat/unitAddUpgrade', {id, unitId, upgradeKey, cost});
    },
    removeUnitUpgrade(upgradeKey) {
      const id = this.armyId;
      const unitId = this.unit.id;
      this.$store.commit('armyManCombat/unitRemoveUpgrade', {id, unitId, upgradeKey});
    },
    unitScaleUp(scale) {
      const id = this.armyId;
      const unitId = this.unit.id;
      this.$store.commit('armyManCombat/unitScaleUp', {id, unitId, scale});
    },
  },
}
</script>

<style scoped>

</style>
