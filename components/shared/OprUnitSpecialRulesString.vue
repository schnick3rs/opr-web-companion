<template>
  <span>{{ specialRulesString }}</span>
</template>

<script>
export default {
  name: 'OprUnitSpecialRulesString',
  props: {
    specialRules: Array,
  },
  computed: {
    specialRulesString() {
      if ( this.specialRules.length <= 0 ) {
        return '-';
      }
      return this.specialRules
        .sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
        }).map((r) => `${r.name}${r.rating ? '('+r.rating+')' : ''}`)
        .join(', ')
    },
  }
}
</script>

<style scoped>

</style>
