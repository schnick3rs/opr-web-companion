<template>
  <div>

    <!-- Replace | Upgrade | Take -->
    <v-menu bottom offset-y>
      <template v-slot:activator="{ on, attrs }">
        <span
          v-bind="attrs" v-on="on"
          class="mr-2"
          style="text-decoration: underline; text-transform: capitalize;"
        >
          {{ blueprint.variant }}
        </span>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(item, index) in variantItems" :key="index"
          @click="changeUpgradeVariant(item)"
        >
          <v-list-item-title >{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <v-menu bottom offset-y>
      <template v-slot:activator="{ on, attrs }">
        <span
          v-bind="attrs" v-on="on"
          class="mr-2"
          style="text-decoration: underline;"
        >
          {{ affectedModelsItems.find(i => i.value === blueprint.affectedModels).text }}
        </span>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(item, index) in affectedModelsItems" :key="index"
          @click="changeAffectedModels(item)"
        >
          <v-list-item-title >{{ item.text }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>

    <span v-if="['upgrade'].includes(blueprint.variant)" class="mr-2">
        models
    </span>

    <span v-if="blueprint.variant === 'replace'" v-for="(item, index) in blueprint.lose">
      <v-chip label small close @click:close="removeLose(index)">{{ item }}</v-chip>
      <span v-if="index < blueprint.lose.length-2">, </span>
      <span v-else-if="index < blueprint.lose.length-1"> and </span>
    </span>

    <v-text-field
      v-if="blueprint.variant === 'replace'"
      v-model="loseCandidate"
      dense single-line
      class="mr-2"
      style="display: inline-block;"
      append-icon="mdi-plus-circle-outline"
      @click:append="addLose()"
      @keypress.enter="addLose()"
    ></v-text-field>

    <template v-if="blueprint.variant === 'upgrade'">

      <span class="mr-2">with</span>

      <v-menu bottom offset-y>
        <template v-slot:activator="{ on, attrs }">
        <span
          v-bind="attrs" v-on="on"
          class="mr-2"
          style="text-decoration: underline;"
        >
          {{ optionLimitOptionsItems.find(i => i.value === blueprint.optionLimitAmount).text }}
        </span>
        </template>
        <v-list dense>
          <v-list-item
            v-for="(item, index) in optionLimitOptionsItems" :key="index"
            @click="changeOptionLimitAmount(item)"
          >
            <v-list-item-title >{{ item.text }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <v-btn
      small
      outlined
      color="success"
      @click="createSection"
    >create</v-btn>

  </div>

</template>

<script>
import * as ArmyBook from '~/assets/js/ArmyBook';

export default {
  name: 'OpaArmyBookUpgradeSectionBuilder',
  props: {
    armyBookId: String,
    upgradePackageId: String,
  },
  data() {
    return {
      variantItems: [
        { text: 'Replace', value: 'replace' },
        { text: 'Upgrade', value: 'upgrade' },
        { text: 'Take', value: 'attachment' },
      ],
      affectedModelsItems: [
        { text: 'any', value: 'any' },
        { text: 'all', value: 'all' },
        { text: 'up to one', value: 1 },
        { text: 'up to two', value: 2 },
        { text: 'up to three', value: 3 },
        { text: 'up to four', value: 4 },
        { text: 'up to five', value: 5 },
        { text: 'up to six', value: 6 },
        { text: 'up to seven', value: 7 },
        { text: 'up to eight', value: 8 },
        { text: 'up to nine', value: 9 },
        { text: 'up to ten', value: 10 },
      ],
      optionLimitOptionsItems: [
        { text: 'any', value: 'any' },
        { text: 'up to one', value: 1 },
        { text: 'up to two', value: 2 },
        { text: 'up to three', value: 3 },
        { text: 'up to four', value: 4 },
        { text: 'up to five', value: 5 },
        { text: 'up to six', value: 6 },
        { text: 'up to seven', value: 7 },
        { text: 'up to eight', value: 8 },
        { text: 'up to nine', value: 9 },
        { text: 'up to ten', value: 10 },
      ],
      loseCandidate: null,
      blueprint: {
        variant : 'replace',
        affectedModels: 'any',
        optionLimitAmount: 'any',
        requirements: [],
        lose: [],
      },
    };
  },
  methods: {
    changeUpgradeVariant(item) {
      this.blueprint.variant = item.value;
    },
    changeAffectedModels(item) {
      this.blueprint.affectedModels = item.value;
    },
    changeAffectedModelsAmount(item) {
    },
    changeOptionLimit(item) {
    },
    changeOptionLimitAmount(item) {
      this.blueprint.optionLimitAmount = item.value;
    },
    addLose() {
      this.blueprint.lose.push(this.loseCandidate);
      this.loseCandidate = '';
    },
    removeLose(index) {
      this.blueprint.lose.splice(index, 1);
    },
    createSection() {
      const armyBookUid = this.armyBookId;
      const upgradePackageUid = this.upgradePackageId;
      const {
        variant,
        lose,
        affectedModels,
        optionLimitAmount,
      } = this.blueprint;

      let section = undefined;
      switch (variant) {
        case 'replace':
          section = ArmyBook.UpgradeSection.BuildReplace(affectedModels, [...lose]);
          break;
        case 'upgrade':
          section = ArmyBook.UpgradeSection.BuildUpgrade(affectedModels, optionLimitAmount);
          break;
        case 'attachment':
          section = ArmyBook.UpgradeSection.BuildAttachment(affectedModels, optionLimitAmount);
          break;
      }

      const commitLoad = { armyBookUid, upgradePackageUid, label: section.label, section };
      this.$store.commit('armyBooks/addUpgradePackageSection', commitLoad);
    },
  },
  filters: {
    numberAsWord(number) {
      const numberWords = [
        'zero',
        'one',
        'two',
        'three',
        'four',
        'five',
      ];
      return numberWords[number];
    },
  },
}
</script>

<style scoped>

</style>
