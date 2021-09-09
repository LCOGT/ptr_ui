<template>  
  <div>
    <the-menu />
    <div class="title has-text-centered" style=" margin: 1rem auto;">photon ranch</div>
    <the-world-map name="google" />
    <!--leaflet-map name="leafmap"></leaflet-map-->
    <p>v0.1.3a</p>

    <sites-overview-cards :sites="all_sites" class="sites-overview-cards" />
  </div>
</template>

<script>
import TheWorldMap from "@/components/TheWorldMap";
import TheMenu from "@/components/TheMenu";
import LeafletMap from "@/components/LeafletMap";
import SitesOverviewCards from '@/components/SitesOverviewCards'
import { mapGetters } from 'vuex'

export default {
  name: "Home",
  components: {
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
.sites-overview-cards {
  margin: 1em auto;
  max-width: 90vw;
}
</style>
