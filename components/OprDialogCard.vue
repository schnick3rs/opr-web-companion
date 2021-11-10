<template>
  <v-card>
    <v-card-title style="background-color: #262e37; color: #fff;">
      <span>{{ title }}</span>
      <v-spacer />
      <v-icon dark @click="$emit('cancle')">mdi-close</v-icon>
    </v-card-title>

    <v-img contain height="100" :src="` /img/onepagerules/ftl-${faction}.png`"></v-img>

    <v-divider></v-divider>

    <v-container>
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="fleetName"
            label="Fleet Name"
            outlined
            persistent-hint hint="Give your fleet an epic name"
            append-icon="mdi-dice-6"
            @click:append="rerollRandomFleetName"
          >
          </v-text-field>
        </v-col>
        <v-col cols="12" :sm="6">
          <v-select
            v-model="faction"
            :items="selectableFactions"
            label="Faction"
            outlined
            persistent-hint hint="Select a faction or stay unaligned"
          >
          </v-select>
        </v-col>
        <v-col cols="12" :sm="6">
          <v-text-field
            v-model="pointLimit"
            type="number"
            label="Point Limit"
            outlined
            persistent-hint hint="Press + to increase by 300pts"
            prepend-icon="mdi-minus-box"
            @click:prepend="pointLimit = (Math.ceil(pointLimit/300)-1)*300"
            append-outer-icon="mdi-plus-box"
            @click:append-outer="pointLimit = (Math.floor(pointLimit/300)+1)*300"
          >
          </v-text-field>
        </v-col>
      </v-row>
    </v-container>

    <v-divider></v-divider>
    <v-card-actions>
      <v-btn outlined color="red" left @click="$emit('close')">
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn color="success" right @click="$emit('create', fleetName, faction, pointLimit)">
        Create Fleet
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';

export default {
  name: "FtlNewFleetCard",
  props: {
    selectableFactions: Array,
  },
  data() {
    return {
      fleetName: this.generateRandomFleetName(),
      faction: 'common',
      pointLimit: 300,
    };
  },
  methods: {
    generateRandomFleetName(faction = undefined) {
      const config = {
        dictionaries: [colors, adjectives, animals],
        separator: ' ',
        style: 'capital',
        length: 2,
      };
      return uniqueNamesGenerator(config);
    },
    rerollRandomFleetName() {
      this.fleetName = this.generateRandomFleetName();
    },
  }
}
</script>

<style scoped>

</style>
