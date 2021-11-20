<template>
  <div>

    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange lighten-2"
        ></v-progress-circular>
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-title>
        <input v-model="upgradePackageHint" class="input">
        <v-spacer></v-spacer>
        <v-btn
          v-if="showPointCalcOptions"
          @click="estimateAllUpgradeOptionCosts()"
          color="primary" small outlined class="mr-1"
        >
          <v-icon left>mdi-auto-fix</v-icon> recalculate
        </v-btn>
        <v-btn
          @click="savePackage()"
          color="primary" small outlined
        >
          <v-icon left>mdi-content-save</v-icon> save
        </v-btn>
      </v-card-title>

      <v-card-subtitle class="mt-2">
        Upgrade packaged available for the following units:
        <v-chip-group column>
          <v-chip
            v-for="unity in unitsUtilizingUpgradePackage"
            :key="unity.name"
            label small close
            @click:close="removeUpgradePackageFromUnit(unity)"
          >
            {{unity.name}}
          </v-chip>
          <v-menu bottom offset-y v-if="unitsNotUtilizingPackage.length > 0">
            <template v-slot:activator="{ on, attrs }">
              <v-chip
                v-bind="attrs" v-on="on"
                class="mr-2"
                small label outlined
                color="success"
              >
                ADD UNIT
              </v-chip>
            </template>
            <v-list dense>
              <v-list-item
                v-for="(unit) in unitsNotUtilizingPackage" :key="unit.id"
                @click="addUpgradePackageToUnit(unit)"
              >
                <v-list-item-title >{{ unit.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-chip-group>
      </v-card-subtitle>

      <v-divider></v-divider>

      <template v-for="(section, sectionIndex) in upgradePackage.sections">
        <opr-army-book-upgrade-section-card-text
          :key="`${sectionIndex}-${section.label}`"
          :army-book-id="armyBookId"
          :upgrade-package-id="upgradePackageId"
          :upgrade-package-section-count="upgradePackage.sections.length"
          :section-index="sectionIndex"
        ></opr-army-book-upgrade-section-card-text>
        <v-divider></v-divider>
      </template>

      <v-card-actions class="justify-center">
        <v-btn
          text
          color="success"
          @click="openUpgradeSectionDialog"
        >
          <v-icon left>mdi-bookmark-plus-outline</v-icon>
          Add upgrade section...
        </v-btn>
        <v-dialog
          v-model="showUpgradeSectionDialog"
          width="600px"
          scrollable
          :fullscreen="$vuetify.breakpoint.xsOnly"
        >
          <opr-dialog
            title="Add upgrade section"
            apply-label="save"
            @close="showUpgradeSectionDialog = false"
            @apply="addUpgradeSection()"
          >
            <v-card-text>
              <v-row>
                <v-col :cols="12">
                  <v-text-field
                    v-model="upgradeSectionEditor.label"
                    label="Label"
                    :rules="[rules.required]"
                    outlined dense autofocus
                    persistent-hint hint="Write a valid string..."
                    @keypress.enter="addUpgradeSection()"
                  ></v-text-field>
                </v-col>
                <v-col :cols="12">
                  <p>Examples:</p>
                  <ul>
                    <li>Replace [any|number] [Equipment|s]</li>
                    <li>Take [number] [Equipment] Attachment</li>
                    <li>Upgrade with [any|number]</li>
                    <li>Upgrade [any|number] model with [any|number]</li>
                  </ul>
                </v-col>
              </v-row>
            </v-card-text>
          </opr-dialog>
        </v-dialog>
      </v-card-actions>

      <v-card-text v-if="false">
        <opa-army-book-upgrade-section-builder
          :army-book-id="armyBookId"
          :upgrade-package-id="upgradePackageId"
        ></opa-army-book-upgrade-section-builder>
      </v-card-text>

      <template v-if="isAdmin">
        <v-divider></v-divider>
        <v-card-text style="overflow: auto"><pre>{{upgradePackage}}</pre></v-card-text>
      </template>

    </v-card>

  </div>
</template>

<script>
import OprDialog from "~/components/shared/OprDialog";
import OprArmyBookUpgradeSectionCardText from "./OprArmyBookUpgradeSectionCardText";
import OpaArmyBookUpgradeSectionBuilder from "./OprArmyBookUpgradeSectionBuilder";
import OprUtils from "~/mixins/OprUtils";
import { ArmyBook } from 'opr-army-book-helper';

export default {
  name: 'OprArmyBookUpgradePackageEditor',
  components: {
    OpaArmyBookUpgradeSectionBuilder,
    OprArmyBookUpgradeSectionCardText,
    OprDialog,
  },
  mixins: [ OprUtils ],
  props: {
    armyBookId: String,
    upgradePackageId: String,
  },
  data() {
    return {
      showAddWeaponDialog: false,
      weaponEditor: {
        name: 'Eel Cannon',
        range: 0,
        attacks: 1,
        specialRules: [],
        specialRuleRating: undefined,
      },
      // Upgrade SECTION
      showUpgradeSectionDialog: false,
      upgradeSectionEditor: {
        label: '',
      },
      rules: {
        required: value => !!value || 'Required.',
        positive: value => parseInt(value) > 0 || '> 0',
        weapon: value => ArmyBook.Weapon.Is(value) || 'Incorrect format.',
        rule: value => ArmyBook.Rule.Is(value) || 'Incorrect format.',
      },
    };
  },
  computed: {
    loading() {
      return !(this.armyBook && this.upgradePackageId);
    },
    elevation() {
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    isAdmin() {
      return this.$store.state.auth?.user?.isAdmin;
    },
    hasPointCalcRights() {
      return this.isAdmin;
    },
    showPointCalcOptions() {
      return this.$config.oprPointCalculatorEnabled && this.hasPointCalcRights;
    },
    armyBook() {
      return this.$store.getters['armyBooks/armyBook'](this.armyBookId);
    },
    armyBookGameSystemSlug() {
      return this.$store.getters['armyBooks/armyBookGameSystemSlug'](this.armyBookId);
    },
    upgradePackage() {
      return this.$store.getters['armyBooks/upgradePackage'](this.armyBookId, this.upgradePackageId);
    },
    units() {
      return this.$store.getters['armyBooks/units'](this.armyBookId);
    },
    unitsUtilizingUpgradePackage() {
      if (this.units) {
        return this.units.filter(unit => unit.upgrades.includes(this.upgradePackageId));
      }
      return [];
    },
    unitsNotUtilizingPackage() {
      if (this.units && this.unitsUtilizingUpgradePackage) {
        const unitIds = this.unitsUtilizingUpgradePackage.map(u => u.id);
        return this.units.filter(u => !unitIds.includes(u.id));
      }
      return [];
    },
    armyBookSpecialRules() {
      return this.$store.getters['armyBooks/specialRules'](this.armyBookId);
    },
    combinedSpecialRules() {
      let rules = [];
      if (this.commonSpecialRules) {
        rules = [ ...this.commonSpecialRules ];
      }
      if (this.armyBookSpecialRules) {
        rules = [ ...rules, ...this.armyBookSpecialRules ];
      }
      return rules;
    },
    unitSpecialRules() {
      return this.combinedSpecialRules.filter((rule) => rule.forUnit);
    },
    weaponSpecialRulesOptions() {
      return this.combinedSpecialRules.filter((rule) => rule.forWeapon);
    },
    upgradePackageHint: {
      get() {
        return this.upgradePackage.hint;
      },
      set(hint) {
        const armyBookUid = this.armyBookId;
        const upgradePackageUid = this.upgradePackageId;
        this.$store.commit('armyBooks/patchUpgradePackageHint', { armyBookUid, upgradePackageUid, hint });
        this.saveDebounced();
      },
    },
  },
  watch: {
    armyBook: {
      handler(newValue) {
        if (newValue) {
          this.loadArmyBookAndAssets(newValue);
        }
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  methods: {
    async loadArmyBookAndAssets() {
      const { data } = await this.$axios.get(`/api/content/game-systems/${this.armyBookGameSystemSlug}/special-rules`);
      this.commonSpecialRules = data;
    },
    addUpgradePackageToUnit(unit) {
      const armyBookUid = this.armyBookId;
      const unitId = unit.id;
      const upgradePackageUid = this.upgradePackageId;
      this.$store.commit('armyBooks/unitAddUpgradePackage', { armyBookUid, unitId, upgradePackageUid });
      this.$store.dispatch('armyBooks/updateUnit',{ armyBookUid, unitId });
    },
    removeUpgradePackageFromUnit(unit) {
      const armyBookUid = this.armyBookId;
      const unitId = unit.id;
      const upgradePackageUid = this.upgradePackageId;
      this.$store.commit('armyBooks/unitRemoveUpgradePackage', { armyBookUid, unitId, upgradePackageUid });
      this.$store.dispatch('armyBooks/updateUnit',{ armyBookUid, unitId });
    },
    openUpgradeSectionDialog(){
      this.upgradeSectionEditor.label = '';
      this.showUpgradeSectionDialog = true;
    },
    saveDebounced(delay = 1000) {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => {this.savePackage()}, delay);
    },
    savePackage() {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);
    },
    addUpgradeSection() {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      let { label } = this.upgradeSectionEditor;
      if (label.endsWith(':')) {
        label = label.slice(0,-1).trim();
      }
      const section = ArmyBook.UpgradeSection.FromString(label);

      if (section && false) {
        // XXX we disable complex strings for now
        const commitLoad = { armyBookUid, upgradePackageUid, section };
        this.$store.commit('armyBooks/addUpgradePackageSection', commitLoad);
      } else {
        console.info(`No valid section string, use the string as fallback.`);
        const simpleSection = { label, options: [] };
        const commitLoad = { armyBookUid, upgradePackageUid, section: simpleSection };
        this.$store.commit('armyBooks/addUpgradePackageSection', commitLoad);
      }

      this.savePackage();

      this.upgradeSectionEditor.label = '';
      this.showUpgradeSectionDialog = false;
    },
    openAddWeaponDialog() {
      this.weaponEditor.name = 'Eel Rifle';
      this.weaponEditor.range = 24;
      this.weaponEditor.attacks = 1;
      this.weaponEditor.specialRules = [];
      this.weaponEditor.specialRule = undefined;
      this.weaponEditor.specialRuleRating = undefined;
      this.weaponEditor.cost = 0;
      this.showAddWeaponDialog = true;
    },
    /**
     * parses the input and adds it to the options gains
     */
    calculateUnitCost(unit) {
      const equipment = unit.equipment.map(e => {
        //const rules = e.specialRules.map(sr => this.parseSpecialRuleString(sr));
        let weapon = {
          range: e.range > 0 ? e.range : undefined,
          attacks: e.attacks,
          rules: e.specialRules.map(sr => sr.name),
        };
        e.specialRules.forEach(sr => {
          if (sr.rating) { weapon[sr.key] = sr.rating; }
        });
        return weapon;
      });
      let calculatableUnit = {
        name: unit.name,
        models: unit.size,
        quality: unit.quality,
        defense: unit.defense,
        rules: unit.specialRules.map(sr => sr.name),
        equipment,
      };
      unit.specialRules.forEach(sr => {
        if (sr.rating) {
          calculatableUnit[sr.key] = sr.rating;
        }
      })
      this.calculatedCost = this.$oprPointCalculator
        ? this.$oprPointCalculator.unitCost(calculatableUnit)
        : undefined;
      if (this.costMode === 'automatic') {
        unit.cost = Math.round(this.calculatedCost/5)*5;
      }
      return this.calculatedCost;
    },
    estimateAllUpgradeOptionCosts() {
      if (this.$oprPointCalculator) {
        const payload = { armyBookUid: this.armyBookId, upgradePackageUid: this.upgradePackageId };
        this.$store.dispatch('armyBooks/recalculateUpgradeCosts', payload);
        } else {
        console.info('Point Calculator Feature disabled.');
      }
    }
  },
  filters: {
    simpleWeaponString: function (weapon) {
      const perks = [];
      if (weapon.range > 0) {
        perks.push(`${weapon.range}"`);
      }
      perks.push(`A${weapon.attacks}`);
      if(weapon.specialRules.length > 0) {
        perks.push(weapon.specialRules);
      }
      return `${weapon.label} (${perks.join(', ')})`;
    },
    costString: (cost) => {
      if (cost === 0) return 'free';
      if (cost > 0) return `+${cost}pts`;
      if (cost < 0) return `${cost}pts`;
      return '?';
    },
  }
}

</script>

<style scoped lang="scss">
.alternating-grey {
  &:nth-child(odd) {
    background: lightgrey;
  }
}

.input:focus {
  border-color: blue;
}
</style>
