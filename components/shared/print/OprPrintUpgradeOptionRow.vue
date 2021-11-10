<template>
  <div class="upgrade-package__row upgrade-package__row--option alternating-grey">

    <span class="upgrade-package__option-label pl-1 pr-1">
      <template v-if="option.gains">
        <template v-for="(gain, index) in finalGains">
          <opr-print-glues :value="gain" :key="index" :is-last="index >= finalGains.length-1"></opr-print-glues>
        </template>
      </template>
      <template v-else>
        {{ option.label }}
      </template>
    </span>
    <span class="upgrade-package__option-cost pl-1 pr-1 text-center">
      {{ option.cost | costString }}
    </span>
  </div>
</template>

<script>
import OprPrintGlues from "@/components/shared/print/OprPrintGlues";

export default {
  name: 'OprPrintUpgradeOptionRow',
  components: {
    OprPrintGlues,
  },
  props: {
    option: Object,
  },
  computed: {
    finalGains() {
      const gains = this.option.gains;
      let finalGains = [];
      gains.forEach(gain => {
        if (finalGains.some(final => final.name === gain.name)) {
          const index = finalGains.findIndex(g => g.name === gain.name);
          finalGains[index] = { ...gain, amount: gain.amount || 2};
        } else {
          finalGains.push(gain);
        }
      });
      finalGains.sort((a, b) => (b.range || 0) - (a.range || 0));
      return finalGains;
    }
  },
  filters: {
    costString: (cost) => {
      if (cost === 0) return 'free';
      if (cost > 0) return `+${cost}pts`;
      if (cost < 0) return `${cost}pts`;
      return '?';
    },
  },
}
</script>

<style scoped lang="scss">
.glue {
  display: inline-block;
}

.upgrade-package {

  padding-top: 4px;
  padding-bottom: 4px;

  &__row {
    display: flex;
    flex-direction: row;
    &--option {

    }
  }
  &__option-label {
    flex: 1;
  }
  &__option-cost {
    width: 12mm;
  }
}
</style>
