<template>
  <div>
    <div class="page-content">
      <SiteNavbar />

      <the-world-map
        name="google"
        class="map-display"
      />
      <!--leaflet-map name="leafmap"></leaflet-map-->

      <sites-overview-cards
        :sites="all_sites_real"
        class="sites-overview-cards"
      />
    </div>
  </div>
</template>

<script>
import TheWorldMap from '@/components/maps/TheWorldMap'
import SiteNavbar from '@/components/SiteNavbar'
import SitesOverviewCards from '@/components/SitesOverviewCards'
import { mapGetters } from 'vuex'

export default {
  name: 'Home',
  components: {
    TheWorldMap,
    SiteNavbar,
    SitesOverviewCards
  },

  computed: {
    ...mapGetters('site_config', ['all_sites_real'])
  }
}
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
  //top: 75px;
  //height: calc(100vh - 75px);
  height: 100vh;
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
