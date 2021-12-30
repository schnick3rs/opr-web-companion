<template>
  <div>

    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange ligthen-2"
        ></v-progress-circular>
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >

      <v-card-title>
        <v-icon large left v-if="isHero">mdi-account-star</v-icon>
        <v-icon large left v-else-if="codexUnit.size > 1">mdi-account-group</v-icon>
        <v-icon large left v-else>mdi-account</v-icon>
        {{ unit.label || unit.name }}
      </v-card-title>

      <v-card-subtitle>{{ codexUnit.name }} <span v-if="codexUnit.size > 1">[{{codexUnit.size}}]</span></v-card-subtitle>

      <v-card-text>
        <v-container>
          <v-row justify-sm="space-between">
            <v-col><v-icon >mdi-run</v-icon>{{unitSpeed}}" / {{unitSpeed*2}}"</v-col>
            <v-col><v-icon >mdi-arm-flex</v-icon>{{codexUnit.quality}}+</v-col>
            <v-col><v-icon >mdi-shield</v-icon>{{codexUnit.defence}}+</v-col>
            <v-col>
              <v-icon v-if="unitWounds > 1">mdi-heart-multiple</v-icon>
              <v-icon v-else>mdi-heart</v-icon>
              {{unitWounds}}
            </v-col>
          </v-row>
        </v-container>
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
            <tr>
              <th class="text-left">Weapon</th>
              <th class="text-center">Rn</th>
              <th class="text-center">At</th>
              <th class="text-center">AP</th>
              <th class="text-left">Special</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, index) in unitEquipment" :key="index">
              <td class="text-left">{{ item.name }}</td>
              <td class="text-center">{{ item.range > 0 ? `${item.range}"` : 'melee' }}</td>
              <td class="text-center">{{ item.attacks }}</td>
              <td class="text-center">{{ weaponAp(item) }}</td>
              <td class="text-left" v-if="item.specialRules">{{ weaponspecialRules(item).join(', ') }}</td>
              <td class="text-left" v-else>-</td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text>
        <div v-for="(plans, plansIndex) in availableUpgrades">
          <div v-for="(plan, planIndex) in plans">
            <div class="mt-2 font-weight-bold font-weight-black font-italic subtitle-2 text-center">
              <div v-if="plan.type === 'replacement'">
                Replace
                {{ plan.limit === 1 ? '' : 'any' }}
                <span v-if="plan.lose">{{ plan.lose.map((item) => item.label).join(' and ') }}</span>:
              </div>
              <div v-else-if="plan.type === 'attachment'">
                Take {{ plan.improve.label }} attachment:
              </div>
              <div v-else-if="plan.type === 'upgrade'">
                Upgrade with {{ plan.limit ? 'one' : 'any' }}:
              </div>
            </div>
            <div>
              <v-simple-table dense>
                <template v-slot:default>
                  <tbody>
                  <tr v-for="(option, optionIndex) in plan.options" :key="optionIndex" class="alternating-grey">

                    <td class="text-left caption pl-1 pr-1" style="width: 80%">
                      <span v-for="(gain, gainIndex) in option.gains">
                        <span v-if="gain.type === 'weapon'">
                          {{ gain | simpleWeaponString }}
                        </span>
                        <span v-else>{{ option.label }}</span>
                        <span v-if="gainIndex < option.gains.length-1">, </span>
                      </span>
                      <span v-if="false">{{ option.label }}</span>
                    </td>

                    <td class="text-right caption pl-1 pr-1">
                      <span>{{ option.cost | costString }}</span>
                    </td>

                    <td class="text-left caption pl-1 pr-1">
                      <v-btn
                        v-if="hasUpgrade(`${plan.letter}.${planIndex}.${option.key}`)"
                        x-small icon color="red"
                        @click="sellUpgrade(`${plan.letter}.${planIndex}.${option.key}`)"
                      >
                        <v-icon>mdi-minus-circle</v-icon>
                      </v-btn>
                      <v-btn
                        :disabled="countOptions(`${plan.letter}.${planIndex}`) >= plan.limit"
                        v-if="!hasUpgrade(`${plan.letter}.${planIndex}.${option.key}`)"
                        x-small icon color="green"
                        @click="buyUpgrade(`${plan.letter}.${planIndex}.${option.key}`, plan, option)"
                      >
                        <v-icon>mdi-plus-circle</v-icon>
                      </v-btn>
                    </td>

                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-text>{{unit}}</v-card-text>

    </v-card>

  </div>
</template>

