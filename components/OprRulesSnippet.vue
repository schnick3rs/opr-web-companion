<template>
  <div>
    <p><strong>{{rule.label}}: </strong>{{rule.effect}}</p>
  </div>
</template>

<script>
export default {
  name: "OprRulesSnippet",
  props: {
    rule: Object,
  }
}
</script>

<style scoped>

</style>
