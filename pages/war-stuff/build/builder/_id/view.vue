<template>
  <v-container v-if="army">
    <v-row>
      <v-col
        v-for="unit in enrichedUnits" :key="unit.id"
        :cols="12"
        :sm="6"
        :md="4"
      >
        <warstuff-unit-card :unit="unit"></warstuff-unit-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import WarstuffUnitCard from "@/components/warstuff/WarstuffUnitCard";
export default {
  name: "print",
  components: {WarstuffUnitCard},
  layout: 'warstuff',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/war-stuff/codex`);
    return {
      armyId: params.id,
      codex: data,
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
}
</script>

<style scoped>

</style>
