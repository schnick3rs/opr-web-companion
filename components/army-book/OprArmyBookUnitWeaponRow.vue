<template>
  <tr>
    <td class="text-right">
      <span v-if="readOnly">{{count}}</span>
      <input
        v-else
        type="number"
        min="1" max="9"
        style="width: 2em;"
        :value="count"
        @change="$emit('update', {field: 'count', value: parseInt($event.target.value)})"
      >
    </td>
    <td class="text-left">
      <span v-if="readOnly">{{name}}</span>
      <input
        v-else
        size="10"
        :value="name"
        @keydown.enter="updateName($event.target.value)"
        @blur="updateName($event.target.value)"
      >
    </td>
    <td class="text-center">
      <span v-if="readOnly">{{range}}</span>
      <select
        v-else
        class="text-center"
        style="width: 3.2em; text-align-last: center;"
        @change="$emit('update', {field: 'range', value: parseInt($event.target.value)})"
      >
        <option v-for="item in weaponRangeOptions" :value="item.value" :selected="item.value === weapon.range">{{item.text}}</option>
      </select>
    </td>
    <td>
      <span v-if="readOnly">{{weapon.attacks}}</span>
      <input
        v-else
        type="number"
        min="1" max="99"
        class="text-right"
        style="width: 2.5em;"
        :value="weapon.attacks"
        @change="$emit('update', {field: 'attacks', value: parseInt($event.target.value)})"
      >
    </td>
    <td class="text-left">
      <span v-if="readOnly">{{specialRulesString}}</span>
      <input
        v-else
        size="10"
        :value="specialRulesString"
        @blur="updateRules($event.target.value)"
      >
    </td>
    <td v-if="showCost" class="text-right">{{ cost ? cost.toFixed(1) : '-' }}</td>
    <td v-show="!readOnly" class="text-right">
      <v-icon small color="error" @click="$emit('remove')">mdi-delete</v-icon>
    </td>
  </tr>
</template>

<script>
import { ArmyBook, CalcHelper } from 'opr-army-book-helper';

export default {
  name: 'OprArmyBookUnitWeaponRow',
  props: {
    showCost: Boolean,
    weapon: {
      type: Object,
      required: true,
    },
    armyBookGameSystemSlug: {
      type: String,
      default: 'grimdark-future',
    },
    calculatableUnit: {
      type: Object,
      required: false,
    },
    readOnly: Boolean,
  },
  data() {
    return {
      weaponRangeOptions: [
        { text: 'melee', value: 0 },
        { text: '6"', value: 6 },
        { text: '9"', value: 9 },
        { text: '12"', value: 12 },
        { text: '18"', value: 18 },
        { text: '24"', value: 24 },
        { text: '30"', value: 30 },
        { text: '36"', value: 36 },
        { text: '42"', value: 42 },
        { text: '48"', value: 48 },
      ],
    };
  },
  computed: {
    count() {
      return this.weapon.count || 1;
    },
    name() {
      return this.weapon?.label || this.weapon.name;
    },
    range() {
      return this.weapon.range > 0 ? `${this.weapon.range}"` : 'melee';
    },
    specialRulesString() {
      return this.weapon.specialRules && this.weapon.specialRules.length > 0
        ? this.weapon.specialRules.join(', ')
        : '-';
    },
    cost() {
      return this.$oprPointCalculator ? this.$oprPointCalculator.weaponCost(this.calculatableWeapon, this.calculatableUnit) : null;
    },
    baseCost() {
      return this.$oprPointCalculator ? this.$oprPointCalculator.weaponBaseCost(this.calculatableWeapon) : null;
    },
    calculatableWeapon() {
      return CalcHelper.normalizeWeapon(this.weapon);
    },
  },
  methods: {
    updateName(name) {
      this.$emit('update', {field: 'name', value: name});
      // DEPRECATED
      this.$emit('update', {field: 'label', value: name});
    },
    updateRules(rulesString) {
      let rulesArray = [];
      rulesString.split(',').map(i => i.trim()).forEach(i => {
        if (ArmyBook.Rule.Is(i)) rulesArray.push(i);
      });
      this.$emit('update', {field: 'specialRules', value: rulesArray});
    }
  },
}
</script>

<style scoped>

</style>
