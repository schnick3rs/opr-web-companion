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

      <section
        class="intro__image-container"
        v-if="armyBook.coverImagePath || armyBook.official"
      >
        <v-img
          min-height="150"
          max-height="400"
          contain
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
        <div v-if="!armyBook.official"><strong>Created with:</strong> <a target="_blank" href="https://webapp.onepagerules.com/">OPR WebApp</a></div>
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
import { marked } from 'marked';
import OprPage from "@/components/shared/print/OprPage";
import OprArmyBookUnitPage from "@/components/shared/print/OprArmyBookUnitPage";

export default {
  name: 'OprArmyBook',
  components: {
    OprPage,
    OprArmyBookUnitPage,
  },
  props: {
    armyBook: Object,
    paperSize: {
      type: String,
      default: 'din-a4',
    },
  },
  data() {
    return {
      expand: false,
      eagerColumnWrap: false,
      showAllSpecialRules: false,
      showSpellsOnAllPages: false,
    };
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
      return marked.parse(text);
    },
    markdownInline(text = '') {
      return marked.parseInline(text, []);
    },
  },
}
</script>

<style scoped>

</style>
