<template>
  <v-container>

    <v-row justify-sm="center" align-content="center">
      <v-dialog
        v-model="loading"
        persistent
        width="200"
      >
        <v-card>
          <v-card-title>Processing...</v-card-title>
          <v-card-text align="center">
            <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>

    <v-row justify-sm="center" align-content="center" v-if="false">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <auth-form
          title="Create Account"
          button-text="Create account"
          show-username
          show-password
          :submit-form="registerUser"
        />
      </v-col>
    </v-row>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <v-alert
          v-model="hasErrors"
          dense text outlined
          type="error"
          dismissible
        >
          {{message}}
        </v-alert>
      </v-col>
    </v-row>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4" class="text-center">
        Already have an account? <nuxt-link to="/auth/sign-in">Sign In</nuxt-link>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import AuthForm from "../../components/shared/AuthForm";
export default {
  name: 'create-account',
  components: {AuthForm},
  data: () => ({
    loading: false,
    hasErrors: false,
    message: undefined,
  }),
  methods: {
    async registerUser(registerInfo) {
      this.loading = true;
      this.hasErrors = false;
      try {
        const { data } = await this.$axios.post('/api/auth/user-account', registerInfo);
        this.$ga.event('User Account', 'create', 'Success', 1);
        this.$auth.loginWith('local', { data: registerInfo });
        this.loading = false;
      } catch (e) {
        this.$ga.event('User Account', 'create', 'Error', 1);
        const { status, data } = e.response;
        this.message = data.message;
        this.hasErrors = true;
        this.loading = false;
      }
    },
  }
}
</script>

<style scoped>

</style>
