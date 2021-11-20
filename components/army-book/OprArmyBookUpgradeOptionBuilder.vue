<template>
  <div>
    <div
      class="text-left"
      v-if="overlay"
    >
      <span class="grey--text" @click="overlay = !overlay">
        write single weapon or rule</span><span>, </span>
      <span
        style="color: cornflowerblue; cursor: pointer"
        @click="openUpgradeOptionDialog"
      >
        use the builder
      </span>
    </div>
    <v-text-field
      v-else
      clearable
      autofocus
      placeholder="Write weapon or rules text and hit enter..."
      v-model="importString"
      append-outer-icon="mdi-plus-circle-outline"
      :rules="[rules.required]"
      :prepend-icon="stringTypeIcon"
      :hint="dynamicHelpText"
      @click:append-outer="addOptionFromString(sectionIndex)"
      @keypress.enter="addOptionFromString(sectionIndex)"
      @keydown.esc="overlay = true"
    ></v-text-field>

    <v-dialog
      v-model="showUpgradeOptionDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <opr-dialog
        title="Add upgrade option"
        apply-label="save"
        @close="showUpgradeOptionDialog = false"
        @apply="addUpgradeOption"
        :disabled-apply="editor.option.gains && editor.option.gains.length === 0"
      >
        <opr-army-book-upgrade-option-editor
          v-model="editor.option"
          @apply="addUpgradeOption"
        />
      </opr-dialog>
    </v-dialog>

  </div>
</template>

<script>
import { ArmyBook } from 'opr-army-book-helper';
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ "~/components/shared/OprDialog");
import OprArmyBookUpgradeOptionEditor from "./OprArmyBookUpgradeOptionEditor";

export default {
  name: 'OprArmyBookUpgradeOptionBuilder',
  components: { OprDialog, OprArmyBookUpgradeOptionEditor },
  props: {
    armyBookId: String,
    upgradePackageId: String,
    sectionIndex: Number,
  },
  data() {
    return {
      option: {},
      rules: {
        required: value => !!value || 'Required.',
        positive: value => parseInt(value) > 0 || '> 0',
        weapon: value => ArmyBook.Weapon.Is(value) || 'Incorrect format.',
        rule: value => ArmyBook.Rule.Is(value) || 'Incorrect format.',
      },
      // inline
      overlay: true,
      importString: '',
      // Dialog
      editor: {
        label: null,
        cost: null,
        gains: [],
        option: {},
      },
      showUpgradeOptionDialog: false,
      upgradeOptionEditor: {
        tab: null,
        tabs: [
          { id: 'tab-weapon', label: 'Weapon', icon: 'mdi-sword-cross' },
          { id: 'tab-rule', label: 'Special Rule', icon: 'mdi-school' },
          { id: 'tab-item', label: 'Item', icon: 'mdi-truck' },
          { id: 'tab-freetext', label: 'Freetext', icon: 'mdi-marker' },
        ],
        name: '',
        gainLabel: '',
        contentInput: '',
        itemContent: [],
        gainInput: '',
        gains: [],
        cost: 0,
        sectionIndex: undefined,
      },
    };
  },
  computed: {
    stringTypeIcon() {
      const importString = this.importString;
      if (ArmyBook.Weapon.Is(importString)) {
        return 'mdi-pistol';
      } else if (ArmyBook.Rule.Is(importString)) {
        return 'mdi-school';
      } else if (ArmyBook.Defense.Is(importString)) {
        return 'mdi-shield-half-full';
      }
      return 'mdi-help-circle-outline';
    },
    dynamicHelpText() {
      const importString = this.importString;
      if (ArmyBook.Weapon.Is(importString)) {
        return 'Weapon detected';
      } else if (ArmyBook.Rule.Is(importString)) {
        return 'Special Rule detected';
      } else if (ArmyBook.Defense.Is(importString)) {
        return 'Defense Bonus Detected';
      }
      return 'Can\'t derive option from input string.' ;
    },
  },
  methods: {
    openUpgradeOptionDialog() {
      this.upgradeOptionEditor.label = '';
      this.upgradeOptionEditor.cost = 0;
      this.editor.option = { gains: [], cost: 0 };
      this.showUpgradeOptionDialog = true;
    },
    addOptionFromString(sectionIndex) {
      const importString = this.importString;
      let option = undefined;

      if (ArmyBook.Weapon.Is(importString)) {
        const weapon = ArmyBook.Weapon.FromString(importString);
        option = new ArmyBook.UpgradeOption([weapon], 0);
      } else if (ArmyBook.Rule.Is(importString)) {
        const rule = ArmyBook.Rule.FromString(importString);
        option = new ArmyBook.UpgradeOption([rule], 0);
      } else if (ArmyBook.Defense.Is(importString)) {
        const defense = ArmyBook.Defense.FromString(importString);
        option = new ArmyBook.UpgradeOption([defense], 0);
      } else  {
        console.info(`could not parse '${importString}'`);
      }

      if (option) {
        this.addUpgradeOptionV2(option);
        this.importString = '';
      }
    },
    addUpgradeOptionV2(option) {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const sectionIndex = this.sectionIndex;

      const commitLoad = { armyBookUid, upgradePackageUid, option, sectionIndex };
      this.$store.commit('armyBooks/addUpgradePackageOption', commitLoad);

      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);
    },
    addUpgradeOption() {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const sectionIndex = this.sectionIndex;
      const { gains, cost } = this.editor.option;
      const option = new ArmyBook.UpgradeOption(gains, cost);

      const commitLoad = { armyBookUid, upgradePackageUid, option, sectionIndex };
      this.$store.commit('armyBooks/addUpgradePackageOption', commitLoad);

      const dispatchLoad = { armyBookUid, upgradePackageUid };
      this.$store.dispatch('armyBooks/updateUpgradePackage', dispatchLoad);

      this.showUpgradeOptionDialog = false;
      this.editor.option = {};
    },
  },
}
</script>

<style scoped>

</style>
