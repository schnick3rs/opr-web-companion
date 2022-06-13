<template>
  <tr>
    <td v-if="showLabelEditor">
      <v-text-field
        v-model="editor.label"
        autofocus
        dense
        hide-details
        @blur="saveLabelEditor(editor.label)"
        @keypress.enter="saveLabelEditor(editor.label)"
        @keypress.esc="cancelLabelEditor"
      />
    </td>
    <td v-else class="text-left text-caption pl-1 pr-1" style="width: 70%;">
      <v-hover v-slot="{ hover }">
        <div>
          <span @dblclick="openOptionEditor">{{ option.label }}</span>
          <v-icon v-show="hover" small color="primary" title="edit label" @click="openOptionEditor">
            mdi-pencil
          </v-icon>
          <v-icon
            v-show="hover"
            :disabled="optionIndex === 0"
            color="primary"
            @click="moveUpgradeOption(optionIndex, optionIndex-1)"
          >
            mdi-arrow-up-drop-circle-outline
          </v-icon>
          <v-icon
            v-show="hover"
            :disabled="optionIndex >= optionCount-1"
            color="primary"
            @click="moveUpgradeOption(optionIndex, optionIndex+1)"
          >
            mdi-arrow-down-drop-circle-outline
          </v-icon>
          <v-tooltip v-show="hover" right>
            <template #activator="{ on, attrs }">
              <v-icon
                v-show="hover"
                color="info"
                v-bind="attrs"
                v-on="on"
              >
                mdi-code-not-equal-variant
              </v-icon>
            </template>
            <pre>{{ option }}</pre>
          </v-tooltip>
        </div>
      </v-hover>
    </td>

    <td v-if="showCostEditor" style="width: 20%">
      <v-text-field
        v-model.number="editor.cost"
        autofocus
        dense
        type="number"
        hide-details
        @blur="saveCostEditor(editor.cost)"
        @keypress.enter="saveCostEditor(editor.cost)"
        @keypress.esc="cancelCostEditor"
      />
    </td>
    <td
      v-else
      class="text-right text-caption pl-1 pr-1"
      style="width: 20%"
    >
      <v-hover v-slot="{ hover }">
        <div>
          <v-icon
            v-show="hover"
            small
            icon
            color="primary"
            title="edit label"
            @click="openCostEditor"
          >
            mdi-pencil
          </v-icon>
          <span>{{ option.cost | costString }}</span>
          <div v-if="false">
            <v-icon v-if="option.mode === 'auto-update'" color="success" @click="setOptionMode('locked')">
              mdi-autorenew
            </v-icon>
            <v-icon v-else-if="option.mode === 'locked'" color="primary" @click="setOptionMode('auto-update')">
              mdi-lock
            </v-icon>
            <v-icon v-else color="primary" @click="setOptionMode('auto-update')">
              mdi-lock
            </v-icon>
          </div>
        </div>
      </v-hover>
    </td>

    <v-dialog
      v-model="showUpgradeOptionDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Update upgrade option"
        apply-label="save"
        :disabled-apply="editor.option.gains && editor.option.gains.length === 0"
        @close="showUpgradeOptionDialog = false"
        @apply="updateUpgradeOption"
      >
        <opr-army-book-upgrade-option-editor
          v-model="editor.option"
          @apply="updateUpgradeOption"
        />
      </opr-dialog>
    </v-dialog>

    <td v-if="$config.oprPointCalculatorEnabled">
      <v-icon v-if="option.proposedCost === undefined" color="info">
        mdi-help-circle-outline
      </v-icon>
      <v-tooltip v-else bottom>
        <template #activator="{ on, attrs }">
          <v-icon v-bind="attrs" color="info" v-on="on">
            mdi-information-outline
          </v-icon>
        </template>
        <div>
          <p>Info how the costs are computed using PointCalc v{{ option.proposedVersion }}</p>
          <template v-if="option.proposedCostHint">
            <div
              v-for="(costy, index) in option.proposedCostHint"
              :key="index"
            >
              {{ costy.unitName }} => {{ costy.newCostPrecise }} ({{ costy.newCostRounded }})
              <v-icon v-if="!costy.isValid" dark>
                mdi-debug-step-over
              </v-icon>
            </div>
          </template>
        </div>
      </v-tooltip>
    </td>

    <td class="text-right text-caption pl-1 pr-1" style="width: 10%">
      <v-hover v-slot="{ hover }">
        <v-icon v-if="hover" color="error" @click="removeUpgradeOption(sectionIndex, optionIndex)">
          mdi-delete-empty
        </v-icon>
        <v-icon v-else>
          mdi-delete
        </v-icon>
      </v-hover>
    </td>
  </tr>
</template>

<script>
import { ArmyBook } from 'opr-army-book-helper';
import OprArmyBookUpgradeOptionEditor from './OprArmyBookUpgradeOptionEditor';
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ '~/components/shared/OprDialog');

