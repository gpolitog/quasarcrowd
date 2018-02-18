<template>
  <!-- Don't drop "q-app" class -->
  <div id="q-app">
    <router-view :firebase="firebase" :GoogleMapsKey="GoogleMapsKey"></router-view>
  </div>
</template>

<script>
/*
 * Root component
 */
export default {
  data: function () {
    return {
      firebase: this.$root.$data.firebase,
      GoogleMapsKey: this.$root.$data.GoogleMapsKey
    }
  }
}
</script>

<style></style>
