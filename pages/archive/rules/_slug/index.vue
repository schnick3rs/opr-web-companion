<template>
  <v-container>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row justify="center">

      <v-col cols="3" v-show="$vuetify.breakpoint.smAndUp">
        <v-card outlined style="position: fixed;">
          <v-list-item
            v-for="(section, i) in toc" :key="i"
            @click="$vuetify.goTo(`#${kebab(section, true)}`)"
            dense
          >
            {{section}}
          </v-list-item>
        </v-card>
      </v-col>

      <v-col cols="12" :sm="9" :md="6">
        <h1>{{gameSystem.name}}</h1>
        <section v-for="(page, index) in ruleBook.pages">
          <h2
            v-if="index > 0 && !headingTypes.includes(page.fields.pageText.content[0].nodeType)"
            :id="`${kebab(page.fields.headline)}`"
          >{{page.fields.headline}}</h2>
          <div class="rules-page" v-html="parse(page.fields.pageText)"></div>
        </section>
        <div>
          <v-btn class="mb-4" block v-if="ruleBook" nuxt :to="`/rules/${slug}/print`">
            <v-icon left>mdi-printer</v-icon> print this PDF
          </v-btn>
          <v-btn class="mb-4" block v-if="gameSystem.originalPdfLink" :href="gameSystem.originalPdfLink">
            <v-icon left>mdi-pdf-box</v-icon> get the original PDF
          </v-btn>
          <v-btn class="mb-4" block v-if="gameSystem.portfolioLink" :href="gameSystem.portfolioLink">
            <v-icon left>mdi-web</v-icon> visit the game portfolio
          </v-btn>
          <v-btn class="mb-4" block href="https://www.patreon.com/onepagerules">
            <v-icon left>mdi-patreon</v-icon> check the authors patreon
          </v-btn>
        </div>
      </v-col>

      <v-col cols="3" v-show="$vuetify.breakpoint.lgAndUp">
        <v-card outlined style="position: fixed;">
          <v-img :src="`${this.gameSystem.cover.fields.file.url}?h=378`"></v-img>
        </v-card>
      </v-col>

    </v-row>

  </v-container>
</template>

<script>
import {BLOCKS} from "@contentful/rich-text-types";
import {documentToHtmlString} from "@contentful/rich-text-html-renderer";
import {marked} from "marked";

const renderEmbeddedNode = (node) => {
  switch (node.data.target.sys.contentType.sys.id) {

    case 'oprSpecialRuleSnippet':
      const { name, description, hasRating } = node.data.target.fields;
      return `<p><strong>${name}: </strong>${description}</p>`;

    case 'oprMarkdownSnippet':
      const { markdownText } = node.data.target.fields;
      return marked.parse(markdownText || '');
  }
  return '';
}

export default {
  name: 'index',
  async asyncData({ $axios, params }) {
    const { slug } = params;
    const gameSystemResponse = await $axios.get(`/api/content/game-systems/${slug}`);
    const gameSystem = gameSystemResponse.data;
    const ruleBookResponse = await $axios.get(`/api/content/game-systems/${slug}/rule-book`);
    const ruleBook = ruleBookResponse.data;
    return {
      slug,
      gameSystem,
      ruleBook,
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'Core Rules', to: '/rules', exact: true },
        { text: gameSystem.name, to: `/rules/${gameSystem.slug}`, exact: true },
      ],
    }
  },
  data() {
    return {
      headingTypes: [ BLOCKS.HEADING_2, BLOCKS.HEADING_3 ],
    };
  },
  head() {
    //.toLowerCase().replace(/\W/gm, '-');
    const title = `${this.ruleBook.name}`;
    const description = this.ruleBook.name;
    const image = `${this.gameSystem.cover.fields.file.url}`;

    return {
      title: title,
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
    }
  },
  computed: {
    /**
     * @see https://vinceparulan.com/blog/how-to-create-table-of-contents-from-contentful-s-rich-text-field/
     */
    toc() {
      if(this.ruleBook) {
        const toc = [];
        let pages = this.ruleBook.pages;
        pages.forEach((page, index) => {
          if (
            index > 0 &&
            !this.headingTypes.includes(page.fields.pageText.content[0].nodeType)
          ) {
            toc.push(page.fields.headline);
          }
          page.fields.pageText.content
            .filter(item => this.headingTypes.includes(item.nodeType))
            .forEach(heading => {
              heading.content.forEach(content => toc.push(content.value))
            });
        });
        return toc;
      }
      return undefined;
    }
  },
  methods: {
    parse(document) {
      const options = {
        renderNode: {
          [BLOCKS.HEADING_2]: (node, next) => `<h2 id="${this.kebab(next(node.content))}">${next(node.content)}</h2>`,
          [BLOCKS.HEADING_3]: (node, next) => `<h2 id="${this.kebab(next(node.content))}">${next(node.content)}</h2>`,
          [BLOCKS.PARAGRAPH]: (node, next) => `<p>${next(node.content).replace(/\n/g, '<br/>')}</p>`,
          [BLOCKS.EMBEDDED_ENTRY]: (node) => `${renderEmbeddedNode(node)}`,
        }
      }
      return documentToHtmlString(document, options);
    },
    kebab(text, escapeHtml = false) {
      if (escapeHtml) {
        return text.toLowerCase().replace(/&/gm, '&amp;').replace(/\W/gm, '-');
      }
      return text.toLowerCase().replace(/\W/gm, '-');
    },
  },
}
</script>


<style lang="scss">
.rules-page {

  & > h1, h2, h3, h4, h5, h6 {
    margin-bottom: 4px;
  }

  & > p, ul, ol {
    margin-bottom: 8px;
  }

  & li > p {
    margin-bottom: 0;
  }

  & > hr {
    display: none;
  }

  & table {
    border: none;
    border-collapse: collapse;
    width: 100%;
  }

  & table tr > *:first-child {
    padding-left: 16px;
  }

  & table tr > *:last-child {
    padding-right: 16px;
  }

  & table thead th:first-child {
    text-align: left;
  }

  & table tbody tr:nth-child(odd) {
    background-color: lightgrey;
  }
}
</style>
