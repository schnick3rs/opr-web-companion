<template>
  <div v-if="fleet">

    <v-container :class="$vuetify.breakpoint.xsOnly ? 'pa-0' :''">

      <v-row
        v-if="fleetViolations.length > 0"
        v-show="$vuetify.breakpoint.smAndUp"
      >
        <v-col>
          <v-alert
            type="error"
            dense text
          >
            <p>Your fleet is not valid:</p>
            <ul>
              <li v-for="violation in fleetViolations">
                {{ violation.label }}
              </li>
            </ul>
          </v-alert>
        </v-col>
      </v-row>

      <v-row
        v-if="legendaryFleet"
        :no-gutters="$vuetify.breakpoint.xsOnly"
      >
        <v-col>
          <v-card>
            <v-card-title>{{legendaryFleet.name}}</v-card-title>
            <v-card-subtitle>Legendary {{fleet.faction}} Fleet</v-card-subtitle>
            <v-card-text>
              <span><strong>Pro:</strong> {{ legendaryFleet.pro }}</span><br/>
              <span><strong>Con:</strong> {{ legendaryFleet.con }}</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row
        v-if="false"
        v-show="$vuetify.breakpoint.smAndUp"
        :no-gutters="$vuetify.breakpoint.xsOnly"
      >
        <v-col cols="4" :md="8" :lg="6" align-self="center">
          <v-btn
            tile block large elevation="4"
            color="success"
            @click="showAddShipDialog = true"
          >Add new ship</v-btn>
        </v-col>
      </v-row>

      <v-row
        :no-gutters="$vuetify.breakpoint.xsOnly"
      >
        <v-col cols="12" :md="6">
          <v-list v-for="(typeObj, i) in types" :key="i" elevation="2" class="mb-4 body-2">
            <v-list-item
              dense
              class="ma-0"
              style="background-color: hsl(199deg 48% 84%);"
            >
              <v-list-item-content>
                {{enrichedShips.filter((s) => s.type === typeObj.type).length}}x {{typeObj.label}}
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon small @click="openAddShip(typeObj.type)"><v-icon color="error">mdi-plus</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
            <v-divider v-if="enrichedShips.filter((s) => s.type === typeObj.type).length > 0"></v-divider>
            <template
              v-for="(ship, i) in enrichedShips.filter((s) => s.type === typeObj.type)"
            >
              <v-list-item
                two-line
                v-on:dblclick="$router.push(`/warfleets-ftl/build/builder/${fleetId}/ships/${ship.id}`)"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <v-icon v-if="ship.hero" small>mdi-crown</v-icon>
                    <strong v-if="ship.title" >{{ship.title.label}}</strong>
                    {{ship.label}} • <span class="caption text--grey">{{ship.faction}}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="caption">{{ship.specialRules.join(', ')}}</v-list-item-subtitle>
                  <v-list-item-subtitle class="caption">{{ship.upgrades.filter((u)=>u).map((u) => u.label).join(', ')}}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action-text>
                  {{ship.totalCost}}pts
                </v-list-item-action-text>
                <v-list-item-action v-if="$vuetify.breakpoint.smAndUp">
                  <v-btn icon @click="openShipEditor(ship)">
                    <v-icon color="success" small>mdi-pencil</v-icon>
                  </v-btn>
                </v-list-item-action>
                <v-list-item-action>
                  <v-menu bottom left offset-y>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        color="primary"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="openShipEditor(ship)">
                        <v-list-item-icon><v-icon color="green">mdi-pencil</v-icon></v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>Edit</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item @click="cloneShip(ship.id)">
                        <v-list-item-icon><v-icon color="blue">mdi-plus-box-multiple</v-icon></v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>Duplicate</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item @click="removeFromRoster(ship.id)">
                        <v-list-item-icon><v-icon color="red">mdi-delete</v-icon></v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>Remove</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </v-list-item-action>
              </v-list-item>
              <v-divider></v-divider>
            </template>
          </v-list>
        </v-col>

        <v-col cols="12" :md="6" v-if="selectedShip">
          <opr-ftl-ship-editor
            :fleet-id="fleetId"
            :ship-id="selectedShip.id"
          ></opr-ftl-ship-editor>
        </v-col>

      </v-row>

    </v-container>

    <!-- showAddShipDialog -->
    <v-dialog
      v-model="showAddShipDialog"
      width="600px"
      scrollable
      :fullscreen="$vuetify.breakpoint.xsOnly"
    >
      <ftl-add-ship-card
        :selectable-ships="selectableShips"
        :remaining-points="fleet.pointLimit - fleet.cost"
        :faction="fleetFactionKey"
        :type-filter="showAddShipDialogTypeFilter"
        @close="showAddShipDialog = false"
        @apply="addNewShip"
      ></ftl-add-ship-card>
    </v-dialog>

    <v-fab-transition>
      <v-tooltip
        v-model="showViolations"
        top
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-show="$vuetify.breakpoint.xsOnly"
            fab
            replace bottom left fixed
            color="error"
            v-bind="attrs"
            v-on="on"
            @click="showViolations = !showViolations"
          >
            <v-icon>mdi-alert</v-icon>
          </v-btn>
        </template>
        <ul>
          <li v-for="violation in fleetViolations">
            {{ violation.label }}
          </li>
        </ul>
      </v-tooltip>
    </v-fab-transition>

    <v-fab-transition>
      <v-btn
        v-show="$vuetify.breakpoint.xsOnly"
        fab
        replace bottom right fixed
        color="success"
        @click="showAddShipDialog = true"
      >
        <v-icon>mdi-rocket-launch</v-icon>
      </v-btn>
    </v-fab-transition>

  </div>
