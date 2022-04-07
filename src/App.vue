<template>
  <div id="app">
    <router-view class="router-view" v-if="$store.state.site_config.did_config_load_yet" />

    <!-- This is the home for the JS9 DOM elements. They are hidden here and only 
    visible when moved into the js9 component. This avoid js9-reloading issues.-->
    <div id="js9home" ref="js9home" v-show="false">
      <div id="js9content" ref="js9content">
        <div class="JS9Menubar" id="myJS9Menubar"></div>
        <div class="JS9" id="myJS9" data-js9init="true"></div>
      </div>
    </div>
  </div>
</template>

<script>
import JS9 from "@/components/JS9";
export default {
  components: { JS9 },
  beforeCreate() {
    // Initial load of the config. This is the only time it needs to happen unless the user reloads the site. 
    this.$store.dispatch('site_config/update_config')
  },
}
</script>

<style scoped lang="scss">
.router-view {
  //height: calc(100vh - 75px);
  overflow-x: hidden;
}
</style>
