<template>
    <b-navbar type="is-dark" wrapper-class="container">

        <template slot="brand">
            <b-navbar-item tag="router-link" class="menu-title" :to="{ path: '/' }">
              <span v-if="site==''" style="margin: 0;" class="title">photon ranch</span>
              <span v-if="site!=''" style="margin: 0;" class="is-hidden-mobile title">photon ranch&nbsp;</span>
              <span v-if="site!=''" class="is-hidden-tablet">&nbsp;&nbsp;<b-icon icon="home"/>&nbsp;</span>
              <span v-if="site!=''" style="margin: 0;" class="subtitle">>&nbsp;{{site.toUpperCase()}}</span>
              <!--span>&nbspv5</span-->
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
                    :to="{ path: '/site/' + site+ '/observe'}"
                    v-bind:key="index"
                    v-if="global_config[site]">
                    <span :class="siteOnlineClass(site)">&#9679;&nbsp;</span>
                    {{global_config[site].name}}
                  </b-navbar-item>
                </template>
                <hr class="navbar-divider">
                <b-navbar-item tag="router-link" :to="{ path: '/about' }">
                    About
                </b-navbar-item>
            </b-navbar-dropdown>

            <!--b-navbar-dropdown label="experimental">
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
            </b-navbar-dropdown-->

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
  data() {
    return {}
  },
  computed: {
    ...mapGetters('site_config', [
      'available_sites', 
      'global_config',
      'site',
    ]),

    ...mapState('sitestatus', ['site_open_status']),

    userIsAdmin() {
      try {
        let user = this.$auth.user 
        let roles = user['https://photonranch.org/user_metadata'].roles
        return roles.includes('admin')
      } catch {
        return false
      }
    },

    menu_name() {
      let siteName = ''
      if (this.site != '') { 
         siteName += ' - ' + this.site.toUpperCase()
      }
      return siteName
    },

    userIsAdmin() {
      try {
        let user = this.$auth.user 
        let roles = user['https://photonranch.org/user_metadata'].roles
        return roles.includes('admin')
      } catch {
        return false
      }
    },

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
    },

    siteOnlineClass(site) {
      const status_age_online = 300 // max number of seconds to be considered online
      const status = this.site_open_status[site]

      if (parseFloat(status.status_age_s) > status_age_online) { return 'no-status' }
      if (!status.hasWeatherStatus) { return 'status-yellow'}
      if (status.weather_ok && status.open_ok) {return 'status-green'}
      if (status.weather_ok || status.open_ok) {return 'status-yellow'}
      return 'status-yellow'
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
  z-index:31; /* so the navbar doesn't cover fullscreen modals */
}

.status-green {
  opacity: 0.8;
  padding-right: 3px;
  font-size: 10px;
  color: lime;
}
.status-yellow {
  opacity: 0.8;
  padding-right: 3px;
  font-size: 10px;
  color: yellow;
}
.no-status {
  padding-right: 3px;
  font-size: 10px;
  opacity: 0;
}
</style>
