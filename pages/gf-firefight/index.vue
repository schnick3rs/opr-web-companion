<template>
  <v-container>

    <opr-breadcrumbs-row :items="breadcrumbItems"></opr-breadcrumbs-row>

    <v-row
      justify-sm="center"
    >
      <v-col
        :cols="12" :sm="4" :md="4" :lg="4" :xl="4"
        v-for="(item, i) in tiles" :key="i"
      >
        <v-card :disabled="item.disabled">
          <v-img :src="item.img" height="150" :class="{ 'img--greyscale': item.disabled }"></v-img>
          <v-card-actions>
            <v-btn block nuxt :to="item.to" color="primary">{{item.snippet}}</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import OprBreadcrumbsRow from "@/components/shared/OprBreadcrumbsRow";

export default {
  name: 'index',
  components: {OprBreadcrumbsRow},
  layout: 'gf-firefight',
  data() {
    return {
      breadcrumbItems: [
        { text: '', to: '/', exact: true },
        { text: 'GF: Firefight', to: '/gf-firefight', exact: true },
      ],
      tiles: [
        { label: 'Create', to: '/army-books', snippet: 'Browse army books', img: '/img/shared/learn.jpg' },
        { label: 'Create', to: '/army-books/my-creations', snippet: 'Create an army book', img: '/img/shared/create-armybook.jpg' },
        { label: 'Build', to: '/gf-firefight/build', snippet: 'Build the list', img: '/img/shared/build-list.jpg' },
        //{ label: 'Play', to: '/war-stuff/play', snippet: 'Play the game', img: '/img/war-stuff/warstuff-play.jpg', disabled: true },
      ],
    }
  }
}
</script>

<style scope lang="scss">

.img--greyscale {
  filter: grayscale(100%);
}

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
      width: 25%;
      min-width: 25%;
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
      width: 25%;
      min-width: 25%;
    }

    &__image {
      height: 240px;
    }
  }
}
</style>
