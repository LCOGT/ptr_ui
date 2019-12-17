<template>  
  <div>
    <nav class="level"><div class="level-item title">photon ranch</div></nav>

<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />

    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!$auth.loading">
      <!-- show login when not authenticated -->
      <button v-if="!$auth.isAuthenticated" @click="login">Log in</button>
      <!-- show logout when authenticated -->
      <button v-if="$auth.isAuthenticated" @click="logout">Log out</button>
    </div>
  </div>
</template>


    <the-world-map name="google" />
    <!--leaflet-map name="leafmap"></leaflet-map-->

  </div>
</template>

<script>
import TheWorldMap from "@/components/TheWorldMap";
import LeafletMap from "@/components/LeafletMap";

//console.log(JS9)

export default {
  name: "Home",
  components: {
    TheWorldMap,
    LeafletMap
  },
  methods: {
    // Log the user in
    login() {
      this.$auth.loginWithRedirect();
    },
    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
};
</script>

<style scoped>
.title {
  font: 70px "Share Tech Mono", monospace;
  /*font: 70px 'Faster One', cursive;*/
  margin: 20px;
}
html {
  overflow: hidden;
}
</style>
