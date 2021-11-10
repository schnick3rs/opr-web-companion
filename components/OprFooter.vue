<template>
  <v-footer
    app
    absolute
    class="caption"
  >
    <span class="d-none d-sm-inline">
      <slot></slot> •&nbsp;
    </span>
    <span>Game Design <a href="https://www.patreon.com/onepagerules" title="Support OnePageRule on Patreon">Gaetano Ferrara</a></span>
    <span class="d-none d-sm-inline">&nbsp;• Code by schnick3rs</span>
    <v-spacer></v-spacer>
    <span><nuxt-link to="/about">About</nuxt-link></span>
    <span>&copy; {{ new Date().getFullYear() }}</span>
  </v-footer>
</template>

<script>
export default {
  name: "OprFooter",
}
</script>

<style scoped>

</style>
