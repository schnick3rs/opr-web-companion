<template>
  <div>
    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange ligthen-2"
        />
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-title>
        <v-text-field
          ref="entry"
          v-model="unit.name"
          label="Unit Name"
          outlined
          dense
          aria-required="true"
          hide-details
          :rules="[rules.required]"
          @input="updateName(unit.name)"
        />
        <v-spacer />
        <template v-if="hasSync">
          <v-tooltip left>
            <template #activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                class="mr-1"
                v-on="on"
                @mouseover="loadSyncInformation"
                @click="updateSync"
              >
                mdi-dna
              </v-icon>
            </template>
            <div v-if="syncInfo">
              <div><strong>Army Book:</strong> {{ syncInfo.name }}</div>
              <div><strong>Unit:</strong> {{ syncInfo.unit.name }}</div>
            </div>
            <v-progress-circular v-else indeterminate color="warning" />
          </v-tooltip>
        </template>
        <v-btn
          color="primary"
          :disabled="!unsavedChanges"
          small
          outlined
        >
          <v-icon v-if="saving" class="mdi-spin" left>
            mdi-loading
          </v-icon>
          <template>Save</template>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="6" :sm="3">
            <v-select
              v-model="unit.quality"
              outlined
              dense
              label="Quality"
              :items="qualityOptions"
              :readonly="!!unit.sync"
              :append-icon="unit.sync ? 'mdi-lock' : ''"
              @input="updateQuality(unit.quality)"
            />
          </v-col>
          <v-col cols="6" :sm="3">
            <v-select
              v-model="unit.defense"
              outlined
              dense
              label="Defense"
              :items="qualityOptions"
              :readonly="!!unit.sync"
              :append-icon="unit.sync ? 'mdi-lock' : ''"
              @input="updateDefense(unit.defense)"
            />
          </v-col>
          <v-col cols="6" :sm="3">
            <v-text-field
              v-model="unit.size"
              :readonly="!!unit.sync"
              outlined
              dense
              label="Size"
              type="Number"
              :rules="[rules.required, rules.positive]"
              :append-icon="unit.sync ? 'mdi-lock' : ''"
              @input="updateSize(unit.size)"
            />
          </v-col>
          <v-col cols="6" :sm="3">
            <v-text-field
              v-model="unit.cost"
              outlined
              dense
              label="Cost (pts)"
              type="Number"
              :persistent-hint="costModeAutomatic"
              :hint="`${calculatedUnitCostRounded} (${calculatedUnitCost ? calculatedUnitCost : ''})`"
              :disabled="costModeAutomatic"
              @input="updateCost()"
            />
            <!--
            automatic: on change, adjust pointcost accordingly append-outer-icon="mdi-lock"
            manually: don't adjust automatically
            -->
          </v-col>
        </v-row>

        <v-row>
          <v-col><strong>Equipment</strong></v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-simple-table :key="unit.id" dense>
              <template #default>
                <thead>
                  <tr>
                    <th class="text-left">
                      No.
                    </th>
                    <th class="text-left">
                      Weapon
                    </th>
                    <th class="text-center">
                      Range
                    </th>
                    <th class="text-center">
                      Att
                    </th>
                    <th class="text-left">
                      Special
                    </th>
                    <th v-if="showPointCalcOptions" class="text-right">
                      Pts
                    </th>
                    <th v-show="!unit.sync" class="text-right">
                      Act.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <opr-army-book-unit-weapon-row
                    v-for="(item, index) in unit.equipment"
                    :key="index"
                    :weapon="item"
                    :army-book-game-system-slug="armyBookGameSystemSlug"
                    :calculatable-unit="calculatableUnit"
                    :show-cost="showPointCalcOptions"
                    :read-only="!!unit.sync"
                    @update="unitWeaponUpdate(index, $event)"
                    @remove="unitRemoveWeapon(index)"
                  />
                  <tr v-if="!unit.sync">
                    <td colspan="7">
                      <div
                        v-if="weaponEditor.overlay"
                        class="text-left"
                      >
                        <span class="grey--text" @click="weaponEditor.overlay = !weaponEditor.overlay">
                          write weapon stats
                        </span>
                        <span>or</span>
                        <span style="color: cornflowerblue; cursor: pointer" @click="openAddWeaponDialog()">use weapon builder</span>
                      </div>
                      <v-text-field
                        v-else
                        v-model="weaponEditor.importString"
                        clearable
                        autofocus
                        placeholder="Write weapon text and hit enter..."
                        append-outer-icon="mdi-plus-circle-outline"
                        :rules="[rules.required, rules.weapon]"
                        @click:append-outer="parseWeaponInput()"
                        @keypress.enter="parseWeaponInput()"
                        @keydown.esc="weaponEditor.overlay = true"
                      />
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-col>
        </v-row>

        <v-row>
          <v-col><strong>Special Rules</strong></v-col>
        </v-row>

        <v-row>
          <v-col v-if="unit.specialRules.length > 0" cols="12">
            <v-chip-group column>
              <v-chip
                v-for="(rule, index) in unit.specialRules"
                :key="index"
                label
                close
                :outlined="unit.sync && !rule.additional"
                @click:close="unitRemoveSpecialRule(index)"
              >
                {{ rule.name }}<span v-if="rule.rating">({{ rule.rating }})</span>
                <span>&nbsp;[{{ computeRuleCost(rule.name) }}pts]</span>
              </v-chip>
            </v-chip-group>
          </v-col>

          <v-col cols="12">
            <div
              v-if="specialRuleEditor.overlay"
              class="text-left"
            >
              <span
                class="grey--text"
                @click="specialRuleEditor.overlay = !specialRuleEditor.overlay"
              >
                write special rule ...
              </span>
              <span v-show="false">or</span>
              <span v-show="false" style="color: cornflowerblue; cursor: pointer">use rules builder</span>
            </div>
            <v-text-field
              v-else
              v-model="specialRuleEditor.importString"
              autofocus
              placeholder="Write rule and hit enter..."
              dense
              append-outer-icon="mdi-plus-circle-outline"
              @click:append-outer="parseSpecialRuleInput()"
              @keypress.enter="parseSpecialRuleInput()"
              @keydown.esc="specialRuleEditor.overlay = true"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-select
              v-model="unit.upgrades"
              :items="armyBookUpgradePackageOptions"
              multiple
              chips
              small-chips
              deletable-chips
              outlined
              label="Upgrades"
              @change="updateUnit(unit.upgrades)"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="unit.splitPageNumber"
              dense
              outlined
              type="Number"
              label="Split Page Number"
              persistent-hint
              hint="Used to distribute large armies over multiple pages"
              @input="updateSplitPageNumber(unit.splitPageNumber)"
            />
            <em>All units with the same number are put on one page, default is '1'</em>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-switch
          v-model="costModeAutomatic"
          inset
          dense
          label="Cost Mode"
          persistent-hint
          :hint="costModeAutomatic ? 'Calculate automatic' : 'Edit manually'"
        />
      </v-card-actions>

      <template v-if="$auth.hasScope('admin')">
        <v-divider />
        <v-card-text style="overflow: auto">
          <pre>{{ unit }}</pre>
        </v-card-text>
      </template>
    </v-card>

    <v-dialog
      v-model="showAddWeaponSpecialRulesDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Add Weapon"
        @apply="unitAddWeapon"
        @close="showAddWeaponSpecialRulesDialog = false"
      >
        <opr-army-book-weapon-editor
          v-model="weaponEditor"
          :special-rules-items="weaponSpecialRulesOptions"
        />
      </opr-dialog>
    </v-dialog>

    <v-dialog
      v-model="showAddSpecialRulesDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Select Special Rule"
        apply-label="Add Special Rules"
        @apply="showAddSpecialRulesDialog = false"
        @close="showAddSpecialRulesDialog = false"
      >
        <v-card-text>
          <v-select
            v-model="unitEditor.specialRules"
            outlined
            dense
            multiple
            :items="combinedSpecialRules"
            item-text="label"
            item-value="key"
          />
        </v-card-text>
      </opr-dialog>
    </v-dialog>
  </div>
