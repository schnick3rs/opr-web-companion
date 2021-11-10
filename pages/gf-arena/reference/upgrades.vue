<template>
  <div>
    <v-container>

      <v-row>

        <v-col>
          <v-chip-group
            multiple
            v-model="factionFilter"
          >
            <v-chip
              label
              filter
              v-for="faction in factionOptions"
              :value="faction"
              :key="faction"
            >{{faction}}</v-chip>
          </v-chip-group>
        </v-col>

        <v-col>
          <v-chip-group
            multiple
            v-model="costFilter"
          >
            <v-chip
              label
              filter
              v-for="option in costOptions"
              :value="option"
              :key="option"
            >{{option}}pts</v-chip>
          </v-chip-group>
        </v-col>

      </v-row>

      <v-row v-if="upgradeCards">
        <div v-for="card in filteredUpgradeCards" class="mb-2">
          <opr-gf-arena-upgrade-card :card="card"></opr-gf-arena-upgrade-card>
        </div>
      </v-row>

    </v-container>

    <v-data-table
      v-if="upgradeCards"
      :items="filteredUpgradeCards"
      :headers="upgradeCardsTableHeaders"
      :items-per-page="-1"
      hide-default-footer
    >
      <template v-slot:item.cost="{ value }">
        {{value}}
      </template>
      <template v-slot:item.tags="{ value }">
        <v-chip
          small
          label
          class="mr-2"
          v-for="tag in value"
          :key="tag"
        >{{tag}}</v-chip>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import OprGfArenaUpgradeCard from "@/components/gf-arena/OprGfArenaUpgradeCard";
export default {
  name: "list-ships",
  components: {OprGfArenaUpgradeCard},
  layout: 'gf-arena',
  async asyncData({ $axios, error }) {
    const { data } = await $axios.get(`/api/gf-arena/`);

    if (data === undefined ) {
      error({ statusCode: 404, message: 'Data not found' });
    }

    const upgradeCards = data.upgradeCards;
    let factionOptions = data.factions;

    return {
      upgradeCards,
      factionOptions,
    };
  },
  data() {
    return {
      upgradeCardsTableHeaders: [
        { text: 'Name', value: 'name', align: 'start', sortable: true, filterable: true },
        { text: 'Faction', value: 'faction', align: 'start', sortable: true, filterable: true },
        { text: 'Cost', value: 'cost', align: 'end', sortable: true, filterable: true },
        { text: 'Effect', value: 'effect', align: 'start', sortable: true, filterable: true },
        { text: 'Tags', value: 'tags', align: 'start', sortable: true, filterable: true },
      ],
      costOptions: [10,15,20],
      factionFilter: [],
      costFilter: [],
    };
  },
  computed: {
    filteredUpgradeCards() {
      let finalCards = this.upgradeCards;

      if (this.factionFilter.length > 0) {
        finalCards = finalCards.filter((card) => this.factionFilter.some((faction) => faction === card.faction));
      }
      if (this.costFilter.length > 0) {
        finalCards = finalCards.filter((card) => this.costFilter.some((cost) => cost == card.cost));
      }

      return finalCards;
    },
  },
  methods: {
  },
  filters: {
    dollar: function (value) {
      const c = value / 5;
      return '$'.repeat(c);
    }
  }
}
</script>

<style scoped>

</style>
