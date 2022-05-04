<template>
  <div v-if="armyBook" class="preview-wrapper">
    <v-app-bar
      app
      dark
      dense
      class="d-print-none"
    >
      <v-container class="pa-0 fill-height" :class="{ 'pl-2 pr-2': $vuetify.breakpoint.mdAndUp }">

        <v-btn
          icon
          nuxt
          :to="`/game-systems/${armyBook.gameSystemSlug}`"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>

        <nuxt-link to="/">
          <v-avatar tile size="32">
            <v-img src="/img/onepagerules_square.png" />
          </v-avatar>

        </nuxt-link>

        <v-toolbar-title class="ml-4" v-if="$vuetify.breakpoint.smAndUp">{{ title }}</v-toolbar-title>

        <v-spacer />

        <v-btn
          icon
        >
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>

        <v-btn
          icon
          @click="print()"
        >
          <v-icon>mdi-printer</v-icon>
        </v-btn>

        <v-btn
          icon
          :href="`/api/army-books/${armyBook.uid}~${armyBook.gameSystemId}/pdf`"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>

      </v-container>
    </v-app-bar>
    <v-main class="preview">
      <opr-army-book :army-book="armyBook" />
    </v-main>
  </div>
</template>

<script>
import OprArmyBook from '@/components/shared/print/OprArmyBook';

export default {
  name: 'PrintPreview',
  components: {
    OprArmyBook,
  },
  layout: 'armyBookPrintPreview',
  async asyncData({ params, $axios, error }) {
    const { slug } = params;
    const armyBookId = slug;
    try {
      const { data: armyBook } = await $axios.get(`/api/army-books/${armyBookId}`);
      return {
        armyBookId,
        armyBook,
      };
    } catch (e) {
      // const { status, data } = e.response;
      error({ statusCode: 404, message: 'Army Book not found.' });
    }
  },
  data() {
    return {
      expand: false,
      paperSize: 'din-a4',
      eagerColumnWrap: false,
      showAllSpecialRules: false,
      showSpellsOnAllPages: false,
    };
  },
  head() {
    // .toLowerCase().replace(/\W/gm, '-');
    const title = `${this.armyBook.aberration} - ${this.armyBook.name} ${this.armyBook.versionString}`;
    const description = this.armyBook.hint;
    const slug = this.armyBook.name.toLowerCase().replace(/\W/gm, '-');

    this.$emit('set-title', title);
    // const universeSlug = this.armyBook.universe.toLowerCase().replace(/\W/gm, '-');
    let image = `https://webapp.onepagerules.com/img/army-books-${this.universeSlug}-tile.jpg`;
    if (this.armyBook.coverImagePath) {
      image = this.armyBook.coverImagePath;
    } else if (this.armyBook.official) {
      image = `https://webapp.onepagerules.com/img/army-books/${slug}.png`;
    }

    return {
      title,
      titleTemplate: '%s',
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
  computed: {
    title() {
      return `${this.armyBook.aberration} - ${this.armyBook.name} ${this.armyBook.versionString}`;
    }
  },
  methods: {
    print() {
      window.print();
    }
  }
};
</script>

<style lang="scss" scoped>
.preview {
  margin: auto;
  background-color: black;

  @media print {
    margin: unset;
    padding: 0 !important;
  }

}

.preview-wrapper {
  margin: auto;

  @media print {
    margin: unset;
  }

}
</style>
