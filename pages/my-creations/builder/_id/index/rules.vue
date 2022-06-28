<template>
  <v-container>
    <v-row>
      <v-col :cols="12" :md="6">
        <v-btn
          block
          color="success"
          outlined
          class="mt-2 mb-2"
          @click="openCreateSpecialRuleDialog()"
        >
          <v-icon left>
            mdi-school
          </v-icon>
          new army special rule
        </v-btn>

        <v-dialog
          v-model="showCreateSpecialRuleDialog"
          width="600px"
          scrollable
          :fullscreen="$vuetify.breakpoint.xsOnly"
        >
          <opr-dialog
            title="Create new army special rule"
            @apply="createNewSpecialRule()"
            @close="showCreateSpecialRuleDialog = false"
          >
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="specialRuleEditor.name"
                    outlined
                    dense
                    label="Name"
                  />
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="specialRuleEditor.effect"
                    outlined
                    dense
                    label="Effect"
                  />
                </v-col>

                <v-col cols="4">
                  <v-switch
                    v-model="specialRuleEditor.hasRating"
                    outlined
                    dense
                    label="Has Rating"
                  />
                </v-col>

                <v-col cols="4">
                  <v-switch
                    v-model="specialRuleEditor.forUnit"
                    outlined
                    dense
                    label="for units"
                  />
                </v-col>

                <v-col cols="4">
                  <v-switch
                    v-model="specialRuleEditor.forWeapon"
                    outlined
                    dense
                    label="for weapons"
                  />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="specialRuleEditor.importString"
                    label="Parsable input"
                    persistent-hint
                    hint="Import rules strings from existing army books."
                    dense
                    outlined
                    append-outer-icon="mdi-import"
                    @click:append-outer="parseSpecialRulesInput"
                    @paste="parseSpecialRulesInput"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </opr-dialog>
        </v-dialog>

        <v-alert dense text class="text-center">
          Army Special Rules
        </v-alert>

        <template v-for="(rule) in armyBookSpecialRules.sort((a,b) => a.name.localeCompare(b.name))">
          <v-list-item
            :key="rule.id"
            two-line
            dense
            :class="{ 'selected': rule.id === selectedSpecialRuleId }"
            @click="openSpecialRuleEditor(rule)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ rule.name }}<span v-if="rule.hasRating">(X)</span></v-list-item-title>
              <v-list-item-subtitle>{{ rule.description }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-hover v-slot="{ hover }">
                <v-icon v-if="hover" color="error" @click="deleteSpecialRule(rule.id)">
                  mdi-delete-empty
                </v-icon>
                <v-icon v-else>
                  mdi-delete
                </v-icon>
              </v-hover>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </template>

        <v-alert dense text class="text-center">
          Common Special Rules
        </v-alert>

        <template v-for="(rule, index) in commonSpecialRules">
          <v-list-item
            :key="index"
            two-line
            dense
          >
            <v-list-item-content>
              <v-list-item-title>{{ rule.name }}<span v-if="rule.hasRating">(X)</span></v-list-item-title>
              <v-list-item-subtitle>{{ rule.description }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
        </template>
      </v-col>
      <v-col v-if="selectedSpecialRuleId" :cols="12" :md="6">
        <opr-army-book-special-rule-editor
          :army-book-id="armyBookId"
          :special-rule-id="selectedSpecialRuleId"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const OprArmyBookSpecialRuleEditor = () => import(/* webpackChunkName: "OprArmyBookSpecialRuleEditor" */ '~/components/army-book/OprArmyBookSpecialRuleEditor');
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ '~/components/shared/OprDialog');

export default {
  name: 'Rules',
  components: {
    OprArmyBookSpecialRuleEditor,
    OprDialog,
  },
  async asyncData({ params, $axios }) {
    const { data } = await $axios.get('/api/content/special-rules');
    return {
      commonSpecialRules: data,
      armyBookId: params.id,
    };
  },
  data() {
    return {
      commonSpecialRules: [],
      selectedSpecialRuleId: undefined,
      /* SPECIAL RULE CREATION */
      showCreateSpecialRuleDialog: false,
      specialRuleEditor: {
        name: 'Eelish evasion',
        effect: 'Roll 4+ to evade an hit',
        forUnit: true,
        forWeapon: true,
        hasRating: false,
        importString: '',
      },
    };
  },
  computed: {
    armyBookGameSystemSlug() {
      return this.$store.getters['armyBooks/armyBookGameSystemSlug'](this.armyBookId);
    },
    armyBookSpecialRules() {
      return this.$store.getters['armyBooks/specialRules'](this.armyBookId);
    },
  },
  methods: {
    parseSpecialRulesInput(event = undefined) {
      let parsableString = this.specialRuleEditor.importString;
      if (event) {
        parsableString = event.clipboardData.getData('text/plain');
      }
      const { groups } = /^(?<name>[\w -]+): (?<effect>.*)$/gm.exec(parsableString);
      this.specialRuleEditor.name = groups.name;
      this.specialRuleEditor.effect = groups.effect;
      this.specialRuleEditor.importString = '';
      if (event) {
        this.createNewSpecialRule();
      }
    },
    openSpecialRuleEditor(specialRule) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUnitId = undefined;
        this.selectedUpgradePackageId = undefined;
        this.selectedSpecialRuleId = specialRule.id;
        this.selectedSpellId = undefined;
      } else {
        this.$router.push(`/my-creations/builder/${this.armyBookId}/special-rules/${specialRule.id}`);
      }
    },
    openCreateSpecialRuleDialog() {
      this.specialRuleEditor.importString = '';
      this.showCreateSpecialRuleDialog = true;
    },
    createNewSpecialRule() {
      const armyBookUid = this.armyBookId;
      const { name, effect, hasRating, forUnit, forWeapon } = this.specialRuleEditor;
      this.$store.dispatch('armyBooks/createSpecialRule', { armyBookUid, name, effect, hasRating, forUnit, forWeapon });
      this.showCreateSpecialRuleDialog = false;
    },
    deleteSpecialRule(specialRuleUid) {
      const armyBookUid = this.armyBookId;
      this.$store.dispatch('armyBooks/deleteSpecialRule', { armyBookUid, specialRuleUid });
    },
    hasRating(specialRule) {
      return specialRule?.hasRating || false;
    },
  }
};
</script>

<style scoped lang="scss">
.selected {
  border-left: 4px solid var(--v-primary-base);
  background-color: var(--v-secondary-lighten5);

  &.theme--dark {
    background-color: var(--v-accent-darken3);
  }
}
</style>
