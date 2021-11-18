<template>  
  <div>
    <the-menu />
    <div class="page-content">


        <the-world-map name="google" class="map-display"/>
        <!--leaflet-map name="leafmap"></leaflet-map-->

      <sites-overview-cards :sites="all_sites" class="sites-overview-cards" />
    </div>
  </div>
</template>

<script>
import PTR from "@/components/logoText/PTR";
import PhotonRanch from "@/components/logoText/PhotonRanch";
import TheWorldMap from "@/components/maps/TheWorldMap";
import TheMenu from "@/components/TheMenu";
import LeafletMap from "@/components/maps/LeafletMap";
import SitesOverviewCards from '@/components/SitesOverviewCards'
import { mapGetters } from 'vuex'

export default {
  name: "Home",
  components: {
    PTR,
    PhotonRanch,
    TheWorldMap,
    LeafletMap,
    TheMenu,
    SitesOverviewCards,
  },

  computed: {
    ...mapGetters('site_config', ['all_sites'])
  }
};
</script>

<style lang="scss" scoped>
.title {
  font: 70px "Share Tech Mono", monospace;
  /*font: 70px 'Faster One', cursive;*/
  margin: 20px;
}
html {
  overflow: hidden;
}
.page-content {
  position:absolute;
  top: 75px;
  height: calc(100vh - 75px);
  overflow-y: auto;
}

.sites-overview-cards {
  margin: 1em auto;
  max-width: 90vw;
}
.map-display {
  margin-top: 2rem;
  height: 100%;
  max-height: 450px;
  width: 100vw;
}
</style>
