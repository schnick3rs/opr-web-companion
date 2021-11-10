<template>
  <div>

    <v-card v-if="loading">
      <v-card-title>
        <v-progress-circular
          size="64"
          style="margin: 0 auto;"
          indeterminate
          color="orange ligthen-2"
        ></v-progress-circular>
      </v-card-title>
    </v-card>

    <v-card
      v-else
      :elevation="elevation"
    >
      <v-card-title>{{ spell.name }}</v-card-title>

      <v-card-text>

        <v-row>

          <v-col cols="8">
            <v-text-field
              outlined dense
              label="Name"
              v-model="spell.name"
              persistent-hint hint="The raw name without (x)"
              @input="updateField('name', spell.name)"
            ></v-text-field>
          </v-col>

          <v-col cols="4">
            <v-select
              outlined dense
              label="Treshold"
              v-model="spell.threshold"
              :items="thresholdOptions"
              @input="updateField('threshold', spell.threshold)"
            >
            </v-select>
          </v-col>

          <v-col cols="12">
            <v-textarea
              outlined dense
              label="Description"
              v-model="spell.effect"
              persistent-hint hint="Markdown **bold** __italic__"
              @input="updateField('effect', spell.effect)"
            >
            </v-textarea>
          </v-col>

        </v-row>

      </v-card-text>

      <template v-if="isAdmin">
        <v-divider></v-divider>
        <v-card-text><pre>{{spell}}</pre></v-card-text>
      </template>

    </v-card>
  </div>
</template>

<script>
import marked from 'marked';

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
    isAdmin() {
      return this.$store.state.auth?.user?.isAdmin;
    },
  },
  methods: {
    saveDebounced() {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => {this.save()}, 500);
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
    markdown(text = '') {
      return marked(text);
    },
  },
}
</script>

<style scoped>

</style>
