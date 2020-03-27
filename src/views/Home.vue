<template>  
  <div>
    <nav class="level"><div class="level-item title">photon ranch</div></nav>
    <the-world-map :g_config="g_config" name="google" />
    <!--leaflet-map name="leafmap"></leaflet-map-->
  </div>
</template>

<script>
import TheWorldMap from "@/components/TheWorldMap";
import LeafletMap from "@/components/LeafletMap";
import axios from 'axios'

//console.log(JS9)

export default {
  name: "Home",
  data() {
    return {
      g_config: {},
    }
  },
  components: {
    TheWorldMap,
    LeafletMap
  },
  created() {
    axios.get('https://api.photonranch.org/api/all/config').then(resp => {
      this.g_config = resp.data
      console.log(resp.data)
    })
  }
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
