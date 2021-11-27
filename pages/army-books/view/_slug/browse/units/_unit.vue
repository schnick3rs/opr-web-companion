<template>
  <div>
    <v-row justify="center">
      <v-col :cols="8">
        <v-img height="200" :src="image" contain></v-img>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col :cols="3">
        <div class="info rounded-b-lg mx-1">
          <div>Quality</div>
          3+
        </div>
      </v-col>
      <v-col :cols="3">
        <div class="info rounded-b-lg mx-1">
          <div>Defense</div>
          3+
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>{{unit.name}}</v-card-title>
          <v-card-subtitle>{{armyBook.name}} unit</v-card-subtitle>
          <v-card-text>
            pewpewpew
          </v-card-text>
          <v-card-text>
            special special
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
    //const { data: mmf } = await $axios.get(`/api/mmf/${unit.name}`);
    const { data: mmf } = await $axios.get(`/api/mmf/Assault Grunts`);
    return {
      armyBook,
      unit,
      mmf,
    };
  },
  computed: {
    image() {
      return this.mmf.images[0].standard.url;
    }
  }
}
</script>

<style scoped>

</style>
