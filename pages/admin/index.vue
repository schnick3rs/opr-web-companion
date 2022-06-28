<template>
  <div>
    <v-row>
      <v-col cols="2">
        <v-btn
          nuxt
          to="/admin/rules"
          block
        >
          Rules
        </v-btn>
        <v-btn
          nuxt
          to="/admin/users"
          block
        >
          Users
        </v-btn>
      </v-col>
      <v-col>
        <nuxt-child />
      </v-col>
    </v-row>
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
