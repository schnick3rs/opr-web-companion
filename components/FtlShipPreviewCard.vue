<template>
  <v-card v-if="ship" >
    <v-card-text>

      <v-container align-start>

        <v-row>
          <v-col>
            <v-icon left>mdi-arrow-right-bold</v-icon>
            <span>{{ ship.speed.move }}” / {{ ship.speed.cruise }}”</span>
          </v-col>
          <v-col>
            <v-icon color="success" left>mdi-undo-variant</v-icon>
            <v-avatar size="32">{{ ship.defense.evasion }}+</v-avatar>
          </v-col>
          <v-col>
            <v-icon color="blue" left>mdi-shield</v-icon>
            <v-avatar size="32">{{ ship.defense.toughness }}+</v-avatar>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12"><h3>Turret</h3></v-col>
          <v-col>
            <v-icon left>mdi-vector-line</v-icon>
            <span>{{ ship.turret.range }}”</span>
          </v-col>
          <v-col>
            <v-icon color="success" left>mdi-bullseye-arrow</v-icon>
            <v-avatar size="32">{{ ship.turret.attacks }}</v-avatar>
          </v-col>
          <v-col>
            <v-icon color="red" left>mdi-arm-flex</v-icon>
            <v-avatar size="32">{{ ship.turret.strength }}</v-avatar>
          </v-col>
        </v-row>

        <v-row v-if="ship.specialRules && ship.specialRules.length > 0">
          <v-col>
            <h3 class="mb-2">Special Rules</h3>
            <p class="mb-1" v-for="(rule, i) in ship.specialRules" :key="i">
              <strong>{{rule.label}}: </strong>{{rule.effect}}
            </p>
          </v-col>
        </v-row>

      </v-container>

    </v-card-text>

  </v-card>
</template>

<script>
export default {
  name: "FtlShipPreviewCard",
  components: {
  },
  mixins: [
  ],
  props: {
    ship: Object,
  },
  data() {
    return {
    };
  },
  computed: {
  },
  methods: {

  },
}
</script>

<style scoped>

</style>
