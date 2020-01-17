<template>
    <b-navbar type="is-dark" wrapper-class="container">

        <template slot="brand">
            <b-navbar-item tag="router-link" class="menu-title" :to="{ path: '/' }">
                photon ranch
                <!--img
                    src="img/icons/logo-via-logohub.png"
                    alt="photon ranch observatory"
                -->
            </b-navbar-item>
        </template>

        <template slot="start">
            <b-navbar-item tag="router-link" :to="{ path: '/ctrl' }">
                ctrl
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ path: '/imgs' }">
                images
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ path: '/analysis' }">
                analysis
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ path: '/skymap' }">
                sky
            </b-navbar-item>
            <b-navbar-item tag="router-link" :to="{ path: '/calendar' }">
                calendar
            </b-navbar-item>
            <b-navbar-dropdown label="sites">
                <template v-for="(site, index) in sites">
                  <router-link 
                    class="navbar-item" 
                    v-bind:to="'/ux1/' + site.code +'/home'"
                    v-bind:key="index"
                    > 
                    {{site.name}} 
                  </router-link>
                </template>
                <hr class="navbar-divider">
                <b-navbar-item tag="router-link" :to="{ path: '/about' }">
                    About
                </b-navbar-item>
            </b-navbar-dropdown>
            <b-navbar-dropdown label="dev">
                <b-navbar-item tag="router-link" :to="{ path: '/ux1/wmd/home' }">
                    layout--1
                </b-navbar-item>
                <b-navbar-item tag="router-link" :to="{ path: '/btns' }">
                    some buttons
                </b-navbar-item>
            </b-navbar-dropdown>
        </template>

        <template slot="end">
            <b-navbar-item tag="div">

              <div v-if="$auth.isAuthenticated" class="navbar-item has-dropdown is-hoverable is-dark">

                  <div class="navbar-link">
                  <p>  {{$auth.user.name}} </p>
                  <!--figure class="image is-24x24">
                    <img :src="$auth.user.picture" style="margin-left: 10px" class="is-rounded" >
                  </figure-->
                  </div>

                  <div class="navbar-dropdown">
                      <router-link to="/profile" class="navbar-item">Profile</router-link>
                      <router-link to="/adminonly" class="navbar-item">Admins Only</router-link>
                      <hr class="navbar-divider">
                      <a v-on:click="logout" class="navbar-item has-link">Log out</a>
                  </div>
              </div>

              <!-- show login when not authenticated -->
              <button class="button" v-if="!$auth.isAuthenticated" @click="login">Log in</button>

            </b-navbar-item>
        </template>
    </b-navbar> 

</template>

<script>
import { mapGetters, mapState } from "vuex";

export default {
  name: "TheMenu",
  data() {
    return {
      sites: [
        {
          code: "wmd",
          name: "West Mountain Drive",
          country: "USA",
          tz: -8,
          lat: 34,
          lng: -119,
          elevation: 0 // meters
        },
        {
          code: "saf",
          name: "Sollee Observatory",
          country: "USA",
          tz: -7,
          lat: 35.55444,
          lng: -105.870277,
          elevation: 2201
        }
      ]
    };
  },
  methods: {

    // Log the user in with Auth0
    login() {
      this.$auth.loginWithRedirect();
    },

    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
      this.$router.go();
    },

  },
};
</script>

<style scoped>
.menu-title {
  font: 30px "Share Tech Mono", monospace;
  margin-right: 2em;
}
nav {
  height: 5em;
}
</style>
