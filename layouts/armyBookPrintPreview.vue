<template>
  <v-app class="preview">
    <nuxt />
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      right: true,
      title: 'Unknown',
    };
  },
};
</script>

<style lang="scss" scoped>
.preview {
  color: black;
  background-color: black;

  @media print {
    background-color: transparent;
  }
}
</style>
