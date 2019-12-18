<template>
    <b-navbar type="is-dark" wrapper-class="container">

        <template slot="brand">
            <b-navbar-item tag="router-link" class="menu-title" :to="{ path: '/' }">
                photon ranch
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
              <div v-if="isLoggedIn" class="navbar-item has-dropdown is-hoverable is-dark">
                  <a class="navbar-link">Hello, {{username}} </a>

                  <div class="navbar-dropdown">
                      <router-link to="/profile" class="navbar-item">Profile</router-link>
                      <hr class="navbar-divider">
                      <a v-on:click="signOut" class="navbar-item has-link">Log out</a>
                  </div>
              </div>

              <div v-if="!isLoggedIn" class="navbar-item">
                  <div class="buttons">
                      <router-link to="/register" tag="button" class="button">sign up</router-link>
                      <router-link to="/login" tag="button" class="button is-light">log in</router-link>
                      <!--button class="button is-warning" @click="signIn">log in as wmd_admin</button-->
                  </div>
              </div>
            </b-navbar-item>
        </template>
    </b-navbar> 

</template>

<script>
import { Auth } from "aws-amplify";
import { mapGetters, mapState } from "vuex";
//import { sites } from '../sites'

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
  mounted() {
    let navbar = document.querySelector(".navbar-burger");
    navbar.addEventListener("click", function() {
      let target = navbar.dataset.target;
      let $target = document.getElementById(target);
      navbar.classList.toggle("is-active");
      $target.classList.toggle("is-active");
    });
  },
  methods: {
    signOut() {
      this.$store.dispatch("auth/logOutUser");
      this.$router.go();
    },

    closeNavbar() {
      let navbar = document.querySelector(".navbar-burger");
      let btn = document.queryselector("#up-button");

      $(document).click(function() {
        navbar.classList.toggle("is-active");
      });
    },

    /**
     * Sign in as wmd_admin.
     * This is temporary for quick testing, and will be disabled when
     * authentication grants access to controls.
     */
    signIn() {
      this.$store.dispatch("auth/logInAdmin");
    }
  },
  computed: {
    ...mapGetters("auth", {
      username: "username",
      isLoggedIn: "isLoggedIn"
    })
  }
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
