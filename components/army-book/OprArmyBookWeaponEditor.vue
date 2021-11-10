<template>
  <v-row>
    <v-col cols="12" :md="6">
      <v-text-field
        outlined dense
        label="Name"
        v-model="value.name"
        @blur="guessWeaponStats(value.name)"
      >
      </v-text-field>
    </v-col>

    <v-col cols="6" :md="3">
      <v-select
        outlined dense
        label="Range"
        v-model="value.range"
        :items="weaponRangeOptions"
      >
      </v-select>
    </v-col>

    <v-col cols="6" :md="3">
      <v-text-field
        outlined dense
        label="Attacks"
        v-model="value.attacks"
        type="Number"
      >
      </v-text-field>
    </v-col>

    <v-col cols="12">
      <v-chip-group>
        <v-chip
          label close
          v-for="(rule, index) in value.specialRules"
          :key="index"
          @click:close="removeSpecialRule(index)"
        >
          {{rule.name}}<span v-if="rule.rating">({{rule.rating}})</span>
        </v-chip>
      </v-chip-group>
    </v-col>

    <v-col cols="8" :md="6">
      <v-select
        outlined dense
        label="Special Rules"
        v-model="specialRule"
        @change="specialRuleRating = specialRule.defaultRating"
        :items="specialRulesItems"
        item-text="name"
        item-value="key"
        return-object
      ></v-select>
    </v-col>

    <v-col cols="4" :md="3">
      <v-text-field
        outlined dense
        type="Number"
        label="Rating"
        v-model="specialRuleRating"
        :disabled="!enableRating"
      ></v-text-field>
    </v-col>

    <v-col cols="12" :md="3">
      <v-btn
        color="success"
        outlined block
        :disabled="specialRule === undefined"
        @click="addSpecialRule"
      >Add</v-btn>
    </v-col>

  </v-row>
</template>

<script>
export default {
  name: 'OprArmyBookWeaponEditor',
  props: {
    value: Object,
    specialRulesItems: Array,
  },
  data() {
    return {
      name: 'Eel Rifle',
      range: 24,
      attacks: 1,
      specialRules: [],
      //
      specialRule: undefined,
      specialRuleRating: undefined,
      //
      weaponRangeOptions: [
        { text: 'melee', value: 0 },
        { text: '6"', value: 6 },
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
    enableRating() {
      return this.specialRule?.hasRating || false;
    },
  },
  methods: {
    guessWeaponStats(name) {
      if (name === 'CCW') {
        this.value.range = 0;
        this.value.attcks = 1;
      }
      if (name.indexOf('Pistol') >= 0) {this.value.range = 12;}
      if (name.indexOf('Carbine') >= 0) {this.value.range = 18;}
      if (name.indexOf('Rifle') >= 0) {this.value.range = 24;}

      if (name === 'Pistol') {this.value.attcks = 1;}
      if (name === 'Carbine') {this.value.attcks = 2;}
      if (name === 'Rifle') {this.value.attcks = 1;}
    },
    addSpecialRule() {
      const { key, name, hasRating } = this.specialRule;
      const rule = {
        key,
        name,
        rating: hasRating ? this.specialRuleRating : undefined,
      };
      this.value.specialRules.push(rule);
    },
    removeSpecialRule(index) {
      this.value.specialRules.splice(index, 1);
    },
  },
}
</script>