export default {
  name: 'OprArmyBookUpgradeOptionRow',
  components: { OprDialog, OprArmyBookUpgradeOptionEditor },
  filters: {
    costString: (cost) => {
      if (cost === 0) { return 'free'; }
      if (cost > 0) { return `+${cost}pts`; }
      if (cost < 0) { return `${cost}pts`; }
      return '?';
    },
  },
  props: {
    armyBookId: String,
    upgradePackageId: String,
    sectionIndex: Number,
    optionIndex: Number,
    optionCount: Number,
  },
  data() {
    return {
      newCost: [],
      showLabelEditor: false,
      showCostEditor: false,
      editor: {
        label: null,
        cost: null,
        gains: [],
        option: {},
      },
      showUpgradeOptionDialog: false,
    };
  },
  computed: {
    armyBookGameSystemSlug() {
      return this.$store.getters['armyBooks/armyBookGameSystemSlug'](this.armyBookId);
    },
    upgradePackage() {
      return this.$store.getters['armyBooks/upgradePackage'](this.armyBookId, this.upgradePackageId);
    },
    section() {
      return this.upgradePackage.sections[this.sectionIndex];
    },
    option() {
      return this.section.options[this.optionIndex];
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
    proposedCost() {
      if (this.newCost && this.newCost.length > 0) {
        const props = this.newCost.map((nc) => {
          if (nc.newCostRounded >= 5) {
            return nc.newCostRounded;
          } else if (nc.newCostPrecise > 0) {
            return 5;
          } else {
            return 0;
          }
        }).map(c => parseInt(c));
        return Math.max.apply(null, props);
      }
      return undefined;
    },
  },
  methods: {
    openOptionEditor() {
      if (this.option.gains && Array.isArray(this.option.gains)) {
        this.editor.option = JSON.parse(JSON.stringify(this.option));
      } else {
        // legacy option
        this.editor.option = new ArmyBook.UpgradeOption([this.option.label], this.option.cost);
      }
      this.showUpgradeOptionDialog = true;
    },
    openCostEditor() {
      console.info(`Open editor, index:${this.sectionIndex}.${this.optionIndex} -> ${this.option.cost}`);
      this.editor.cost = this.option.cost;
      this.showCostEditor = true;
    },
    cancelCostEditor() {
      this.editor.cost = null;
      this.showCostEditor = false;
    },
    saveCostEditor(cost) {
      this.patchOptionValues(null, cost);
      this.editor.cost = null;
      this.showCostEditor = false;
    },
    patchOptionValues(label, cost) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const sectionIndex = this.sectionIndex;
      const optionIndex = this.optionIndex;
      const option = {
        ...this.option,
        cost: cost !== undefined ? parseInt(cost) : this.option.cost,
      };

      const commitLoad = { armyBookUid, upgradePackageUid, sectionIndex, optionIndex, option };
      this.$store.commit('armyBooks/alterUpgradePackageOption', commitLoad);

      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);
    },
    updateUpgradeOption() {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const sectionIndex = this.sectionIndex;
      const optionIndex = this.optionIndex;
      const { gains, cost } = this.editor.option;
      const option = new ArmyBook.UpgradeOption(gains, cost);

      const commitLoad = { armyBookUid, upgradePackageUid, sectionIndex, optionIndex, option };
      this.$store.commit('armyBooks/alterUpgradePackageOption', commitLoad);

      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);

      this.showUpgradeOptionDialog = false;
      this.editor.option = {};
    },
    moveUpgradeOption(currentOptionIndex, newOptionIndex) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const sectionIndex = this.sectionIndex;

      const commitLoad = { armyBookUid, upgradePackageUid, sectionIndex, currentOptionIndex, newOptionIndex };
      this.$store.commit('armyBooks/moveUpgradePackageOption', commitLoad);

      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);
    },
    setOptionMode(newMode) {
      const payload = {
        armyBookUid: this.armyBookId,
        upgradePackageUid: this.upgradePackageId,
        sectionIndex: this.sectionIndex,
        optionIndex: this.optionIndex,
        option: {
          ...this.option,
          mode: newMode,
        },
      };
      this.$store.commit('armyBooks/alterUpgradePackageOption', payload);
    },
    removeUpgradeOption(sectionIndex, optionIndex) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;

      const commitLoad = { armyBookUid, upgradePackageUid, sectionIndex, optionIndex };
      this.$store.commit('armyBooks/removeUpgradePackageOption', commitLoad);

      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);
    },
    calculateUnitCost(unit) {
      const equipment = unit.equipment.map((e) => {
        // normalize weapons
        const weapon = {
          name: e.label,
          range: e.range > 0 ? e.range : undefined,
          attacks: e.attacks,
          rules: e.specialRules.map(sr => sr.name),
        };
        e.specialRules.forEach((sr) => {
          if (sr.rating) { weapon[sr.key] = sr.rating; }
        });
        return weapon;
      });
      const calculatableUnit = {
        name: unit.name,
        models: unit.size,
        quality: unit.quality,
        defense: unit.defense,
        rules: unit.specialRules.map(sr => sr.name),
        equipment,
      };
      unit.specialRules.forEach((sr) => {
        if (sr.rating) {
          calculatableUnit[sr.key] = sr.rating;
        }
      });
      unit.specialRules = unit.specialRules.map((sr) => {
        return {
          ...sr,
          key: sr.key.replace('-skirmish', ''),
        };
      });
      this.calculatedCost = this.$oprPointCalculator
        ? this.$oprPointCalculator.unitCost(calculatableUnit)
        : undefined;
      if (this.costMode === 'automatic') {
        unit.cost = Math.round(this.calculatedCost / 5) * 5;
      }
      return this.calculatedCost;
    }
  }
};
</script>

<style scoped>

</style>
