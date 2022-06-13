<template>
  <div>
    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange ligthen-2"
        />
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="specialRule.name"
              outlined
              dense
              label="Name"
              persistent-hint
              hint="The raw name without (x)"
              @input="updateField('name', specialRule.name)"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="specialRule.description"
              outlined
              dense
              label="Description"
              persistent-hint
              messages="Show hints"
              @input="updateField('description', specialRule.description)"
            >
              <template #message>
                Use <a href="https://marked.js.org/demo/" target="_blank">markdown</a><v-icon x-small>
                  mdi-launch
                </v-icon>, e.g.: **bold** __italic__
              </template>
            </v-textarea>
          </v-col>

          <v-col cols="4">
            <v-switch
              v-model="specialRule.hasRating"
              outlined
              dense
              label="Has Rating"
              disabled
            />
          </v-col>

          <v-col cols="8">
            <v-text-field
              v-model="specialRule.defaultRating"
              outlined
              dense
              label="Default Rating"
              type="Number"
              persistent-hint
              hint="usually 1 or 3 as the starting / default rating"
              :disabled="!specialRule.hasRating"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-text>
        You can set a flat cost per model for this rule.
        This overwrites cost definitions from the CALC for a rule with the same name.
      </v-card-text>

      <v-card-text>
        <v-row>
          <v-col :cols="12">
            <v-text-field
              v-model="cost"
              outlined
              dense
              persistent-hint
              hint="Write single integer OR space separated function shortcode."
              clearable
              append-icon="mdi-content-save"
              :append-outer-icon="costIsNoNumber ? `mdi-code-tags` : `mdi-numeric`"
              @click:clear="updateField('cost', null)"
              @click:append="updateCostField"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="$auth.hasScope('admin')">
        <v-divider />
        <v-card-text style="overflow: auto">
          <pre>{{ specialRule }}</pre>
        </v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'OprArmyBookSpecialRuleEditor',
  props: {
    armyBookId: String,
    specialRuleId: String,
  },
  data() {
    return {
      cost: null,
    };
  },
  computed: {
    loading() {
      return !(this.armyBook && this.specialRule);
    },
    elevation() {
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    armyBook() {
      return this.$store.getters['armyBooks/armyBook'](this.armyBookId);
    },
    specialRule() {
      return this.$store.getters['armyBooks/specialRule'](this.armyBookId, this.specialRuleId);
    },
    costIsNoNumber() {
      return isNaN(this.cost);
    },
  },
  watch: {
    specialRule: {
      handler(rule) {
        if (rule) {
          this.cost = rule.cost;
        }
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  methods: {
    saveDebounced() {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => { this.save(); }, 500);
    },
    save() {
      const armyBookUid = this.armyBookId;
      const specialRuleId = this.specialRuleId;
      this.$store.dispatch('armyBooks/updateSpecialRule', { armyBookUid, specialRuleId });
    },
    updateField(field, value) {
      const id = this.armyBookId;
      const { specialRuleId } = this;
      this.$store.commit('armyBooks/setSpecialRuleField', { id, specialRuleId, field, value });
      this.saveDebounced();
    },
    updateCostField() {
      const cost = isNaN(this.cost) ? this.cost : parseInt(this.cost);
      this.updateField('cost', cost);
    },
  },
};
</script>

<style scoped>

</style>
