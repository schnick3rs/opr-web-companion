<template>
  <div>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row>
      <v-col cols="12">

        <v-tabs
          v-model="tab"
        >
          <v-tab v-for="item in tabs" :key="item.key" :disabled="item.disabled" exact nuxt :to="item.to">{{item.name}}</v-tab>
        </v-tabs>
      </v-col>


    </v-row>

    <nuxt-child></nuxt-child>

  </div>
</template>

<script>
import OprBreadcrumbsRow from "@/components/shared/OprBreadcrumbsRow";
export default {
  name: 'rules',
  components: {OprBreadcrumbsRow},
  layout: 'admin',
  async asyncData() {
    return {
    };
  },
  data() {
    return {
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'Admin', to: '/admin', exact: true },
        { text: 'Rules', to: '/admin/rules', exact: false },
      ],
      tab: undefined,
      tabs: [
        { key: 'common', name: 'Common Rules', to: `/admin/rules` },
        { key: 'army', name: 'Army Rules', to: `/admin/rules/army` },
      ],
    };
  },
  head() {
    return {
      title: 'Manage Rules',
    };
  },
}
</script>

<style scoped>

</style>
