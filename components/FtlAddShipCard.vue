<template>
  <v-card>
    <v-card-title style="background-color: #262e37; color: #fff;">
      <span>Add ship to fleet</span>
      <v-spacer />
      <v-icon dark @click="$emit('close')">mdi-close</v-icon>
    </v-card-title>

    <v-card-text>
      <v-container>
        <v-row>

          <v-col cols="12">
            <v-text-field
              v-model="shipName"
              label="Ship / Squadron Name"
              outlined
              persistent-hint hint="Give your ship / squadron a name"
              append-icon="mdi-dice-6"
              @click:append="rerollRandomShipName"
            >
            </v-text-field>
          </v-col>

          <v-col cols="12">
            <v-select
              outlined
              v-model="shipClass"
              label="Ship Class"
              :items="filteredShips"
              item-value="key"
              item-text="label"
              return-object
            >
              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title>{{item.label}} • {{item.speed.move}}" / {{item.speed.cruise}}"</v-list-item-title>
                  <v-list-item-subtitle>
                    Turret: Ran {{item.turret.range}}" / Att {{item.turret.attacks}} / Str {{item.turret.strength}}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    {{item.type}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>
            </v-select>
          </v-col>

          <v-col v-if="shipClass">
            <ftl-ship-preview-card
              :ship="shipClass"
            ></ftl-ship-preview-card>
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
      <v-btn color="success" right @click="apply">
        Add Ship
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import FtlNewFleetCard from "~/components/FtlNewFleetCard";
import FtlShipPreviewCard from "~/components/FtlShipPreviewCard";
import data from "~/mixins/WarfleetsFtlNames.json";

export default {
  name: "FtlAddShipCard",
  components: {FtlShipPreviewCard, FtlNewFleetCard},
  props: {
    remainingPoints: Number,
    selectableShips: Array,
    faction: String,
    typeFilter: String,
  },
  data() {
    return {
      shipName: this.generateRandomShipName(this.faction),
      shipClass: null,
    };
  },
  computed: {
    filteredShips() {
      let ships = this.selectableShips;
      if (this.typeFilter) {
        ships = ships.filter((ship) => ship.type === this.typeFilter);
      }
      return ships;
    },
  },
  methods: {
    apply() {
      this.$emit('apply', this.shipName, this.shipClass);
      this.shipClass = undefined;
      this.rerollRandomShipName();
    },
    generateRandomShipName(faction = 'common') {
      let dict = { dictionaries: [colors, adjectives], length: 2};
      if (data) {
        const factionNames = data[faction];
        const colorfullAdjectives = [...colors, ...adjectives];
        dict = { dictionaries: [colorfullAdjectives, factionNames], length: 2};
      }
      const { dictionaries, length } = dict;

      const config = {
        dictionaries,
        separator: ' ',
        style: 'capital',
        length,
      };
      return uniqueNamesGenerator(config);
    },
    rerollRandomShipName() {
      this.shipName = this.generateRandomShipName(this.faction);
    },
  }
}
</script>

<style scoped>

</style>
