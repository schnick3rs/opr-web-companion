<template>
  <div>
    <v-row justify-sm="center">

      <v-dialog
        v-model="vuexLoading"
        persistent
        width="300"
      >
        <v-card>
          <v-card-text>
            {{ vuexLoadingMessage }}
            <v-progress-linear
              size="64"
              style="margin: 0 auto;"
              indeterminate
              color="primary"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-dialog>

      <!-- build for which game system -->
      <v-col cols="8">
        <v-select
          v-model="gameSystem"
          :items="gameSystemOptions"
          item-text="fullname"
          item-value="id"
          return-object
          label="Game System"
          dense outlined
          required
          persistent-hint hint="Which game system is this build for?"
          @change="fetchArmyBooks(gameSystem)"
        ></v-select>
      </v-col>

      <!-- army book name -->
      <v-col cols="8">
        <v-text-field
          v-model="name"
          label="Name"
          dense outlined
          required
          persistent-hint hint="A shot name describing the army book"
          append-icon="mdi-dice-6"
          @click:append="rerollRandomArmyName"
        ></v-text-field>
      </v-col>

      <!-- army book one-line-hint -->
      <v-col cols="8">
        <v-text-field
          v-model="hint"
          label="Hint (recommended)"
          dense outlined
          persistent-hint hint="One sentence describing the army"
        ></v-text-field>
      </v-col>

      <!-- army book name -->
      <v-col cols="8">
        <v-select
          v-model="parentArmyBook"
          :items="armyBooks"
          item-text="name"
          item-value="uid"
          label="Parent Book"
          dense outlined
          required
          @change="fetchArmyBook"
        >
          <template v-slot:item="{ item }">
            <template>
              <v-list-item-avatar>
                <img :src="item.coverImagePath || `/img/army-books/${item.name.toLowerCase().replace(/\W/gm, '-')}.png`">
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title v-text="item.name"></v-list-item-title>
                <v-list-item-subtitle v-text="item.hint"></v-list-item-subtitle>
                <v-list-item-subtitle v-if="item.factionName" v-text="item.factionName"></v-list-item-subtitle>
              </v-list-item-content>
            </template>
          </template>
        </v-select>
      </v-col>
    </v-row>

    <v-row justify-sm="center">
      <v-col cols="4">
        <h4>
          Select units for cloning
          <v-btn x-small color="success" :disabled="loadingParent" @click="toggleCloneSelect">Select all</v-btn>
        </h4>
        <v-card tile>
          <v-list style="height: 400px; overflow-y: scroll;">
            <v-list-item-group
              v-model="unitsToClone"
              multiple
            >
              <v-progress-circular
                v-show="loadingParent"
                color="success"
                size="64"
                style="margin: 0 auto;"
                indeterminate
              ></v-progress-circular>
              <v-list-item v-for="unit in clonableUnits" :key="unit.id" two-line>
                <v-list-item-content>
                  <v-list-item-title v-text="`${unit.name} [${unit.size}]`"></v-list-item-title>
                  <v-list-item-subtitle>
                    {{ unit.equipment.map((e) => e.label).join(', ') }},
                    {{ unit.specialRules.map((e) => e.name).join(', ') }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text>{{unit.cost}}pts</v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="4">
        <h4>
          Enable sync mode
          <v-btn
            x-small
            color="success"
            @click="toggleSyncSelect"
            :disabled="loadingParent"
          >Select all</v-btn>
        </h4>
        <v-card tile>
          <v-list style="height: 400px; overflow-y: scroll;">
            <v-progress-circular
              v-show="loadingParent"
              color="success"
              size="64"
              style="margin: 0 auto;"
              indeterminate
            ></v-progress-circular>
            <v-list-item-group
              v-model="unitsToSync"
              multiple
            >
              <v-list-item v-for="unit in syncableUnits" :key="unit.id">
                <template v-slot:default="{ active }">
                  <v-list-item-content>
                    <v-list-item-title v-text="unit.name"></v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-icon v-if="active">mdi-sync</v-icon>
                    <v-icon v-else>mdi-sync-off</v-icon>
                  </v-list-item-action>
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="4" offset="4">
        <v-btn block color="primary" @click="createArmyWithClones">Create army and open editor</v-btn>
      </v-col>

    </v-row>
  </div>
</template>

<script>
import {adjectives, uniqueNamesGenerator} from "unique-names-generator";

export default {
  name: 'index',
  async asyncData({ $axios }) {
    const { data } = await $axios.get('/api/game-systems/');
    const gameSystems = data.filter(gs => gs.armyBookBuilderEnabled);
    return {
      gameSystems,
    }
  },
  data() {
    return {
      // basics
      gameSystem: undefined,
      name: '',
      hint: '',
      // inheritance
      armyBooks: [],
      parentArmyBook: undefined,
      unitsToClone: [],
      unitsToSync: [],
    };
  },
  methods: {
    generateRandomArmyName() {
      const prefix = ['Space','Guardian','Battle','Robot','Mecha','Alien','Havoc','Undead','Elven','Dark'];
      const eel = ['Eel'];
      const suffix = ['Boyz','Bros','Army','Fleet','Hive','Flock','Swarm','Legion','Horde','Flock','Guild','Cult','Clans','Sisters','Force','Raiders','Guard','Daemons'];
      const config = {
        dictionaries: [ prefix, prefix, eel, suffix ],
        separator: ' ',
        style: 'capital',
        length: 4,
      };
      return uniqueNamesGenerator(config);
    },
    generateRandomArmyHint() {
      const adjective = uniqueNamesGenerator({ dictionaries: [ adjectives ], length: 1 });
      return `Those ${adjective} eels from space don't mess around.`;
    },
    rerollRandomArmyName(){
      this.name = this.generateRandomArmyName();
    },
    async fetchArmyBooks({slug}) {
      this.unitsToClone = [];
      this.unitsToSync = [];
      this.parentArmyBook = undefined;
      const { data } = await this.$axios.get('/api/army-books/', {params: {gameSystemSlug: slug}});
      this.name = this.generateRandomArmyName();
      this.hint = this.generateRandomArmyHint();
      this.armyBooks = data;
    },
    async fetchArmyBook(armyBookId) {
      this.unitsToClone = [];
      this.unitsToSync = [];
      const { data } = await this.$axios.get(`/api/army-books/${armyBookId}`);
      this.parentArmyBook = data;
    },
    toggleCloneSelect() {
      this.unitsToClone = this.parentArmyBook.units.map((unit, index) => index);
    },
    toggleSyncSelect() {
      this.unitsToSync = this.syncableUnits.map((unit, index) => index);
    },
    createArmyWithClones() {
      const payload = {
        gameSystemId: this.gameSystem.id,
        name: this.name,
        hint: this.hint,
        parentArmyBookId: this.parentArmyBook.uid,
        clones: this.unitsToClone.sort().map(index => this.parentArmyBook.units[index].id),
        syncs: this.unitsToSync.sort().map(index => this.parentArmyBook.units[index].id),
      };
      this.$store.dispatch('armyBooks/createWithClones', payload).then((armyBookUid) => {
        this.$router.push(`/my-creations/builder/${armyBookUid}`);
      });
    }
  },
  computed: {
    vuexLoading() {
      return this.$store.getters['armyBooks/loading'];
    },
    vuexLoadingMessage() {
      return this.$store.getters['armyBooks/loadingMessage'];
    },
    gameSystemOptions() {
      if (this.gameSystems) {
        return this.gameSystems
          .filter(system => system.armyBookBuilderEnabled)
      }
      return [];
    },
    loadingParent() {
      return this.parentArmyBook && (!this.clonableUnits || this.clonableUnits.length <= 0);
    },
    clonableUnits() {
      if (this.parentArmyBook) {
        return this.parentArmyBook.units;
      }
      return [];
    },
    syncableUnits() {
      if (this.parentArmyBook) {
        return this.unitsToClone.sort().map(index => this.parentArmyBook.units[index]) ;
      }
      return [];
    },
  }
}
</script>

<style scoped>

</style>
