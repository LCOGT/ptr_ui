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

  Auth: {
    identityPoolId: 'us-west-2:b9d6f9e8-202a-4a6f-9487-1e918f945f29',
    region: 'us-west-2',
    userPoolId: 'us-west-2_gAjMkmuFh',
    userPoolWebClientId: '7uh22ggsabjjusnb8fqdfitkf8',
  },
  // Disable analytics to fix this bug:
  // Description: https://github.com/aws-amplify/amplify-js/issues/3484
  // Solution: https://stackoverflow.com/questions/56680112/bad-request-is-returned-when-amplify-is-configured-for-hosted-ui-in-angular-6/56685607#56685607
  Analytics:{
    disabled:true
  },


  // API usage docs: https://bit.ly/30n9cTt
  API: {
    endpoints: [
      {
        name: "LambdaTest",
        endpoint: "https://ubkz32a95c.execute-api.us-west-2.amazonaws.com/dev",
        custom_header: async () => {
          return { Authorization: (await Auth.currentSession()).idToken.jwtToken }
        }
      },
      {
        name: "ptr-api",
        endpoint: "http://api.photonranch.org",
        //endpoint: "http://localhost:5000",
        custom_header: async () => {
          return { Authorization: 'Bearer '+(await Auth.currentSession()).accessToken.jwtToken }
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
    this.$store.dispatch('observatory_configuration/update_config')
  },
}
</script>

<style>
</style>
