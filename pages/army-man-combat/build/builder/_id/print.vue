<template>
  <div>

    <v-toolbar class="d-print-none" v-if="army">

      <v-btn nuxt :to="`/army-man-combat/`">System Home</v-btn>

      <v-btn class="ml-2" small color="success" nuxt :to="`/army-man-combat/build/builder/${army.id}/`">
        <v-icon left>mdi-pencil</v-icon> Edit
      </v-btn>

      <v-btn class="ml-2" small color="primary" outlined nuxt :to="`/army-man-combat/build/builder/${army.id}/view`">
        <v-icon left>mdi-ballot-outline</v-icon> View
      </v-btn>

    </v-toolbar>

    <div class="page page--din-a4">

      <h1 class="page__headline">Army Roster</h1>

      <section v-if="army">
        <div>
          Name: {{army.name}}
        </div>
        <div>
          Costs: {{armyTotalCost}} / {{ army.pointLimit }} pts.
        </div>
      </section>

      <section v-if="enrichedUnits" class="unit-wrapper">

        <div
          v-for="(unit, i) in enrichedUnits" :key="i"
          class="unit__container"
        >
          <div>
            {{unit.name }} - {{ unit.totalSize }} {{ unit.label }}
            <span style="float: right">{{ unit.totalCost }}pts.</span>
          </div>
          <v-divider class="pb-2"></v-divider>

          <div class="caption" v-if="unit.armour">
            <strong>Armor ({{unit.armour}}):</strong> {{`Rolls +${unit.armour} dice to block hits.`}}
          </div>

          <v-simple-table dense v-if="unit.equipment.length > 0">
            <template v-slot:default>
              <thead>
              <tr>
                <th class="text-left">Weapon</th>
                <th class="text-center">Range</th>
                <th class="text-center">Attacks</th>
                <th class="text-center">AntiVehicle</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(item, index) in unit.equipment" :key="index">
                <td class="text-left">{{ item.label }}</td>
                <td class="text-center">{{ item.range }}"</td>
                <td class="text-center">{{ item.attacks }}</td>
                <td class="text-center">{{ item.isAntiVehicle ? 'x2' : '½' }}</td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>

          <p class="caption pt-2" v-if="unit.special">
            <strong>Special:</strong> {{unit.special}}
          </p>

        </div>

      </section>

    </div>

  </div>
</template>

<script>
export default {
  name: "print",
  layout: 'print',
  async asyncData({ $axios, params }) {
    const { data } = await $axios.get(`/api/army-man-combat/codex`);
    return {
      armyId: params.id,
      codex: data,
    };
  },
  computed: {
    army() {
      return this.$store.getters['armyManCombat/army'](this.armyId);
    },
    armyTotalCost() {
      return this.$store.getters['armyManCombat/armyTotalCost'](this.armyId);
    },
    units() {
      return this.$store.getters['armyManCombat/units'](this.armyId);
    },
    enrichedUnits() {
      if(this.units && this.codex) {
        return this.units.map((unit) => {
          let totalSize = unit.size * unit.sizeFactor
          let totalCost = unit.cost * unit.sizeFactor;
          unit.upgrades.forEach((u) => totalCost += u.cost);

          const codexUnit = this.codex.units.find((u) => u.key === unit.key);

          let equipment = [];
          codexUnit.equipment.forEach((e) => {
            const weapon = this.codex.weapons.find((w) => w.key === e);
            if (weapon) {
              equipment.push(weapon);
            }
          });
          unit.upgrades.forEach((u) => {
            const weapon = this.codex.weapons.find((w) => w.key === u.key);
            if (weapon) {
              equipment.push(weapon);
            }
          });
          return {
            ...unit,
            ...codexUnit,
            equipment,
            totalCost,
            totalSize,
          };
        });
      } else {
        return [];
      }
    },
  },
}
</script>

<style scoped lang="scss">

.page {
//  page-break-inside: avoid;

&--din-a4 {
 //height: 297mm;
   width: 220mm;
   overflow: hidden;
 //margin: 5mm 10mm;
   padding: 5mm 10mm;
   font-family: Calibri, serif;
 }
}

.unit {
&__container {
   display: inline-grid;
   width: 50%;
   border: lightgrey 1px dashed;
   padding: 2mm 4mm;
 }
}

@media print {

  .unit-wrapper {

  }

  .unit__container {
    page-break-inside: avoid;
  }
}

@media screen {
  .page--din-a4 {
    border-style: dashed;
    border-width: 1px;
  }
}


.range-band {

  &__table {
    width: 100%;
  }

  &__header {
    display: flex;
    flex-direction: row;
  }

  &__header-item {
    &--label { width: 25%; }
    &--attacks { width: 10%; }
    &--ranges {
      text-align: right;
    }
    &--ranges-9 {
      width: 16%;
      justify-content: space-between;
      display: flex;
    }
    &--ranges-18 { width: 16%; }
    &--ranges-27 { width: 16%; }
    &--ranges-36 { width: 16%; }
  }

  &__row {
    display: flex;
    flex-direction: row;
  }

  &__row-item {
    &--label { width: 25%; }
    &--attacks { width: 10%; }
    &--ranges {
      width: 64%;
      display: flex;
      flex-direction: row;
    }
  }

  &__container {

    display: flex;
    flex-direction: row;

  }

  &__section {
    justify-content: space-between;
    padding: 2px 4px;
    color: white;
    text-align: center;
    display: block;

    background-color: #8c8c8c;

    &--ranges-9 { width: 25%; }
    &--ranges-18 { width: 50%; }
    &--ranges-27 { width: 75%; }
    &--ranges-36 { width: 100%; }

    &--worst {
      background-color: #646363;
    }

    &--best {
      background-color: #cdcdcd;
    }
  }

  @media print {
    .range-band {
      &__section {
        background-color: #a4a4a4;
        &--worst {
          background-color: #646464;
        }

        &--best {
          background-color: #e9e9e9;
          color: black;
        }
      }
    }
  }

}
</style>
