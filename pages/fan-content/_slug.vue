<template>
  <div>
    <template v-for="(page, index) in ruleBook.pages">
      <opr-page
        :universe="ruleBook.flavour"
        :page-number="`${index+1}`"
      >
        <template v-slot:headline>
          <div>
            <strong>{{ page.fields.headline }}</strong>
            <strong class="page-headline__version" v-if="page.fields.headlineSufix">
              {{ page.fields.headlineSufix }}
            </strong>
          </div>
        </template>
        <div
          class="page__content"
          :class="`page__content--${ruleBook.flavour} columns-${page.fields.columns}`"
          v-html="parse(page.fields.pageText)"
        ></div>
      </opr-page>
    </template>
  </div>
</template>

<script>
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import OprPage from '~/components/shared/print/OprPage';
import { marked } from 'marked';

const renderEmbeddedNode = (node) => {
  switch (node.data.target.sys.contentType.sys.id) {

    case 'oprSpecialRuleSnippet':
      const { name, description, hasRating } = node.data.target.fields;
      return `<p><strong>${name}${hasRating ? '(X)' : ''}: </strong>${description}</p>`;

    case 'oprMarkdownSnippet':
      const { markdownText } = node.data.target.fields;
      return marked.parse(markdownText || '');

  }
  return '';
}

export default {
  name: 'rules',
  components: {OprPage},
  layout: 'print',
  async asyncData({ $axios, params }) {
    const { slug } = params;
    const ruleBookResponse = await $axios.get(`/api/content/rule-books/${slug}`);
    const ruleBook = ruleBookResponse.data;
    return {
      slug,
      ruleBook,
    }
  },
  head() {
    //.toLowerCase().replace(/\W/gm, '-');
    const title = `${this.ruleBook.name}`;
    const description = this.ruleBook.name;

    return {
      title: title,
      titleTemplate: '%s',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', name: 'og:title', content: title },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: description },
      ],
    }
  },
  methods: {
    parse(document) {
      const options = {
        renderNode: {
          [BLOCKS.PARAGRAPH]: (node, next) => `<p>${next(node.content).replace(/\n/g, '<br/>')}</p>`,
          [BLOCKS.EMBEDDED_ENTRY]: (node) => `${renderEmbeddedNode(node)}`,
        }
      };
      return documentToHtmlString(document, options);
    },
  },
}
</script>


<style lang="scss">

$font-size-text-headline: 3.88056mm;
$font-size-text: 3.175mm;
$font-size-text--dense: 2.82mm;
$font-size-army-book-name: 7.76111mm;
$font-size-army-book-version-string: 3.88056mm;
$font-size-block-headline: 3.52778mm;

@font-face { font-family: 'WarfleetsTitle'; font-weight: normal; src: url('~static/fonts/TeutonFett.otf') format('opentype') }
@font-face { font-family: 'WarfleetsText'; font-weight: normal; src: url('~static/fonts/Optima.ttf') format('truetype') }
@font-face { font-family: 'WarfleetsText'; font-weight: bold; src: url('~static/fonts/Optima-Bold.ttf') format('truetype') }

.page-headline__version {
  text-transform: none;
  font-size: $font-size-army-book-version-string;
}

.page__content {

  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  flex: 1 1 auto;
  align-items: flex-start;
  align-content: flex-start;
  height: 268mm;
  font-size: $font-size-text;
  line-height: 1.35;
  color: rgba(0,0,0,1);

  &--warfleets-ftl {
    line-height: 1.30;
  }

  & > hr {
    border: 0;
    flex-basis: 100% !important;
    width: 0 !important;
    padding: 0 !important;
    height: 0 !important;
  }

  & > * {
    align-self: flex-start;
    padding-right: 6mm;
    margin-bottom: 2.11mm;
  }

  & table {
    border: none;
    border-collapse: collapse;
    width: 100% !important;
  }

  & table tr > * {
    padding-left: 1mm;
    &:first-child {
      padding-left: 2mm;
    }
  }

  & table tr > *:last-child {
    padding-right: 2mm;
  }

  & table thead th:first-child {
    text-align: left;
  }

  & table tbody tr:nth-child(odd) {
    background-color: lightgrey;
  }

  &.columns-2 {
    & > * {
      width: calc(100% / 2);
    }
  }

  &.columns-3 {
    & > * {
      width: calc(100% / 3);
    }
  }

  & > h2, h3, h4, h5, h6 {
    -webkit-column-break-after: avoid;
    margin-bottom: 4px;
    font-size: $font-size-text-headline;
  }

  & > table, p, ul, ol {
    -webkit-column-break-inside: avoid;
    margin-bottom: 2.11mm;
  }

  & > ul, ol {
    -webkit-column-break-before: avoid;
    margin-left: 0;
  }

  & li > p {
    margin-bottom: 0;
  }
  & > hr {
    -webkit-column-break-after: always;
  }

}


@media print {
  .v-toolbar {
    display: none;
  }
}

</style>
