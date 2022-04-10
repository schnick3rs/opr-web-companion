<template>
  <span :data-type="value.type" class="glue">
    <template v-if="prepend">{{prepend}}</template><template v-if="value.type === 'ArmyBookItem'">
      <span>{{value.name}}&nbsp;<opr-print-glues :data-content="value.content"
        v-for="(item, index) in sortedItemContent"
        :key="index"
        :value="item"
        :is-last="index >= sortedItemContent.length-1"
        :prepend="index === 0 ? '(' : ''"
        :append="index === sortedItemContent.length-1 ? ')' : ''"
      ></opr-print-glues></span>
    </template>
    <template v-else-if="value.type === 'ArmyBookWeapon'">
      <span v-if="value.amount">{{ value.amount }}x&nbsp;</span>{{ value.name }} <span class="glue">{{ value.label.substr(value.name.length) }}</span>
    </template>
    <template v-else-if="value.type === 'ArmyBookMultiWeapon'">
      {{ value.name }}: <opr-print-glues
      v-for="(profile, index) in value.profiles"
      :key="index"
      :value="profile"
      :is-last="index >= value.profiles.length-1"
    ></opr-print-glues>
    </template>
    <span v-else>{{value.label}}</span><template v-if="showSeparator">,&nbsp;</template><template v-if="append">{{append}}</template>
  </span>
</template>

<script>
import OprPrintGlues from "@/components/shared/print/OprPrintGlues";

export default {
  name: 'OprPrintGlues',
  components: {
    OprPrintGlues,
  },
  props: {
    value: Object,
    isLast: Boolean,
    prepend: String,
    append: String,
  },
  computed: {
    showSeparator() {
      return !this.isLast;
    },
    sortedItemContent() {
      if (this.value && this.value.type === 'ArmyBookItem') {
        const content = JSON.parse(JSON.stringify(this.value.content));
        content.sort((a, b) => {
          if (a.type > b.type) return 1;
          if (a.type < b.type) return -1;
        });
        return content;
      }
    }
  },
}
</script>

<style scoped lang="scss">
.glue {
  display: inline-block;
}
</style>
