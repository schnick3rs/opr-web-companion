<template>
  <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
    <v-row no-gutters>
      <v-col cols="12" :md="6" v-if="specialRuleId">
        <opr-army-book-special-rule-editor
          :army-book-id="armybBookId"
          :special-rule-id="specialRuleId"
        ></opr-army-book-special-rule-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OprArmyBookSpecialRuleEditor from "@/components/army-book/OprArmyBookSpecialRuleEditor";

export default {
  name: 'build-army-book-edit-unit',
  components: {OprArmyBookSpecialRuleEditor},
  async asyncData({ params }) {
    return {
      armybBookId: params.id,
      specialRuleId: params.specialrule,
    };
  },
}
</script>

<style scoped>

</style>
