<template>
  <div>

    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange ligthen-2"
        ></v-progress-circular>
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-title>
        {{ unit.name }}
        <v-spacer></v-spacer>
        <template v-if="hasSync">
          <v-tooltip left>
            <template v-slot:activator="{ on, attrs }">
              <v-icon
                v-bind="attrs"
                v-on="on"
                @mouseover="loadSyncInformation"
                @click="updateSync"
              >
                mdi-dna
              </v-icon>
            </template>
            <div v-if="this.syncInfo">
              <div><strong>Army Book:</strong> {{this.syncInfo.name}}</div>
              <div><strong>Unit:</strong> {{this.syncInfo.unit.name}}</div>
            </div>
            <v-progress-circular v-else indeterminate color="warning"></v-progress-circular>
          </v-tooltip>
        </template>
      </v-card-title>
      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          color="primary"
          :disabled="!unsavedChanges"
          small
          outlined
        >
          <v-icon class="mdi-spin" left v-if="saving">mdi-loading</v-icon>
          <template>Save</template>
        </v-btn>
        <v-spacer></v-spacer>
        <v-switch
          inset dense
          v-model="costModeAutomatic"
          label="Cost Mode"
          persistent-hint
          :hint="costModeAutomatic ? 'Calculate automatic' : 'Edit manually'"
        ></v-switch>
      </v-card-actions>

      <v-divider></v-divider>

      <v-card-text>

        <v-row>
          <v-col cols="12" :sm="6">
            <v-text-field
              ref="entry"
              v-model="unit.name"
              @input="updateName(unit.name)"
              label="Unit Name"
              outlined dense
              aria-required="true"
              :rules="[rules.required]"
            ></v-text-field>
          </v-col>
          <v-col cols="6" :sm="3">
            <v-text-field
              v-model="unit.size"
              :readonly="!!unit.sync"
              outlined dense
              label="Size"
              type="Number"
              :rules="[rules.required, rules.positive]"
              @input="updateSize(unit.size)"
              :append-icon="unit.sync ? 'mdi-lock' : ''"
            ></v-text-field>
          </v-col>
          <v-col cols="6" :sm="3">
            <v-text-field
              outlined dense
              label="Cost (pts)" type="Number" v-model="unit.cost" @input="updateCost()"
              :persistent-hint="costModeAutomatic"
              :hint="`${calculatedUnitCostRounded} (${calculatedUnitCost ? calculatedUnitCost : ''})`"
              :disabled="costModeAutomatic"
            >
            </v-text-field>
            <!--
            automatic: on change, adjust pointcost accordingly append-outer-icon="mdi-lock"
            manually: don't adjust automatically
            -->
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6" :sm="3">
            <v-select
              outlined dense
              label="Quality"
              v-model="unit.quality"
              :items="qualityOptions"
              @input="updateQuality(unit.quality)"
              :readonly="!!unit.sync"
              :append-icon="unit.sync ? 'mdi-lock' : ''"
            ></v-select>
          </v-col>
          <v-col cols="6" :sm="3">
            <v-select
              outlined dense
              label="Defense"
              v-model="unit.defense"
              :items="qualityOptions"
              @input="updateDefense(unit.defense)"
              :readonly="!!unit.sync"
              :append-icon="unit.sync ? 'mdi-lock' : ''"
            ></v-select>
          </v-col>
        </v-row>

        <v-row>
          <v-col><strong>Equipment</strong></v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-simple-table dense :key="unit.id">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">No.</th>
                    <th class="text-left">Weapon</th>
                    <th class="text-center">Range</th>
                    <th class="text-center">Att</th>
                    <th class="text-left">Special</th>
                    <th v-if="showPointCalcOptions" class="text-right">Pts</th>
                    <th class="text-right" v-show="!unit.sync">Act.</th>
                  </tr>
                </thead>
                <tbody>
                  <opr-army-book-unit-weapon-row
                    v-for="(item, index) in unit.equipment" :key="index"
                    :weapon="item"
                    :army-book-game-system-slug="armyBookGameSystemSlug"
                    :calculatable-unit="calculatableUnit"
                    @update="unitWeaponUpdate(index, $event)"
                    @remove="unitRemoveWeapon(index)"
                    :show-cost="showPointCalcOptions"
                    :read-only="!!unit.sync"
                  />
                  <tr v-if="!unit.sync">
                    <td colspan="7">
                      <div
                        class="text-left"
                        v-if="weaponEditor.overlay"
                      >
                        <span class="grey--text" @click="weaponEditor.overlay = !weaponEditor.overlay">
                          write weapon stats
                        </span>
                        <span>or</span>
                        <span @click="openAddWeaponDialog()" style="color: cornflowerblue; cursor: pointer" >use weapon builder</span>
                      </div>
                      <v-text-field
                        v-else
                        clearable
                        autofocus
                        placeholder="Write weapon text and hit enter..."
                        v-model="weaponEditor.importString"
                        append-outer-icon="mdi-plus-circle-outline"
                        :rules="[rules.required, rules.weapon]"
                        @click:append-outer="parseWeaponInput()"
                        @keypress.enter="parseWeaponInput()"
                        @keydown.esc="weaponEditor.overlay = true"
                      ></v-text-field>
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

          <v-col cols="12" v-if="unit.specialRules.length > 0">
            <v-chip-group column>
              <v-chip
                label
                close
                :outlined="unit.sync && !rule.additional"
                v-for="(rule, index) in unit.specialRules"
                :key="index"
                @click:close="unitRemoveSpecialRule(index)"
              >
                {{rule.name}}<span v-if="rule.rating">({{rule.rating}})</span>
                <span>&nbsp;[{{computeRuleCost(rule.name)}}pts]</span>
              </v-chip>
            </v-chip-group>
          </v-col>

          <v-col cols="12">
            <div
              class="text-left"
              v-if="specialRuleEditor.overlay"
            >
                <span
                  class="grey--text"
                  @click="specialRuleEditor.overlay = !specialRuleEditor.overlay"
                >
                  write special rule ...
                </span>
              <span v-show="false">or</span>
              <span v-show="false" style="color: cornflowerblue; cursor: pointer" >use rules builder</span>
            </div>
            <v-text-field
              v-else
              autofocus
              placeholder="Write rule and hit enter..."
              dense
              v-model="specialRuleEditor.importString"
              append-outer-icon="mdi-plus-circle-outline"
              @click:append-outer="parseSpecialRuleInput()"
              @keypress.enter="parseSpecialRuleInput()"
              @keydown.esc="specialRuleEditor.overlay = true"
            >
            </v-text-field>
          </v-col>
        </v-row>

        <!-- deprecated -->
        <v-row v-if="false">
          <v-col cols="6">
            <v-select
              outlined dense
              label="Special Rule"
              v-model="unitEditor.specialRule"
              @change="unitEditor.specialRuleRating = unitEditor.specialRule.defaultRating"
              :items="unitSpecialRules"
              item-text="name"
              item-value="key"
              return-object
              persistent-hint :hint="unitEditor.specialRule ? unitEditor.specialRule.hint : ''"
            ></v-select>
          </v-col>

          <v-col cols="3">
            <v-text-field
              outlined dense
              type="Number"
              label="Rating"
              v-model="unitEditor.specialRuleRating"
              :disabled="!enableRating"
            ></v-text-field>
          </v-col>

          <v-col cols="3">
            <v-btn
              color="success"
              outlined block
              @click="unitAddSpecialRule"
            >Add</v-btn>
          </v-col>

          <v-col cols="12" v-if="unitEditor.specialRule && unitEditor.specialRule.description">
            <v-alert color="info" dense text v-html="markdown(unitEditor.specialRule.description)"></v-alert>
          </v-col>

        </v-row>

      </v-card-text>

      <v-divider></v-divider>

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
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="unit.splitPageNumber"
              @input="updateSplitPageNumber(unit.splitPageNumber)"
              dense outlined
              type="Number"
              label="Split Page Number"
              persistent-hint hint="Used to distribute large armies over multiple pages"
            ></v-text-field>
            <em>All units with the same number are put on one page, default is '1'</em>
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="isAdmin">
        <v-divider></v-divider>
        <v-card-text style="overflow: auto"><pre>{{unit}}</pre></v-card-text>
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
        >
        </opr-army-book-weapon-editor>
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
        @apply="showAddSpecialRulesDialog = false"
        @close="showAddSpecialRulesDialog = false"
        apply-label="Add Special Rules"
      >
        <v-card-text>
          <v-select
            outlined dense multiple
            v-model="unitEditor.specialRules"
            :items="combinedSpecialRules"
            item-text="label"
            item-value="key"
          ></v-select>
        </v-card-text>
      </opr-dialog>
    </v-dialog>

  </div>