<script>
export default {
  name: 'OprFirefightUnitEditor',
  props: {
    warbandId: String,
    unitId: String,
  },
  data() {
    return {
      armyBook: undefined,
    };
  },
  computed: {
    loading() {
      return !(this.warband && this.unit && this.armyBook);
    },
    elevation(){
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    warband() {
      return this.$store.getters['gfFirefight/warband'](this.warbandId);
    },
    warbandFactionKey() {
      return this.$store.getters['gfFirefight/warbandFactionKey'](this.warbandId);
    },
    unit() {
      return this.$store.getters['gfFirefight/unit'](this.warbandId, this.unitId);
    },
    codexUnit() {
      if (this.unit && this.armyBook) {
        return this.armyBook.units.find((unit) => unit.key === this.unit.unitKey);
      }
      return undefined;
    },
    availableUpgrades() {
      if (this.unit && this.armyBook) {
        const unit = this.armyBook.units.find((unit) => unit.key === this.unit.unitKey);
        return unit.upgrades.map((letter) => {
          return this.armyBook.upgrades[letter].map((upgrade) => { return { letter, ...upgrade }; });
        });
      }
      return undefined;
    },
    unitSpeed() {
      let speed = 6;
      if (!this.loading) {
        const fast = this.unit.specialRules.includes((sr) => sr.name === 'Fast');
        const slow = this.unit.specialRules.includes((sr) => sr.name === 'Slow');
        if (fast && !slow) {
          speed = 9;
        }
        if (!fast && slow) {
          speed = 4;
        }
      }
      return speed;
    },
    unitWounds() {
      if (!this.loading) {
       const tough = this.unit.specialRules.find((sr) => sr.name === 'Tough');
       return tough ? tough.rating : 1;
      }
      return '?';
    },
    isHero() {
      if (!this.loading) {
        return this.unit.specialRules.find((sr) => sr.name === 'Hero');
      }
      return false;
    },
    unitEquipment() {
      if (!this.loading) {
        const equipment =  [...this.unit.equipment];
        this.unit.upgrades.forEach((upgrade) => {
          const splits = upgrade.key.split('.');
          const letter = splits[0];
          const planIndex = splits[1];
          const optionKey = splits[2];
          const plan = this.armyBook.upgrades[letter][planIndex];
          console.warn(plan)
          const loses = plan.lose || [];
          const gains = plan.options.find((option) => option.key === optionKey).gains;

          loses.forEach((loseItem) => {
            const losingItemIndex = equipment.findIndex((e) => e.label === loseItem.label);
            if (losingItemIndex >= 0) {
              equipment.splice(losingItemIndex, 1);
            }
          });
          gains.forEach((gain) => {
            if (gain instanceof Object && gain.type === 'weapon') {
              equipment.push(gain);
            }
          });
        });
        return equipment;
      }
      return [];
    },
  },
  watch: {
    warbandFactionKey: {
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
      const { data } = await this.$axios.get(`/api/gf-firefight/army-books/${factionKey}`);
      this.armyBook = data;
    },
    hasUpgrade(upgradeKey) {
      return this.unit.upgrades.find((upgrade) => upgrade.key === upgradeKey);
    },
    countOptions(planKey) {
      return this.unit.upgrades.filter((upgrades) => upgrades.key.startsWith(planKey)).length;
    },
    hasUpgradeLose(lose) {

    },
    buyUpgrade(upgradeKey, plan, option) {
      const id = this.warbandId;
      const unitId = this.unitId;
      const cost = option.cost;
      const lose = plan.lose;
      const gains = option.gains;
      this.$store.commit('gfFirefight/unitAddUpgrade', { id, unitId, upgradeKey, cost, lose, gains });
    },
    sellUpgrade(upgradeKey) {
      const id = this.warbandId;
      const unitId = this.unitId;
      // TODO sell half
      this.$store.commit('gfFirefight/unitRemoveUpgrade', { id, unitId, upgradeKey });
    },
    weaponAp(weapon) {
      const ap = weapon.specialRules.find((special) => special.startsWith('AP'));
      if (ap) {
        const { groups } = /^(?<name>[\w -]+)\(?(?<rating>[\w\d]*)\)?$/gm.exec(ap);
        return `-${groups.rating}` || '-';
      }
      return '-';
    },
    weaponSpecials(weapon) {
      return weapon.specialRules.filter((special) => !special.startsWith('AP'));
    }
  },
  filters: {
    simpleWeaponString: function (weapon) {
      const perks = [];
      if (weapon.range > 0) {
        perks.push(`${weapon.range}"`);
      }
      perks.push(`A${weapon.attacks}`);
      if(weapon.specialRules.length > 0) {
        perks.push(weapon.specialRules);
      }
      return `${weapon.label} (${perks.join(', ')})`;
    },
    costString: (cost) => {
      if (cost === 0) return 'free';
      if (cost > 0) return `+${cost}pts`;
      if (cost < 0) return `${cost}pts`;
      return '?';
    },
  }
}
</script>

<style scoped lang="scss">
.alternating-grey {
  &:nth-child(odd) {
    background: lightgrey;
  }
}
</style>
