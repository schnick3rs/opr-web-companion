<template>
  <div>

    <v-toolbar class="d-print-none" v-if="army">

      <v-btn nuxt :to="`/double-tab/`">System Home</v-btn>

      <v-btn class="ml-2" small color="success" nuxt :to="`/double-tab/build/builder/${army.id}/`">
        <v-icon left>mdi-pencil</v-icon> Edit
      </v-btn>

      <v-btn class="ml-2" small color="primary" outlined nuxt :to="`/double-tab/build/builder/${army.id}/view`">
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
            {{unit.name }}
            <span style="float: right">{{ unit.totalCost }}pts.</span>
          </div>

          <v-divider></v-divider>

          <div class="caption pt-2 range-band__table" v-if="unit.weapons">

            <div class="range-band__header caption">
              <span class="range-band__header-item range-band__header-item--label">Weapon</span>
              <span class="range-band__header-item range-band__header-item--attacks">Att.</span>
              <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-9">
                <span>0"</span>
                <span>9"</span>
              </span>
              <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-18">18"</span>
              <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-27">27"</span>
              <span class="range-band__header-item range-band__header-item--ranges range-band__header-item--ranges-36">36"</span>
            </div>

            <div
              v-for="weapon in unit.weapons"
              class="range-band__row caption mb-2"
            >
              <span class="range-band__row-item range-band__row-item--label">{{weapon.label}}</span>
              <span class="range-band__row-item range-band__row-item--attacks">{{weapon.attacks}}</span>
              <div
                v-if="weapon.range > 0"
                class="range-band__row-item range-band__row-item--ranges"
              >
                <div
                  v-for="band in weapon.bands"
                  class="range-band__section"
                  :class="{
                      'range-band__section--worst': band.mod < 0,
                      'range-band__section--best': band.mod > 0,
                      'range-band__section--ranges-9': (band.to-band.from) === 9,
                      'range-band__section--ranges-18': (band.to-band.from) === 18,
                     }"
                >
                  <span v-if="band.mod !== 0">{{ band.mod > 0 ? '+1' : '-1' }}</span>
                </div>
              </div>
            </div>
          </div>

          <v-divider></v-divider>

          <div class="caption pt-2">
            <p v-for="rule in unit.specialRules" :key="rule.label">
              <strong>{{rule.label}}:</strong> {{rule.effect}}
            </p>
          </div>

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
    const { data } = await $axios.get(`/api/double-tab/codex`);
    return {
      armyId: params.id,
      codex: data,
    };
  },
  computed: {
    army() {
      return this.$store.getters['doubleTab/army'](this.armyId);
    },
    armyWithHealer() {
      if(this.units) {
        return this.units.some((u) => u.specialRules.find((r) => r.key === 'healer'));
      } else {
        return false;
      }
    },
    armyTotalCost() {
      return this.$store.getters['doubleTab/armyTotalCost'](this.armyId);
    },
    units() {
      return this.$store.getters['doubleTab/units'](this.armyId);
    },
    enrichedUnits() {
      if(this.units && this.codex) {
        return this.units.map((unit) => {
          let totalCost = 0;
          unit.weapons.forEach((r) => totalCost += parseInt(r.cost));
          unit.specialRules.forEach((r) => totalCost += parseInt(r.cost));
          const weapons = unit.weapons
            .map((weapon) => this.codex.weapons.find((w) => w.key == weapon.key))
            .sort((a, b) => a.order - b.order);
          const specialRules = unit.specialRules.map((rule) => this.codex.specialRules.find((r) => r.key == rule.key));
          return {
            ...unit,
            weapons,
            specialRules,
            totalCost,
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
