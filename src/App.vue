<template>
  <div id="app">
    <Menu></Menu>
    <router-view></router-view>
  </div>
</template>

<script>
import Menu from '@/components/Menu.vue'
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
  API: {
    endpoints: [
      {
        name: "MyCustomLambda",
        endpoint: "https://lambda.us-east-1.amazonaws.com/2015-03-31/functions/yourFuncName/invocations",
        service: "lambda",
        region: "us-east-1"
      },
      {
        name: "MyAPIGatewayAPI",
        endpoint: "https://ohtk5cazqc.execute-api.us-west-2.amazonaws.com/dev/goodbye"
      }
    ]
  }
});

export default {
  name: 'App',
  components: {
    Menu,
    components
  },
  created() {
    this.$store.dispatch('observatory/streamSSE')
  }
}
</script>

<style>
#app {
  height: 100vh;
}
</style>
