<template>
  <div v-if="ships">

    <v-container :class="$vuetify.breakpoint.xsOnly ? 'pa-0' :''">

      <v-row
        :no-gutters="$vuetify.breakpoint.xsOnly"
      >
        <v-col cols="12" :md="8" :lg="6">
          <v-list
            v-if="ships.filter((s) => s.type === typeObj.type).length > 0"
            v-for="(typeObj, i) in types" :key="i"
            class="mb-4 body-2"
            elevation="2"
          >
            <v-list-item
              dense
              class="ma-0"
              style="background-color: hsl(199deg 48% 84%);"
            >
              <v-list-item-content>
                {{typeObj.label}}
              </v-list-item-content>
            </v-list-item>
            <v-divider v-if="ships.filter((s) => s.type === typeObj.type).length > 0"></v-divider>
            <template
              v-for="ship in ships.filter((s) => s.type === typeObj.type)"
            >
              <v-list-item
                two-line
                v-on:dblclick="$router.push(`/warfleets-ftl/build/builder/${fleetId}/ships/${ship.id}`)"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <v-icon v-if="ship.hero" small>mdi-crown</v-icon>
                    <strong v-if="ship.title" >{{ship.title.label}}</strong>
                    {{ship.label}} • <span class="caption text-grey">{{ship.name}}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="caption">{{ship.specialRules.join(', ')}}</v-list-item-subtitle>
                  <v-list-item-subtitle class="caption">{{ship.upgrades.filter((u)=>u).map((u) => u.label).join(', ')}}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider></v-divider>
            </template>
          </v-list>
        </v-col>
      </v-row>

    </v-container>

  </div>
</template>

<script>

export default {
  name: "fleet-view",
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
      immediate: true, // make this watch function is called when component created
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
      }
      this.armyBook = finalArmyBook;
    },
  },
}
</script>

<style scoped>

</style>
