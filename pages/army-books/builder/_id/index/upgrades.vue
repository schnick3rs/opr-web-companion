<template>
  <v-container>
    <v-row>
      <v-col :cols="12" :md="6">
        <v-btn
          block
          color="success" outlined
          class="mt-2 mb-2"
          @click="openAddUpgradePackageDialog()"
        >
          <v-icon left>mdi-auto-upload</v-icon>
          New Upgrade Package
          <v-dialog
            v-model="showAddUpgradePackageDialog"
            width="600px"
            scrollable
            :fullscreen="$vuetify.breakpoint.xsOnly"
          >
            <opr-dialog
              title="Create upgrade package"
              @apply="addUpgradePackage"
              @close="showAddUpgradePackageDialog = false"
            >
              <v-card-text>
                <v-row>

                  <v-col cols="12">
                    <v-text-field
                      v-model="createUpgradePackageEditor.hint"
                      label="Internal Hint"
                      outlined dense autofocus
                      persistent-hint hint="A short note summarizing the package"
                      @keypress.enter="addUpgradePackage"
                    ></v-text-field>
                  </v-col>

                  <v-col cols="12">
                    <v-alert type="info" dense text>
                      <span>Creates an empty upgrade package that can be filled with different options.</span>
                    </v-alert>
                  </v-col>

                </v-row>

              </v-card-text>
            </opr-dialog>
          </v-dialog>
        </v-btn>

        <v-list-item-group v-model="selected" active-class="selected">
          <template v-for="(upgradePackage, index) in sortedUpgradePackages">
            <v-list-item
              dense
              two-line
              :key="upgradePackage.uid"
              @click="openUpgradePackageEditor(upgradePackage)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  {{ upgradePackage.hint }}
                </v-list-item-title>
                <v-list-item-subtitle>{{upgradePackage.sections.length}} Sections, used by {{unitsUtilizingUpgradePackage(upgradePackage.uid).length}} units</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-hover v-slot="{ hover }">
                  <v-icon v-if="hover" color="error" @click="deleteUpgradePackage(upgradePackage.uid)">mdi-delete-empty</v-icon>
                  <v-icon v-else >mdi-delete</v-icon>
                </v-hover>
              </v-list-item-action>
            </v-list-item>
            <v-divider></v-divider>
          </template>
        </v-list-item-group>

      </v-col>
      <v-col :cols="12" :md="6" v-if="selectedUpgradePackageId">
        <opr-army-book-upgrade-package-editor
          :army-book-id="armyBookId"
          :upgrade-package-id="selectedUpgradePackageId"
        ></opr-army-book-upgrade-package-editor>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const OprArmyBookUpgradePackageEditor = () => import(/* webpackChunkName: "OprArmyBookUpgradePackageEditor" */ "~/components/army-book/OprArmyBookUpgradePackageEditor");
const OprDialog = () => import(/* webpackChunkName: "OprDialog" */ "~/components/shared/OprDialog");

export default {
  name: 'upgrades',
  components: {
    OprArmyBookUpgradePackageEditor,
    OprDialog,
  },
  async asyncData({ params }) {
    return {
      armyBookId: params.id,
    };
  },
  data() {
    return {
      selected: [],
      selectedUpgradePackageId: undefined,
      /* UPGRADE CREATION */
      showAddUpgradePackageDialog: false,
      createUpgradePackageEditor: {
        letter: '',
        letterLocked: true,
        label: '',
        hint: '',
      },
      newUpgradePackage: {
        loseInput: undefined,
        models: {
          type: undefined,
          limit: undefined,
          amount: 1,
          lose: [],
          modifies: [],
        },
        items: {
          type: [
            { text: 'Replace equipment', value: 'replace' },
            { text: 'Upgrade models', value: 'upgrade-models' },
            { text: 'Upgrade unit', value: 'upgrade-unit' },
            { text: 'Weapon Attachment', value: 'attachment' },
          ],
          limit: [
            { text: 'One', value: 'one' },
            { text: 'Any', value: 'any' },
            { text: 'All', value: 'all' },
            { text: 'Up to', value: 'limited' },
          ],
        }
      },
    };
  },
  methods: {
    openAddUpgradePackageDialog(){
      this.createUpgradePackageEditor.letterLocked = true;
      this.createUpgradePackageEditor.hint = '';
      this.showAddUpgradePackageDialog = true;
    },
    addUpgradePackage(){
      const armyBookUid = this.armyBookId;
      const { hint, letter } = this.createUpgradePackageEditor;
      this.$store.dispatch('armyBooks/createUpgradePackage', { armyBookUid, hint, letter })
        .then(upgradePackage => this.openUpgradePackageEditor(upgradePackage));
      this.showAddUpgradePackageDialog = false;
      this.createUpgradePackageEditor.hint = '';
    },
    deleteUpgradePackage(upgradePackageUid) {
      const armyBookUid = this.armyBookId;
      this.selectedUpgradePackageId = undefined;
      this.$store.dispatch('armyBooks/deleteUpgradePackage', { armyBookUid, upgradePackageUid });
    },
    openUpgradePackageEditor(upgradePackage) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedUpgradePackageId = upgradePackage.uid;
      } else {
        this.$router.push(`/army-books/builder/${this.armyBookId}/upgrades/${upgradePackage.uid}`);
      }
    },
    unitsUtilizingUpgradePackage(upgradePackageId) {
      if (this.units) {
        return this.units
          .filter(unit => unit.upgrades.includes(upgradePackageId))
          .map(unit => unit.name);
      }
      return [];
    },
  },
  computed: {
    armyBookUpgradePackages() {
      return this.$store.getters['armyBooks/upgradePackages'](this.armyBookId);
    },
    units() {
      return this.$store.getters['armyBooks/units'](this.armyBookId);
    },
    upgradePackagesIds() {
      const upgradePackagesIds = [];
      if (this.units) {
        this.units
          .filter(unit => unit.upgrades) // only units with upgrades
          .forEach(unit => upgradePackagesIds.push(...unit.upgrades));
      }
      return [...new Set(upgradePackagesIds)];
    },
    sortedUpgradePackages() {
      const upgradePackages = [];
      const allPackages = [...this.armyBookUpgradePackages];
      this.upgradePackagesIds.forEach(upgradePackageId => {
        const index = allPackages.findIndex(up => up.uid === upgradePackageId);
        if (index >= 0) {
          const found = allPackages.splice(index, 1);
          upgradePackages.push(...found);
        } else {
          console.info(`no package found for ${upgradePackageId}`);
        }
      });
      upgradePackages.push(...allPackages);
      return upgradePackages;
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
