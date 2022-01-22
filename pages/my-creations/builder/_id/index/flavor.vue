<template>
  <v-container>
    <v-row>

      <v-col :cols="12" :md="6">
        <v-row>

          <v-col :cols="12" :md="8">
            <v-text-field
              outlined dense
              v-model="armyBookName"
              label="Name"
            ></v-text-field>
          </v-col>

          <v-col :cols="12" :md="4">
            <v-text-field
              outlined dense
              v-model="armyBookVersionString"
              persistent-hint hint="e.g. v1.2, draft, wip"
              label="Version"
            ></v-text-field>
          </v-col>

          <v-col :cols="12" :md="6">
            <v-text-field
              outlined dense
              v-model="armyBookCoverImagePath"
              label="Image Path"
              persistent-hint hint="Add an image to the cover page. SFW only please."
            ></v-text-field>
          </v-col>

          <v-col :cols="12" :md="6">
            <v-text-field
              outlined dense
              v-model="armyBookCoverImageCredit"
              label="Image Artist Credit"
              persistent-hint hint="e.g. name/alias [link title](https://path-to-link.png)"
            ></v-text-field>
          </v-col>

          <v-col :cols="12">
            <v-text-field
              outlined dense
              v-model="armyBookHint"
              persistent-hint hint="A short sentence, describing the army book theme"
              label="Hint"
            ></v-text-field>
          </v-col>

          <v-col :cols="12">
            <v-textarea
              outlined dense
              v-model="armyBookBackground"
              label="Background"
              persistent-hint hint="Use markdown **bold** _italic_ ..."
              auto-grow
            ></v-textarea>
          </v-col>

        </v-row>
      </v-col>

      <v-col :cols="12" :md="6">
        <v-card>
          <v-card-text>
            <strong :class="`title--${universeSlug}`">{{armyBookGameSystemAberration}} - </strong>
            <strong :class="`title--${universeSlug}`">{{armyBookName}}</strong>
            <strong :class="`title--${universeSlug}`" class="title--suffix">{{armyBookVersionString}}</strong>
          </v-card-text>
          <v-card-text v-if="coverImage">
            <v-img :src="coverImage"></v-img>
          </v-card-text>
          <v-card-text>
            <div :class="`text--${universeSlug}`">
              <div v-html="backgroundText"></div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

    </v-row>
  </v-container>
</template>

<script>
import { marked } from 'marked';
import OprPage from "@/components/shared/print/OprPage";

export default {
  name: 'settings',
  components: {
    OprPage,
  },
  async asyncData({ params }) {
    return {
      armyBookId: params.id,
    };
  },
  methods: {
    markdown(text = '') {
      return marked.parse(text);
    },
    saveDebounced() {
      clearTimeout(this._timerId);
      this._timerId = setTimeout(() => {this.save()}, 500);
    },
    save() {
      this.$store.dispatch('armyBooks/updateGeneralInformation', { armyBookUid: this.armyBookId });
    },
  },
  computed: {
    armyBookName: {
      get() {
        return this.$store.getters['armyBooks/armyBookName'](this.armyBookId);
      },
      set(name) {
        this.$store.commit('armyBooks/setArmyBookName', { id: this.armyBookId, name });
        this.saveDebounced();
      }
    },
    armyBookVersionString: {
      get() {
        return this.$store.getters['armyBooks/armyBookVersionString'](this.armyBookId);
      },
      set(versionString) {
        this.$store.commit('armyBooks/setArmyBookVersionString', { id: this.armyBookId, versionString });
        this.saveDebounced();
      },
    },
    armyBookIsOfficial() {
      return this.$store.getters['armyBooks/armyBookIsOfficial'](this.armyBookId);
    },
    armyBookGameSystemUniverse() {
      return this.$store.getters['armyBooks/armyBookGameSystemUniverse'](this.armyBookId);
    },
    armyBookGameSystemAberration() {
      return this.$store.getters['armyBooks/armyBookGameSystemAberration'](this.armyBookId);
    },
    universeSlug() {
      return this.armyBookGameSystemUniverse
        ? this.armyBookGameSystemUniverse.toLowerCase().replace(/\W/gm, '-')
        : 'unknown';
    },
    coverImage() {
      if (this.armyBookCoverImagePath) {
        return this.armyBookCoverImagePath;
      }
      if (this.armyBookIsOfficial && this.armyBookName) {
        return `/img/army-books/${this.armyBookName.toLowerCase().replace(/\W/gm, '-')}.png`
      }
      return undefined;
    },
    armyBookHint: {
      get() {
        return this.$store.getters['armyBooks/armyBookHint'](this.armyBookId);
      },
      set(hint) {
        this.$store.commit('armyBooks/setArmyBookHint', { id: this.armyBookId, hint });
        this.saveDebounced();
      },
    },
    armyBookCoverImagePath: {
      get() {
        return this.$store.getters['armyBooks/armyBookCoverImagePath'](this.armyBookId);
      },
      set(coverImagePath) {
        this.$store.commit('armyBooks/setArmyBookCoverImagePath', { id: this.armyBookId, coverImagePath });
        this.saveDebounced();
      },
    },
    armyBookCoverImageCredit: {
      get() {
        return this.$store.getters['armyBooks/armyBookCoverImageCredit'](this.armyBookId);
      },
      set(coverImageCredit) {
        this.$store.commit('armyBooks/setArmyBookCoverImageCredit', { id: this.armyBookId, coverImageCredit });
        this.saveDebounced();
      },
    },
    armyBookBackground: {
      get() {
        return this.$store.getters['armyBooks/armyBookBackground'](this.armyBookId);
      },
      set(background) {
        this.$store.commit('armyBooks/setArmyBookBackground', { id: this.armyBookId, background });
        this.saveDebounced();
      },
    },
    backgroundText() {
      return marked.parse(this.armyBookBackground || '');
    },
  }
}
</script>

<style scoped lang="scss">

@font-face {
  font-family: 'AgeOfFantasyTitle';
  font-weight: normal;
  src: url('~static/fonts/caslon-antique.regular.ttf')  format('truetype'),
  url('~static/fonts/caslon-antique.regular.woff2') format('woff2'),
  url('~static/fonts/caslon-antique.regular.woff') format('woff')
}

@font-face {
  font-family: 'AgeOfFantasyText';
  font-weight: normal;
  src: url('~static/fonts/BKANT.ttf')  format('truetype'),
  url('~static/fonts/BKANT.woff2') format('woff2'),
  url('~static/fonts/BKANT.woff') format('woff')
}

.background {
  &--grimdark-future {
    background-image: url('/img/army-books/border-grimdark-future.png');
    background-size: contain;
    background-position: center;
  }
}

.title {
  &--suffix {
    font-size: small !important;
  }
  &--grimdark-future {
    font-size: x-large;
    font-family: GrimdarkTitle, sans-serif;
  }
  &--age-of-fantasy {
    font-size: x-large;
    font-family: AgeOfFantasyTitle, serif;
  }
}

.text {
  &--grimdark-future {
    font-family: GrimdarkText, sans-serif;
  }
  &--age-of-fantasy {
    font-family: AgeOfFantasyText, serif;
  }
}

</style>
