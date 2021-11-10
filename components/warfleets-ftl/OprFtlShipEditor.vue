<template>
  <div>
    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="blue ligthen-2"
        ></v-progress-circular>
      </v-card-title>
    </v-card>
    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-title>
        <div v-if="showShipNameEditor">
          <v-text-field
            autofocus
            v-model="shipNameEditorName"
            dense
            outlined
            prepend-icon="mdi-undo"
            @click:prepend="showShipNameEditor = false"
            @keydown.esc="showShipNameEditor = false"
            append-outer-icon="mdi-content-save"
            @click:append-outer="shipNameEditorSave"
            @keydown.enter="shipNameEditorSave"
          ></v-text-field>
        </div>
        <div v-else>
          {{ ship.name }}
          <v-btn
            class="ml-2" x-small outlined color="success"
            @click="openShipNameEditor"
          >
            <v-icon left>mdi-pencil</v-icon>edit name
          </v-btn>
        </div>
        <v-spacer></v-spacer>
        {{ shipCost }} pts
      </v-card-title>

      <v-card-subtitle>
        {{ship.label }} Class • {{ ship.faction }} {{ ship.type}}
      </v-card-subtitle>

      <v-card-subtitle>
        <v-alert
          type="error"
          dense text
          v-if="ship.violations.length > 0"
        >
          <ul>
            <li v-for="violation in ship.violations">
              {{ violation.label }}
            </li>
          </ul>
        </v-alert>
      </v-card-subtitle>

      <v-card-text>
        <v-layout align-center>
          <v-row justify="space-between" no-gutters>
            <v-col cols="4">
              <v-icon>mdi-arrow-right-bold</v-icon>
              <span>Speed</span>
              <span style="display: inline-block">{{ ship.speed.move }}” / {{ ship.speed.cruise }}”</span>
            </v-col>
            <v-col cols="4">
              <v-icon>mdi-undo-variant</v-icon>
              <span>Evasion</span>
              <span>{{ ship.defense.evasion }}+</span>
            </v-col>
            <v-col cols="4">
              <v-icon>mdi-shield</v-icon>
              <span>Toughness</span>
              <span>{{ ship.defense.toughness }}+</span>
            </v-col>
          </v-row>
        </v-layout>
      </v-card-text>

      <v-card-text>
        {{ upgrades.map((u) => u.label).join(', ') }}
      </v-card-text>

      <!-- WEAPONS -->
      <v-card-text>
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
            <tr v-for="(item, index) in weapons" :key="index">
              <td class="text-left">{{ item.label }}</td>
              <td class="text-center">
                <v-icon v-if="item.arc==='full'">mdi-circle-slice-8</v-icon>
                <v-menu bottom offset-x v-else>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs" v-on="on"
                      icon
                      small
                    >
                      <v-icon v-if="item.arc==='full'">mdi-circle-slice-8</v-icon>
                      <v-icon v-else-if="item.arc==='front'" :style="{transform: `rotate(-45deg)`}">mdi-circle-slice-2</v-icon>
                      <opr-ftl-arc-icon v-else-if="item.arc==='sides'"></opr-ftl-arc-icon>
                      <v-icon v-else-if="item.arc==='rear'" :style="{transform: `rotate(-45deg) scale(-1)`}">mdi-circle-slice-2</v-icon>
                      <v-icon v-else-if="item.arc==='rear'" :style="{transform: `rotate(-45deg) scale(-1)`}">mdi-circle-slice-2</v-icon>
                      <v-icon v-else>mdi-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <v-list dense>
                    <v-list-item @click="setShipWeaponArc(ship.id, item.slotIndex, item.key,'front')">
                      <v-list-item-icon><v-icon :style="{transform: `rotate(-45deg)`}">mdi-circle-slice-2</v-icon></v-list-item-icon>
                      Front
                    </v-list-item>
                    <v-list-item @click="setShipWeaponArc(ship.id, item.slotIndex, item.key,'sides')">
                      <v-list-item-icon><opr-ftl-arc-icon/></v-list-item-icon>
                      Sides
                    </v-list-item>
                    <v-list-item @click="setShipWeaponArc(ship.id, item.slotIndex, item.key,'rear')">
                      <v-list-item-icon><v-icon :style="{transform: `rotate(-45deg) scale(-1)`}">mdi-circle-slice-2</v-icon></v-list-item-icon>
                      Rear
                    </v-list-item>
                    <v-list-item @click="setShipWeaponArc(ship.id, item.slotIndex, item.key,null)">
                      <v-list-item-icon><v-icon>mdi-circle-outline</v-icon></v-list-item-icon>
                      None
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
              <td class="text-center">{{ item.range }}"</td>
              <td class="text-center">{{ item.attacks }}</td>
              <td class="text-center">{{ item.strength }}</td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>

      <v-card-text v-if="ship.category === 'Ship'">

        <v-select
          v-model="ship.hero"
          :items="armyBook.heroes"
          item-text="label"
          item-value="key"
          return-object
          persistent-hint :hint="ship.hero.effect"
          outlined dense clearable
          label="Hero"
          class="mb-4"
          @change="setHero($event)"
        >
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title>
                {{ item.label }}
                ({{ item.cost }} pts.)
                • <span class="grey--text"><em>{{ item.faction }}</em></span>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.effect }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-select>

        <v-select
          v-model="ship.title"
          :items="armyBook.titles"
          item-text="label"
          item-value="key"
          return-object
          persistent-hint :hint="ship.title.effect"
          outlined dense clearable
          label="Title"
          class="mb-4"
          @change="setTitle($event)"
        >
          <template v-slot:item="{ item }">
            <v-list-item-content>
              <v-list-item-title>
                {{ item.label }}
                ({{ item.cost }} pts.)
                • <span class="grey--text"><em>{{ item.faction }}</em></span>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.effect }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-select>
      </v-card-text>

      <v-card-text>
        <div
          v-for="index in ship.upgradeSlotCount"
          :key="index"
        >
          <v-select
            v-model="ship.upgradeSlots[index-1]"
            :items="armyBook.upgrades"
            item-text="label"
            item-value="key"
            return-object
            dense outlined clearable
            placeholder="Select and upgrade"
            :label="`Upgrade Slot ${index}`"
            @change="setUpdate($event, index-1)"
          >
            <template v-slot:item="{ item }">
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.label }} •
                  <span class="grey--text"><em>{{ item.faction }} {{ item.type | capitalize }}</em></span>
                </v-list-item-title>
                <v-list-item-subtitle v-if="item.type === 'upgrade'">
                  {{ item.effect }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="item.type === 'weapon'">
                  Range: {{ item.range }}" / Attacks: {{ item.attacks }} / Strength: {{ item.strength }}
                </v-list-item-subtitle>
                <v-list-item-subtitle v-if="item.type === 'weapon' && item.special">
                  {{ item.special }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </v-select>
        </div>
      </v-card-text>

    </v-card>
  </div>
</template>

<script>
import OprRulesSnippet from "~/components/OprRulesSnippet";
import OprFtlArcIcon from "@/components/warfleets-ftl/OprFtlArcIcon";

export default {
  name: 'OprFtlShipEditor',
  components: {
    OprFtlArcIcon,
    OprRulesSnippet,
  },
  props: {
    fleetId: String,
    shipId: String,
  },
  data() {
    return {
      armyBook: undefined,
      showShipNameEditor: false,
      shipNameEditorName: '',
    };
  },
  computed: {
    loading() {
      return !(this.fleet && this.ship && this.armyBook);
    },
    elevation(){
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    fleet() {
      return this.$store.getters['fleets/fleet'](this.fleetId);
    },
    fleetFactionKey() {
      return this.$store.getters['fleets/fleetKey'](this.fleetId);
    },
    shipCost() {
      return this.$store.getters['fleets/shipAllCost'](this.fleetId, this.shipId);
    },
    storeShip() {
      return this.$store.getters['fleets/ship'](this.fleetId, this.shipId);
    },
    codexShip() {
      if (this.storeShip) {
        return this.armyBook?.shipClasses.find((ship) => ship.key === this.storeShip.blueprintKey);
      }
      return undefined;
    },
    ship() {
      if (this.storeShip && this.codexShip && this.armyBook) {
        const upgrades = [];
        const upgradeSlots = {
          0: { key: undefined },
          1: { key: undefined },
          2: { key: undefined },
          3: { key: undefined },
          4: { key: undefined },
        };
        this.storeShip.upgrades.forEach((u) => {
          if (u) {
            const upgrade =  u ? this.armyBook.upgrades.find((i) => i.key === u.shipUpgrade) : { key: undefined } ;
            if(upgrade?.key) {
              upgrades.push({...upgrade, ...u});
            }
            upgradeSlots[u.slotIndex] = upgrade;
          }
        });
        const hero = this.armyBook.heroes.find((hero) => hero.key === this.storeShip.hero?.key) || { key: undefined };
        const title = this.armyBook.titles.find((title) => title.key === this.storeShip.title?.key) || { key: undefined };
        return {
          ...this.codexShip,
          ...this.storeShip,
          upgrades,
          upgradeSlots,
          hero: {...hero},
          title: {...title},
        };
      }
      return undefined;
    },
    weapons() {
      if (this.ship) {
        let finalWeapons = [{ ...this.ship.turret, arc: 'full' }];
        this.ship.upgrades.forEach((u) => {
          if (u && u.type === 'weapon') {
            finalWeapons.push(u);
          }
        });
        return finalWeapons;
      }
      return [];
    },
    upgrades(){
      if (this.ship) {
        return [
          ...this.ship.upgrades.filter((u) => u && u.type === 'upgrade'),
        ];
      }
      return [];
    },
  },
  watch: {
    fleetFactionKey: {
      handler(newValue) {
        if (newValue) {
          this.loadFactionArmyBook(newValue);
        }
      },
      immediate: true, // make this watch function is called when component created
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
    setUpdate(item, slotIndex) {
      const payload = {
        id: this.fleetId,
        shipId: this.ship.id,
        shipUpgrade: item?.key,
        slotIndex,
      };
      this.$store.commit('fleets/shipSetUpgrade', payload);
    },
    setHero(heroItem) {
      this.heroSlot = heroItem;
      const payload = {
        id: this.fleetId,
        shipId: this.ship.id,
        heroKey: heroItem?.key,
        cost: heroItem?.cost,
      };
      this.$store.commit('fleets/shipSetHero', payload);
    },
    setTitle(titleItem) {
      this.titleSlot = titleItem;
      const payload = {
        id: this.fleetId,
        shipId: this.ship.id,
        titleKey: titleItem?.key,
        cost: titleItem?.cost,
      };
      this.$store.commit('fleets/shipSetTitle', payload);
    },
    setShipWeaponArc(shipId, slotIndex, weaponKey, weaponArc) {
      const payload = {
        id: this.fleetId,
        shipId: this.ship.id,
        slotIndex: slotIndex,
        weaponKey: weaponKey,
        weaponArc: weaponArc,
      };
      this.$store.commit('fleets/shipSetWeaponArc', payload);
    },
    openShipNameEditor() {
      this.shipNameEditorName = this.ship.name;
      this.showShipNameEditor = true;
    },
    shipNameEditorSave() {
      const payload = {
        id: this.fleetId,
        shipId: this.ship.id,
        name: this.shipNameEditorName,
      };
      this.$store.commit('fleets/shipSetName', payload);
      this.showShipNameEditor = false;
    },
  },
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  }
}
</script>

<style scoped>

</style>
