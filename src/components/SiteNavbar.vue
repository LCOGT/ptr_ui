<template>
    <b-navbar type="is-dark" wrapper-class="container">

        <template slot="brand">
            <b-navbar-item tag="router-link" class="menu-title" :to="{ path: '/' }">
                <PTR class="ml-1 mr-2 is-hidden-tablet" with-lambda font-size="40px" />
                <PhotonRanch class="is-hidden-mobile" :with-lambda="true" />
                <span v-if="selected_site!=''" style="margin: 0;" class="subtitle site-hint">>&nbsp;{{selected_site.toUpperCase()}}</span>
            </b-navbar-item>
        </template>

        <template slot="start">
          <NavbarSiteDropdown />


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

              <!-- userway accessbility widget -->
              <a class="" id="userway-trigger" style="background: rgb(7, 8, 102); margin-left: 1em;"> 
                <span id="accessibilityWidget" tabindex="0">
                  <div style=" width: 25px; height: 25px;">
                    <svg _ngcontent-dbd-c18="" viewBox="0 0 63 63" xmlns="http://www.w3.org/2000/svg">
                      <circle _ngcontent-dbd-c18="" cx="31.49" cy="16.08" r="5.5" transform="translate(-2.14 26.98) rotate(-45)" fill="#FFFFFF"></circle>
                      <path _ngcontent-dbd-c18="" d="M47.62,22.28a88.73,88.73,0,0,1-32.25,0,1.63,1.63,0,0,0-1.92,1.32,1.64,1.64,0,0,0,1.32,1.92,92,92,0,0,0,10.92,1.34,2.62,2.62,0,0,1,2.42,2.93l-.32,2.75a54.14,54.14,0,0,1-3,12.67l-2,5.35a1.65,1.65,0,0,0,3.09,1.16v0l.49-1c1.6-3.41,3.09-6.9,4.45-10.43a.74.74,0,0,1,1.38,0c1.36,3.53,2.85,7,4.45,10.44l.51,1.09h0a1.64,1.64,0,0,0,1.48,1,1.6,1.6,0,0,0,.57-.11,1.64,1.64,0,0,0,1-2.12l-2-5.35a54.67,54.67,0,0,1-3-12.67l-.31-2.77a2.61,2.61,0,0,1,2.42-2.91,92.51,92.51,0,0,0,10.83-1.32,1.73,1.73,0,0,0,1.44-1.67A1.65,1.65,0,0,0,47.62,22.28Z" fill="#FFFFFF"></path>
                      <path _ngcontent-dbd-c18="" d="M31.5,0A31.5,31.5,0,1,0,63,31.5,31.53,31.53,0,0,0,31.5,0Zm0,60A28.5,28.5,0,1,1,60,31.5,28.54,28.54,0,0,1,31.5,60Z" fill="#FFFFFF"></path>
                    </svg>
                  </div>
                </span>
              </a>
            </b-navbar-item>
        </template>
    </b-navbar> 

</template>

<script>
import PhotonRanch from '@/components/logoText/PhotonRanch'
import PTR from '@/components/logoText/PTR'
import NavbarSiteDropdown from '@/components/NavbarSiteDropdown'
import { mapGetters, mapState } from "vuex";

export default {
  name: "SiteNavbar",
  components: {
    PTR,
    PhotonRanch,
    NavbarSiteDropdown,
  },
  computed: {

    ...mapState('site_config', [
      'selected_site',
    ]),
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
      this.$auth.loginWithPopup();
    },

    // Log the user out
    logout() {
      // make sure the logout happens before redirect.
      // otherwise, the redirect check for authentication might log the user back in.
      this.$auth.logout({
        returnTo: window.location.origin
      }).then($router.go)
    },
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

</style>
