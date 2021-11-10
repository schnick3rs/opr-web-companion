<template>
  <div
    class="range-band__row"
  >
    <span class="range-band__row-item range-band__row-item--label">
      {{weapon.label}}
      <em v-if="showCost">({{weapon.cost}})</em>
    </span>
    <span class="range-band__row-item range-band__row-item--attacks">{{weapon.attacks}}</span>
    <div
      v-if="weapon.range > 0"
      class="range-band__row-item range-band__row-item--ranges"
    >
      <div
        v-for="(band, i) in weapon.bands" :key="i"
        class="range-band__section"
        :class="{
                      'range-band__section--worst': band.mod < 0,
                      'range-band__section--best': band.mod > 0,
                      'range-band__section--ranges-9': (band.to-band.from) === 9,
                      'range-band__section--ranges-18': (band.to-band.from) === 18,
                     }"
      >
        <span v-if="band.mod !== 0">{{ band.mod > 0 ? '+1' : '-1' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DtRangeBandRow",
  props: {
    weapon: Object,
    showCost: {
      default: false,
      type: Boolean,
    }
  }
}
</script>

<style scoped lang="scss">

.range-band {
  &__row {
    display: flex;
    flex-direction: row;
  }

  &__row-item {
    &--label { width: 25%; }
    &--attacks { width: 10%; }
    &--ranges {
      width: 64%;
      display: flex;
      flex-direction: row;
    }
  }

  &__container {

    display: flex;
    flex-direction: row;

  }

  &__section {
    justify-content: space-between;
    padding: 2px 4px;
    color: white;
    text-align: center;
    display: block;

    background-color: #4984cb;

    &--ranges-9 { width: 25%; }
    &--ranges-18 { width: 50%; }
    &--ranges-27 { width: 75%; }
    &--ranges-36 { width: 100%; }

    &--worst {
      background-color: #ff5050;
    }

    &--best {
      background-color: #68d253;
    }
  }

  @media print {
    .range-band {
      &__section {
        background-color: #a4a4a4;
        &--worst {
          background-color: #646464;
        }

        &--best {
          background-color: #e9e9e9;
          color: black;
        }
      }
    }
  }
}

</style>
