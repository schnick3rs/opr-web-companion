<template>
  <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
    <v-row no-gutters>
      <v-col cols="12" :md="6" v-if="unit">
        <amc-unit-editor
          :army-id="armyId"
          :unit-id="unit.id"
          :unit="unit"
          :codex-unit="codex.units.find((u) => u.key === unit.key )"
          :codex-weapons="codex.weapons"
        ></amc-unit-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OprDialog from "@/components/shared/OprDialog";
import DtRangeBandRow from "@/components/doubletab/DtRangeBandRow";
import DtRangeBandHeader from "@/components/doubletab/DtRangeBandHeader";
import AmcUnitEditor from "@/components/armymancombat/AmcUnitEditor";

export default {
  name: "army-unit",
  components: {AmcUnitEditor, DtRangeBandHeader, DtRangeBandRow, OprDialog},
  layout: 'armymancombat',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/army-man-combat/codex`);
    return {
      armyId: params.id,
      unitId: params.unit,
      codex: data,
    };
  },
  computed: {
    unit() {
      return this.$store.getters['armyManCombat/unit'](this.armyId, this.unitId);
    },
  },
}
</script>

<style scoped>

</style>
