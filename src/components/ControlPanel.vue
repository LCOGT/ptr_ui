<template>
<div id="side-controls" v-bind:style="{ width: width}">
    <p class='toggle-open-button' v-if="!isMobile" v-on:click="isOpen = !isOpen">{{ isOpen ? 'controls >' : '<' }}</p>
    <div class="top-block"><strong></strong></div>
    <div class="scrollBox">
      <camera />
      <focus />
      <rotate />
      <br>
      <div style="height:2000px; font: 96px/1 'Oswald', serif; color: #777; text-align: center; opacity: 0.05;">&Omega;</div>
      

    </div>
</div>
</template>

<script>
import Focus from '@/components/ControlPanel/Focus'
import Rotate from '@/components/ControlPanel/Rotate'
import Camera from '@/components/ControlPanel/Camera'
export default {
  name: 'ControlPanel',
  components: {
    Focus,
    Rotate,
    Camera,
  },
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
    background-color: #202020;
    transition: width 0.3s;
    height:88vh;
    overflow-y: scroll;
}
.toggle-open-button {
  background-color: #444;
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
