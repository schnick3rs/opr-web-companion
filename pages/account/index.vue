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
        <v-card :disabled="loading">
          <v-card-title>Patreon</v-card-title>
          <v-card-subtitle>
            Patreon integration
            <v-chip v-if="$auth.user.patreon" x-small label color="success">
              Connected
            </v-chip>
          </v-card-subtitle>
          <v-card-text>
            <span class="text-subtitle-2">Permissions</span>
            <ul style="list-style: none; padding-left: 0;">
              <li v-for="(item, index) in scopes" :key="index">
                <v-icon v-if="$auth.user.patreon" color="success" class="mr-2">
                  mdi-checkbox-marked-circle-outline
                </v-icon>
                <v-icon v-else class="mr-2">
                  mdi-checkbox-blank-circle-outline
                </v-icon>
                {{ item }}
              </li>
            </ul>
          </v-card-text>
          <v-card-actions>
            <v-btn
              v-if="$auth.user.patreon"
              color="error"
              outlined
              block
              small
              :loading="loading"
              @click="deautherizePatreon"
            >
              Deautherize
            </v-btn>
            <v-btn
              v-else
              color="primary"
              outlined
              :href="patreonConnectUrl"
              small
              block
            >
              Connect with patreon
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div class="elevation-2">
      <pre>{{ $auth.user }}</pre>
    </div>
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
      scopes: [
        'Access your username, email and avatar',
        'Know your OPR Pledge level and subscription status',
      ],
      loading: false,
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
      const scope = [
        'identity',
        'identity[email]',
        /*
         * @see https://docs.patreon.com/#get-api-oauth2-v2-identity
         * "If you request memberships and DON’T have the identity.memberships scope, you will receive data about the user’s membership to your campaign. If you DO have the scope, you will receive data about all of the user’s memberships, to all the campaigns they’re members of."
         */
        // 'identity.memberships',
      ];
      url.searchParams.append('scope', scope.join(' '));
      return url.toString();
    }
  },
  methods: {
    async deautherizePatreon() {
      this.loading = true;
      await this.$axios.delete('/api/account/patreon');
      await this.$auth.fetchUser();
      this.loading = false;
    },
  },
};
</script>

<style scoped>

</style>
