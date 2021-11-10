<template>
  <div>

    <v-data-table
      v-if="item.pages"
      :items="item.pages[0].units"
      :headers="unitTableHeaders"
    >

      <template v-slot:item.name="{ item }">
        <span>{{item.name}} [{{item.size}}]</span>
      </template>

      <template v-slot:item.quality="{ item }">
        <span>{{item.quality}}+</span>
      </template>

      <template v-slot:item.defence="{ item }">
        <span>{{item.defence}}+</span>
      </template>

      <template v-slot:item.equipment="{ item }">
        {{ item.equipment.map((e) => e.label).join(', ') }}
      </template>

      <template v-slot:item.specialRules="{ item }">
        {{ item.specialRules.map((r) => r.label).join(', ') }}
      </template>


      <template v-slot:item.actions="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="addToRoster(item)"
        >
          mdi-account-circle
        </v-icon>
      </template>

    </v-data-table>

    <v-layout>
      <v-row>
        <v-col cols="6">
          <v-list>
            <opr-unit-list-item
              v-for="(unit, index) in roster" :key="index"
              :unit="unit"
              @select="selectedUnit = unit"
            ></opr-unit-list-item>
          </v-list>
        </v-col>
        <v-col cols="6">
          <opr-unit-card v-if="selectedUnit" :unit="selectedUnit" :army-upgrades="item.pages[0].upgrades"/>
        </v-col>
      </v-row>
    </v-layout>

  </div>
</template>

<script>
import OprUnitCard from "~/components/OprUnitCard";
import OprUnitListItem from "~/components/OprUnitListItem";
export default {
  name: "roster",
  components: {OprUnitListItem, OprUnitCard},
  async asyncData({ params, $axios, error }) {
    const { slug } = params;

    const response = await $axios.get(`/api/army-books/prime-brothers`);
    const item = response.data;

    if (item === undefined ) {
      error({ statusCode: 404, message: 'Army Book not found' });
    }
    return {
      item,
    };
  },
  data() {
    return {
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
      roster: [],
      selectedUnit: null,
    };
  },
  methods: {
    selectUnit(unit) {
      this.selectedUnit = unit;
    },
    addToRoster(unit) {
      const clonedUnit = JSON.parse(JSON.stringify(unit));
      this.roster.push(clonedUnit);
    },
  },
}
</script>

<style scoped>

</style>
