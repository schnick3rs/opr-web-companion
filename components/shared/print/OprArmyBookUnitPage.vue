<template>
  <opr-page
    :universe="universe"
    :page-number="pageNumber"
    :paper-size="paperSize"
  >

    <template v-slot:headline>
      <div>
        <strong>{{ headline }}</strong>
        <strong class="page-headline__version" v-if="versionString">
            {{versionString}}
          </strong>
      </div>
    </template>

    <section
      v-if="units"
      class="unit-wrapper"
      ref="unitsContainer"
      id="units-container"
    >

      <table class="unit__table">
        <thead>
        <tr>
          <th class="unit__header-cell text-left">Name [size]</th>
          <th class="unit__header-cell text-center">Qua</th>
          <th class="unit__header-cell text-center">Def</th>
          <th class="unit__header-cell text-left">Equipment</th>
          <th class="unit__header-cell text-left">Special Rules</th>
          <th class="unit__header-cell text-center">Upgrades</th>
          <th class="unit__header-cell text-center">Cost</th>
        </tr>
        </thead>
        <tbody>
        <template v-for="unit in units" class="unit__row">
          <opr-print-unit-row
            :unit="unit"
            :sorted-upgrade-packages="sortedUpgradePackages"
          />
        </template>
        </tbody>
      </table>

    </section>

    <section class="upgrade-wrapper">
      <v-container class="pa-0">
        <v-row dense class="upgrade-columns" :style="upgradesContainerHeightMm">

          <div class="column-item upgrade-package"
               v-if="sortedUpgradePackages"
               v-for="upgradePackage in sortedUpgradePackages" :key="upgradePackage.uid"
          >
            <div v-for="(upgrade, index) in upgradePackage.sections">
              <div
                  class="upgrade-package__headline-row font-weight-medium text-center"
                  :class="{ 'alternating-grey': index !== 0 }"
              >
                  <span v-if="index === 0" class="upgrade-package__headline-row-letter text-left">
                    {{upgradePackage.letter}}
                  </span>
                <span class="upgrade-package__headline-row-label font-italic">{{upgrade.label}}:</span>
              </div>
              <template v-for="(option) in upgrade.options">
                <opr-print-upgrade-option-row :option="option" />
              </template>
            </div>
          </div>

          <div class="column-item" v-if="armyWideRule && armyWideRule.headline">
            <h3 style="text-align: center;border-bottom: 1px solid;">{{ armyWideRule.headline }}</h3>
            <div v-html="markdown(armyWideRule.text)"></div>

            <div v-for="(upgrade, index) in armyWideRule.sections">
              <div
                  class="upgrade-package__headline-row font-weight-medium text-center"
                  :class="{ 'alternating-grey': index !== 0 }"
                  style="position:relative;"
              >
                <span class="font-italic">{{upgrade.label}}:</span>
              </div>
              <template v-for="(option) in upgrade.options">
                <opr-print-upgrade-option-row :option="option" />
              </template>
            </div>
          </div>

          <template v-if="sortedSpecialRules.length > 0">
            <div class="column-item column-item--first column-item--last" v-if="eagerColumnWrap === false">
              <div class="special-rules__headline">Special Rules</div>
              <div>
                <div
                  v-for="rule in sortedSpecialRules"
                  class="special-rules__rule"
                  v-html="markdown(`**${rule.name}${rule.hasRating?'(X)':''}:** ${rule.description}`)"
                ></div>
              </div>
            </div>
            <template v-else>
              <div
                class="column-item"
                v-for="(rule, index) in sortedSpecialRules"
                :class="{
                  'column-item--first': index === 0,
                  'column-item--last': index === sortedSpecialRules.length-1,
                 }"
              >
                <div v-if="index === 0" class="special-rules__headline">Special Rules</div>
                <div
                  class="special-rules__rule"
                  v-html="markdown(`**${rule.name}${rule.hasRating?'(X)':''}:** ${rule.description}`)"
                ></div>
              </div>
            </template>
          </template>

          <div class="column-item" v-if="showSpells">
            <div class="spell-book__headline">Psychic Spells</div>
            <div class="spell-book__spells">
              <div
                v-for="spell in sortedSpells"
                class="spell-book__spell"
              >
                <strong class="spell-book__spell-name">{{ spell.name }} ({{ spell.threshold }}+):</strong>
                {{ spell.effect }}
              </div>
            </div>
          </div>

        </v-row>
      </v-container>
    </section>
  </opr-page>
</template>

<script>
import marked from "marked";
import OprPage from "@/components/shared/print/OprPage";
import OprPrintUpgradeOptionRow from "@/components/shared/print/OprPrintUpgradeOptionRow";
import OprUnitSpecialRulesString from "../OprUnitSpecialRulesString";
import OprPrintUnitRow from "./OprPrintUnitRow";
import { ArmyBook, ArmyBookHelper } from 'opr-army-book-helper';