</template>

<script>
import { ArmyBook, CalcHelper } from 'opr-army-book-helper';
import OprArmyBookUnitWeaponRow from './OprArmyBookUnitWeaponRow';
import OprArmyBookWeaponEditor from '~/components/army-book/OprArmyBookWeaponEditor';
import OprDialog from '~/components/shared/OprDialog';
import OprUtils from '~/mixins/OprUtils';
import { toCustomRule } from '~/assets/js/CustomArmyRulesService';

export default {
  name: 'OprArmyBookUnitEditor',
  components: {
    OprArmyBookUnitWeaponRow,
    OprDialog,
    OprArmyBookWeaponEditor,
  },
  mixins: [OprUtils],
  props: {
    armyBookId: String,
    unitId: String,
  },
  data() {
    return {
      rules: {
        required: value => !!value || 'Required.',
        positive: value => parseInt(value) > 0 || '> 0',
        weapon: value => ArmyBook.Weapon.Is(value) || 'Incorrect format, use: Name (Range, Attacks, Special) or Name (Attacks, Special).',
        rule: value => ArmyBook.Rule.Is(value) || 'Incorrect format.',
      },
      costMode: 'automatic',
      calculatedCost: undefined,
      commonSpecialRules: undefined,
      qualityOptions: [
        { text: '6+', value: 6 },
        { text: '5+', value: 5 },
        { text: '4+', value: 4 },
        { text: '3+', value: 3 },
        { text: '2+', value: 2 },
      ],
      unitEditor: {
        specialRule: undefined,
        specialRuleRating: 1,
        specialRules: [],
      },
      showAddWeaponSpecialRulesDialog: false,
      weaponEditor: {
        name: 'Eel Cannon',
        range: 0,
        attacks: 1,
        specialRules: [],
        overlay: true,
        importString: ''
      },
      specialRuleEditor: {
        overlay: true,
        importString: '',
      },
      showAddSpecialRulesDialog: false,
      saving: false,
      unsavedChanges: false,
      syncInfo: undefined,
    };
  },
  computed: {
    loading() {
      return !(this.commonSpecialRules && this.armyBook && this.unit);
    },
    elevation() {
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    armyBook() {
      return this.$store.getters['armyBooks/armyBook'](this.armyBookId);
    },
    armyBookGameSystemSlug() {
      return this.$store.getters['armyBooks/armyBookGameSystemSlug'](this.armyBookId);
    },
    armyBookUpgradePackages() {
      return this.$store.getters['armyBooks/upgradePackages'](this.armyBookId);
    },
    armyBookUpgradePackageOptions() {
      return this.armyBookUpgradePackages.map((upgradePackage) => {
        const { hint } = upgradePackage;
        return {
          text: `${hint}`,
          value: upgradePackage.uid,
        };
      });
    },
    unit() {
      return this.$store.getters['armyBooks/unit'](this.armyBookId, this.unitId);
    },
    hasSync() {
      return this.unit?.sync || false;
    },
    showPointCalcOptions() {
      return this.$config.oprPointCalculatorEnabled;
    },
    calculatableUnit() {
      return CalcHelper.normalizeUnit(this.unit);
    },
    customRules() {
      const customRules = {};
      this.armyBookSpecialRules.forEach((rule) => {
        const ruleCost = toCustomRule(rule);
        if (ruleCost) {
          customRules[rule.name] = ruleCost;
        }
      });
      return customRules;
    },
    calculatedUnitCost() {
      if (this.calculatableUnit && this.$oprPointCalculator) {
        return this.$oprPointCalculator.unitCost(this.calculatableUnit, this.customRules).toFixed(3);
      }
      return undefined;
    },
    calculatedUnitCostRounded() {
      return this.calculatedUnitCost ? Math.round(this.calculatedUnitCost / 5) * 5 : 0;
    },
    armyBookSpecialRules() {
      return this.$store.getters['armyBooks/specialRules'](this.armyBookId);
    },
    enableRating() {
      return this.unitEditor?.specialRule?.hasRating || false;
    },
    combinedSpecialRules() {
      let rules = [];
      if (this.commonSpecialRules) {
        rules = [...this.commonSpecialRules];
      }
      if (this.armyBookSpecialRules) {
        rules = [...rules, ...this.armyBookSpecialRules];
      }
      return rules;
    },
    unitSpecialRules() {
      return this.combinedSpecialRules.filter(rule => rule.forUnit || rule?.tags?.includes('unit') || false);
    },
    weaponSpecialRulesOptions() {
      return this.combinedSpecialRules.filter(rule => rule.forWeapon || rule?.tags?.includes('weapon') || false);
    },
    costModeAutomatic: {
      get() {
        return this.unit.costModeAutomatic;
      },
      set(costModeAutomatic) {
        const costMode = costModeAutomatic === 'automatic' ? 'manually' : 'automatic';
        if (costMode === 'automatic') {
          this.$store.commit('armyBooks/unitSetCost', { id: this.armyBookId, unitId: this.unitId, cost: this.calculatedUnitCostRounded });
        }
        this.$store.commit('armyBooks/unitSetCostMode', { id: this.armyBookId, unitId: this.unitId, costMode, costModeAutomatic });
        this.$store.dispatch('armyBooks/updateUnit', { armyBookUid: this.armyBookId, unitId: this.unitId });
      },
    }
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
    unitId: {
      handler(newValue) {
        if (newValue) {
          // eslint-disable-next-line no-unused-expressions
          this.$refs.entry ? this.$refs.entry.focus() : '';
        }
      },
      immediate: true, // make this watch function is called when component created
    },
    calculatedUnitCostRounded: {
      handler(newValue) {
        if (newValue && this.unit.cost !== newValue && this.unit.costModeAutomatic) {
          this.$store.commit('armyBooks/unitSetCost', {
            id: this.armyBookId,
            unitId: this.unitId,
            cost: newValue
          });
        }
      },
    },
  },
  methods: {
    async loadArmyBookAndAssets() {
      const { data } = await this.$axios.get('/api/content/special-rules');
      this.commonSpecialRules = data;
    },
    loadSyncInformation() {
      if (this.unit.sync && (!this.syncInfo || this.syncInfo?.unit?.id !== this.unit.sync.unitId)) {
        this.syncInfo = undefined;
        this.$axios.get(`/api/army-books/${this.unit.sync.parentArmyBookId}`).then((response) => {
          const { name, units } = response.data;
          const unit = units.find(unit => unit.id === this.unit.sync.unitId);
          this.syncInfo = { name, unit };
        });
      }
    },
    updateSync() {
      if (this.unit.sync) {
        console.info('TODO fetching data and update unit.');
        const armyBookId = this.armyBookId;
        const unitId = this.unitId;
        this.$store.dispatch('armyBooks/unitResync', { armyBookId, unitId });
      }
    },
    updateUnit(upgrades) {
      const armyBookUid = this.armyBookId;
      const unitId = this.unitId;
      this.$store.commit('armyBooks/unitSetUpgrades', { armyBookUid, unitId, upgrades });
      this.saveUnitDebounced();
    },
    openAddWeaponDialog() {
      this.weaponEditor.name = 'Eel Rifle';
      this.weaponEditor.range = 24;
      this.weaponEditor.attacks = 1;
      this.weaponEditor.specialRules = [];
      this.weaponEditor.specialRule = undefined;
      this.weaponEditor.specialRuleRating = undefined;
      this.showAddWeaponSpecialRulesDialog = true;
    },
    parseSpecialRuleInput() {
      this.specialRuleEditor.importString
        .split(',')
        .map(i => i.trim())
        .forEach((ruleString) => {
          if (ArmyBook.Rule.Is(ruleString)) {
            const id = this.armyBookId;
            const unitId = this.unitId;
            const { key, name, rating } = ArmyBook.Rule.FromString(ruleString);
            const rule = {
              key,
              name,
              rating,
              additional: !!this.unit.sync,
            };
            this.$store.commit('armyBooks/unitAddSpecialRule', { id, unitId, rule });
          }
        });
      this.specialRuleEditor.importString = '';
      this.saveUnitDebounced();
    },
    unitAddSpecialRule() {
      const id = this.armyBookId;
      const unitId = this.unitId;
      const { key, name, hasRating } = this.unitEditor.specialRule;
      const rule = {
        key,
        name,
        rating: hasRating ? this.unitEditor.specialRuleRating : undefined,
      };
      this.$store.commit('armyBooks/unitAddSpecialRule', { id, unitId, rule });
      this.saveUnitDebounced();
    },
    unitWeaponUpdate(equipmentIndex, payload) {
      const unitId = this.unitId;
      const { field, value } = payload;
      this.$store.commit('armyBooks/unitUpdateEquipment', { id: this.armyBookId, unitId, equipmentIndex, field, value });
      this.saveUnitDebounced();
    },
    unitRemoveWeapon(equipmentIndex) {
      const unitId = this.unitId;
      this.$store.commit('armyBooks/unitRemoveEquipment', { id: this.armyBookId, unitId, equipmentIndex });
      this.saveUnitDebounced();
    },
    unitRemoveSpecialRule(specialRulesIndex) {
      const unitId = this.unitId;
      this.$store.commit('armyBooks/unitRemoveSpecialRule', { id: this.armyBookId, unitId, specialRulesIndex });
      this.saveUnitDebounced();
    },
    parseWeaponInput() {
      const weaponString = this.weaponEditor.importString;

      // check shortand codes
      let weapon = ArmyBook.Weapon.CcwShorthand(weaponString);
      if (weapon === undefined) {
        if (ArmyBook.Weapon.Is(weaponString)) {
          weapon = ArmyBook.Weapon.FromString(weaponString);
        }
      }

      if (weapon) {
        const id = this.armyBookId;
        const unitId = this.unitId;
        const equipment = {
          label: weapon.name,
          range: weapon.range > 0 ? weapon.range : undefined,
          attacks: weapon.attacks,
          specialRules: weapon.specialRules.map(r => r.label),
        };
        this.$store.commit('armyBooks/unitAddEquipment', { id, unitId, equipment });
        this.weaponEditor.importString = '';
        this.saveUnitDebounced();
      }
    },
    unitAddWeapon() {
      const id = this.armyBookId;
      const unitId = this.unitId;
      const { name, range, attacks, specialRules } = this.weaponEditor;
      const equipment = {
        label: name,
        range: range > 0 ? range : undefined,
        attacks,
        specialRules: specialRules.map(r => `${r.name}${r.rating ? '(' + r.rating + ')' : ''}`),
      };
      this.$store.commit('armyBooks/unitAddEquipment', { id, unitId, equipment });
      this.showAddWeaponSpecialRulesDialog = false;
      this.saveUnitDebounced();
    },
    saveUnitDebounced(delay = 2000) {
      clearTimeout(this._timerId);
      this.unsavedChanges = true;
      this._timerId = setTimeout(() => { this.saveUnit(); }, delay);
    },
    saveUnit() {
      this.saving = true;
      this.$store.dispatch('armyBooks/updateUnit', { armyBookUid: this.armyBookId, unitId: this.unitId })
        .then(() => {
          this.saving = false;
          this.unsavedChanges = false;
        });
    },
    updateSplitPageNumber(splitPageNumber) {
      this.$store.commit(
        'armyBooks/unitSetSplitPageNumber',
        { id: this.armyBookId, unitId: this.unitId, splitPageNumber }
      );
      this.saveUnitDebounced();
    },
    updateName(name) {
      this.$store.commit('armyBooks/unitSetName', { id: this.armyBookId, unitId: this.unitId, name });
      this.saveUnitDebounced();
    },
    updateSize(sizeString) {
      const size = parseInt(sizeString);
      this.$store.commit('armyBooks/unitSetSize', { id: this.armyBookId, unitId: this.unitId, size });
      this.saveUnitDebounced();
    },
    updateCost(costy = this.unit.cost) {
      const cost = parseInt(costy);
      this.$store.commit('armyBooks/unitSetCost', { id: this.armyBookId, unitId: this.unitId, cost });
      this.saveUnitDebounced();
    },
    updateQuality(qualityString) {
      const quality = parseInt(qualityString);
      this.$store.commit('armyBooks/unitSetQuality', { id: this.armyBookId, unitId: this.unitId, quality });
      this.saveUnitDebounced(2000);
    },
    updateDefense(defenseString) {
      const defense = parseInt(defenseString);
      this.$store.commit('armyBooks/unitSetDefense', { id: this.armyBookId, unitId: this.unitId, defense });
      this.saveUnitDebounced(2000);
    },
    computeRuleCost(ruleName) {
      if (this.calculatableUnit && this.$oprPointCalculator) {
        switch (ruleName) {
          case 'Fearless':
            // eslint-disable-next-line no-case-declarations
            const fearfullUnit = { ...this.calculatableUnit };
            // eslint-disable-next-line no-case-declarations
            const fearfullCost = this.$oprPointCalculator.unitBaseCost(fearfullUnit) * this.unit.size;
            // eslint-disable-next-line no-case-declarations
            const fearlessUnit = { ...this.calculatableUnit, rules: [...this.calculatableUnit.rules.filter(i => i !== 'Fearless')] };
            // eslint-disable-next-line no-case-declarations
            const fearlessCost = this.$oprPointCalculator.unitBaseCost(fearlessUnit) * this.unit.size;
            return fearfullCost - fearlessCost;

          case 'Tough':
            // eslint-disable-next-line no-case-declarations
            const toughUnit = { ...this.calculatableUnit, tough: parseInt(this.calculatableUnit.tough) - 1 };
            return this.$oprPointCalculator.unitBaseCost(toughUnit) * this.unit.size;

          default:
            return (this.$oprPointCalculator.unitRuleCost(this.calculatableUnit, ruleName, this.customRules) * this.unit.size).toFixed(1);
        }
      }
      return '?';
    },
  },
};
</script>

<style scoped>

</style>
