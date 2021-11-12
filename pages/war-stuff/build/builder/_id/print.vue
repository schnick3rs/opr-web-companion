<template>
  <div>

    <v-toolbar class="d-print-none" v-if="army">

      <v-btn nuxt :to="`/war-stuff/`">System Home</v-btn>

      <v-btn class="ml-2" small color="success" nuxt :to="`/war-stuff/build/builder/${army.id}/`">
        <v-icon left>mdi-pencil</v-icon> Edit
      </v-btn>

      <v-btn class="ml-2" small color="primary" outlined nuxt :to="`/war-stuff/build/builder/${army.id}/view`">
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
          Costs: {{armyTotalCost}} pts.
        </div>
      </section>

      <section v-if="enrichedUnits" class="unit-wrapper">

        <div
          v-for="(unit, i) in enrichedUnits" :key="i"
          class="unit__container"
        >
          <div>
            {{unit.name }}
            - <strong>Quality: {{unit.quality}}+</strong>
            <span style="float: right">{{ unit.totalCost }}pts.</span>
          </div>
          <v-divider></v-divider>
          <div>
            <span class="caption d-block">Wound Markers:</span>
            <v-icon v-if="unit.isTough" v-for="n in 2" :key="n">mdi-border-none-variant</v-icon>
            <v-icon v-for="n in unit.wounds" :key="n">mdi-border-all-variant</v-icon>
            <v-icon v-if="armyWithHealer || unit.hasRegeneration" v-for="n in 3" :key="n">mdi-border-none-variant</v-icon>
          </div>
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
    const { data } = await $axios.get(`/api/war-stuff/codex`);
    return {
      armyId: params.id,
      codex: data,
    };
  },
  computed: {
    army() {
      return this.$store.getters['warStuff/army'](this.armyId);
    },
    armyWithHealer() {
      if(this.units) {
        return this.units.some((u) => u.specialRules.find((r) => r.key === 'healer'));
      } else {
        return false;
      }
    },
    armyTotalCost() {
      return this.$store.getters['warStuff/armyTotalCost'](this.armyId);
    },
    units() {
      return this.$store.getters['warStuff/units'](this.armyId);
    },
    enrichedUnits() {
      if(this.units && this.codex) {
        return this.units.map((unit) => {
          let totalCost = unit.baseCost;
          unit.specialRules.forEach((r) => totalCost += r.cost);
          const specialRules = unit.specialRules.map((rule) => this.codex.specialRules.find((r) => r.key == rule.key));
          const wounds = 5;
          return {
            ...unit,
            specialRules,
            totalCost,
            wounds,
            isTough: unit.specialRules.find((r) => r.key === 'tough') !== undefined,
            hasRegeneration: unit.specialRules.find((r) => r.key === 'regeneration') !== undefined,
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
</style>
