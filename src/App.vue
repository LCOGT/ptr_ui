<template>
  <div id="app">
    <the-menu />
    <dev-panel /> <!-- Developer testing tools. Not for prodution. -->
    <router-view></router-view>

    <!-- This is the home for the JS9 DOM elements. They are hidden here and only 
    visible when moved into the js9 component. This avoid js9-reloading issues. -->
    <div id="js9home" ref="js9home" v-show="false">
      <div id="js9content" ref="js9content">
        <div class="JS9Menubar" id="myJS9Menubar" ></div>
        <div class="JS9" id="myJS9" data-js9init="true"></div>
      </div>
    </div>


  </div>
</template>

<script>
import TheMenu from '@/components/TheMenu.vue'
import DevPanel from '@/components/DevPanel.vue'
import Amplify from 'aws-amplify'
import awsmobile from './aws-exports';
import { components } from 'aws-amplify-vue'
import JS9 from "@/components/JS9";

 
// This enables connection to the backend resources created in the amplify cli.
//Amplify.configure(awsmobile)

Amplify.configure({

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
        // This is the production api.
        name: "ptr-api",
        endpoint: "https://api.photonranch.org",
        //custom_header: async () => {
          //return { Authorization: 'Bearer '+(await Auth.currentSession()).accessToken.jwtToken }
        //}
      },
      {
        // This is a copy of the production api running locally. Used for testing.
        name: "ptr-api-local",
        endpoint: "http://localhost:5000",
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
    DevPanel,
    JS9,
    components,
  },
  created() {
    this.$store.dispatch('observatory_configuration/update_config')
  },
}
</script>

<style>
</style>
