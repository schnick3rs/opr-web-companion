<template>
  <v-card
    :disabled="!section.isActive"
    class="card"
    nuxt exact :to="section.link.route"
    hover
  >
    <div class="card__image-container">
      <div
        class="card__image"
        :class="{ 'greyscale': !section.isActive || section.beta }"
        :style="{ backgroundImage: 'url('+section.imageSrc+')' }"
        loading
      />
    </div>

    <div class="card__content-container pa-4">
      <h2 class="headline" v-html="section.title" />

      <h3 class="card__content-subtitle pb-4 subtitle-2">
        {{ section.subtitle }}
      </h3>

      <v-alert
        v-if="section.beta"
        type="warning"
        dense
        text
      >
        Experimental
      </v-alert>

      <p class="body-2 d-none d-sm-block" v-html="section.htmlText" />

      <div class="card__content-footer d-none d-sm-block">
        <v-btn block :color="section.color">
          {{ section.link.text }}
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: "OprSectionCard",
  props: {
    section: Object,
  }
}
</script>

<style scoped lang="scss">

// xs < 600
.card {

  //max-width: 640px;
  height: 140px;
  display: flex;

  &__image-container {
    width: 30%;
    min-width: 30%;
    object-fit: contain;
    align-self: flex-start;
  }

  &__image {
    background-position: center center;
    background-size: cover;
    height: 140px;
  }

  &__content-container {
    flex: 1 1 auto;
  }

  &__content-subtitle {

  }

  &__content-footer {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }
}

// sm small
@media only screen and (min-width: 600px) {
  .card {
    height: 180px;

    &__image-container {
      width: 40%;
      min-width: 40%;
    }

    &__image {
      height: 180px;
    }
  }
}

// md medium
@media only screen and (min-width: 960px) {
  .card {
    height: 240px;

    &__image-container {
      width: 50%;
      min-width: 50%;
    }

    &__image {
      height: 240px;
    }
  }
}


.flexcard {
  display: flex;
  flex-direction: column;
}
.hover-card {
  cursor: pointer;
}
.hover-card:hover {
  -webkit-box-shadow: 0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12) !important;
  box-shadow: 0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12) !important;
}
.greyscale {
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
}
</style>

