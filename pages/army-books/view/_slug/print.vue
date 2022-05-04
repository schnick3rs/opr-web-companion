<template>
  <div v-if="armyBook">
    <opr-army-book :army-book="armyBook" />
  </div>
</template>

<script>
import OprArmyBook from '@/components/shared/print/OprArmyBook';

export default {
  name: 'PrintView',
  components: {
    OprArmyBook,
  },
  layout: 'print',
  async asyncData({ params, $axios, error }) {
    const { slug } = params;
    const armyBookId = slug;
    try {
      const { data } = await $axios.get(`/api/army-books/${armyBookId}`);
      return {
        armyBookId,
        armyBook: data,
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
};
</script>

<style lang="scss">
</style>
