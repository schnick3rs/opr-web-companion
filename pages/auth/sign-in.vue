<template>
  <v-container>

    <v-row justify-sm="center" align-content="center">
      <v-col>
        <v-alert
          icon="mdi-account-hard-hat"
          prominent
          text
          type="error"
        >
          Account creation and login is currently disabled.
        </v-alert>
      </v-col>
    </v-row>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <auth-form
          title="Sign In"
          button-text="Sign in"
          show-password
          :submit-form="loginUser"
        ></auth-form>
      </v-col>
    </v-row>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4" class="text-center">
        New to the OPR WebApp? <nuxt-link to="/auth/create-account">Create Account</nuxt-link>
      </v-col>
    </v-row>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4" class="text-center">
        Forgot your password? <nuxt-link to="/auth/request-password-reset">Request password reset</nuxt-link>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import AuthForm from "../../components/shared/AuthForm";
export default {
  name: 'sign-in',
  components: {
    AuthForm,
  },
  methods: {
    async loginUser(loginInfo) {
      this.loading = true;
      try {
        await this.$auth.loginWith('local', {data: loginInfo});
        console.info(this.$auth.user.name);
      } catch (e) {
        console.warn(e);
      }
      this.loading = false;
    },
  }
}
</script>

<style scoped>

</style>
