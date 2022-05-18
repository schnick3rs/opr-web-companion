<template>
  <div>
    <opr-breadcrumbs-row :items="breadcrumbItems" />

    <v-row v-show="false">
      <v-col :cols="1">
        <v-img :src="`/img/game-systems/${gameSystem.slug}-cover.jpg`" contain />
      </v-col>
      <v-col :cols="8" />
    </v-row>

    <v-row justify="space-between">
      <v-col>
        <v-tabs
          v-model="tab"
        >
          <v-tab
            v-for="item in tabs"
            :key="item.key"
            :disabled="item.disabled"
            exact
            nuxt
            :to="item.to"
          >
            {{ item.name }}
          </v-tab>
        </v-tabs>
      </v-col>
      <v-col style="text-align: end;" v-show="false">
        <v-btn
          :href="`/api/army-books/zip?gameSystemSlug=${gameSystem.slug}`"
          download
          @click="initDownload"
        >
          <v-icon left>
            mdi-folder-download
          </v-icon>
          Download all
        </v-btn>
      </v-col>
      <v-dialog
        v-model="downloadInProgress"
        persistent
        width="300"
      >
        <v-card
          color="primary"
          dark
        >
          <v-card-text>
            Preparing download ....
            <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-row>

    <nuxt-child />
  </div>
</template>

<script>
import OprBreadcrumbsRow from '@/components/shared/OprBreadcrumbsRow';

export default {
  name: 'GameSystemIndex',
  components: {
    OprBreadcrumbsRow,
  },
  async asyncData({ $axios, params }) {
    const { slug } = params;
    const gameSystemResponse = await $axios.get(`/api/game-systems/${slug}`);
    const gameSystem = gameSystemResponse.data;
    return {
      slug,
      gameSystem,
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        // {text: 'Game Systems', to: '/game-systems', exact: true},
        { text: gameSystem.fullname, to: `/game-systems/${gameSystem.slug}`, exact: false },
      ],
      tabs: [
        { key: 'opr', name: 'Army Books', to: `/game-systems/${gameSystem.slug}` },
        // { key: 'opr', name: 'Rules', disabled: true, },
        // { key: 'homebrew', name: 'Fan Army Books', disabled: false, to: `/army-books/${gameSystem.slug}/homebrew` },
      ],
    };
  },
  data() {
    return {
      tab: undefined,
      downloadInProgress: false,
      downloadTimeout: undefined,
      headers: [
        { text: 'Name', align: 'start', value: 'name' },
        { text: 'Published', align: 'left', value: 'isLive' },
        { text: 'Author', align: 'start', value: 'username' },
        { text: 'Last change', align: 'start', value: 'modifiedAt' },
        { text: '#Units', align: 'center', value: 'unitCount' },
        { text: 'Actions', align: 'center', value: 'actions' },
      ]
    };
  },
  head() {
    const title = `Browse ${this.gameSystem.fullname} Army Books`;
    const description = `Browser the v2.50 BETA army books for ${this.gameSystem.fullname}. Check the PDF view or build a list with the Army Forge.`;
    const image = `/img/game-systems/${this.gameSystem.slug}_twitter-banner-size.jpeg`;
    return {
      title,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', name: 'og:title', content: title },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'og:image', name: 'og:image', content: image },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: description },
        { hid: 'twitter:image', name: 'twitter:image', content: image },
      ],
    };
  },
  methods: {
    initDownload() {
      this.downloadInProgress = true;
      // Expiration could be anything... As long as we reset the value
      this.setCookie('downloadStarted', 0, 100);
      // Initiate the loop to check the cookie.
      setTimeout(() => { this.checkDownloadCookie(); }, 1000);
    },
    setCookie(name, value, expiracy) {
      const exdate = new Date();
      exdate.setTime(exdate.getTime() + expiracy * 1000);
      const cValue = escape(value) + ((expiracy == null) ? '' : '; expires=' + exdate.toUTCString());
      document.cookie = name + '=' + cValue + '; path=/';
    },
    getCookie(name) {
      let i;
      let x;
      let y;
      const ARRcookies = document.cookie.split(';');
      for (i = 0; i < ARRcookies.length; i++) {
        x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
        y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
        x = x.replace(/^\s+|\s+$/g, '');
        // eslint-disable-next-line eqeqeq
        if (x == name) {
          return y ? decodeURI(unescape(y.replace(/\+/g, ' '))) : y; // ;//unescape(decodeURI(y));
        }
      }
    },
    checkDownloadCookie() {
      // eslint-disable-next-line eqeqeq
      if (this.getCookie('downloadStarted') == 1) {
        // Expiration could be anything... As long as we reset the value
        this.setCookie('downloadStarted', 'false', 100);
        this.downloadInProgress = false;
      } else {
        // Re-run this function in 1 second.
        this.downloadTimeout = setTimeout(() => { this.checkDownloadCookie(); }, 1000);
      }
    }
  },
};
</script>