</template>

<script>
import OprArmyBookWeaponEditor from '~/components/army-book/OprArmyBookWeaponEditor';
import OprDialog from "~/components/shared/OprDialog";
import OprUtils from "~/mixins/OprUtils";
import { marked } from 'marked';
import { ArmyBook, CalcHelper } from 'opr-army-book-helper';
import { toCustomRule } from '~/assets/js/CustomArmyRulesService';
import OprArmyBookUnitWeaponRow from "./OprArmyBookUnitWeaponRow";

export default {
  name: 'OprArmyBookUnitEditor',
  components: {
    OprArmyBookUnitWeaponRow,
    OprDialog,
    OprArmyBookWeaponEditor,
  },
  mixins: [ OprUtils ],
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
      return this.armyBookUpgradePackages.map(upgradePackage => {
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
    isAdmin() {
      return this.$store.state.auth?.user?.isAdmin;
    },
    hasPointCalcRights() {
      return this.isAdmin;
    },
    showPointCalcOptions() {
      return this.$config.oprPointCalculatorEnabled && this.hasPointCalcRights;
    },
    calculatableUnit() {
      return CalcHelper.normalizeUnit(this.unit);
    },
    customRules() {
      let customRules = {};
      this.armyBookSpecialRules.forEach(rule => {
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
      return this.calculatedUnitCost ? Math.round(this.calculatedUnitCost/5) * 5 : 0;
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
        rules = [ ...this.commonSpecialRules ];
      }
      if (this.armyBookSpecialRules) {
        rules = [ ...rules, ...this.armyBookSpecialRules ];
      }
      return rules;
    },
    unitSpecialRules() {
      return this.combinedSpecialRules.filter((rule) => rule.forUnit || rule?.tags?.includes('unit') || false);
    },
    weaponSpecialRulesOptions() {
      return this.combinedSpecialRules.filter((rule) => rule.forWeapon || rule?.tags?.includes('weapon') || false);
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
        this.$store.dispatch('armyBooks/updateUnit',{ armyBookUid: this.armyBookId, unitId: this.unitId });
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
      const { data } = await this.$axios.get(`/api/content/game-systems/${this.armyBookGameSystemSlug}/special-rules`);
      this.commonSpecialRules = data;
    },
    loadSyncInformation() {
      if (this.unit.sync && (!this.syncInfo || this.syncInfo?.unit?.id !== this.unit.sync.unitId )) {
        this.syncInfo = undefined;
        this.$axios.get(`/api/army-books/${this.unit.sync.parentArmyBookId}`).then((response) => {
          const { name, units } = response.data;
          const unit = units.find((unit) => unit.id === this.unit.sync.unitId);
          this.syncInfo = { name, unit };
        });
      }
    },
    updateSync() {
      if (this.unit.sync) {
        console.info(`TODO fetching data and update unit.`);
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
        .forEach(ruleString => {
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
      let unitId = this.unitId;
      const { field, value } = payload;
      this.$store.commit('armyBooks/unitUpdateEquipment',{ id: this.armyBookId, unitId, equipmentIndex, field, value });
      this.saveUnitDebounced();
    },
    unitRemoveWeapon(equipmentIndex) {
      let unitId = this.unitId;
      this.$store.commit('armyBooks/unitRemoveEquipment',{ id: this.armyBookId, unitId, equipmentIndex });
      this.saveUnitDebounced();
    },
    unitRemoveSpecialRule(specialRulesIndex) {
      let unitId = this.unitId;
      this.$store.commit('armyBooks/unitRemoveSpecialRule',{ id: this.armyBookId, unitId, specialRulesIndex });
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
          specialRules: weapon.specialRules.map((r) => r.label),
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
        specialRules: specialRules.map((r) => `${r.name}${r.rating ? '('+r.rating+')' : ''}`),
      };
      this.$store.commit('armyBooks/unitAddEquipment', { id, unitId, equipment });
      this.showAddWeaponSpecialRulesDialog = false;
      this.saveUnitDebounced();
    },
    saveUnitDebounced(delay = 2000) {
      clearTimeout(this._timerId);
      this.unsavedChanges = true;
      this._timerId = setTimeout(() => {this.saveUnit()}, delay);
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
    markdown(text = '') {
      return marked.parse(text);
    },
    computeRuleCost(ruleName) {
      if (this.calculatableUnit && this.$oprPointCalculator) {
        switch (ruleName) {

          case 'Fearless':
            const fearfullUnit = {...this.calculatableUnit};
            const fearfullCost = this.$oprPointCalculator.unitBaseCost(fearfullUnit) * this.unit.size;
            const fearlessUnit = {...this.calculatableUnit, rules: [...this.calculatableUnit.rules.filter(i => i !== 'Fearless')]};
            const fearlessCost = this.$oprPointCalculator.unitBaseCost(fearlessUnit) * this.unit.size;
            return fearfullCost - fearlessCost;

          case 'Tough':
            const toughUnit = {...this.calculatableUnit, tough: parseInt(this.calculatableUnit.tough)-1};
            return this.$oprPointCalculator.unitBaseCost(toughUnit) * this.unit.size;

          default:
            return (this.$oprPointCalculator.unitRuleCost(this.calculatableUnit, ruleName, this.customRules) * this.unit.size).toFixed(1);
        }
      }
      return '?';
    },
  },
}
</script>

<style scoped>

</style>
