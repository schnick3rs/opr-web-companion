<template>
  <v-container>
    <v-row>

      <v-col :cols="12" :md="6">
        <v-btn
          block
          color="success" outlined
          class="mt-2 mb-2"
          @click="openCreateSpellDialog()"
        >
          <v-icon left>mdi-lightning-bolt</v-icon>
          new Spell
        </v-btn>

        <v-alert type="info" dense text v-show="!hasRecommendedSpells">
          An army usually has 2 spells of those thresholds: 4+, 5+, 6+.
        </v-alert>

        <v-dialog
          v-model="showCreateSpellDialog"
          width="600px"
          scrollable
          :fullscreen="$vuetify.breakpoint.xsOnly"
        >
          <opr-dialog
            title="Create new spell"
            @apply="createNewSpell()"
            @close="showCreateSpellDialog = false"
          >
            <v-card-text>
              <v-row>
                <v-col cols="8">
                  <v-text-field
                    outlined dense
                    label="Name"
                    v-model="spellEditor.name"
                  >
                  </v-text-field>
                </v-col>

                <v-col cols="4">
                  <v-select
                    outlined dense
                    label="Treshold"
                    v-model="spellEditor.threshold"
                    :items="spellEditor.thresholdOptions"
                  >
                  </v-select>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    outlined dense
                    label="Spell effect"
                    v-model="spellEditor.effect"
                  >
                  </v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    label="Parsable input"
                    persistent-hint hint="Import spell strings from existing army books."
                    dense outlined
                    v-model="spellEditor.importString"
                    append-outer-icon="mdi-import"
                    @click:append-outer="parseInput"
                    @paste="parseInput"
                  >
                  </v-text-field>
                </v-col>

              </v-row>

            </v-card-text>
          </opr-dialog>
        </v-dialog>

        <template v-for="(spell, index) in armyBookSpells">
          <v-list-item
            two-line
            :key="`${index}-${spell.id}`"
            :class="{ 'selected': spell.id === selectedSpellId }"
            @click="openSpellEditor(spell)"
          >
            <v-list-item-content>
              <v-list-item-title>{{spell.name}} ({{spell.threshold}}+)</v-list-item-title>
              <v-list-item-subtitle>{{spell.effect}}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-hover v-slot="{ hover }">
                <v-icon v-if="hover" color="error" @click="deleteSpell(spell.id)">mdi-delete-empty</v-icon>
                <v-icon v-else >mdi-delete</v-icon>
              </v-hover>
            </v-list-item-action>
          </v-list-item>
          <v-divider></v-divider>
        </template>
      </v-col>

      <v-col :cols="12" :md="6" v-if="selectedSpellId">
        <opr-army-book-spell-editor
          :army-book-id="armyBookId"
          :spell-id="selectedSpellId"
        ></opr-army-book-spell-editor>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
const OprArmyBookSpellEditor = () => import(/* webpackChunkName: "OprArmyBookSpellEditor" */ "~/components/army-book/OprArmyBookSpellEditor");
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ "~/components/shared/OprDialog");

export default {
  name: 'spells',
  components: {
    OprArmyBookSpellEditor,
    OprDialog,
  },
  async asyncData({ params }) {
    return {
      armyBookId: params.id,
    };
  },
  data() {
    return {
      selectedSpellId: null,
      armySpells: [
        { name: 'Summon eels', threshold: 4, effect: 'Summon a lot of eels...' },
      ],
      /* SPELL CREATION */
      showCreateSpellDialog: false,
      spellEditor: {
        name: 'Eel Slice!',
        threshold: 4,
        thresholdOptions: [
          { text: '2+', value: 2 },
          { text: '3+', value: 3 },
          { text: '4+', value: 4 },
          { text: '5+', value: 5 },
          { text: '6+', value: 6 },
        ],
        effect: 'Magic eels entangle the enemy...',
        importString: '',
      },
    };
  },
  methods: {
    openCreateSpellDialog() {
      this.spellEditor.importString = '';
      this.showCreateSpellDialog = true;
    },
    createNewSpell() {
      const armyBookUid = this.armyBookId;
      const { name, effect, threshold } = this.spellEditor;
      this.$store.dispatch('armyBooks/createSpell', { armyBookUid, name, effect, threshold });
      this.showCreateSpellDialog = false;
    },
    openSpellEditor(spell) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUnitId = undefined;
        this.selectedUpgradePackageId = undefined;
        this.selectedSpecialRuleId = undefined;
        this.selectedSpellId = spell.id;
      } else {
        this.$router.push(`/army-books/builder/${this.armyBookId}/spells/${spell.id}`);
      }
    },
    deleteSpell(spellUid) {
      const armyBookUid = this.armyBookId;
      this.$store.dispatch('armyBooks/deleteSpell', {armyBookUid, spellUid });
    },
    parseInput(event = undefined) {
      let parsableString = this.spellEditor.importString;
      if (event) {
        parsableString = event.clipboardData.getData('text/plain');
      }
      const { groups } = /^(?<name>[\w -]+)\(?(?<threshold>[\w\d])\+\): (?<effect>.*)$/gm.exec(parsableString);
      this.spellEditor.name = groups.name;
      this.spellEditor.threshold = parseInt(groups.threshold);
      this.spellEditor.effect = groups.effect;
      this.spellEditor.importString = '';
      if (event) {
        this.createNewSpell();
      }
    },
  },
  computed: {
    armyBookSpells() {
      return this.$store.getters['armyBooks/spells'](this.armyBookId);
    },
    hasRecommendedSpells() {
      let overcommitment = false;
      if (this.armyBookSpells) {
        let expected = [4, 4, 5, 5, 6, 6];
        this.armyBookSpells.map(s => s.threshold).forEach(t => {
          const index = expected.indexOf(t);
          console.info(expected)
          if (index > -1) {
            expected.splice(index, 1);
          } else {
            overcommitment = true;
          }
        });
        return expected.length === 0 && !overcommitment;
      }
      return false;
    },
  },
}
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
