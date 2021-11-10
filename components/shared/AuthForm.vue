<template>
  <v-card>
    <v-card-title class="justify-center">{{ title }}</v-card-title>
    <v-card-subtitle></v-card-subtitle>
    <v-card-text>

      <v-form v-model="valid">

        <v-row>

          <v-col v-if="showUsername" cols="12">
            <v-text-field
              v-model="userInfo.username"
              outlined dense
              label="Username"
              required
              persistent-hint hint="Displayed publicly"
              :rules="usernameRules"
            ></v-text-field>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="userInfo.email"
              outlined dense
              label="Email"
              :rules="emailRules"
              persistent-hint hint="Keept private, used for sign in"
              required
            ></v-text-field>
          </v-col>

          <v-col v-if="showPassword" cols="12">
            <v-text-field
              v-model="userInfo.password"
              required
              persistent-hint hint="Use only (at least 12) alphanumeric characters"
              outlined dense
              label="Password"
              :rules="passwordRules"
              :type="showPasswordPlain ? 'text' : 'password'"
              :append-icon="showPasswordPlain ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPasswordPlain = !showPasswordPlain"
            ></v-text-field>
          </v-col>

        </v-row>

      </v-form>

    </v-card-text>
    <v-card-actions>
      <v-btn
        block
        @click="submitForm(userInfo)"
        color="primary"
        :disabled="maintenance"
      >
        {{buttonText}}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'AuthForm',
  data() {
    return {
      maintenance: false,
      valid: undefined,
      userInfo: {
        username: undefined,
        email: undefined,
        password: undefined,
      },
      showPasswordPlain: false,
      usernameRules:  [
        v => !!v || 'Username is required',
        v => (v && v.length >= 3) || 'Name must be at least 3 characters',
      ],
      emailRules:  [
        v => !!v || 'E-mail is required',
        v => /.+@.+\..+/.test(v) || 'E-mail must be valid',
      ],
      passwordRules:  [
        v => !!v || 'Password is required',
        v => (v && v.length >= 8) || 'Password must be at least 8 characters',
      ],
    }
  },
  props: {
    title: {
      type: String,
      default: 'Sign in'
    },
    showUsername: {
      type: Boolean,
      default: false,
    },
    showPassword: {
      type: Boolean,
      default: false,
    },
    submitForm: {
      type: Function,
      default: () => {},
    },
    buttonText: {
      type: String,
      default: 'Sign in',
    },
  },
}
</script>

<style scoped>

</style>
