<template>
  <v-card>

    <v-card-title>
      <v-icon large left v-if="unit.size > 1">
        mdi-account-group
      </v-icon>
      <v-icon large left v-else-if="isHero">
        mdi-account-cowboy-hat
      </v-icon>
      <v-icon large left v-else>
        mdi-account
      </v-icon>
      <span class="title font-weight-light">{{ unit.name }}</span>
      <v-spacer></v-spacer>
      <v-avatar color="primary">
        <span class="caption">{{ unit.cost }} pts</span>
      </v-avatar>
    </v-card-title>
    <v-card-subtitle>
      some fancy tex
    </v-card-subtitle>

    <v-card-text>
      <v-layout align-center>
        <v-row>
          <v-col>
            <v-icon large left>mdi-walk</v-icon>
            <span>{{ move }}” / {{ advance }}”</span>
          </v-col>
          <v-col>
            <v-icon color="success" large left>mdi-arm-flex</v-icon>
            <v-avatar size="32">{{ unit.quality }}+</v-avatar>
          </v-col>
          <v-col>
            <v-icon color="blue" large left>mdi-shield</v-icon>
            <v-avatar size="32">{{ unit.defence }}+</v-avatar>
          </v-col>
          <v-col>
            <v-icon color="red" large left v-if="hp > 1">mdi-heart-multiple</v-icon>
            <v-icon large left v-else>mdi-cards-heart</v-icon>
            <v-avatar size="32" dark>{{ hp }}</v-avatar>
          </v-col>
        </v-row>
      </v-layout>
    </v-card-text>

    <!-- SPECIAL RULES -->
    <v-card-text>

      <v-expansion-panels focusable light>
        <v-expansion-panel
          v-for="(item, index) in enrichedSpecialRules" :key="index"
        >
          <v-expansion-panel-header>{{ item.label }}</v-expansion-panel-header>
          <v-expansion-panel-content>
            {{item.effect}}
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>


    </v-card-text>

    <!-- WEAPONS -->
    <v-card-text>
      <v-simple-table light dense>
        <template v-slot:default>
          <thead>
          <tr>
            <th class="text-center">#</th>
            <th class="text-left">Name</th>
            <th class="text-center">Range</th>
            <th class="text-center">A</th>
            <th class="text-left">Special</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in finalEquipment" :key="item.name">
            <td class="text-center">{{ item.amount }}x</td>
            <td class="text-left">{{ item.name }}</td>
            <td class="text-center">
              <span v-if="item.range > 1">{{ item.range }}"</span>
              <span v-else>melee</span>
            </td>
            <td class="text-center">{{ item.attacks }}</td>
            <td class="text-left">{{ item.specialRules.join(', ') }}</td>
          </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>

    <v-card-text>
      <div v-for="(letter, i) in upgrades" :key="i">

        <div v-if="letter">
          <div v-for="(option, i) in letter.options" :key="i">
            <div v-if="option.type === 'replacement'">
              <v-select
                :label="option.hint"
                :items="option.choices"
                item-text="label"
                @change="addItem(option, $event)"
                return-object
              ></v-select>
            </div>
            <div v-if="option.type === 'upgrade-unit-any'">
              <v-checkbox
                v-for="(choice, i) in option.choices" :key="i"
                :label="choice.label"
              ></v-checkbox>
            </div>
          </div>
        </div>

      </div>
    </v-card-text>

  </v-card>
</template>

<script>
import GrimdarkSpecialRules from "~/mixins/GrimdarkSpecialRules";
import OprRulesSnippet from "~/components/OprRulesSnippet";

export default {
  name: "OprUnitCard",
  components: {
    OprRulesSnippet,
  },
  mixins: [
    GrimdarkSpecialRules,
  ],
  props: {
    unit: Object,
    armyUpgrades: Object,
  },
  data() {
    return {
      adjustments: [
        //{ group: 'equipment', modifier: -1, value: 'Assault Rifle' },
        //{ group: 'equipment', modifier: -1, value: 'CCW' },
        //{ group: 'equipment', modifier: 1, value: { "label": "Heavy Chainsaw Sword", "range": 0, "attacks": 6, "specialRules": ["AP(1)"]} },
      ],
      boughtItems: [],
    };
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
    finalEquipment() {
      let baseEquipment = this.unit.equipment;
      this.adjustments.forEach((a) => {
        if (a.modifier > 0) {
          this.boughtItems.push(a.value)
        }
        if (a.modifier < 0) {
          const first = this.boughtItems.find((b) => b.label === a.value);
          console.info(first);
        }
      });

      return [
        ...this.unit.equipment,
        //...this.boughtItems,
      ];
    },
    // Upgrades
    upgrades() {
      return this.unit.upgrades.map((u) => {
        return this.armyUpgrades[u];
      });
    },
  },
  methods: {
    getSpecialRule(name) {
      return this.specialRulesRepository.find((rule) => rule.name === name) || {};
    },
    addItem(option, choice) {
      this.adjustments.push(option.adjustments);
      choice.gain.forEach((g) => this.boughtItems.push({ ...g, amount: 1 }));
    },
  },
}
</script>

<style scoped>

</style>
