<template>
  <v-app style="color: black; background: white;">
    <nuxt />
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
      ],
      right: true,
      title: 'Warfleets: FTL'
    };
  },
  computed: {
    isFleetRoute() {
      return this.$route.params.id || null;
    },
    fleetRaw() {
      return this.isFleetRoute ? this.$store.getters['fleets/fleet'](this.$route.params.id) : null;
    },
    fleet() {
      if (this.fleetRaw) {
        return {
          ...this.fleetRaw,
          cost: this.$store.getters['fleets/cost'](this.fleetRaw.id),
        };
      } else {
        return undefined;
      }
    },
    prime() {
      return this.$route;
    },
    theme() {
      return (this.$vuetify.theme.dark) ? 'dark' : 'light';
    }
  }
};
</script>

<style lang="scss">

</style>
