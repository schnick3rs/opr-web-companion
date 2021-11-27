<template>
  <v-container v-if="armyBook">

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row>
      <v-col>
        <h2>{{ armyBook.name }}</h2>
        <span>{{ armyBook.hint }}</span>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-if="armyBook.units">
        <v-simple-table>
          <template v-slot:default>
            <thead>
            <tr>
              <th class="unit__header-cell text-left">Name [size]</th>
              <th class="unit__header-cell text-center">Qua</th>
              <th class="unit__header-cell text-center">Def</th>
              <th class="unit__header-cell text-left">Equipment</th>
              <th class="unit__header-cell text-left">Special Rules</th>
              <th class="unit__header-cell text-center">Upgrades</th>
              <th class="unit__header-cell text-center">Cost</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="unit in armyBook.units" :key="unit.id"
              class="unit__row"
              @click="$router.push(`/army-books/view/${armyBook.uid}/browse/units/${unit.id}`)"
            >
              <td class="unit__cell text-left">{{ unit.name }} [{{ unit.size }}]</td>
              <td class="unit__cell text-center">{{ unit.quality }}+</td>
              <td class="unit__cell text-center">{{ unit.defense }}+</td>
              <td class="unit__cell text-left">{{ unit.equipment.map((e) => equipmentString(e)).join(', ') }}</td>
              <td class="unit__cell text-left">{{ unit.specialRules.map((r) => `${r.name}${r.rating ? '('+r.rating+')' : ''}`).join(', ') }}</td>
              <td class="unit__cell text-center">{{ unit.upgrades.size > 0 ? unit.upgrades.join(', ') : '-' }}</td>
              <td class="unit__cell text-center">{{ unit.cost }}pts</td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>

    <v-row v-if="armyBook.upgrades">
      <v-col cols="8">
        <v-row>
          <v-col
            cols="6"
            v-for="(upgrade, index) in armyBook.upgrades"
            :key="index"
          >
            {{upgrade}}
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="4" v-if="armyBook.armyWideRule && armyBook.armyWideRule.headline">
        <h3 style="text-align: center;border-bottom: 1px solid;">{{ armyBook.armyWideRule.headline }}</h3>
        <div v-html="markdown(armyBook.armyWideRule.text)"></div>
        <div
          v-for="upgrade in armyBook.armyWideRule.upgrades"
        >
          <div class="mt-2 font-weight-bold font-weight-black font-italic subtitle-2 text-center">
            {{upgrade.headline}}
          </div>
          <v-simple-table dense>
            <template v-slot:default>
              <tbody>
              <tr v-for="(option, optionIndex) in upgrade.options" :key="optionIndex" class="alternating-grey">
                <td class="text-left pl-1 pr-1" style="width: 80%">
                  {{option.label}}
                </td>
                <td class="text-right pl-1 pr-1">
                  <span>{{ option.cost | costString }}</span>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </div>
      </v-col>

      <v-col
        cols="4"
      >

        <div v-if="armyBook.specialRules && armyBook.specialRules.length > 0" class="mb-2">
          <h3 style="text-align: center;border-bottom: 1px solid;">Special Rules</h3>
          <div
            v-for="rule in armyBook.specialRules"
            class="alternate pt-1 pb-1 pl-2 pr-2 special-rule-block"
            v-html="markdown(`**${rule.label}:** ${rule.description}`)"
          >
          </div>
        </div>

        <div
          v-if="armyBook.spells && armyBook.spells.length > 0"
        >
          <h3 style="text-align: center;border-bottom: 1px solid;">Psychic Spells</h3>
          <div
            v-for="spell in armyBook.spells"
            class="alternate pt-1 pb-1 pl-2 pr-2"
          >
            <strong>{{ spell.name }} ({{ spell.threshold }}+):</strong>
            {{ spell.effect }}
          </div>
        </div>
      </v-col>

    </v-row>

  </v-container>
</template>

<script>
import OprBreadcrumbsRow from '@/components/shared/OprBreadcrumbsRow';
import marked from 'marked';

export default {
  name: 'armybook',
  components: {OprBreadcrumbsRow},
  async asyncData({ params, $axios }) {
    const { slug } = params;
    const armyBookId = slug;
    const { data } = await $axios.get(`/api/army-books/${armyBookId}`);
    const armyBook = data;
    return {
      armyBookId,
      armyBook,
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'Army Books', to: '/army-books', exact: true },
        { text: armyBook.shortname, to: `/army-books/${armyBook.gameSystemSlug}`, exact: true },
        { text: armyBook.name, to: `/army-books/view/${slug}`, exact: true },
      ],
    };
  },
  head() {
    const title = `${this.armyBook.name} ${this.armyBook.versionString} | ${this.armyBook.aberration} Army Book`;
    const description = this.armyBook.hint;
    const slug = this.armyBook.name.toLowerCase().replace(/\W/gm, '-');
    const image = `https://webapp.onepagerules.com/img/gf-firefight/gf-firefight-twitter-wide.jpg`;

    return {
      title: title,
      titleTemplate: '%s',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:title', name: 'og:title', content: title },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'og:image', name: 'og:image', content: image },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: description },
        { hid: 'twitter:image', name: 'twitter:image', content: image },
      ],
    }
  },
  methods: {
    equipmentString(item) {
      let itemString = item.label;
      let content = [];
      if (item.range > 0) {
        content.push(`${item.range}”`);
      }
      content.push(`A${item.attacks}`);
      item.specialRules.forEach((rule) => {
        content.push(rule);
      });
      return `${item.name} (${content.join(', ')})`;
    },
    markdown(text) {
      return marked(text);
    }
  },
  filters: {
    costString: (cost) => {
      if (cost === 0) return 'free';
      if (cost > 0) return `+${cost}pts`;
      if (cost < 0) return `${cost}pts`;
      return '?';
    },
  }
}
</script>

<style scoped lang="scss">

.special-rule-block {

  & > :last-child {
    margin-bottom: 0;
  }
}

.alternate {
  &:nth-child(odd) {
    background-color: lightgrey;
  }
}
</style>
