<template>  
  <div>
    <nav class="level"><div class="level-item title">photon ranch</div></nav>
    <the-world-map name="google" />
    <!--leaflet-map name="leafmap"></leaflet-map-->
    <p>v0.1.0</p>
  </div>
</template>

<script>
import TheWorldMap from "@/components/TheWorldMap";
import LeafletMap from "@/components/LeafletMap";

export default {
  name: "Home",
  components: {
    TheWorldMap,
    LeafletMap
  },
};
</script>

<style scoped>
.title {
  font: 70px "Share Tech Mono", monospace;
  /*font: 70px 'Faster One', cursive;*/
  margin: 20px;
}
html {
  overflow: hidden;
}
</style>
