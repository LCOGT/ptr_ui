<template>
    <b-navbar type="is-dark" wrapper-class="container">

        <template slot="brand">
            <b-navbar-item tag="router-link" class="menu-title" :to="{ path: '/' }">
              <!--span v-if="selected_site==''" style="margin: 0;" class="title">photon ranch</span-->
              <!--span v-if="selected_site!=''" style="margin: 0;" class="is-hidden-mobile title">photon ranch&nbsp;</span-->
              <!--span v-if="selected_site!=''" class="is-hidden-tablet">&nbsp;&nbsp;<b-icon icon="home"/>&nbsp;</span-->
              <!--span>&nbspv5</span-->
                <PTR class="ml-1 mr-2 is-hidden-tablet" with-lambda font-size="40px" />
                <PhotonRanch class="is-hidden-mobile" font-size="45px" :with-lambda="true" />
                <span v-if="selected_site!=''" style="margin: 0;" class="subtitle site-hint">>&nbsp;{{selected_site.toUpperCase()}}</span>
            </b-navbar-item>
        </template>

        <template slot="start">

            <b-navbar-dropdown label="sites" :close-on-click="true" @click.native="updateSiteStatus"> 
                <template v-for="(site, index) in real_sites">
                  <b-navbar-item tag="router-link" 
                    :to="{ path: '/site/' + site+ '/observe'}"
                    v-bind:key="'real'+index"
                    v-if="global_config[site]">
                    <div :class="siteOnlineClass(site)">&#9679;&nbsp;</div>
                    <span style="font-weight: bold; width: 9ex">{{global_config[site].site}}&nbsp;</span>
										<span style="color: silver;">{{global_config[site].name}}</span>
                    <span></span>
                  </b-navbar-item>
                </template>
                <hr class="navbar-divider">
                <template v-for="(site, index) in simulated_sites">
                  <b-navbar-item tag="router-link" 
                    :to="{ path: '/site/' + site+ '/observe'}"
                    v-bind:key="'sim'+index"
                    v-if="global_config[site]">
                    <div :class="siteOnlineClass(site)">&#9679;&nbsp;</div>
                    <span style="font-weight: bold; width: 9ex">{{global_config[site].site}}&nbsp;</span>
										<span style="color: silver;">{{global_config[site].name}}</span>
                    <span></span>
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
            <b-navbar-item tag="router-link" :to="{ path: '/plantargets' }">
                    find targets
            </b-navbar-item>

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
import PhotonRanch from '@/components/logoText/PhotonRanch'
import PTR from '@/components/logoText/PTR'
import { mapGetters, mapState } from "vuex";

export default {
  name: "TheMenu",
  components: {
    PTR,
    PhotonRanch,
  },
  computed: {
    ...mapState('site_config', [
      'selected_site',
      'global_config'
    ]),
    ...mapGetters('site_config', [
      'all_sites_real',
      'all_sites_simulated',
    ]),

    real_sites() {
      return this.all_sites_real.map(s => s.site)
    },
    simulated_sites() {
      return this.all_sites_simulated.map(s => s.site)
    },

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
      if (this.selected_site != '') { 
         siteName += ' - ' + this.selected_site.toUpperCase()
      }
      return siteName
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

    updateSiteStatus() {
      this.$store.dispatch('sitestatus/getSiteOpenStatus')
    },
    siteOnlineClass(site) {
      const status_age_online = 300 // max number of seconds to be considered online
      let status
      try { 
        status = this.site_open_status[site]
      } catch {
        return 'no-status'
      }

      if (status === undefined) {
        return 'no-status'
      }

      if (parseFloat(status.status_age_s) > status_age_online) { return 'no-status' }
      if (!status.hasWeatherStatus) { return 'status-blue'}
      if (status.weather_ok && status.open_ok) {return 'status-green'}
      if (status.weather_ok || status.open_ok) {return 'status-yellow'}
      return 'status-yellow'
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
.menu-title {
  display:flex;
  align-items:center;
  //font: 30px "Share Tech Mono", monospace;
  margin-right: 2em;
  height: 75px;
}
.site-hint {
  padding-left: 1em;
  color: $grey-light;
  font: 20px "Share Tech Mono", monospace;
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
.status-blue {
  opacity: 0.8;
  padding-right: 3px;
  font-size: 10px;
  color: lightskyblue;
}
.no-status {
  padding-right: 3px;
  font-size: 10px;
  opacity: 0;
}
</style>
