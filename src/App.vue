<template>
  <div id="app">
    <the-menu />

    <router-view class="router-view"></router-view>

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
import JS9 from "@/components/JS9";
import axios from 'axios'

 
export default {
  name: 'App',
  components: {
    TheMenu,
    JS9,
  },
  async created() {
    this.$store.dispatch('site_config/update_config')
  },
}
</script>

<style scoped lang="scss">
.router-view {
  height: calc(100vh - 75px);
  overflow-y: scroll;
  overflow-x:hidden;;
}
</style>
