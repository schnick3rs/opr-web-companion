<template>
  <v-app style="color: black; background: black;">
    <v-app-bar
      app
      dark
      dense
      class="d-print-none"
    >
      <v-container class="pa-0 fill-height" :class="{ 'pl-2 pr-2': $vuetify.breakpoint.mdAndUp }">
        <nuxt-link to="/">
          <v-avatar tile size="32">
            <v-img src="/img/onepagerules_square.png" />
          </v-avatar>
        </nuxt-link>
        <v-spacer />
      </v-container>
    </v-app-bar>
    <v-main class="preview">
      <nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      right: true,
    };
  },
  computed: {
  }
};
</script>

<style lang="scss" scoped>
.preview {
  margin: auto;
  background-color: black;

  @media print {
    margin: unset;
    padding: 0 !important;
  }

}
</style>
