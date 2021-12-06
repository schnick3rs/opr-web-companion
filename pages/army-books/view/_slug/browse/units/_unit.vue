<template>
  <div>
    <v-row justify="center">
      <v-col cols="6">
        <v-card>
          <v-card-title>{{unit.name}}</v-card-title>
          <v-card-subtitle>{{armyBook.name}} unit, {{unit.size}} models</v-card-subtitle>
          <v-card-text>
            <v-row justify="center" class="text-center">
              <v-col :cols="3">
                <div class="rounded-b-lg mx-1" style="border: solid 1px lightgrey;">
                  <div class="" style="background-color: lightgrey">Speed</div>
                  <div class="my-2" style="font-size: x-large;">
                    {{movement}}" / {{rush}}"
                  </div>
                </div>
              </v-col>
              <v-col :cols="3">
                <div class="rounded-b-lg mx-1" style="border: solid 1px lightgrey;">
                  <div class="" style="background-color: lightgrey">Quality</div>
                  <div class="my-2" style="font-size: x-large;">{{unit.quality}}+</div>
                </div>
              </v-col>
              <v-col :cols="3">
                <div class="rounded-b-lg mx-1" style="border: solid 1px lightgrey;">
                  <div class="" style="background-color: lightgrey">Defense</div>
                  <div class="my-2" style="font-size: x-large;">{{unit.defense}}+</div>
                </div>
              </v-col>
              <v-col :cols="3">
                <div class="rounded-b-lg mx-1" style="border: solid 1px lightgrey;">
                  <div class="" style="background-color: lightgrey">Tough</div>
                  <div class="my-2" style="font-size: x-large;">{{tough}}</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text>
            Equipment
          </v-card-text>
          <v-card-text>
            Special Rules
          </v-card-text>
          <v-card-text>
            Upgrades
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "browse-unit",
  async asyncData({ params, $axios }) {
    const { slug: armyBookId, unit: unitId } = params;
    const { data: armyBook } = await $axios.get(`/api/army-books/${armyBookId}`);
    const unit = armyBook.units.find(unit => unit.id === unitId);
    return {
      armyBook,
      unit,
    };
  },
  computed: {
    avatarImage() {
      if (this.armyBook.coverImagePath) {
        return this.armyBook.coverImagePath;
      }
      if (this.armyBook.official && this.armyBook.name) {
        return `/img/army-books/${this.armyBook.name.toLowerCase().replace(/\W/gm, '-')}.png`
      }
      return undefined;
    },
    movement() {
      return 6;
    },
    rush() {
      return this.movement * 2;
    },
    tough() {
      return this.unit.specialRules.find(sr => sr.key === 'tough')?.rating;
    }
  }
}
</script>

<style scoped>

</style>
