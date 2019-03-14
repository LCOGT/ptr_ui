<template>  
  <div>
    <nav class="level"><div class="level-item title">photon ranch</div></nav>
    <world-map name="google"></world-map>
    <!--leaflet-map name="leafmap"></leaflet-map-->
  </div>
</template>

<script>
import WorldMap from '@/components/WorldMap'
import LeafletMap from '@/components/LeafletMap'

export default {
  name: 'Home',
  components: {
    WorldMap,
    LeafletMap
  }
}
</script>

<style scoped>
.title {
  font: 70px 'Share Tech Mono', monospace;
  margin: 20px;
}
</style>