export default {
  name: 'OprArmyBookUnitPage',
  components: {
    OprPrintUnitRow,
    OprPrintUpgradeOptionRow,
    OprUnitSpecialRulesString,
    OprPage,
  },
  props: {
    universe: String,
    headline: String,
    versionString: String,
    pageNumber: Number,
    units: Array,
    upgradePackages: Array,
    specialRules: Array,
    spells: Array,
    armyWideRule: Object,
    paperSize: {
      type: String,
      default: 'din-a4',
    },
    eagerColumnWrap: {
      type: Boolean,
      default: false,
    },
    forcePrintAllArmySpecialRules: {
      type: Boolean,
      default: false,
    },
    forcePrintSpells: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      unitsContainerHeight: undefined,
    };
  },
  computed: {
    upgradesContainerHeightMm() {
      if (this.unitsContainerHeight) {
        const height = this.paperSize === 'din-a4'  ? 296 : 274;
        return {
          // 296 (page height) -12 (padding) -(headline-padding) -(headline-font-size) - (units)
          height: `calc(${height}mm - 12mm - 8mm - 8mm - ${this.unitsContainerHeight} - 8mm)`,
        };
      }
      return {};
    },
    upgradePackagesIds() {
      const upgradePackagesIds = [];
      this.units
        .filter(unit => unit.upgrades) // only units with upgrades
        .forEach(unit => upgradePackagesIds.push(...unit.upgrades));
      const uniqueUpgradePackagesIds = [...new Set(upgradePackagesIds)];
      return uniqueUpgradePackagesIds;
    },
    sortedUpgradePackages() {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZαβγδϵζηθικλμνξοπρστυϕχψω'.split('');
      const upgradePackages = [];
      this.upgradePackagesIds.forEach(upgradePackageId => {
        const upgradePackage = this.upgradePackages.find(up => up.uid === upgradePackageId);
        if (upgradePackage) {
          const relettered = { ...upgradePackage, letter: letters[upgradePackages.length] };
          upgradePackages.push(relettered);
        } else {
          console.info(`no package found for ${upgradePackageId}`);
        }
      });
      return upgradePackages;
    },
    unitSpecialRules() {
      let unitSpecialRules = [];
      if (this.units) {
        this.units.forEach(u => {
          u.equipment.forEach(w => {
            w.specialRules.forEach(sr => {
              if (typeof sr === 'string') {
                const rule = ArmyBook.Rule.FromString(sr);
                if (rule) unitSpecialRules.push(rule);
              } else if (sr.type === 'ArmyBookRule') {
                unitSpecialRules.push(sr);
              } else if (sr.name && sr.rating) {
                const rule = ArmyBook.Rule.FromString(`${sr.name}(${sr.rating})`);
                if (rule) unitSpecialRules.push(rule);
              } else if (sr.name) {
                const rule = ArmyBook.Rule.FromString(sr.name);
                if (rule) unitSpecialRules.push(rule);
              } else {
                console.warn(`Could not handle units equipment rule ${sr}.`);
              }
            });
          });
          u.specialRules.forEach(sr => {
            if (typeof sr === 'string') {
              const rule = ArmyBook.Rule.FromString(sr);
              if (rule) unitSpecialRules.push(rule);
            } else if (sr.type === 'ArmyBookRule') {
              unitSpecialRules.push(sr);
            } else if (sr.name && sr.rating) {
              const rule = ArmyBook.Rule.FromString(`${sr.name}(${sr.rating})`);
              if (rule) unitSpecialRules.push(rule);
            } else if (sr.name) {
              const rule = ArmyBook.Rule.FromString(sr.name);
              if (rule) unitSpecialRules.push(rule);
            } else {
              console.warn(`Could not handle unit rule ${sr}.`);
            }
          });
        });
        // distinct
        unitSpecialRules = unitSpecialRules.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);
      }
      return unitSpecialRules;
    },
    upgradesSpecialRules() {
      let upgradesSpecialRules = [];
      if (this.sortedUpgradePackages) {
        upgradesSpecialRules = ArmyBookHelper.getAllSpecialRulesFromUpgradePackages(this.sortedUpgradePackages);
      }
      upgradesSpecialRules = upgradesSpecialRules.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);
      return upgradesSpecialRules;
    },
    usedOnPageSpecialRules() {
      let mergedRules = [];
      if (this.unitSpecialRules) mergedRules.push(...this.unitSpecialRules);
      if (this.upgradesSpecialRules) mergedRules.push(...this.upgradesSpecialRules);
      if (this.forcePrintAllArmySpecialRules) mergedRules.push(...this.specialRules);
      mergedRules = mergedRules.filter((thing, index, self) => self.findIndex(t => t.name === thing.name) === index);
      return mergedRules;
    },
    /**
     * we only want to display special rules that are used by units or upgrades
     */
    filteredSpecialRules() {
      let specialRules = [];
      if (this.specialRules && this.units && this.usedOnPageSpecialRules) {
        specialRules = [...this.specialRules];
        specialRules = specialRules.filter(sr => {
          return this.usedOnPageSpecialRules.some(unitRule => unitRule.name === sr.name);
        });
      }
      return specialRules;
    },
    containsSpellUsers() {
      if (this.usedOnPageSpecialRules) {
        return this.usedOnPageSpecialRules.some(pageSr => {
          return ['Wizard', 'Psychic'].includes(pageSr.name);
        });
      }
      return undefined;
    },
    showSpells() {
      return this.sortedSpells.length > 0 && (this.containsSpellUsers || this.forcePrintSpells);
    },
    sortedSpecialRules() {
      if (this.filteredSpecialRules) {
        return [...this.filteredSpecialRules].sort((a, b) => {
          if (a.name > b.name) return 1;
          if (a.name < b.name) return -1;
        });
      }
      return [];
    },
    sortedSpells() {
      if (this.spells) {
        return [...this.spells]
          .sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
          })
          .sort((a, b) => {
            return (a.threshold - b.threshold);
          });
      }
      return [];
    },
  },
  mounted() {
    this.setUnitsContainerHeight();
  },
  methods: {
    setUnitsContainerHeight() {
      this.unitsContainerHeight = (this.$refs.unitsContainer.clientHeight * 0.26) + 'mm';
    },
    equipmentString(item) {
      let itemString = item.label;
      let content = [];
      if (item.range > 0) {
        content.push(`${item.range}”`);
      }
      content.push(`A${item.attacks}`);
      item.specialRules.forEach((rule) => {
        content.push(rule);
      });
      return `${item.label} (${content.join(', ')})`;
    },
    computeUpgradeString(upgrades) {
      if ( upgrades.length <= 0 ) {
        return '-';
      }
      return upgrades
        .map(upgradeUid => {
          const upgradePackage = this.sortedUpgradePackages.find(up => up.uid === upgradeUid);
          return upgradePackage ? upgradePackage.letter : '?';
        })
        .filter(text => text !== '?')
        .join(', ');
      return '?';
    },
    markdown(text = '') {
      return marked(text);
    },
    markdownInline(text = '') {
      return marked.parseInline(text, []);
    },
  },
  filters: {
    costString: (cost) => {
      if (cost === 0) return 'free';
      if (cost > 0) return `+${cost}pts`;
      if (cost < 0) return `${cost}pts`;
      return '?';
    },
  },
}
</script>

