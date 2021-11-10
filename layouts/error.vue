<template>
  <v-app dark>
    <v-container>
      <v-row justify="center">
        <v-col :cols="12" :md="8" class="text-center">
          <div v-if="error.statusCode === 404">
            <h1>The page does not exist, but the mighty eel does!</h1>
            <v-img src="/img/eel-avatar_320.jpg" max-width="320" class="mx-auto"></v-img>
            <p>
              The space eel gently asks, you to check the home page.
            </p>
          </div>
          <div v-else>
            <h1>"Stop right here!", the space eel demanded.</h1>
            <v-img src="/img/eel-avatar_320.jpg" max-width="320" class="mx-auto"></v-img>
            <p>
              Something went wrong, and until I figure out who is responsible,
              you better check out a different page.
            </p>
          </div>
          <NuxtLink to="/">
            Home page
          </NuxtLink>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
