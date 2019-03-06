<template>
<div id="side-controls" v-bind:style="{ width: sidebarWidth }">
    <div style="background-color: red; height: 50px;" v-on:click="setWidth()"></div>

</div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
export default {
  name: 'SideControls',
  data () {
    return {
      isOpen: true,
      sidebarWidth: '300px',
    }
  },
  components: {
    Sidebar
  },
  methods: {
      setWidth () {
          this.isOpen = !this.isOpen;
          this.sidebarWidth = (this.isOpen) ? '300px' : '50px';
      }
  }
}
</script>

<style scoped>
#side-controls {
    background-color: #ddd;
    height: 100vh;
}
</style>
