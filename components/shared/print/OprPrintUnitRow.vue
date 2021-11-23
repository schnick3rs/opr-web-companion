<template>
  <tr class="unit__row">
    <td class="unit__cell text-left unit__cell--name-size" style="vertical-align: top; white-space: nowrap;">
      <div>{{ unit.name }} [{{ unit.size }}]</div>
    </td>
    <td class="unit__cell unit__cell--quality text-center" style="vertical-align: top;"><div>{{ unit.quality }}+</div></td>
    <td class="unit__cell unit__cell--defense text-center" style="vertical-align: top;"><div>{{ unit.defense }}+</div></td>
    <td class="unit__cell unit__cell--equipment text-left" style="vertical-align: top;">
      <template v-for="(weapon, index) in equipmentLabels">
        <span class="glue">{{ weapon }}<template v-if="index < equipmentLabels.length-1">,&nbsp;</template></span>
      </template>
    </td>
    <td class="unit__cell unit__cell--special-rules text-left" style="vertical-align: top;">
      <div><opr-unit-special-rules-string :special-rules="unit.specialRules" /></div>
    </td>
    <td class="unit__cell text-center unit__cell--upgrades" style="vertical-align: top;"><div>{{ computeUpgradeString(unit.upgrades) }}</div></td>
    <td class="unit__cell text-center unit__cell--cost" style="vertical-align: top;"><div>{{ unit.cost }}pts</div></td>
  </tr>
</template>

<script>
import OprUnitSpecialRulesString from "../OprUnitSpecialRulesString";
import OprPrintGlues from "@/components/shared/print/OprPrintGlues";
import pluralize from 'pluralize';

export default {
  name: 'OprPrintUnitRow',
  components: {
    OprUnitSpecialRulesString,
    OprPrintGlues,
  },
  props: {
    unit: Object,
    sortedUpgradePackages: Array,
  },
  computed: {
    equipment() {
      const equipment = [];
      // sort range first, melee second
      this.unit.equipment.forEach(weapon => {
        if (equipment.some(final => pluralize.singular(final.label) === pluralize.singular(weapon.label))) {
          const index = equipment.findIndex(g => pluralize.singular(g.label) === pluralize.singular(weapon.label));
          const base = equipment.find(g => pluralize.singular(g.label) === pluralize.singular(weapon.label));
          equipment[index] = { ...weapon, count: ++base.count};
        } else {
          equipment.push({...weapon, count: weapon.count || 1});
        }
      });
      equipment.sort((a, b) => (b.range || 0) - (a.range || 0));
      return equipment;
    },
    equipmentLabels() {
      return this.equipment.map((e) => this.equipmentString(e));
    },
  },
  methods: {
    /**
     * We compute the display of a single item
     * @param item
     * @returns {string}
     */
    equipmentString(item) {
      let content = [];
      if (item.range > 0) {
        content.push(`${item.range}”`);
      }
      content.push(`A${item.attacks}`);
      item.specialRules.forEach((rule) => {
        content.push(rule);
      });

      // TODO label is deprecated
      let name = item.label;

      if (this.unit.size === 1 && item.count > 1) {
        name = pluralize(item.label, item.count);
      } else if (this.unit.size > 1) {
        name = pluralize(item.label, this.unit.size);
      }

      return `${item.count > 1 ? item.count+'x ' : ''}${name} (${content.join(', ')})`;
    },
    computeUpgradeString(upgrades) {
      if ( upgrades.length <= 0 ) {
        return '-';
      }
      return upgrades
        .map(upgradeUid => {
          const upgradePackage = this.sortedUpgradePackages.find(up => up.uid === upgradeUid);
          return upgradePackage ? upgradePackage.letter : '?';
        })
        .sort()
        .filter(text => text !== '?')
        .join(', ');
      return '?';
    },
  },
}
</script>

<style scoped lang="scss">
.glue {
  display: inline-block;
}

.unit {
  &__table {
    width: 100%;
    border: none;
    border-collapse: collapse;
  }

  &__row {
    &:nth-child(odd) {
      background-color: lightgrey;
    }
  }

  &__header-cell {
    padding: 0 1mm;
    font-weight: 500;

    &:first-child {
      padding-left: 1mm;
    }
    &:last-child {
      padding-right: 1mm;
    }
  }

  &__cell {

    padding: 0 1mm;

    &--equipment {
      max-width: 70mm;
    }

    &--special-rules {
      max-width: 60mm;
    }

    &:first-child {
      padding-left: 1mm;
    }
    &:last-child {
      padding-right: 1mm;
    }
  }
}
</style>
