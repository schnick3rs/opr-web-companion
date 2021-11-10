<template>
  <v-list-item @click="$emit('select', unit)">
    <v-list-item-avatar>
      <v-icon large left v-if="unit.size > 1">
        mdi-account-group
      </v-icon>
      <v-icon large left v-else-if="isHero">
        mdi-account-cowboy-hat
      </v-icon>
      <v-icon large left v-else>
        mdi-account
      </v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title>
        <span>{{ unit.name }}</span>
      </v-list-item-title>
      <v-list-item-subtitle>

      </v-list-item-subtitle>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
import GrimdarkSpecialRules from "~/mixins/GrimdarkSpecialRules";
import OprRulesSnippet from "~/components/OprRulesSnippet";

export default {
  name: "OprUnitListItem",
  components: {
    OprRulesSnippet,
  },
  mixins: [
    GrimdarkSpecialRules,
  ],
  props: {
    unit: Object,
  },
  computed: {
    move() {
      return this.hasFast ? 9 : this.hasSlow ? 4 : 6;
    },
    advance() {
      return this.hasFast ? 18: this.hasSlow ? 8 : 9;
    },
    hp() {
      return this.toughRule ? this.toughRule.rating : 1;
    },
    enrichedSpecialRules() {
      return this.unit.specialRules.map((unitRule) => {
        const ruleReference = this.getSpecialRule(unitRule.name);
        return {
          ...ruleReference,
          ...unitRule,
        }
      });
    },
    toughRule() {
      return this.unit.specialRules.find((rule) => rule.name == 'Tough');
    },
    isHero() {
      return this.unit.specialRules.some((rule) => rule.name == 'Hero');
    },
    hasFast() {
      return this.unit.specialRules.some((rule) => rule.name == 'Fast');
    },
    hasSlow() {
      return this.unit.specialRules.some((rule) => rule.name == 'Slow');
    },
  },
  methods: {
    getSpecialRule(name) {
      return this.specialRulesRepository.find((rule) => rule.name === name) || {};
    }
  },
}
</script>

<style scoped>

</style>
