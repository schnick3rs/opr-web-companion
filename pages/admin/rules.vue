<template>
  <v-container>
    <v-row>
      <v-col cols="12" :md="6">
        <v-list dense>
          <v-list-item v-for="rule in rules" :key="rule.id">
            <v-list-item-content>
              <v-list-item-title>{{rule.name}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>

      <v-col>
        <v-card>
          <v-card-text>
            <v-textarea
              outlined dense
              label="Description"
              value="This model may be kept in reserve instead of deploying. At the start of any round after the first you may place the model anywhere over 9” away from enemy units. If both player have Ambush they roll-off to see who deploys first, and then alternate in placing them."
              persistent-hint messages="Show hints"
            >
              <template v-slot:message>

                <v-chip-group>
                  <v-chip
                    v-for="system in gameSystems"
                    label x-small outlined
                  >
                    {{system.aberration}}
                  </v-chip>
                </v-chip-group>
              </template>
            </v-textarea>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'rules',
  middleware: 'auth',
  async asyncData({ $axios }) {
    const { data: gameSystems } = await $axios.get(`/api/game-systems/`);
    const { data: rules } = await $axios.get(`/api/game-systems/grimdark-future/special-rules`);
    return {
      gameSystems,
      rules,
    };
  },
  data() {
    return {
      selectedRule: 0,
    };
  },
}
</script>

<style scoped>

</style>
