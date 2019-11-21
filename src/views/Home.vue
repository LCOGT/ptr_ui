<template>  
  <div>
    <nav class="level"><div class="level-item title">photon ranch</div></nav>
    <!--the-world-map name="google" /-->

    <leaflet-map name="leafmap"></leaflet-map>
    <div id="testplotdiv" style="width: 600px; height: 200px;" />
  </div>
</template>

<script>
import TheWorldMap from '@/components/TheWorldMap'
import LeafletMap from '@/components/LeafletMap'

//console.log(JS9)

export default {
  name: 'Home',
  components: {
    TheWorldMap,
    LeafletMap
  },
  mounted() {
    let testplotdiv = document.getElementById("testplotdiv")
    let xdata = [[1,3],[2,6],[3,8],[4,2]]
    let opts = {
      zoomStack: true,
      selection: { mode: "xy" },
      grid: {
        color: "red",
        //backgroundColor: "green",
        borderColor: "orange",
        margin: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        },
        axisMargin: 0,
        labelMargin: 0,
        minBorderMargin: 0,
        borderWidth: 0,
        hoverable: true,
        markings: [ { xaxis: { from: 3, to: 3 }, yaxis: {from: 0, to: 8}, color: "white", lineWidth: 1}],
      },
      yaxis: {
        show: false,
      },
      xaxis: {
        show: false,
      },
    }
    $.plot(testplotdiv, [xdata], opts);
  }
}
</script>

<style scoped>
.title {
  font: 70px 'Share Tech Mono', monospace;
  /*font: 70px 'Faster One', cursive;*/
  margin: 20px;
}
html {
  overflow: hidden;
}
</style>
