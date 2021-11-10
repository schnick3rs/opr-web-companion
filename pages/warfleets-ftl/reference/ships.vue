<template>
  <div>
    <v-data-table
      v-if="shipClasses"
      :items="shipClasses"
      :headers="shipsTableHeaders"
      :items-per-page="-1"
      hide-default-footer
    >
      <template v-slot:item.cost="{ value }">{{value}}</template>
      <template v-slot:item.speed.move="{ value }">{{value}}“</template>
      <template v-slot:item.speed.cruise="{ value }">{{value}}“</template>
      <template v-slot:item.turret.range="{ value }">{{value}}“</template>
      <template v-slot:item.turret.attacks="{ value }">{{value}}</template>
      <template v-slot:item.turret.strength="{ value }">{{value}}</template>
      <template v-slot:item.defense.evasion="{ value }">{{value}}+</template>
      <template v-slot:item.defense.toughness="{ value }">{{value}}+</template>
      <template v-slot:item.specialRules="{ value }">
        <span v-for="(rule, index) in value" :key="index">
           <v-tooltip bottom>
             <template v-slot:activator="{ on }">
                 <v-chip small label v-on="on" class="mr-2">{{ rule }}</v-chip>
             </template>
             {{ getRule(rule).effect }}
           </v-tooltip>
        </span>
      </template>

    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "list-ships",
  layout: 'warfleets-ftl',
  async asyncData({ $axios, error }) {
    const { data } = await $axios.get(`/api/warfleets-ftl/`);

    if (data === undefined ) {
      error({ statusCode: 404, message: 'FTL Fleet not found' });
    }

    let shipClasses = [];
    data.forEach((armyBook) => {
      shipClasses = [
        ...shipClasses,
        ...armyBook.shipClasses,
      ]
    })

    let specialRules = [];
    data.forEach((armyBook) => {
      specialRules = [
        ...specialRules,
        ...armyBook.specialRules,
      ]
    })

    return {
      shipClasses,
      specialRules,
    };
  },
  data() {
    return {
      shipsTableHeaders: [
        {
          text: 'Cost',
          value: 'cost',
          align: 'end',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Faction',
          value: 'faction',
          align: 'start',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Name',
          value: 'label',
          align: 'start',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Type',
          value: 'type',
          align: 'start',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Speed',
          value: 'speed.move',
          align: 'end',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Speed',
          value: 'speed.cruise',
          align: 'end',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Ran',
          value: 'turret.range',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Acc',
          value: 'turret .attacks',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Str',
          value: 'turret.strength',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Eva',
          value: 'defense.evasion',
          align: 'center',
          sortable: true,
          filterable: true,
        },
        {
          text: 'Tou',
          value: 'defense.toughness',
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
      ],
    };
  },
  methods: {
    getRule(ruleLabel) {
      return this.specialRules.find((rule) => rule.label === ruleLabel);
    }
  }
}
</script>

<style scoped>

</style>
