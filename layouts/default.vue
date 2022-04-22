<template>
  <div>
    <v-app
      :style="{background: $vuetify.theme.themes[theme].background}"
    >
      <v-app-bar
        fixed
        app
        dark
        dense
      >
        <template v-slot:img="{ props }">
          <v-img
            v-bind="props"
            gradient="to top right, rgba(100,115,201,.7), rgba(25,32,72,.7)"
          ></v-img>
        </template>

        <v-container class="pa-0 fill-height" :class="{ 'pl-2 pr-2': this.$vuetify.breakpoint.mdAndUp }">

          <nuxt-link to="/">
            <v-avatar tile size="32">
              <v-img src="/img/onepagerules_square.png"></v-img>
            </v-avatar>
          </nuxt-link>

          <v-toolbar-title class="ml-4" v-if="$vuetify.breakpoint.smAndUp">WebApp</v-toolbar-title>

          <v-spacer />

          <v-btn icon href="https://army-forge.onepagerules.com/">
            <v-icon color="white">$forge</v-icon>
          </v-btn>

          <v-btn icon @click="toggleDarkTheme">
            <v-icon v-if="theme === 'dark'">mdi-white-balance-sunny</v-icon>
            <v-icon v-else>mdi-weather-night</v-icon>
          </v-btn>

          <template v-if="$auth.loggedIn">
            <v-menu
              bottom offset-y left
              :open-on-hover="$vuetify.breakpoint.mdAndUp"
            >
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  <v-avatar size="24"><v-icon>mdi-account</v-icon></v-avatar>
                  {{ $auth.user.username }}
                </div>
              </template>
              <v-list dense>
                <v-list-item nuxt to="/account">
                  <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
                  <v-list-item-title>Account</v-list-item-title>
                </v-list-item>
                <v-list-item @click="logout">
                  <v-list-item-icon><v-icon>mdi-logout</v-icon></v-list-item-icon>
                  <v-list-item-title>logout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <div v-else>
            <v-btn color="blue" small nuxt to="/auth/sign-in" :disabled="maintenance">
              sign in
            </v-btn>
            <v-btn v-if="false" color="blue" small nuxt to="/auth/create-account" :disabled="maintenance">
              register
            </v-btn>
          </div>

          <v-btn
            v-if="false"
            icon small
            @click.stop="drawer = !drawer"
          >
            <v-icon left>mdi-menu</v-icon>
          </v-btn>
        </v-container>

      </v-app-bar>

      <v-navigation-drawer
        v-if="false"
        v-model="drawer"
        fixed
        app
        right
      >
        <v-list dense nav>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <v-container>

          <v-alert type="warning" prominent outlined v-if="maintenance">
            <p>
              <strong>Maintenance</strong> <em>(April 2)</em>: Login and army book edit might experience some hiccups as the feature is merged into the main application. This process might take 1-2 days (April 4) to be completed. <strong>Once this is merged, this url will be gone and you can find all <a href="https://webapp.onepagerules.com/">here</a>.</strong>
            </p>
          </v-alert>

          <nuxt />

        </v-container>
      </v-main>

      <opr-footer>
        <span>OPR WebApp</span>
      </opr-footer>
    </v-app>
  </div>
</template>

<script>
import OprFooter from "@/components/OprFooter";
export default {
  components: {OprFooter},
  data () {
    return {
      maintenance: false,
      clipped: false,
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
      ],
      right: true,
      title: 'OnePageRules List Builder',
    }
  },
  computed:{
    prime() {
      return this.$route;
    },
    theme() {
      return this.$store.getters['settings/theme'];
    },
  },
  watch: {
    theme: {
      handler(newTheme, oldTheme) {
        console.info(`handle ${newTheme}`);
        this.$vuetify.theme.dark = newTheme !== 'light';
      },
      immediate: true, // make this watch function is called when component created
    }
  },
  methods: {
    async logout() {
      await this.$auth.logout();
    },
    toggleDarkTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      let theme = this.$vuetify.theme.dark ? 'dark' : 'light';
      this.$store.commit('settings/setTheme', theme);
      this.$ga.event('Settings', 'Change Theme', theme, 1);
    },
  },
}
</script>

<style lang="scss">

</style>
