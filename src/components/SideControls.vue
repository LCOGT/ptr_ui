<template>
<div id="side-controls" v-bind:style="{ width: width}">
    <p class='toggle-open-button' v-if="!isMobile" v-on:click="isOpen = !isOpen">{{ isOpen ? '>' : '<' }}</p>

</div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
export default {
  name: 'SideControls',
  data () {
    return {
      isOpen: true,
      isMobile: ''
    }
  },
  mounted() {
    this.isMobile = window.innerWidth <= 768;
    addEventListener('resize', () =>  {
      this.isMobile = window.innerWidth <= 768;
    })
  },
  computed: {
    width: function () {
      if (this.isMobile) { return '100%' }
      else { return (this.isOpen) ? '400px' : '70px'; }
    },
  }
}
</script>

<style scoped>
#side-controls {
    background-color: #ddd;
    height: 100vh;
    transition: width 0.3s;
}

.toggle-open-button {
  background-color: red;
  height: 70px;
  line-height: 70px;
  text-align: center;
  vertical-align: center;
  color: white;
  font-weight: 900;
  font-size: 48px;
  cursor: pointer;
}
</style>
