<template>
  <v-container>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <auth-form
          title="Reset Password"
          button-text="Request reset token"
          :submit-form="resetPassword"
        />
      </v-col>
    </v-row>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4" class="text-center">
        Got your token? <nuxt-link to="/auth/reset-password?token=">Set a new password</nuxt-link>
      </v-col>
    </v-row>

    <v-row v-if="resetSend" justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <v-alert :type="resetStatus" text>Request was send. Check your mails for the instructions.</v-alert>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import AuthForm from "../../components/shared/AuthForm";
export default {
  name: 'request-password-reset',
  components: {
    AuthForm,
  },
  data() {
    return {
      resetSend: false,
      resetStatus: null,
    };
  },
  methods: {
    async resetPassword(resetInfo) {
      this.loading = true;
      try {
        const { data } = await this.$axios.post('/api/auth/reset-password-request', resetInfo);
        this.$ga.event('User Account', 'reset-request', 'Success', 1);
        console.info(`Send reset token`);
        this.resetStatus = 'success';
      } catch (e) {
        console.warn(e);
        this.resetStatus = 'error';
      }
      this.resetSend = true;
      this.loading = false;
    },
  }
}
</script>

<style scoped>

</style>
