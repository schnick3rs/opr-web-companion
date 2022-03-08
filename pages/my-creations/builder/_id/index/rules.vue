<template>
  <v-container>
    <v-row>
      <v-col :cols="12" :md="6">

        <v-btn
          block
          color="success" outlined
          class="mt-2 mb-2"
          @click="openCreateSpecialRuleDialog()"
        >
          <v-icon left>mdi-school</v-icon>
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
                    outlined dense
                    label="Name"
                    v-model="specialRuleEditor.name"
                  >
                  </v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    outlined dense
                    label="Effect"
                    v-model="specialRuleEditor.effect"
                  >
                  </v-textarea>
                </v-col>

                <v-col cols="4">
                  <v-switch
                    outlined dense
                    label="Has Rating"
                    v-model="specialRuleEditor.hasRating"
                  >
                  </v-switch>
                </v-col>

                <v-col cols="4">
                  <v-switch
                    outlined dense
                    label="for units"
                    v-model="specialRuleEditor.forUnit"
                  >
                  </v-switch>
                </v-col>

                <v-col cols="4">
                  <v-switch
                    outlined dense
                    label="for weapons"
                    v-model="specialRuleEditor.forWeapon"
                  >
                  </v-switch>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="Parsable input"
                    persistent-hint hint="Import rules strings from existing army books."
                    dense outlined
                    v-model="specialRuleEditor.importString"
                    append-outer-icon="mdi-import"
                    @click:append-outer="parseSpecialRulesInput"
                    @paste="parseSpecialRulesInput"
                  >
                  </v-text-field>
                </v-col>

              </v-row>

            </v-card-text>
          </opr-dialog>
        </v-dialog>

        <v-alert dense text class="text-center">Army Special Rules</v-alert>

        <template v-for="(rule, index) in armyBookSpecialRules.sort((a,b) => a.name.localeCompare(b.name))">
          <v-list-item
            two-line
            dense
            :key="rule.id"
            :class="{ 'selected': rule.id === selectedSpecialRuleId }"
            @click="openSpecialRuleEditor(rule)"
          >
            <v-list-item-content>
              <v-list-item-title>{{rule.name}}<span v-if="rule.hasRating">(X)</span></v-list-item-title>
              <v-list-item-subtitle>{{rule.description}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-hover v-slot="{ hover }">
                <v-icon v-if="hover" color="error" @click="deleteSpecialRule(rule.id)">mdi-delete-empty</v-icon>
                <v-icon v-else >mdi-delete</v-icon>
              </v-hover>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
        </template>

        <v-alert dense text class="text-center">Common Special Rules</v-alert>

        <template v-for="(rule, index) in commonSpecialRules">
          <v-list-item
            two-line
            dense
            :key="index"
          >
            <v-list-item-content>
              <v-list-item-title>{{rule.name}}<span v-if="rule.hasRating">(X)</span></v-list-item-title>
              <v-list-item-subtitle>{{rule.description}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider></v-divider>
        </template>
      </v-col>
      <v-col :cols="12" :md="6" v-if="selectedSpecialRuleId">
        <opr-army-book-special-rule-editor
          :army-book-id="armyBookId"
          :special-rule-id="selectedSpecialRuleId"
        ></opr-army-book-special-rule-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const OprArmyBookSpecialRuleEditor = () => import(/* webpackChunkName: "OprArmyBookSpecialRuleEditor" */ "~/components/army-book/OprArmyBookSpecialRuleEditor");
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ "~/components/shared/OprDialog");

export default {
  name: 'rules',
  components: {
    OprArmyBookSpecialRuleEditor,
    OprDialog,
  },
  async asyncData({ params, $axios }) {
    const { data } = await $axios.get(`/api/content/special-rules`);
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
      this.$store.dispatch('armyBooks/deleteSpecialRule', {armyBookUid, specialRuleUid });
    },
    hasRating(specialRule) {
      return specialRule?.hasRating || false;
    },
  },
  computed: {
    hasPointCalcRights() {
      return this.$store.state.auth?.user?.isAdmin;
    },
    armyBookGameSystemSlug() {
      return this.$store.getters['armyBooks/armyBookGameSystemSlug'](this.armyBookId);
    },
    armyBookSpecialRules() {
      return this.$store.getters['armyBooks/specialRules'](this.armyBookId);
    },
  }
}
</script>

<<style scoped lang="scss">
.selected {
  border-left: 4px solid var(--v-primary-base);
  background-color: var(--v-secondary-lighten5);

  &.theme--dark {
    background-color: var(--v-accent-darken3);
  }
}
</style>
