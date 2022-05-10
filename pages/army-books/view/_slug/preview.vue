<template>
  <div v-if="armyBook" class="preview-wrapper" :class="{ 'preview-wrapper--xs' : $vuetify.breakpoint.xs }">
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
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>

        <nuxt-link to="/">
          <v-avatar tile size="32">
            <v-img src="/img/onepagerules_square.png" />
          </v-avatar>
        </nuxt-link>

        <span v-if="$vuetify.breakpoint.smAndUp" class="ml-4">{{ title }}</span>

        <v-spacer />

        <v-btn
          icon
          disabled
          @click="share()"
        >
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>

        <v-btn
          icon
          :href="`${armyBook.armyForgeUrl}&gameSystem=${armyBook.aberration.toLowerCase()}`"
        >
          <v-icon>$forge</v-icon>
        </v-btn>

        <v-btn
          icon
          :href="`/api/army-books/${armyBook.uid}~${armyBook.gameSystemId}/pdf`"
          download
          style="padding-top: 3px"
        >
          <v-icon>mdi-download</v-icon>
        </v-btn>

        <v-menu
          v-if="$vuetify.breakpoint.smAndUp"
          v-model="menu"
          :close-on-content-click="false"
          :nudge-width="200"
          offset-x
        >
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-printer</v-icon>
            </v-btn>
          </template>
          <v-card class="d-print-none">
            <v-list>
              <v-list-item>
                <v-radio-group
                  v-model="paperSize"
                  row
                >
                  <v-radio label="A4" value="din-a4" />
                  <v-radio label="Letter" value="letter-us" />
                </v-radio-group>
              </v-list-item>
              <v-list-item>
                <v-checkbox
                  v-model="eagerColumnWrap"
                  label="force column wrap"
                  persistent-hint
                  hint="force wrap on special rules section"
                />
              </v-list-item>
            </v-list>
            <v-divider />
            <v-card-actions>
              <v-spacer />

              <v-btn
                text
                @click="menu = false"
              >
                Cancel
              </v-btn>
              <v-btn
                color="primary"
                text
                @click="print()"
              >
                Print
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-container>
    </v-app-bar>
    <v-main
      v-if="$vuetify.breakpoint.smAndUp"
      class="preview"
    >
      <opr-army-book
        :army-book="armyBook"
        :paper-size="paperSize"
      />
    </v-main>
    <iframe
      v-else
      :src="`/army-books/view/${armyBook.uid}~${armyBook.gameSystemId}/print`"
      class="iframe"
    />
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
    let factionBooks = [];
    try {
      const { data: armyBook } = await $axios.get(`/api/army-books/${armyBookId}`);
      if (armyBook.factionName) {
        const { data } = await $axios.get(`/api/army-books/?gameSystemSlug=${armyBook.gameSystemSlug}&factionName=${armyBook.factionName}`);
        factionBooks = data;
      }
      return {
        armyBookId,
        armyBook,
        factionBooks,
      };
    } catch (e) {
      // const { status, data } = e.response;
      error({ statusCode: 404, message: 'Army Book not found.' });
    }
  },
  data() {
    return {
      menu: false,
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
      this.menu = false;
      window.print();
    },
    share() {
      navigator.share({
        url: `/api/army-books/${this.armyBook.uid}~${this.armyBook.gameSystemId}/preview`,
        title: this.title,
        text: this.armyBook.hint,
        files: [],
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.preview {
  margin: auto;
  background-color: black;

  @media print {
    margin: unset;
    padding: 0 !important;
    background-color: unset;
  }

}

.preview-wrapper {
  margin: auto;

  @media print {
    margin: unset;
  }

  &--xs {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
  }

  .iframe {
    flex-grow: 1;
    border: none;
    margin: 0;
    padding: 48px 0 0 0;
  }
}
</style>