<style scoped lang="scss">

$font-size-block-headline: 3.52778mm;

$font-size-army-book-name: 7.76111mm;
$font-size-army-book-version-string: 3.88056mm;

.alternating-grey {
  &:nth-child(even) {
    background: lightgrey;
  }
}

.page-headline {
  font-size: $font-size-army-book-name;
  margin-left: 2mm;

  &__version {
    font-size: $font-size-army-book-version-string;
  }
}

.page--age-of-fantasy {
  .unit {
    &__header-cell {
      font-weight: 700;
    }
  }
  .upgrade-package {
    &__headline-row {
      font-weight: 700 !important;
    }
  }
}

.unit {
  &__table {
    width: 100%;
    border: none;
    border-collapse: collapse;
  }

  &__row {
    &:nth-child(odd) {
      background-color: lightgrey;
    }
  }

  &__header-cell {
    padding: 0 1mm;
    font-weight: 500;

    &:first-child {
      padding-left: 1mm;
    }
    &:last-child {
      padding-right: 1mm;
    }
  }

  &__cell {

    padding: 0 1mm;

    &:first-child {
      padding-left: 1mm;
    }
    &:last-child {
      padding-right: 1mm;
    }
  }
}

.upgrade-wrapper {
  padding-top: 3mm;
}

.column-item {
  width: calc(100% / 3);
  flex-basis: 0 33%;
  align-self: flex-start;
  padding: 0 4px;

  &--first {
    padding-top: 4px;
  }
  &--last {
    padding-bottom: 4px;
  }
}

.upgrade-columns {
  flex-direction: column;
  //column-count: 3;
  height: 100%;
  align-items: flex-start;
  //width: 100%;
  align-content: flex-start;
}

.upgrade-package {

  padding-top: 4px;
  padding-bottom: 4px;

  &__headline-row {
    display: flex;
  }

  &__headline-row-letter {
    margin-left: 1mm;
    width: 3.5mm;
    display: inline;
    border-right: 0.3mm solid black;
  }

  &__headline-row-label {
    flex: auto;
  }

  &__row {
    display: flex;
    flex-direction: row;
    &--option {

    }
  }
  &__option-label {
    flex: 1;
  }
  &__option-cost {
    width: 12mm;
  }
}

.special-rules {
  &__headline {
    text-align: center;
    font-size: $font-size-block-headline;
    border-bottom: 0.2mm solid #333;
    font-weight: 500;
  }

  &__rule {
    padding: 0 1mm;

    & > {
      margin-bottom: 0;
    }

    & > :first-child {
      margin-bottom: 0;
    }

    & > :last-child {
      margin-bottom: 0;
    }
  }

}

.spell-book {

  &__headline {
    text-align: center;
    font-size: $font-size-block-headline;
    border-bottom: 1pt solid #333;
    font-weight: 500;
  }

  &__spell {

    padding: 0 1mm;

    &:nth-child(odd) {
      background-color: lightgrey;
    }
  }

  &__spell-name {
    font-weight: 500;
  }

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
</style>
