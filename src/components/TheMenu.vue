<template>
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
      <div class="container">

        <div class="navbar-brand">
            <router-link class="navbar-item menu-title" to="/">photon ranch</router-link>
            <div></div>

            <a role="button" class="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarBasicExample" class="navbar-menu">
            <div class="navbar-start">

            <router-link class="navbar-item" to="/btns"> btns </router-link>
            <router-link class="navbar-item" to="/imgs"> imgs </router-link>
            <router-link class="navbar-item" to="/skymap"> sky </router-link>
            <router-link class="navbar-item" to="/ctrl"> ctrl </router-link>
            <router-link class="navbar-item" to="/ux1/wmd/home"> ux1 </router-link>
            <router-link class="navbar-item" to="/imgnav"> imgnav </router-link>

            <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link"> sites </a>

                <div class="navbar-dropdown">
                    <template v-for="(site, index) in sites">
                      <router-link 
                        class="navbar-item" 
                        v-bind:to="'/site/' + site.code"
                        v-bind:key="index"
                        > 
                        {{site.name}} 
                      </router-link>
                    </template>
                    <hr class="navbar-divider">
                    <router-link class="navbar-item" to="/about"> About </router-link>
                </div>
            </div>
            </div>

            <div class="navbar-end">

            <div v-if="isLoggedIn" class="navbar-item has-dropdown is-hoverable">
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
                    <button class="button is-warning" @click="signIn">log in as wmd_admin</button>
                </div>
            </div>
            </div>
        </div>
      </div>
    </nav>
</template>

<script>
import { Auth } from 'aws-amplify'
import { mapGetters, mapState } from 'vuex'
//import { sites } from '../sites'

export default {
  name: 'TheMenu',
  data() {
    return {
      sites: [
         {
        'code': 'wmd',
        'name': 'West Mountain Drive',
        'country': 'USA',
        'tz': -8,
        'lat': 34,
        'lng': -119,
        'elevation': 0, // meters
    },
    {
        'code': 'saf',
        'name': 'Sollee Observatory',
        'country': 'USA',
        'tz': -7,
        'lat': 35.55444,
        'lng': -105.870277,
        'elevation': 2201,
    }
      ],
    }
  },
  mounted () {
    let navbar = document.querySelector('.navbar-burger')
    navbar.addEventListener('click', function () {
      let target = navbar.dataset.target
      let $target = document.getElementById(target)
      navbar.classList.toggle('is-active')
      $target.classList.toggle('is-active')
    })
  },
  methods: {
    signOut () {
      Auth.signOut({ global: true })
        .then(data => {
          console.log(data)
          this.$store.commit('auth/setUser', '')
          this.$router.go() // reload to redirect if user is on auth-required page.
        })
        .catch(err => console.log(err))
    },

    /**
     * Sign in as wmd_admin. 
     * This is temporary for quick testing, and will be disabled when 
     * authentication grants access to controls. 
     */
    signIn () {
      Auth.signIn({ username: 'wmd_admin', password: 'Password1!', region: 'us-west-2' })
        .then(user => {
          console.log(user)
          this.$store.dispatch('auth/log_in_user', user)
        })
        .catch(err => console.log(err))
    },
  },
  computed: {
    ...mapGetters('auth', {
      username: 'username',
      isLoggedIn: 'isLoggedIn'
    }),
  }

}
</script>

<style scoped>
.menu-title {
  font: 30px 'Share Tech Mono', monospace; 
  margin-right: 2em;
}
nav {
  height: 5em;
}
</style>
