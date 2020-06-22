<template>
    <b-navbar type="is-dark" wrapper-class="container">

        <template slot="brand">
            <b-navbar-item tag="router-link" class="menu-title" :to="{ path: '/' }">
              <span v-if="site==''" style="margin: 0;" class="title">photon ranch --</span>
              <span v-if="site!=''" style="margin: 0;" class="is-hidden-mobile title">photon ranch&nbsp</span>
              <span v-if="site!=''" class="is-hidden-tablet">&nbsp&nbsp<b-icon icon="home"/>&nbsp</span>
              <span v-if="site!=''" style="margin: 0;" class="subtitle">>&nbsp{{site.toUpperCase()}}</span>
                <!--img
                    src="img/icons/logo-via-logohub.png"
                    alt="photon ranch observatory"
                -->
            </b-navbar-item>
        </template>

        <template slot="start">

            <b-navbar-dropdown label="sites" :close-on-click="true">
                <template v-for="(site, index) in available_sites">
                  <b-navbar-item tag="router-link" 
                    :to="{ path: '/site/' + site+ '/home'}"
                    v-bind:key="index"
                    v-if="global_config[site]">
                    {{global_config[site].name}}
                  </b-navbar-item>
                </template>
                <hr class="navbar-divider">
                <b-navbar-item tag="router-link" :to="{ path: '/about' }">
                    About
                </b-navbar-item>
            </b-navbar-dropdown>



            <b-navbar-dropdown label="experimental">
                <b-navbar-item tag="router-link" :to="{ path: '/ctrl' }">
                    ctrl
                </b-navbar-item>
                <b-navbar-item tag="router-link" :to="{ path: '/skymap' }">
                    chat
                </b-navbar-item>
                <b-navbar-item tag="router-link" :to="{ path: '/jobs' }">
                    jobs
                </b-navbar-item>
                <b-navbar-item tag="router-link" :to="{ path: '/calendar' }">
                    calendar
                </b-navbar-item>
                <b-navbar-item tag="router-link" :to="{ path: '/analysis' }">
                    analysis
                </b-navbar-item>
            </b-navbar-dropdown>
        </template>

        <template slot="end">
            <b-navbar-item tag="div">

              <div v-if="$auth.isAuthenticated" class="navbar-item has-dropdown is-hoverable is-dark">

                  <div class="navbar-link">
                      <img :src="$auth.user.picture" width="25" height="25" style="border-radius: 50%;">
                      <div style="width:5px"></div>
                      <p> {{$auth.user.name}} </p>
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
  //props: ["global_config"],
  data() {
    return {}
    //return {
      //sites: [
        //{
          //code: "wmd",
          //name: "West Mountain Drive",
          //country: "USA",
          //tz: -8,
          //lat: 34,
          //lng: -119,
          //elevation: 0 // meters
        //},
        //{
          //code: "saf",
          //name: "Apache Ridge Observatory",
          //country: "USA",
          //tz: -7,
          //lat: 35.55444,
          //lng: -105.870277,
          //elevation: 2201
        //}
      //]
    //};
  },
  computed: {
    ...mapGetters('site_config', [
      'available_sites', 
      'global_config',
      'site',
    ]),

    menu_name() {
      let siteName = ''
      if (this.site != '') { 
         siteName += ' - ' + this.site.toUpperCase()
      }
      return siteName
    }
  },
  methods: {
    // Log the user in with Auth0
    login() {
      this.$auth.loginWithRedirect();
    },

    // Log the user out
    logout() {
      // make sure the logout happens before redirect.
      // otherwise, the redirect check for authentication might log the user back in.
      this.$auth.logout({
        returnTo: window.location.origin
      }).then($router.go)
    }
  }
};
</script>

<style scoped>
.menu-title {
  display:flex;
  align-items:center;
  font: 30px "Share Tech Mono", monospace;
  margin-right: 2em;
  height: 75px;
}
nav {
  height: 75px;
}
.navbar {
  border-radius: 0;
  z-index:10; /* so the navbar doesn't cover fullscreen modals */
}
</style>
