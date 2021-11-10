<template>
  <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
    <v-row no-gutters>
      <v-col cols="12" :md="6" v-if="unit">
        <dt-unit-editor
          :army-id="armyId"
          :unit-id="unit.id"
          :unit="unit"
          :codex-weapons="codex.weapons"
          :codex-special-rules="codex.specialRules"
        ></dt-unit-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DtRangeBand from "@/components/doubletab/DtRangeBand";
import OprDialog from "@/components/shared/OprDialog";
import DtRangeBandRow from "@/components/doubletab/DtRangeBandRow";
import DtRangeBandHeader from "@/components/doubletab/DtRangeBandHeader";
import DtUnitEditor from "@/components/doubletab/DtUnitEditor";
export default {
  name: "army-unit",
  components: {DtUnitEditor, DtRangeBandHeader, DtRangeBandRow, OprDialog, DtRangeBand},
  layout: 'doubletab',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/double-tab/codex`);
    return {
      armyId: params.id,
      unitId: params.unit,
      codex: data,
    };
  },
  computed: {
    unit() {
      return this.$store.getters['doubleTab/unit'](this.armyId, this.unitId);
    },
  },
}
</script>

<style scoped>

</style>
