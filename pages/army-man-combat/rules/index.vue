<template>
  <v-container>
    <v-row justify-sm="center">
      <v-col cols="3" v-show="$vuetify.breakpoint.smAndUp">
        <v-card outlined style="position: fixed;">
          <v-list-item
             v-for="(section, i) in rules.sections" :key="i"
            @click="$vuetify.goTo(`#${section.key}`)"
            dense
          >
            {{section.headline}}
          </v-list-item>
        </v-card>
      </v-col>
      <v-col cols="12" :sm="9" :md="6">
        <div v-for="(section, i) in rules.sections" :key="i">
          <h3 :id="section.key">{{section.headline}}</h3>
          <div v-for="(element, i) in section.elements" :key="i">
            <p v-if="element instanceof Object"><strong>{{element.label}}:</strong> {{element.content}}</p>
            <p v-else v-html="element"></p>
          </div>
        </div>
        <div>
          <v-btn class="mb-4" block href="https://drive.google.com/open?id=1gFV5PVPFyE22ZEpN8V4xRigpJMdNXRZh">
            <v-icon left>mdi-pdf-box</v-icon> get the original PDF
          </v-btn>
          <v-btn class="mb-4" block href="https://onepagerules.com/portfolio/one-off-games/">
            <v-icon left>mdi-web</v-icon> visit the authors website
          </v-btn>
          <v-btn class="mb-4" block href="https://www.patreon.com/onepagerules">
            <v-icon left>mdi-patreon</v-icon> check the authors patreon
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'rules',
  layout: 'armymancombat-rules',
  head() {
    const title = 'Army Man Combat Rules';
    const description = "Check the rules.";
    const image = '/img/shared/learn.jpg';
    return {
      title,
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
    };
  },
  async asyncData({ $axios }) {
    const { data } = await $axios(`/api/army-man-combat/rules`);
    return {
      rules: data,
    };
  },
}
</script>

<style scoped>

</style>
