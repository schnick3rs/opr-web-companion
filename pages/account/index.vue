<template>
  <v-container>
    <opr-breadcrumbs-row :items="breadcrumbItems" />

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>{{ $auth.user.username }}</v-card-title>
          <v-card-subtitle>Registered user since <span>{{ new Date(createdAt).toLocaleDateString() }}</span></v-card-subtitle>
          <v-card-text />
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="8">
        <v-text-field
          v-model="username"
          label="Username"
          dense
          outlined
        />
      </v-col>
      <v-col cols="8">
        <v-text-field
          v-model="email"
          label="Email"
          dense
          outlined
          disabled
        />
      </v-col>
      <v-col cols="8">
        <v-alert
          :color="$auth.user.patreon ? 'success' : 'info'"
          :icon="$auth.user.patreon ? 'mdi-power-plug' : 'mdi-power-plug-off'"
          prominent
          text
        >
          <a
            :href="$auth.user.patreon ? '' : patreonConnectUrl"
          >
            {{ $auth.user.patreon ? 'Connected with patreon' : 'Connect with Patreon' }}
          </a>
        </v-alert>
        <div>
          We request the following access when connecting to patreon:
          <v-checkbox input-value="true" disabled label="pledges" hint="to confirm sufficient pledge level with OPR" persistent-hint />
          <v-checkbox input-value="true" disabled label="email address" hint="to confirm your WebApp email matches your Patreon email" persistent-hint />
          <v-checkbox label="public profile" hint="(optional) to access your thumbnail" persistent-hint />
        </div>
      </v-col>
    </v-row>

    {{ $auth.user }}
  </v-container>
</template>

<script>
import OprBreadcrumbsRow from '../../components/shared/OprBreadcrumbsRow';
export default {
  name: 'AccountIndex',
  components: { OprBreadcrumbsRow },
  middleware: 'auth',
  async asyncData({ $axios }) {
    const { data } = await $axios.get('/api/auth/user');
    const { username, email, createdAt } = data.user;
    return {
      username,
      email,
      createdAt,
    };
  },
  data() {
    return {
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'Account', to: '/account', exact: true },
      ],
    };
  },
  head() {
    return {
      title: 'My Account',
    };
  },
  computed: {
    patreonConnectUrl() {
      const url = new URL('https://www.patreon.com/oauth2/authorize');
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('client_id', this.$config.patreonClientId);
      url.searchParams.append('redirect_uri', `${this.$config.patreonRedirectBase}/api/account/patreon`);
      url.searchParams.append('scope', 'identity identity.memberships identity[email]');
      return url;
    }
  }
};
</script>

<style scoped>

</style>
