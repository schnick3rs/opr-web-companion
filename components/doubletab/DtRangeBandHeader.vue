<template>
  <div class="range-band__header mb-2">
    <span class="range-band__header-item range-band__header-item--label">Weapon</span>
    <span class="range-band__header-item range-band__header-item--attacks">Att.</span>
    <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-9">
                <span>0"</span>
                <span>9"</span>
              </span>
    <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-18">18"</span>
    <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-27">27"</span>
    <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-36">36"</span>
  </div>
</template>

<script>
export default {
  name: "DtRangeBandHeader"
}
</script>

<style scoped lang="scss">
.range-band {
  &__header {
    display: flex;
    flex-direction: row;
    border-bottom: solid 1px black;
  }

  &__header-item {
    &--label { width: 25%; }
    &--attacks { width: 10%; }
    &--ranges {
      text-align: right;
    }
    &--ranges-9 {
      width: 16%;
      justify-content: space-between;
      display: flex;
    }
    &--ranges-18 { width: 16%; }
    &--ranges-27 { width: 16%; }
    &--ranges-36 { width: 16%; }
  }
}
</style>
