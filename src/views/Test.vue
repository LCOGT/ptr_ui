<template>
    <div>
        <button class="button" v-on:click="authenticate">authenticate</button>
        <button class="button" v-on:click="currentSession">current session</button>
        <button class="button" v-on:click="currentUserInfo">current user info</button>
        <button class="button" v-on:click="signOut">sign out</button>
        <button class="button" v-on:click="signIn">sign in as timbeccue</button>
        <button class="button" v-on:click="getUser">getUser</button>
        <button class="button" v-on:click="testAPI">testAPI</button>
        <button class="button" v-on:click="testRestrictedAPI">testRestrictedAPI</button>
    </div>
</template>

<script>
import { Auth } from 'aws-amplify'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { mapGetters } from 'vuex'
import axios from 'axios';

export default {
  name: 'Test',
  methods: {
    authenticate () {
      Auth.currentAuthenticatedUser({
        bypassCache: false
      }).then(user => console.log(user))
        .catch(err => console.log(err))
    },
    currentSession () {
      Auth.currentSession()
        .then(data => console.log(data))
        .catch(err => console.log(err))
    },
    currentUserInfo () {
      Auth.currentUserInfo()
        .then(data => console.log(data))
        .catch(err => console.log(err))
    },
    signOut () {
      Auth.signOut({ global: true })
        .then(data => {
          console.log(data)
          this.$store.commit('auth/setUser', '')
        })
        .catch(err => console.log(err))
    },
    signIn () {
      Auth.signIn({ username: 'timbeccue', password: 'Password1!' })
        .then(user => {
          console.log(user)
          this.$store.commit('auth/setUser', user)
        })
        .catch(err => console.log(err))
    },
    getUser () {
      console.log('user: ', this.user)
      console.log('username: ',this.username)
    },
    testAPI () {
      let headers = { 'Authorization': this.user }
      axios
        .get('http://localhost:5000/api/test', {headers: headers })
        .then(response => console.log(response))
    },
    testRestrictedAPI () {
      let headers = { 'Authorization': this.token }
      axios
        .get('http://localhost:5000/api/loginrequired', {headers: headers })
        .then(response => console.log(response))
    }
  },
  computed: {
    ...mapGetters('auth', {
      user: 'user',
      username: 'username',
      isLoggedIn: 'isLoggedIn',
      token: 'getToken'
    }),
  },
  mounted () {
    AmplifyEventBus.$on('authState', info => {
      console.log(`Here is the auth event that was just emitted by an Amplify component: ${info}`)
    })
  }
}
</script>

<style scoped>
</style>
