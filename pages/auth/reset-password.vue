<template>
  <v-container>

    <v-row justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <auth-form
          title="Reset Password"
          button-text="Set new password"
          show-password
          :submit-form="resetPassword"
        />
      </v-col>
    </v-row>

    <v-row v-if="submitDone" justify-sm="center" align-content="center">
      <v-col cols="12" :sm="8" :md="6" lg="4">
        <v-alert :type="submitStatus" text>Request was send. Check your mails for the instructions.</v-alert>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import AuthForm from "../../components/shared/AuthForm";

export default {
  name: 'reset-password',
  components: {
    AuthForm,
  },
  asyncData({ route }) {
    const { token } = route.query;
    return {
      token,
    }
  },
  data() {
    return {
      submitDone: false,
      submitStatus: null,
    };
  },
  methods: {
    async resetPassword(resetInfo) {
      this.loading = true;
      const resetInfoWithToken = {
        ...resetInfo,
        token: this.token,
      };
      try {
        const { data } = await this.$axios.post('/api/auth/reset-password', resetInfoWithToken);
        this.$ga.event('User Account', 'reset-request', 'Success', 1);
        this.submitStatus = 'success';
        this.$auth.loginWith('local', { data: resetInfo });
      } catch (e) {
        console.warn(e);
        this.submitStatus = 'error';
      }
      this.submitDone = true;
      this.loading = false;
    },
  }
}
</script>

<style scoped>

</style>
