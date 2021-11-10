<template>
  <v-row no-gutters justify-sm="left" v-show="$vuetify.breakpoint.smAndUp">
    <v-col
      cols="12"
      class="elevation-4 mb-2 pa-0 ma-0"
    >
      <v-breadcrumbs
        class="pa-2"
        :items="items"
      >
        <template v-slot:item="{ item }">
          <v-breadcrumbs-item
            :nuxt="true"
            :to="item.to"
            :disabled="item.disabled"
            :exact="item.exact"
          >
            <img v-if="item.to == '/'" src="/favicon-16x16.png">
            {{ item.text }}
          </v-breadcrumbs-item>
        </template>
        <template v-slot:divider>
          <v-icon>mdi-chevron-right</v-icon>
        </template>
      </v-breadcrumbs>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'OprBreadcrumbsRow',
  props: {
    items: Array,
  }
}
</script>

<style scoped>

</style>
