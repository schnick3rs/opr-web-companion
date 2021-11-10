<template>
  <div v-if="ships">

    <v-container :class="$vuetify.breakpoint.xsOnly ? 'pa-0' :''">

      <v-row :no-gutters="$vuetify.breakpoint.xsOnly">
        <v-col cols="12" :md="12" :lg="9">

          <div class="pa-4" style="font-family: monospace, monospace; font-size: 1em; border: 1px solid lightgrey">
            <template
              v-for="(typeObj, i) in types"
            >
              <div
                v-for="ship in ships.filter((s) => s.type === typeObj.type)"
              >
              1x {{ ship.label }} {{ ship.type}}
                <template v-if="ship.hero || ship.title" v-show="false">
                  <template>[<template v-if="ship.hero">{{ship.hero.label}}</template>, <template v-if="ship.title">{{ship.title.label}}</template>]</template>
                </template>
                <template v-if="ship.upgrades && ship.upgrades.length > 0">
                (<template v-for="(upgrade, i) in ship.upgrades">{{upgrade.label}}, </template>
                  <template v-for="(weapon, i) in ship.weapons"><template v-if="weapon.key !== 'turret'">{{weapon.label}} ({{weapon.arc}})<template v-if="i<ship.weapons.length-1">, </template></template></template>)
                </template>
                {{ship.costTotal}}pts
              </div>
            </template>

          </div>

        </v-col>
      </v-row>

    </v-container>

  </div>
</template>

<script>

export default {
  name: 'plain',
  layout: 'warfleets-ftl',
  asyncData({ params }) {
    return {
      fleetId: params.id,
    };
  },
  data() {
    return {
      armyBook: null,
      types: [
        { label: 'Heavy Ships', type: 'Heavy Ship' },
        { label: 'Medium Ships', type: 'Medium Ship' },
        { label: 'Light Ships', type: 'Light Ship' },
        { label: 'Squadrons', type: 'Squadron' },
      ],
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
      immediate: true,
    },
  },
  computed: {
    fleetRaw() {
      return this.$store.getters['fleets/fleet'](this.fleetId);
    },
    fleetFactionKey() {
      return this.$store.getters['fleets/fleetKey'](this.fleetId);
    },
    fleetCost() {
      return this.$store.getters['fleets/cost'](this.fleetRaw.id);
    },
    legendaryFleet() {
      if (this.fleetRaw && this.armyBook) {
        return this.armyBook.legendaryFleets.find((fleet) => fleet.key === this.fleetRaw.legendary);
      }
      return undefined;
    },
    shipsRaw() {
      return this.$store.getters['fleets/ships'](this.fleetId);
    },
    ships() {
      if ( this.armyBook && this.shipsRaw && this.shipsRaw.length > 0 ) {
        return this.shipsRaw.map((ship) => {
          const rawShip = this.armyBook.shipClasses.find((s) => s.key === ship.blueprintKey);
          return {
            ...rawShip,
            ...ship,
            costTotal: this.$store.getters['fleets/shipAllCost'](this.fleetId, ship.id),
            weapons: [
              { ...rawShip.turret, arc: 'full' },
              ...ship.upgrades.filter((u) => u).map((u) => {
                return {
                  ...this.armyBook.upgrades.find((i) => i.key === u.shipUpgrade),
                  ...u,
                };
              }).filter((u) => u.type === 'weapon')
            ],
            utilities: ship.upgrades.filter((u) => u).map((u) => {
              return {
                ...this.armyBook.upgrades.find((i) => i.key === u.shipUpgrade),
                ...u,
              };
            }).filter((u) => u.type === 'upgrade'),
            upgrades: ship.upgrades.filter((u) => u).map((u) => {
              return this.armyBook.upgrades.find((i) => i.key === u.shipUpgrade) ;
            }),
            specialRules: rawShip.specialRules?.map((r) => {
              return this.armyBook.specialRules.find((i) => i.label === r);
            }),
            hero: this.armyBook.heroes.find((h) => h.key === ship.hero?.key),
            title: this.armyBook.titles.find((t) => t.key === ship.title?.key),
          };
        });
      } else {
        return [];
      }
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
  },
}
</script>

<style scoped lang="scss">
</style>
