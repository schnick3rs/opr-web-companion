<template>
  <div>
    <v-toolbar class="d-print-none" v-if="fleetRaw">
      <v-btn nuxt :to="`/warfleets-ftl/build/`">System Home</v-btn>

      <v-btn class="ml-2" small color="success" nuxt :to="`/warfleets-ftl/build/builder/${fleetRaw.id}`">
        <v-icon left>mdi-pencil</v-icon> Edit
      </v-btn>

    </v-toolbar>
    <div class="page page--din-a-4">

      <h1 class="page__headline">Fleet Roster</h1>

      <v-divider></v-divider>

      <section v-if="fleetRaw">
        <div>
          Fleet Name: {{fleetRaw.name}} - {{ fleetRaw.faction }}
        </div>
        <div>
          Costs: {{fleetCost}} pts.
        </div>
      </section>

      <section v-if="legendaryFleet" class="pb-4">
        <span>Legendary Fleet Effects:</span>
        <div>
          <span><strong>Pro:</strong> {{ legendaryFleet.pro }}</span><br/>
          <span><strong>Con:</strong> {{ legendaryFleet.con }}</span>
        </div>
      </section>

      <section v-if="ships" class="ships-container">
        <template
          v-for="(typeObj, i) in types"
        >
          <v-container
          v-for="ship in ships.filter((s) => s.type === typeObj.type)"
          :key="ship.id"
          class="ship__container"
        >
          <v-row no-gutters>
            <v-col cols="12">
              <div class="text-h6">{{ship.name}}</div>
              <v-divider></v-divider>
              <div>
                {{ship.label}} Class - {{ ship.faction }} {{ ship.type }}
                <span style="float: right">{{ ship.costTotal }}pts.</span>
              </div>
            </v-col>
          </v-row>

          <v-row justify="space-between" class="caption" no-gutters>
            <v-col cols="4">
              <v-icon small>mdi-arrow-right-bold</v-icon>
              <span>Speed</span>
              <div style="display: inline-block">
                <span v-if="typeof ship.speed.move === 'object'">
                  {{ ship.speed.move.base }}” ({{ ship.speed.move.adjusted }}”)
                </span>
                <span v-else>{{ ship.speed.move }}”</span>
                /
                <span v-if="typeof ship.speed.cruise === 'object'">
                  {{ ship.speed.cruise.base }}” ({{ ship.speed.cruise.adjusted }}”)
                </span>
                <span v-else>{{ ship.speed.cruise }}”</span>
              </div>
            </v-col>
            <v-col cols="4">
              <v-icon small>mdi-undo-variant</v-icon>
              <span>Evasion</span>
              <span>{{ ship.defense.evasion }}+</span>
            </v-col>
            <v-col cols="4">
              <v-icon small>mdi-shield</v-icon>
              <span>Toughness</span>
              <span>{{ ship.defense.toughness }}+</span>
            </v-col>
          </v-row>

          <!-- special rules -->
          <v-row
            no-gutters
            v-if="ship.hero || ship.title || ship.specialRules.length > 0 "
            class="caption"
          >
            <v-col cols="12" v-if="ship.hero" class="pb-2">
              <strong>{{ ship.hero.label}} (Hero):</strong> {{ship.hero.effect}}
            </v-col>
            <v-col cols="12" v-if="ship.title" class="pb-2">
              <strong>{{ ship.title.label}} (Title):</strong> {{ship.title.effect}}
            </v-col>
            <v-col cols="12" v-for="(specialRules, i) in ship.specialRules" :key="i" class="pb-2">
              <strong>{{specialRules.label}}:</strong> {{specialRules.effect}}
            </v-col>
          </v-row>

          <!-- Weapons -->
          <v-row no-gutters>
            <v-col>
              <v-simple-table light dense>
                <template v-slot:default>
                  <thead>
                  <tr>
                    <th class="text-left">Name</th>
                    <th class="text-center">Arc</th>
                    <th class="text-center">Range</th>
                    <th class="text-center">Att</th>
                    <th class="text-left">Str</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(item, index) in ship.weapons" :key="index">
                    <td class="text-left">{{ item.label }}</td>
                    <td class="text-center">
                      <v-icon v-if="item.arc==='full'">mdi-circle-slice-8</v-icon>
                      <v-icon v-else-if="item.arc==='front'" :style="{transform: `rotate(-45deg)`}">mdi-circle-slice-2</v-icon>
                      <opr-ftl-arc-icon v-else-if="item.arc==='sides'" />
                      <v-icon v-else-if="item.arc==='rear'" :style="{transform: `rotate(-45deg) scale(-1)`}">mdi-circle-slice-2</v-icon>
                      <v-icon v-else>mdi-circle-outline</v-icon>
                    </td>
                    <td class="text-center">{{ item.range }}"</td>
                    <td class="text-center">{{ item.attacks }}</td>
                    <td class="text-center">
                      <span v-if="typeof item.strength === 'object'">
                        {{ item.strength.base }} ({{ item.strength.adjusted }})
                      </span>
                      <span v-else>{{ item.strength }}</span>
                    </td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-col>
          </v-row>

          <v-row no-gutters v-if="ship.category === 'Squadron'" >
            <v-col style="text-align: center;">
              <v-icon v-for="count in 3" :key="count">mdi-border-all-variant</v-icon>
              <v-icon v-if="ship.specialRules.find((r) => r.key === 'heavy')">mdi-border-all-variant</v-icon>
              <v-icon v-if="ship.specialRules.find((r) => r.key === 'heavy')">mdi-border-all-variant</v-icon>
            </v-col>
          </v-row>

          <!-- Upgrades -->
          <v-row no-gutters class="caption">
            <v-col>
              <v-row v-for="(utility, i) in ship.upgrades" :key="i" class="mb-3" no-gutters justify-sm="space-between">
                <v-col>
                  <strong>{{utility.label}}:</strong>
                  <span v-if="utility.type === 'upgrade'">{{utility.effect}}</span>
                  <span v-if="utility.type === 'weapon'">{{utility.special}}</span>
                </v-col>
                <v-col cols="3" style="text-align: right;">
                  <v-icon v-for="count in 3" :key="count">mdi-border-all-variant</v-icon>
                  <v-icon v-if="utility.key === 'armored-plating'">mdi-border-all-variant</v-icon>
                  <v-icon v-if="utility.key === 'armored-plating'">mdi-border-all-variant</v-icon>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

        </v-container>
        </template>
      </section>

    </div>
  </div>
