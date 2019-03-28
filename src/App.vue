<template>
  <div id="app">
    <the-menu />
    <router-view></router-view>
  </div>
</template>

<script>
import TheMenu from '@/components/TheMenu.vue'
import Amplify, { Auth, API } from 'aws-amplify'
import awsmobile from './aws-exports';
import { components } from 'aws-amplify-vue'

Amplify.configure({

  // Auth works without this config section, probably because it was configured in amplify-cli. 
  Auth: {
    identityPoolId: 'us-west-2:b9d6f9e8-202a-4a6f-9487-1e918f945f29',
    region: 'us-west-2',
    userPoolId: 'us-west-2_gAjMkmuFh',
    userPoolWebClientId: '7uh22ggsabjjusnb8fqdfitkf8',
  },


  API: {
    endpoints: [
      {
        name: "LambdaTest",
        endpoint: "https://ohtk5cazqc.execute-api.us-west-2.amazonaws.com/dev",
        custom_header: async () => {
          return { Authorization: (await Auth.currentSession()).idToken.jwtToken }
        }
      },
      {
        name: "local flask",
        endpoint: "http://localhost:5000",
        custom_header: async () => {
          return { Authorization: (await Auth.currentSession()).idToken.jwtToken }
        }
      },
    ]
  }
});

export default {
  name: 'App',
  components: {
    TheMenu,
    components
  },
  created() {

    // Update state information from flask-based server-sent-events stream. 
    this.$store.dispatch('observatory/streamSSE')

  }
}
</script>

<style>
#app {
  height: 100vh;
}
</style>
