<template>
  <div class="range-band__table" v-if="weapons">

    <dt-range-band-header></dt-range-band-header>

    <dt-range-band-row
      v-for="weapon in weapons" :key="weapon.key"
      :weapon="weapon"
      class="mb-2"
      :show-cost="showCost"
    >
    </dt-range-band-row>

  </div>
</template>

<script>
import DtRangeBandRow from "@/components/doubletab/DtRangeBandRow";
import DtRangeBandHeader from "@/components/doubletab/DtRangeBandHeader";
export default {
  name: "DtRangeBand",
  components: {DtRangeBandHeader, DtRangeBandRow},
  props: {
    weapons: Array,
    showCost: Boolean,
  }
}
</script>

<style scoped lang="scss">
.range-band {

  &__table {
    width: 100%;
  }


  &__container {

    display: flex;
    flex-direction: row;

  }

}
</style>
