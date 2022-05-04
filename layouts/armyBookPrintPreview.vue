<template>
  <v-app style="color: black; background: black;">
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
</style>
