<template>
  <v-container :class="{ 'pl-0 pr-0': $vuetify.breakpoint.xsOnly}">
    <v-row no-gutters>
      <v-col cols="12" :md="6" v-if="upgradePackageId">
        <opr-army-book-upgrade-package-editor
          :army-book-id="armybBookId"
          :upgrade-package-id="upgradePackageId"
        ></opr-army-book-upgrade-package-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OprArmyBookUpgradePackageEditor from "@/components/army-book/OprArmyBookUpgradePackageEditor";

export default {
  name: 'build-army-book-edit-unit',
  components: {OprArmyBookUpgradePackageEditor},
  async asyncData({ params }) {
    return {
      armybBookId: params.id,
      upgradePackageId: params.upgrade,
    };
  },
}
</script>

<style scoped>

</style>