</template>

<script>
import OprUnitCard from "~/components/OprUnitCard";
import OprUnitListItem from "~/components/OprUnitListItem";
import FtlAddShipCard from "@/components/FtlAddShipCard";
import OprFtlShipEditor from "@/components/warfleets-ftl/OprFtlShipEditor";
import OprDialog from "@/components/shared/OprDialog";

export default {
  name: "ftl-fleet-builder",
  layout: 'warfleets-ftl',
  components: {OprDialog, OprFtlShipEditor, FtlAddShipCard, OprUnitListItem, OprUnitCard},
  asyncData({ params }) {
    return {
      fleetId: params.id,
    };
  },
  data() {
    return {
      showViolations: false,
      unitTableHeaders: [
        {
          text: 'Name [Size]',
          value: 'name',
          align: 'start',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Qua',
          value: 'quality',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Def',
          value: 'defence',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Equipment',
          value: 'equipment',
          align: 'start',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Special Rules',
          value: 'specialRules',
          align: 'start',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Upgrades',
          value: 'upgrades',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Cost',
          value: 'cost',
          align: 'end',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Actions',
          value: 'actions',
          align: 'end',
          sortable: false,
        },
      ],
      types: [
        { label: 'Heavy Ships', type: 'Heavy Ship', key: 'heavy' },
        { label: 'Medium Ships', type: 'Medium Ship', key: 'medium' },
        { label: 'Light Ships', type: 'Light Ship', key: 'light' },
        { label: 'Squadrons', type: 'Squadron', key: 'squadron' },
      ],
      armyBook: null,
      roster: [],
      selectedShipId: null,
      tab: null,
      showAddShipDialog: false,
      showAddShipDialogTypeFilter: undefined,
    };
  },
  watch: {
    fleetFactionKey: {
      handler(newValue) {
        console.info(`fleetFactionKey updated ${newValue}`);
        if (newValue) {
          this.loadFactionArmyBook(newValue);
        }
      },
      immediate: true, // make this watch function is called when component created
    },
  },
  computed: {
    fleetRaw() {
      return this.$store.getters['fleets/fleet'](this.fleetId);
    },
    fleet() {
      if (this.fleetRaw) {
        return {
          ...this.fleetRaw,
          cost: this.$store.getters['fleets/cost'](this.fleetRaw.id),
        };
      } else {
        return undefined;
      }
    },
    fleetViolations() {
      if (this.fleetRaw) {
        return this.$store.getters['fleets/fleetViolations'](this.fleetRaw.id);
      }
      return [];
    },
    selectableShips() {
      if (this.armyBook) {
        return this.armyBook.shipClasses.map((ship) => {
          return {
            ...ship,
            specialRules: ship.specialRules.map((specialRuleName) => {
              return this.armyBook.specialRules.find((rule) => rule.label === specialRuleName);
            }),
          }
        });
      }
      return [];
    },
    fleetFactionKey() {
      return this.$store.getters['fleets/fleetKey'](this.fleetId);
    },
    ships() {
      return this.$store.getters['fleets/ships'](this.fleetId);
    },
    enrichedShips() {
      if ( this.armyBook && this.ships && this.ships.length > 0 ) {
        return this.ships.map((ship) => {
          const rawShip = this.armyBook.shipClasses.find((s) => s.key === ship.blueprintKey);
          return {
            ...rawShip,
            ...ship,
            totalCost: this.$store.getters['fleets/shipAllCost'](this.fleet.id, ship.id),
            upgrades: ship.upgrades.map((u) => {
              return u ? this.armyBook.upgrades.find((i) => i.key === u.shipUpgrade) : undefined ;
            }),
            hero: this.armyBook.heroes.find((h) => h.key === ship.hero?.key),
            title: this.armyBook.titles.find((t) => t.key === ship.title?.key),
          };
        });
      } else {
        return [];
      }
    },
    selectedShip() {
      if (this.selectedShipId) {
        return this.$store.getters['fleets/ship'](this.fleetId, this.selectedShipId);
      }
      return undefined;
    },
    legendaryFleet() {
      if (this.fleet && this.armyBook) {
        return this.armyBook.legendaryFleets.find((fleet) => fleet.key === this.fleet.legendary);
      }
      return undefined;
    },
  },
  methods: {
    async loadFactionArmyBook(factionKey) {
      const commonResponse = await this.$axios.get(`/api/warfleets-ftl/common/`);
      let finalArmyBook = commonResponse.data;
      if (factionKey !== 'common') {
        const { data } = await this.$axios.get(`/api/warfleets-ftl/${factionKey}/`);
        finalArmyBook.shipClasses = [ ...finalArmyBook.shipClasses, ...data.shipClasses ];
        finalArmyBook.heroes = [ ...finalArmyBook.heroes, ...data.heroes ];
        finalArmyBook.titles = [ ...finalArmyBook.titles, ...data.titles ];
        finalArmyBook.upgrades = [ ...finalArmyBook.upgrades, ...data.upgrades ];
        finalArmyBook.specialRules = [ ...finalArmyBook.specialRules, ...data.specialRules ];
        finalArmyBook.legendaryFleets = [ ...finalArmyBook.legendaryFleets, ...data.legendaryFleets ];
      }
      this.armyBook = finalArmyBook;
    },
    cloneShip(shipId) {
      this.$store.commit('fleets/cloneShip', { id: this.fleetId, shipId });
    },
    openShipEditor(ship) {
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.selectedShipId = ship.id;
      } else {
        this.$router.push(`/warfleets-ftl/build/builder/${this.fleetId}/ships/${ship.id}`);
      }
    },
    openAddShip(typeFilter = undefined){
      this.showAddShipDialogTypeFilter = typeFilter;
      this.showAddShipDialog = true;
    },
    addNewShip(name, shipClass) {
      const id = this.fleetId;
      const blueprintKey = shipClass.key;
      const cost = shipClass.cost;
      this.$store.commit('fleets/addShip', { id, name, blueprintKey, cost } );
      this.showAddShipDialog = false;
    },
    addToRoster(shipClazz) {
      const id = this.fleetId;
      const blueprintKey = shipClazz.key;
      const name = shipClazz.label;
      const cost = shipClazz.cost;
      this.$store.commit('fleets/addShip', { id, name, blueprintKey, cost } );
    },
    removeFromRoster(shipId) {
      const id = this.fleetId;
      this.$store.commit('fleets/removeShip', { id, shipId } );
    },
    swipe(ship) {
      console.info(`swipe left ${ship.id}`);
    },
  },
}
</script>

<style scoped>

</style>
