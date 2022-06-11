<template>
  <div>

    <v-btn
      nuxt
      to="/admin/rules"
    >
      Rules
    </v-btn>

    <v-btn
      nuxt
      to="/admin/users"
    >
      Users
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'AdminIndex',
  layout: 'admin',
};
</script>

<style scoped>

</style>