</template>

<script>
import OprFtlArcIcon from "@/components/warfleets-ftl/OprFtlArcIcon";
export default {
  name: 'print',
  components: {OprFtlArcIcon},
  layout: 'print',
  asyncData({ params }) {
    return {
      fleetId: params.id,
    };
  },
  data() {
    return {
      armyBook: undefined,
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
          const rawShip = JSON.parse(JSON.stringify(this.armyBook.shipClasses.find((s) => s.key === ship.blueprintKey)));
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
        }).map(ship => {
          ship.upgrades.filter(u => u).forEach(upgrade => {
            if (upgrade.modifiers) {
              upgrade.modifiers.forEach(mod => {
                console.info(`[${ship.name}::${upgrade.key}] Apply ${mod.stat} with value ${mod.modifier}.`);
                switch (mod.stat) {
                  case 'move':
                  case 'cruise':
                    ship.speed[mod.stat] = {
                      base: ship.speed[mod.stat],
                      adjusted: ship.speed[mod.stat] + mod.modifier,
                      modifiers: [{ modifier: mod.modifier, source: upgrade.label }],
                    };
                    break;
                  case 'turret.strength':
                    console.info(`[${ship.name}::${upgrade.key}] adjust ${ship.turret.strength}.`);
                    ship.turret.strength = {
                      base: ship.turret.strength,
                      adjusted: ship.turret.strength + mod.modifier,
                      modifiers: [{ modifier: mod.modifier, source: upgrade.label }],
                    };
                    ship.weapons = ship.weapons.map(weapon => {
                      if (weapon.key === 'turret') {
                        weapon.strength = ship.turret.strength;
                      }
                      return weapon;
                    });
                    break;
                  default:
                    console.info(`Modifier ${mod.stat} not handled.`);
                }
              });
            }
          });
          return ship;
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


.page {
//  page-break-inside: avoid;

  &--din-a-4 {
    width: 220mm;
    overflow: hidden;
    //margin: 5mm 10mm;
    padding: 5mm 10mm;
    font-family: Calibri, serif;
  }

  &--warfleets-ftl {
    height: 296mm;
    background-image: url('/img/border-warfleets-ftl.png');
    padding: 10mm 10mm;
    background-size: auto;
    background-position: center;
    font-family: WarfleetsText, sans-serif;
    & .page-headline {
      font-family: WarfleetsTitle, sans-serif;
    }
  }
}

.ship {
  &__container {
    display: inline-grid;
    width: 50%;
    border: lightgrey 1px dashed;
  }
}

@media print {

  .ships-container {

  }

  .ship__container {
    page-break-inside: avoid;
  }
}

@media screen {
  .page--din-a-4 {
    border-style: dashed;
    border-width: 1px;
  }
}


</style>
