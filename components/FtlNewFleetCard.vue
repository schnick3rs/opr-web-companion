<template>
  <v-card>
    <v-card-title style="background-color: #262e37; color: #fff;">
      <span>Create a new Fleet</span>
      <v-spacer />
      <v-icon dark @click="$emit('close')">mdi-close</v-icon>
    </v-card-title>

    <v-img contain height="100" :src="`/img/onepagerules/ftl-${factionKey}.png`"></v-img>

    <v-divider></v-divider>

    <v-card-text class="pa-0 ma-0">

      <v-container>

        <v-row>

          <!-- faction -->
          <v-col cols="12" :sm="6">
            <v-select
              v-model="factionKey"
              :items="selectableFactions"
              label="Faction"
              outlined
              persistent-hint hint="Select a faction or stay unaligned"
            >
            </v-select>
            <v-alert color="info" dense text class="caption">
              {{ factionHint }}
            </v-alert>
          </v-col>

          <!-- point limit -->
          <v-col cols="12" :sm="6">
            <v-text-field
              v-model="pointLimit"
              type="number"
              label="Point Limit"
              outlined
              persistent-hint hint="Press + to increase by 300pts."
              prepend-icon="mdi-minus-box"
              @click:prepend="pointLimit = (Math.ceil(pointLimit/300)-1)*300"
              append-outer-icon="mdi-plus-box"
              @click:append-outer="pointLimit = (Math.floor(pointLimit/300)+1)*300"
            >
            </v-text-field>
            <v-alert color="info" dense text class="caption">
              Your fleet may contain {{heroAmountString}}.
            </v-alert>
          </v-col>

          <!-- legendary fleets -->
          <v-col cols="12">
            <v-select
              v-model="legendaryFleet"
              :items="legendaryFleetItems"
              item-value="key"
              item-text="name"
              return-object
              label="Legendary Fleet (Optional)"
              clearable
              dense outlined
              persistent-hint hint="(Optional) Select a legendary fleet"
              @change="legendaryFleetSelected"
            >
            </v-select>
          </v-col>

          <!-- name -->
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

        </v-row>
      </v-container>

    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-btn outlined color="red" left @click="$emit('close')">
        Cancel
      </v-btn>
      <v-spacer />
      <v-btn color="success" right @click="createFleet">
        Create Fleet
      </v-btn>
    </v-card-actions>

  </v-card>
</template>

<script>
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import data from "~/mixins/WarfleetsFtlNames.json";

export default {
  name: "FtlNewFleetCard",
  props: {
    selectableFactions: Array,
  },
  data() {
    return {
      fleetName: this.generateRandomFleetName(),
      factionKey: 'common',
      pointLimit: 300,
      legendaryFleet: undefined,
    };
  },
  computed: {
    full300() {
      return Math.floor(this.pointLimit/300);
    },
    heroAmountString() {
      if (this.full300 > 1) {
        return `${this.full300} heroes`;
      }
      return '1 hero';
    },
    factionHint() {
      const faction = this.selectableFactions.find((f) => f.value === this.factionKey);
      return faction?.hint;
    },
    legendaryFleetItems() {
      const faction = this.selectableFactions.find((f) => f.value === this.factionKey);
      return faction?.legendaryFleets || [];
    },
  },
  methods: {
    generateRandomFleetName(faction = 'common') {
      const sufix = ['Fleet', 'Armada', 'Raiders', 'Rangers', 'Ambushers'];
      let dict = { dictionaries: [adjectives, sufix], length: 2};
      if (data) {
        const factionNames = data[faction];
        dict = { dictionaries: [factionNames, sufix], length: 2};
      }
      const { dictionaries, length } = dict;

      const config = {
        dictionaries,
        separator: '´s ',
        style: 'capital',
        length,
      };
      return uniqueNamesGenerator(config);
    },
    rerollRandomFleetName() {
      this.fleetName = this.generateRandomFleetName();
    },
    legendaryFleetSelected() {
      if (this.legendaryFleet) {
        this.fleetName = this.legendaryFleet.name;
      }
    },
    createFleet(){
      this.$emit('create', this.fleetName, this.factionKey, this.pointLimit, this.legendaryFleet?.key);
    }
  }
}
</script>

<style scoped>

</style>
