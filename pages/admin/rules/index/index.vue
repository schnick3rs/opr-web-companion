<template>
  <v-row>
    <v-col cols="12" :md="6">
      <v-list dense class="optimal-scroll">
        <v-list-item
          v-for="rule in uniqueRuleNames" :key="rule"
          @click="selectRule(rule)"
        >
          <v-list-item-content>
            <v-list-item-title>{{rule}}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>

    <v-col>
      <v-card>
        <v-card-title>
          {{ selectedRuleName }}
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!unsavedChanges"
            :loading="saving"
            small color="success"
            @click="save"
          >Save</v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text v-if="selectedRuleVariant">

          <v-textarea
            outlined dense
            label="Description"
            v-model="editor.description"
            :disabled="saving"
            counter
            :error="errorMessage"
            :error-messages="errorMessage"
          >
          </v-textarea>

          <v-text-field
            label="cost"
            outlined dense
            :value="selectedRuleVariant.cost"
          ></v-text-field>

          <v-row no-gutters>
            <v-col cols="4">
              <v-select
                dense outlined
                :items="costFunctionNames"
                item-text="name" item-value="name"
              ></v-select>
            </v-col>
            <v-col>
              <v-text-field dense outlined></v-text-field>
            </v-col>
          </v-row>

          <v-checkbox label="with Rating" v-model="editor.hasRating"></v-checkbox>

          <v-chip-group
            v-model="selectedGameSystem"
            mandatory
            active-class="primary--text"
          >
            <v-chip
              v-for="system in gameSystems"
              :key="system.id"
              :value="system.id"
              :disabled="!selectedRuleVariants.some(rule => rule.gameSystemId === system.id)"
              label small
              @click="selectGameSystem(system.id)"
            >
              {{system.aberration}}
            </v-chip>
          </v-chip-group>

        </v-card-text>

        <v-divider></v-divider>

        <v-card-text>
          <div v-if="selectedRuleVariant" v-html="previewRuleSnippet"></div>
        </v-card-text>

      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import {marked} from 'marked';

export default {
  name: "index",
  layout: 'admin',
  async asyncData({ $axios }) {
    const { data: gameSystems } = await $axios.get(`/api/game-systems/`);
    const { data: rulesGf } = await $axios.get(`/api/game-systems/grimdark-future/special-rules`);
    const { data: rulesGff } = await $axios.get(`/api/game-systems/grimdark-future-firefight/special-rules`);
    const { data: rulesAof } = await $axios.get(`/api/game-systems/age-of-fantasy/special-rules`);
    const { data: rulesAofs } = await $axios.get(`/api/game-systems/age-of-fantasy-skirmish/special-rules`);
    const { data: rulesAofr } = await $axios.get(`/api/game-systems/age-of-fantasy-regiments/special-rules`);
    return {
      gameSystems,
      rules: [
        ...rulesGf,
        ...rulesGff,
        ...rulesAof,
        ...rulesAofs,
        ...rulesAofr,
      ],
    };
  },
  data() {
    return {
      selectedRuleName: null,
      selectedRuleVariants: [],
      selectedRuleVariant: undefined,
      editor: {
        description: undefined,
        hasRating: undefined,
        cost: undefined,
        costFunctions: [],
      },
      selectedGameSystem: null,
      selectedRuleVariantDescription: '',
      selectedRuleVariantDescriptionInit: '',
      saving: false,
      errorMessage: null,
      description: null,
      costFunctionNames: [
        // units
        { name: 'addRules', arguments: [] },
        { name: 'properties', arguments: ['unit'] },
        { name: 'unitPropertiesForWeapons', arguments: ['unit', 'weapon'] },
        { name: 'modifyWeapons', arguments: ['weapon'] },
        { name: 'weaponBaseCostMultiplier', arguments: ['weapon'] },
        { name: 'weaponCost', arguments: ['unit'] },
        { name: 'cost', arguments: ['unit|weapon'] },
        { name: 'unitCost', arguments: ['unit'] },
        // weapons
        { name: 'addRules', arguments: [] },
        { name: 'addUnitRules', arguments: [] },
        { name: 'baseCostMultiplier', arguments: ['weapon'] },
        { name: 'newQuality', arguments: ['quality'] },
        { name: 'addQualityCost', arguments: ['weapon'] },
        // Impact?
        { name: 'modifyUnit', arguments: ['unit', 'weapon'] },
      ],
    };
  },
  computed: {
    unsavedChanges() {
      return this.editor.description !== this.selectedRuleVariantDescriptionInit;
    },
    uniqueRuleNames() {
      const rules = [];
      return [ ...new Set(this.rules.map(rule => rule.name).sort()) ];
    },
    previewRuleSnippet() {
      const {name, description, hasRating} = this.selectedRuleVariant;
      const rate = hasRating ? '(X)' : '';
      return marked.parse(`**${name}${rate}:** ${description}`);
    },
  },
  methods: {
    selectRule(ruleName) {
      this.selectedRuleName = ruleName;
      this.selectedRuleVariants = this.rules.filter(rule => rule.name === this.selectedRuleName);
      this.selectGameSystem(this.selectedRuleVariants.map(rule => rule.gameSystemId)[0]);
    },
    selectGameSystem(gameSystemId) {
      this.selectedGameSystem = gameSystemId;
      this.selectedRuleVariant = this.selectedRuleVariants.find(rule => rule.gameSystemId === this.selectedGameSystem);
      this.editor.description = this.selectedRuleVariant.description;
      this.editor.hasRating = this.selectedRuleVariant.hasRating;
      this.editor.cost = this.selectedRuleVariant.cost;
      this.selectedRuleVariantDescriptionInit = this.selectedRuleVariant.description;
    },
    save() {
      const ruleId = this.selectedRuleVariant.id;
      const { description } = this.editor;
      this.saving = true;
      this.$axios.patch(`/api/special-rules/${ruleId}/description`, { value: description })
      .then(() => {
        console.info('patch done');
      })
      .catch((e) => {
        console.warn('patch failed', e.message);
        this.errorMessage = e.message;
      })
      .finally(() => {
        this.saving = false;
      });
    },
  },
}
</script>

<style scoped lang="scss">
.optimal-scroll {
  height: calc(100vh - 250px);
  overflow-y: auto;
}

/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
