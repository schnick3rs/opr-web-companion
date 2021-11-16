<template>
  <div v-if="armyBook">

    <opr-page
      :universe="armyBook.universe"
      :paper-size="paperSize"
      pageNumber="1"
    >

      <template v-slot:headline>
        <div>
          <strong>{{ armyBook.aberration }} - {{ armyBook.name }}</strong>
          <strong class="page-headline__version" v-if="armyBook.versionString">
            {{armyBook.versionString}}
          </strong>
        </div>
      </template>

      <section class="intro__image" v-if="armyBook.coverImagePath || armyBook.official">
        <v-img
          min-height="150"
          :src="armyBook.coverImagePath || introImageSrc"
        ></v-img>
      </section>

      <section class="intro__wrapper">

        <v-container style="padding: 2mm;">
          <v-row>
            <!-- Disclaimer -->
            <v-col cols="6">
              <h2 class="intro__headline">About OPR</h2>
              <div class="intro__text-html">
                <p>
                  OPR (<a href="https//www.onepagerules.com">www.onepagerules.com</a>) is the home of many free games which are designed to be fast to learn and easy to play.
                </p>
                <p>
                  This project was made by gamers for gamers and it can only exist thanks to the support of our awesome community.
                </p>
                <p>
                  If you’d like to support the continued development of our games you can donate on <a href="https://www.patreon.com/onepagerules">patreon.com/onepagerules</a>.
                </p>
              </div>
              <h2 class="intro__headline">Thank you for playing!</h2>
            </v-col>

            <!-- Background Story -->
            <v-col cols="6" v-if="armyBook.background">
              <h2 class="intro__headline">Background Story</h2>
              <div class="intro__text-html" v-html="markdown(armyBook.background)"></div>
            </v-col>

          </v-row>

        </v-container>
      </section>

      <div class="credits">
        <div><strong>Game Design:</strong> Gaetano Ferrara</div>
        <div><strong>Illustrations:</strong> Brandon Gillam</div>
        <div v-if="!armyBook.official"><strong>Army Book by:</strong> {{ armyBook.username }}</div>
        <div v-if="armyBook.coverImageCredit"><strong>Cover Image by:</strong> <span v-html="markdownInline(armyBook.coverImageCredit)"></span></div>
        <div v-if="!armyBook.official"><strong>Created with:</strong> <a target="_blank" href="https://opr-list-builder.herokuapp.com/">OPR Web Companion</a></div>
      </div>

      <div class="config d-print-none">
        <v-expand-transition>
          <v-card v-show="expand">
            <v-card-subtitle>
              Page / print configurations
              <v-icon class="float-right" @click="expand = !expand">mdi-window-restore</v-icon>
            </v-card-subtitle>
            <v-card-text>
              <v-select
                v-model="paperSize"
                label="Paper Size"
                outlined dense
                :items="[{text: 'DIN A4', value: 'din-a4'},{text: 'Letter', value: 'letter-us'}]"
              ></v-select>
              <v-checkbox
                v-model="eagerColumnWrap"
                label="force column wrap"
                persistent-hint hint="force wrap on special rules section"
              ></v-checkbox>
              <v-checkbox
                v-if="false"
                v-model="showAllSpecialRules"
                label="print all army wide special rules"
                persistent-hint hint="[beta] disable to let the app decide which rules to print"
              ></v-checkbox>
              <v-checkbox
                v-if="false"
                v-model="showSpellsOnAllPages"
                label="print spells on each page"
                persistent-hint hint="[beta] disable to let the app decide when spells are to print"
              ></v-checkbox>
            </v-card-text>
          </v-card>
        </v-expand-transition>
        <v-btn
          class="ma-2"
          color="primary float-right"
          outlined
          small
          v-show="!expand"
          @click="expand = !expand"
        >
          <v-icon left small>mdi-window-restore</v-icon>
          open print config
        </v-btn>
      </div>


    </opr-page>

    <template v-for="(page, index) in unitPages">
      <opr-army-book-unit-page
        v-if="page.units.length > 0"
        :universe="armyBook.universe"
        :paper-size="paperSize"
        :headline="`${armyBook.aberration} - ${armyBook.name}`"
        :version-string="armyBook.versionString"
        :page-number="2+index"
        :units="page.units"
        :upgrade-packages="page.upgradePackages"
        :special-rules="page.specialRules"
        :spells="page.spells"
        :army-wide-rule="page.armyWideRule"
        :eager-column-wrap="eagerColumnWrap"
        :force-print-all-army-special-rules="showAllSpecialRules"
        :force-print-spells="showSpellsOnAllPages"
      ></opr-army-book-unit-page>
    </template>

  </div>
