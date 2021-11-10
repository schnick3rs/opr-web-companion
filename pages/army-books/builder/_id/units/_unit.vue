<template>
  <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
    <v-row no-gutters>
      <v-col cols="12" :md="6" v-if="unitId">
        <opr-army-book-unit-editor
          :army-book-id="armybBookId"
          :unit-id="unitId"
        ></opr-army-book-unit-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OprArmyBookUnitEditor from "@/components/army-book/OprArmyBookUnitEditor";

export default {
  name: 'build-army-book-edit-unit',
  components: {
    OprArmyBookUnitEditor,
  },
  async asyncData({ params }) {
    return {
      armybBookId: params.id,
      unitId: params.unit,
    };
  },
}
</script>

<style scoped>

</style>
