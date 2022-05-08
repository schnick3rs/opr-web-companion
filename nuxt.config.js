module.exports = {
  /*
  ** Nuxt rendering mode
  ** See https://nuxtjs.org/api/configuration-mode
  */
  // mode: 'spa',
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  // target: 'static',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    htmlAttrs: { lang: 'en' },
    titleTemplate: '%s | OPR WebApp',
    title: 'Home',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'theme-color', name: 'theme-color', content: '#00466e' },
      { hid: 'description', name: 'description', content: 'Browse & create Army Books for the main games an build lists for FTL, DoubleTab, ArmyManCombat or WarStuff.' },
      // Facebook Data
      { hid: 'og:title', name: 'og:title', content: 'Home | OPR WebApp' },
      { hid: 'og:description', name: 'og:description', content: 'Browse & create Army Books for the main games an build lists for FTL, DoubleTab, ArmyManCombat or WarStuff.' },
      // { hid: 'og:image', name: 'og:image', content: '/img/army-books-grimdark-future-tile.jpg' },
      // Twitter Card
      { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
      { hid: 'twitter:title', name: 'twitter:title', content: 'Home | OPR WebApp' },
      { hid: 'twitter:description', name: 'twitter:description', content: 'Browse & create Army Books for the main games an build lists for FTL, DoubleTab, ArmyManCombat or WarStuff.' },
      // { hid: 'twitter:image', name: 'twitter:image', content: '/img/army-books-grimdark-future-tile.jpg' },
      // { hid: 'twitter:image', name: 'twitter:image:alt', content: 'OPR WebApp' },
    ],
    link: [
      { rel: 'manifest', href: '/manifest.webmanifest' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'icon', type: 'image/x-icon', sizes: '16x16', href: '/favicon-16x16.png' },
      { rel: 'icon', type: 'image/x-icon', sizes: '32x32', href: '/favicon-32x32.png' },
      { rel: 'shortcut icon', type: 'image/x-icon', sizes: '192x192', href: '/android-icon-192x192.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-icon-180x180.png' },
    ],
  },
  /*
  ** Global CSS
  */
  css: [
  ],
  loading: {
    color: 'orange',
  },

  publicRuntimeConfig: {
    oprPointCalculatorEnabled: process.env.POINT_CALCULATOR_ENABLED || false,
    patreonClientId: process.env.PATREON_CLIENT_ID,
    patreonRedirectBase: process.env.PATREON_REDIRECT_BASE,
  },

  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    // { src: '~/plugins/vuex-persist', ssr: false },
    { src: '~/plugins/vue-draggable' },
    { src: '~/plugins/persistedState.client' },
    { src: '~/plugins/opr-point-calculator' },
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    ['@nuxtjs/google-analytics', { id: 'UA-178265978-1' }],
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/sitemap',
    '@nuxtjs/auth',
  ],
  auth: {
    redirect: {
      login: '/auth/sign-in',
    },
    strategies: {
      local: {
        endpoints: {
          login: { url: '/api/auth/login', method: 'post', propertyName: 'token' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get', propertyName: 'user' },
        },
      },
    },
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    // baseURL: process.env.BASE_URL || 'http://localhost:3000/api'
    browserBaseURL: '/',
  },
  pwa: {
    manifest: false,
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    optionsPath: './vuetify.options.js'
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    transpile: ['opr-army-book-helper', 'opr-data-service'],
  },

  serverMiddleware: [
    '~/api/express', // handles /api/** calls
  ],
};