</template>

<script>
import marked from "marked";
import OprPage from "@/components/shared/print/OprPage";
import OprArmyBookUnitPage from "@/components/shared/print/OprArmyBookUnitPage";

export default {
  name: 'print',
  components: {
    OprPage,
    OprArmyBookUnitPage,
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
      const { status, data } = e.response;
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
    //.toLowerCase().replace(/\W/gm, '-');
    const title = `${this.armyBook.aberration} - ${this.armyBook.name} ${this.armyBook.versionString}`;
    const description = this.armyBook.hint;
    const slug = this.armyBook.name.toLowerCase().replace(/\W/gm, '-');

    const universeSlug = this.armyBook.universe.toLowerCase().replace(/\W/gm, '-');
    let image = this.armyBook.coverImagePath || `https://opr-list-builder.herokuapp.com/img/army-books-${this.universeSlug}-tile.jpg`;
    if (this.armyBook.official) {
      image = `https://opr-list-builder.herokuapp.com/img/army-books/${slug}.png`;
    }

    return {
      title: title,
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
    }
  },
  computed: {
    unitPages() {
      let pages = [];
      if (this.armyBook.units) {
        const { units, upgradePackages, specialRules, spells, armyWideRule } = this.armyBook;

        const splitPageNumbers = units
          .filter(unit => unit.splitPageNumber)
          .map(unit => parseInt(unit.splitPageNumber));
        const uniqueSplitPageNumbers = [...new Set(splitPageNumbers)];

        uniqueSplitPageNumbers.forEach(splitPageNumber => {
          const taggedUnits = units.filter(unit => unit.splitPageNumber && unit.splitPageNumber === splitPageNumber);

          const upgradePackagesIds = [];
          taggedUnits
            .filter(unit => unit.upgrades) // only units with upgrades
            .forEach(unit => upgradePackagesIds.push(...unit.upgrades));
          const uniqueUpgradePackagesIds = [...new Set(upgradePackagesIds)];
          const taggedUpgradePackages = upgradePackages.filter(upgradePackage => uniqueUpgradePackagesIds.includes(upgradePackage.uid) );

          const page = {
            splitPageNumber,
            units: taggedUnits,
            upgradePackages: taggedUpgradePackages,
            specialRules,
            spells,
            armyWideRule,
          };
          pages.push(page);
        });
        const taggedUnits = units.filter(unit => unit.splitPageNumber === undefined || unit.splitPageNumber === '' || unit.splitPageNumber === 0);
        if (taggedUnits) {
          const upgradePackagesIds = [];
          taggedUnits
            .filter(unit => unit.upgrades) // only units with upgrades
            .forEach(unit => upgradePackagesIds.push(...unit.upgrades));
          const uniqueUpgradePackagesIds = [...new Set(upgradePackagesIds)];
          const taggedUpgradePackages = upgradePackages.filter(upgradePackage => uniqueUpgradePackagesIds.includes(upgradePackage.uid) );
          const page = {
            units: taggedUnits,
            upgradePackages: taggedUpgradePackages,
            specialRules,
            spells,
            armyWideRule,
          };
          pages.push(page);
        }
      }
      return pages;
    },
    universeSlug() {
      return this?.armyBook.universe.toLowerCase().replace(/\W/gm, '-');
    },
    introImageSrc() {
      let slug = this.armyBook.name.toLowerCase().replace(/\W/gm, '-');
      if (this.armyBook.factionName) {
        slug = this.armyBook.factionName.toLowerCase().replace(/\W/gm, '-');
      }
      return `/img/army-books/${slug}.png`;
    },
  },
  methods: {
    markdown(text = '') {
      return marked(text);
    },
    markdownInline(text = '') {
      return marked.parseInline(text, []);
    },
  },
}
</script>

