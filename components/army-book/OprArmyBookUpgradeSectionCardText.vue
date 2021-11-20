<template>
  <v-card-text
    :key="sectionIndex"
  >
    <div v-if="sectionEditor.show">
      <v-text-field
        autofocus
        dense
        outlined
        v-model="sectionEditor.label"
        hide-details
        @blur="saveLabelEditor(sectionEditor.label)"
        @keypress.enter="saveLabelEditor(sectionEditor.label)"
        @keydown.esc="cancelLabelEditor"
      ></v-text-field>
    </div>
    <h4 class="text-center" v-else>
      <v-icon
        :disabled="sectionIndex === 0"
        @click="moveUpgradeSection(sectionIndex, sectionIndex-1)"
        color="primary"
      >mdi-arrow-up-bold-circle-outline</v-icon>
      <v-icon
        :disabled="sectionIndex >= upgradePackageSectionCount-1"
        @click="moveUpgradeSection(sectionIndex, sectionIndex+1)"
        color="primary"
      >mdi-arrow-down-bold-circle-outline</v-icon>
      <span @click="openLabelEditor(section, sectionIndex)">{{ section.label }}:</span>
      <v-icon v-if="!parsedSectionLabel" color="warning">mdi-alert</v-icon>
      <v-icon v-else v-show="false" color="success">mdi-check-circle</v-icon>
      <v-hover v-slot="{ hover }">
        <v-icon v-if="hover" color="error" small @click="removeUpgradeSection(sectionIndex)">mdi-delete-empty</v-icon>
        <v-icon v-else small>mdi-delete</v-icon>
      </v-hover>
    </h4>
    <v-simple-table dense class="mb-2">
      <template v-slot:default>
        <tbody>
        <template v-for="(option, optionIndex) in section.options">
          <opr-army-book-upgrade-option-row
            :key="`${optionIndex}-${option.label}-${option.cost}`"
            :army-book-id="armyBookId"
            :upgrade-package-id="upgradePackageId"
            :section-index="sectionIndex"
            :option="option"
            :option-count="section.options.length"
            :option-index="optionIndex"
          ></opr-army-book-upgrade-option-row>
        </template>
        <tr>
          <td colspan="7">
            <opr-army-book-upgrade-option-builder
              :army-book-id="armyBookId"
              :upgrade-package-id="upgradePackageId"
              :section-index="sectionIndex"
            />
          </td>
        </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-card-text>
</template>

<script>
import OprArmyBookUpgradeOptionRow from "./OprArmyBookUpgradeOptionRow";
import OprArmyBookUpgradeOptionBuilder from "./OprArmyBookUpgradeOptionBuilder";
import { ArmyBook } from 'opr-army-book-helper';

export default {
  name: 'OprArmyBookUpgradeSectionCardText',
  components: {
    OprArmyBookUpgradeOptionRow,
    OprArmyBookUpgradeOptionBuilder,
  },
  props: {
    armyBookId: String,
    upgradePackageId: String,
    upgradePackageSectionCount: Number,
    sectionIndex: Number,
  },
  data() {
    return {
      sectionEditor: {
        show: false,
        label: '',
      },
    };
  },
  computed: {
    hasPointCalcRights() {
      return this.$store.state.auth?.user?.isAdmin;
    },
    sectionCode() {
      return {
        ...this.section,
        options: []
      };
    },
    upgradePackage() {
      return this.$store.getters['armyBooks/upgradePackage'](this.armyBookId, this.upgradePackageId);
    },
    section() {
      return this.upgradePackage.sections[this.sectionIndex];
    },
    parsedSectionLabel() {
      return ArmyBook.UpgradeSection.FromString(this.section.label);
    },
  },
  methods: {
    savePackage() {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);
    },
    openLabelEditor(section, sectionIndex) {
      console.info(`Open editor, index:${sectionIndex} -> ${section.label}`);
      this.sectionEditor.label = section.label;
      this.sectionEditor.show = true;
    },
    cancelLabelEditor() {
      this.sectionEditor.label = null;
      this.sectionEditor.show = false;
    },
    saveLabelEditor(label) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const sectionIndex = this.sectionIndex;

      const commitLoad = { armyBookUid, upgradePackageUid, sectionIndex, label };
      this.$store.commit('armyBooks/patchUpgradePackageSectionLabel', commitLoad);

      this.savePackage();

      this.sectionEditor.label = null;
      this.sectionEditor.show = false;
    },
    moveUpgradeSection(currentSectionIndex, newSectionIndex) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;

      const commitLoad = { armyBookUid, upgradePackageUid, currentSectionIndex, newSectionIndex };
      this.$store.commit('armyBooks/moveUpgradePackageSection', commitLoad);

      this.savePackage();
    },
    removeUpgradeSection(sectionIndex) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;

      const commitLoad = { armyBookUid, upgradePackageUid, sectionIndex };
      this.$store.commit('armyBooks/removeUpgradePackageSection', commitLoad);

      this.savePackage();
    },
  },
}
</script>

<style scoped>

</style>
