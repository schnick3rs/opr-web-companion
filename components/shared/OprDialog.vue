<template>
  <v-card>
    <v-card-title style="background-color: #262e37; color: #fff;">
      <span>{{title}}</span>
      <v-spacer />
      <v-icon dark @click="close">mdi-close</v-icon>
    </v-card-title>
    <v-card-text class="pt-6" :class="{ 'pl-2 pr-2': this.$vuetify.breakpoint.xsOnly }">
      <slot></slot>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn color="error" outlined @click="close">Close</v-btn>
      <v-spacer></v-spacer>
      <v-btn
        color="success"
        @click="apply"
        :disabled="disabledApply"
      >
        {{ applyLabel }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: "OprDialog",
  props: {
    title: String,
    applyLabel: {
      default: 'Apply',
      type: String,
      required: false,
    },
    disabledApply: Boolean,
  },
  methods: {
    close() {
      this.$emit('close');
    },
    apply() {
      this.$emit('apply');
    },
  }
}
</script>

<style scoped>

</style>
