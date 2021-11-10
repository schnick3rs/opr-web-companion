<template>
  <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
    <v-row no-gutters>
      <v-col cols="12" :md="6" v-if="unitId">
        <opr-firefight-unit-editor
          :warband-id="warbandId"
          :unit-id="unitId"
        ></opr-firefight-unit-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OprFirefightUnitEditor from "@/components/gf-firefight/OprFirefightUnitEditor";

export default {
  name: "_unit",
  layout: 'gf-firefight',
  components: {OprFirefightUnitEditor},
  async asyncData({ params }) {
    return {
      warbandId: params.id,
      unitId: params.unit,
    };
  },
}
</script>

<style scoped>

</style>
