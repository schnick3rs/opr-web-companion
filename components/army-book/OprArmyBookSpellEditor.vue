<template>
  <div>
    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange ligthen-2"
        />
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-text>
        <v-row>
          <v-col cols="8">
            <v-text-field
              v-model="spell.name"
              outlined
              dense
              label="Name"
              persistent-hint
              hint="The raw name without (x)"
              @input="updateField('name', spell.name)"
            />
          </v-col>

          <v-col cols="4">
            <v-select
              v-model="spell.threshold"
              outlined
              dense
              label="Treshold"
              :items="thresholdOptions"
              @input="updateField('threshold', spell.threshold)"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="spell.effect"
              outlined
              dense
              label="Description"
              persistent-hint
              hint="Markdown **bold** __italic__"
              @input="updateField('effect', spell.effect)"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <template v-if="$auth.hasScope('admin')">
        <v-divider />
        <v-card-text><pre>{{ spell }}</pre></v-card-text>
      </template>
    </v-card>
  </div>
</template>

<script>
export default {
  name: 'OprArmyBookSpellEditor',
  props: {
    armyBookId: String,
    spellId: String,
  },
  data() {
    return {
      thresholdOptions: [
        { text: '2+', value: 2 },
        { text: '3+', value: 3 },
        { text: '4+', value: 4 },
        { text: '5+', value: 5 },
        { text: '6+', value: 6 },
      ],
    };
  },
  computed: {
    loading() {
      return !(this.armyBook && this.spell);
    },
    elevation() {
      return this.$vuetify.breakpoint.xsOnly ? '0' : undefined;
    },
    armyBook() {
      return this.$store.getters['armyBooks/armyBook'](this.armyBookId);
    },
    spell() {
      return this.$store.getters['armyBooks/spell'](this.armyBookId, this.spellId);
    },
  },
  methods: {
    saveDebounced() {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => { this.save(); }, 500);
    },
    save() {
      const armyBookUid = this.armyBookId;
      const spellId = this.spellId;
      this.$store.dispatch('armyBooks/updateSpell', { armyBookUid, spellId });
    },
    updateField(field, value) {
      const id = this.armyBookId;
      const spellId = this.spellId;
      this.$store.commit('armyBooks/setSpellField', { id, spellId, field, value });
      this.saveDebounced();
    },
  },
};
</script>

<style scoped>

</style>
