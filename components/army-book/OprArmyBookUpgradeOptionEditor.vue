<template>
  <div>
    <v-tabs
      v-model="tab"
      centered
      icons-and-text
      class="mb-4"
    >
      <v-tab v-for="tab in tabs" :key="tab.id" :href="`#${tab.id}`">
        {{ tab.label }}
        <v-icon>{{tab.icon}}</v-icon>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab">
      <v-tab-item value="tab-weapon">
        <v-row class="mt-4">
          <v-col :cols="12">
            <v-text-field
              v-model="gainInput"
              label="Weapon String"
              outlined dense
              append-outer-icon="mdi-plus-circle-outline"
              @click:append-outer="addGain"
              @keypress.enter="addGain"
              persistent-hint hint="Parsable weapon string, e.g. Eel-Rifle (12”, A2, AP(1))"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item value="tab-rule">
        <v-row class="mt-4">
          <v-col :cols="12">
            <v-text-field
              v-model="gainInput"
              label="Special Rule String"
              outlined dense
              append-outer-icon="mdi-plus-circle-outline"
              @click:append-outer="addGain"
              @keypress.enter="addGain"
              persistent-hint hint="Parsable Rules string, e.g. Tough(3), Fast, Defense +1, Ignore Cover"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item value="tab-item">

        <v-alert type="info" dense text>
          An item is a named wrapper for one or more weapons or rules like, mounts, bikes, ar just a flavoured single rule.
        </v-alert>

        <v-row class="mt-4">
          <v-col :cols="8">
            <v-text-field
              v-model="name"
              label="Name"
              outlined dense
              persistent-hint hint="A flavourful name for the item, vehicle or mount"
            ></v-text-field>
          </v-col>

          <v-col :cols="12">
            <v-text-field
              v-model="contentInput"
              label="Content"
              placeholder="Enter weapon or rules string and hit enter or (+)"
              outlined dense
              append-outer-icon="mdi-plus-circle-outline"
              @click:append-outer="itemAddContent"
              @keypress.enter="itemAddContent"
              persistent-hint hint="E.g.: Tough(3), Fast, Defense +1, Ignore Cover, AP(1) in melee"
            ></v-text-field>
          </v-col>

          <v-col :cols="12">
            <v-chip-group column>
              <v-chip
                v-for="(item, index) in itemContent"
                :key="index"
                small
                label
                close
                @click:close="itemContent.splice(index, 1)"
              >{{item.label}}</v-chip>
            </v-chip-group>
          </v-col>

          <v-col :cols="12">
            <v-btn color="primary" outlined small block @click="addGainItem">
              Add Item to option
            </v-btn>
          </v-col>

        </v-row>
      </v-tab-item>

      <v-tab-item value="tab-freetext">
        <v-row class="mt-4">
          <v-col :cols="12">
            <v-text-field
              v-model="gainLabel"
              label="Custom text"
              outlined dense
              append-outer-icon="mdi-plus-circle-outline"
              @click:append-outer="addGain"
              @keypress.enter="addGain"
              persistent-hint hint="enter any free text you want"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-tab-item>

    </v-tabs-items>

    <v-divider class="mt-4"></v-divider>

    <v-row>

      <v-col :cols="12">
        <span>The following stuff will be part if the upgrade option:</span>
        <v-chip-group column>
          <v-chip
            v-for="(item, index) in value.gains"
            :key="index"
            small
            label
            color="primary"
            close
            @click:close="value.gains.splice(index, 1)"
          >
            <template v-if="typeof item === 'string'">{{item}}</template>
            <template v-else>{{item.label}}</template>
          </v-chip>
        </v-chip-group>
      </v-col>

      <v-col :cols="6">
        <v-text-field
          v-model="value.cost"
          label="Point Cost"
          type="number"
          outlined dense
          persistent-hint hint="0 for free or increments of 5 (usually)"
          @keypress.enter="$emit('apply')"
        ></v-text-field>
      </v-col>

    </v-row>
  </div>
</template>

<script>
import * as ArmyBook from "assets/js/ArmyBook";

export default {
  name: 'OprArmyBookUpgradeOptionEditor',
  props: {
    value: {
      type: Object, // the OptionItem
      defaut: () => {
        return {
          gains: [],
          cost: 0,
        };
      },
    },
  },
  data() {
    return {
      tab: null,
      tabs: [
        { id: 'tab-weapon', label: 'Weapon', icon: 'mdi-sword-cross' },
        { id: 'tab-rule', label: 'Special Rule', icon: 'mdi-school' },
        { id: 'tab-item', label: 'Item', icon: 'mdi-truck' },
        { id: 'tab-freetext', label: 'Freetext', icon: 'mdi-marker' },
      ],
      name: '',
      gainLabel: '',
      contentInput: '',
      itemContent: [],
      gainInput: '',
      sectionIndex: undefined,
    };
  },
  methods: {
    addGain() {

      if (this.gainLabel) {
        this.value.gains.push(this.gainLabel);
      } else if (ArmyBook.Weapon.Is(this.gainInput)) {
        this.value.gains.push(ArmyBook.Weapon.FromString(this.gainInput));
      } else if (ArmyBook.Rule.Is(this.gainInput)) {
        this.value.gains.push(ArmyBook.Rule.FromString(this.gainInput));
      } else if (ArmyBook.Defense.Is(this.gainInput)) {
        this.itemContent.push(ArmyBook.Defense.FromString(this.gainInput));
      } else {
        console.info(`Could not parse ${this.gainInput}.`);
      }

      this.gainLabel = '';
      this.gainInput = '';
    },
    addGainItem() {
      const item = new ArmyBook.Item(this.name, this.itemContent);
      this.value.gains.push(item);

      this.name = '';
      this.itemContent = [];
    },
    itemAddContent() {
      const contentInput = this.contentInput;

      if (ArmyBook.Weapon.Is(contentInput)) {
        this.itemContent.push(ArmyBook.Weapon.FromString(contentInput));
      } else if (ArmyBook.Rule.Is(contentInput)) {
        this.itemContent.push(ArmyBook.Rule.FromString(contentInput));
      } else if (ArmyBook.Defense.Is(contentInput)) {
        this.itemContent.push(ArmyBook.Defense.FromString(contentInput));
      } else {
        console.info(`Could not parse ${contentInput}.`);
      }
      this.contentInput = '';
    },
  },
}
</script>

<style scoped>

</style>
