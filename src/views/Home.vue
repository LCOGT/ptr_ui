<template>
  <div class="home">
    <world-map name="google"></world-map>
    <leaflet-map name="leafmap"></leaflet-map>
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
</style>
