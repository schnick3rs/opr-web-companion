<template>
  <v-container>

    <v-row>

      <v-col cols="12">
        <v-card>
          <v-card-title>{{ $auth.user.username }}</v-card-title>
          <p>{{ data }}</p>
        </v-card>
      </v-col>

    </v-row>

  </v-container>
</template>

<script>
export default {
  name: "account-patreon",
  middleware: "auth",
  async asyncData({ $axios }) {
    try {
    const { data } = await $axios.get('/api/account/patreon-refresh');
    return {
      data
    };
    }catch (e) {
      console.log(e);
      return {
        data: null
      }
    }
  }
}
</script>
