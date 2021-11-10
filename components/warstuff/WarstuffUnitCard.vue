<template>
  <v-card>
    <v-card-title>
      <v-avatar color="lime" size="32" class="mr-2">{{unit.quality}}+</v-avatar>
      {{ unit.name }}
    </v-card-title>
    <v-card-text>{{specialsOverview}}</v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        icon
        @click="show = !show"
      >
        <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-actions>
    <v-expand-transition>
      <div v-show="show">
        <v-divider></v-divider>

        <v-card-text>
          <p v-for="rule in unit.specialRules" :key="rule.label">
            <strong>{{rule.label}}:</strong> {{rule.effect}}
          </p>
        </v-card-text>
      </div>
    </v-expand-transition>

  </v-card>
</template>

<script>
export default {
  name: "WarstuffUnitCard",
  props: {
    unit: Object,
  },
  data() {
    return {
      show: false,
    }
  },
  computed: {
    specialsOverview() {
      return this.unit.specialRules.map((rule) => rule.label).join(', ');
    }
  }
}
</script>

<style scoped>

</style>
