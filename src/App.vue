<template>
  <div id="app">
    <Menu></Menu>
    <router-view></router-view>
  </div>
</template>

<script>
import Menu from '@/components/Menu.vue'
import { Auth } from 'aws-amplify'
import { components } from 'aws-amplify-vue'

export default {
  name: 'App',
  components: {
    Menu,
    components
  },

  // Obsolete by vue-createPersistedState

  //mounted() {
  //  // Check for login credentials
  //  Auth.currentAuthenticatedUser()
  //    .then(user => {
  //        console.log('user',user);
  //        this.$store.commit('setUser', user);
  //        })
  //    .catch(err => console.log(err));
  //}
}
</script>

<style>
</style>