<style lang="scss">
.page .special-rules__rule > p { margin-bottom: 0; }
.page.page--grimdark-future .special-rules__rule > p > strong { font-weight: 500; }
</style>

<style scoped lang="scss">

$font-size-default-text: 2.82mm;
$font-size-army-book-name: 7.76111mm;
$font-size-army-book-version-string: 3.88056mm;
$font-size-intro-headline: 3.88056mm;
$font-size-intro-text: 3.175mm;

$font-size-block-headline: 3.52778mm;

@font-face {
  font-family: 'AgeOfFantasyTitle';
  font-weight: normal;
  src: url('~static/fonts/caslon-antique.regular.ttf')  format('truetype'),
  url('~static/fonts/caslon-antique.regular.woff2') format('woff2'),
  url('~static/fonts/caslon-antique.regular.woff') format('woff')
}

@font-face {
  font-family: 'AgeOfFantasyText';
  font-weight: normal;
  src: url('~static/fonts/BKANT.ttf')  format('truetype'),
  url('~static/fonts/BKANT.woff2') format('woff2'),
  url('~static/fonts/BKANT.woff') format('woff')
}


.page {
  //  page-break-inside: avoid;
  position: relative;
  line-height: 1.15;

  &--din-a4 {
    //height: 842.08pt;
    //width: 595.41pt;
    height: calc(297mm - 1mm);
    width: 210mm;
    overflow: hidden;
    //margin: 5mm 10mm;
    padding: 6mm 10mm;

    font-size: $font-size-default-text;
  }

  &--letter-us {
    //height: 842.08pt;
    //width: 595.41pt;
    height: calc(274mm - 1mm);
    width: 215mm;
    overflow: hidden;
    //margin: 5mm 10mm;
    padding: 6mm 10mm;

    font-size: $font-size-default-text;
  }

  &--grimdark-future {
    background-image: url('/img/army-books/border-grimdark-future.png');
    //background-size: auto;
    background-position: center;

    font-family: GrimdarkText, sans-serif;

    & .page-headline {
      font-family: GrimdarkTitle, sans-serif;
      margin-top: 5mm;
      margin-bottom: 2mm;
    }
  }

  .page--age-of-fantasy {
    background-image: url('/img/army-books/border-age-of-fantasy.png');
    //background-size: auto;
    background-position: center;

    font-family: AgeOfFantasyText, serif;

    & .page-headline {
      font-family: AgeOfFantasyTitle, serif;
      text-transform: uppercase;
      padding-top: 7mm;
      padding-bottom: 1mm;
      padding-left: 5mm;
    }
  }

}

.intro {
  &__image {
    width: 50%;
    margin: 0 auto;
    padding-top: 8mm;
    padding-bottom: 8mm;
  }

  &__headline {
    font-size: $font-size-intro-headline;
    font-weight: 500;
    margin-bottom: 2mm;
  }

  &__text-html {
    font-size: $font-size-intro-text;
    //font-weight: 600;
    & > h1, h2, h3, h4, h5, h6 {
      margin-bottom: 2mm;
    }
  }

  &__footer {
  }
}

.page-headline {
  font-size: $font-size-army-book-name;
  margin-left: 2mm;

  &__version {
    font-size: $font-size-army-book-version-string;
  }
}


.credits {
  position: absolute;
  left: 14mm;
  bottom: 18mm;
}

.config {
  position: absolute;
  right: 14mm;
  bottom: 18mm;
}


@page {
  //size: A4;
  margin: 0;
}

@media print {
  .page {
    margin: 0;
    border: initial;
    border-radius: initial;
    width: initial;
    min-height: initial;
    box-shadow: initial;
    //background: initial;
    page-break-after: always;
  }

  .unit-wrapper {

  }

  .unit__container {
    page-break-inside: avoid;
  }
}

@media screen {
  .page--din-a4 {
    border-style: dashed;
    border-width: 1px;
  }

  .page--letter-us {
    border-style: dashed;
    border-width: 1px;
  }
}
.alternating-grey {
  &:nth-child(even) {
    background: lightgrey;
  }
}
</style>
