<template>
  <div id="app">
    <the-menu :global_config="global_config"/>
    <!--dev-panel /--> <!-- Developer testing tools. Not for prodution. -->

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
import JS9 from "@/components/JS9";
import axios from 'axios'

 
export default {
  name: 'App',
  components: {
    TheMenu,
    DevPanel,
    JS9,
  },
  data() {
    return {
      global_config: {},
    }
  },
  async created() {
    let response = await axios.get('https://api.photonranch.org/api/all/config')
    this.global_config = response.data
    console.log(this.config)
    this.$store.dispatch('observatory_configuration/update_config')
  },
}
</script>

<style>
</style>
