<template>
  <div id="app">
    <router-view class="router-view" />

    <!-- This is the home for the JS9 DOM elements. They are hidden here and only
    visible when moved into the js9 component. This avoid js9-reloading issues.-->
    <div
      v-show="false"
      id="js9home"
      ref="js9home"
    >
      <div
        id="js9content"
        ref="js9content"
      >
        <div
          id="myJS9Menubar"
          class="JS9Menubar"
        />
        <div
          id="myJS9"
          class="JS9"
          data-js9init="true"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.router-view {
  overflow-x: hidden;
}
</style>
