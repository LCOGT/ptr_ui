<template>
  <div class="card-row">
    <template v-for="s in sorted_sites">
      <div 
        :key="s.site" 
        :val="s.site"
        v-if="!site_blacklist.includes(s.site)"
        class="card" 
        :class="{
          'online': isOnline(s.site)
          }">

        <div class="card-header subtitle">{{s.name}}</div>
        <div class="card-image">
          <router-link :to="'/site/'+s.site+'/observe'">
            <figure class="image is-2by1"> <img :src="site_images[s.site]" /> </figure>
          </router-link>
        </div>

        <div class="card-content">
          <div class="quick-links">
            <router-link :to="'/site/'+s.site+'/home'"> home</router-link>
            &nbsp;|&nbsp;
            <router-link :to="'/site/'+s.site+'/targets'"> targets</router-link>
            &nbsp;|&nbsp;
            <router-link :to="'/site/'+s.site+'/observe'"> observe</router-link>
            &nbsp;|&nbsp;
            <router-link :to="'/site/'+s.site+'/calendar'"> calendar</router-link>
            &nbsp;|&nbsp;
            <router-link :to="'/site/'+s.site+'/projects'"> projects</router-link>
          </div>
          <hr style="border-bottom: 1px solid grey;">
          <!--site-reservation-status :sitecode="s.site" /-->
        </div>

      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios';
import _ from 'lodash'
import { mapGetters } from 'vuex'

import SiteReservationStatus from '@/components/SiteReservationStatus'
export default {
  name: 'SitesOverviewCards',
  components: {
    SiteReservationStatus,
  },
  props: {
    sites: {
      type: Array,
      default: () => { return []}
    }
  },
  data() {
    return {
      site_blacklist: [ 'ALI-sim', 'wmd2' ], // don't show test sites
      site_online_status: {},

      site_images: {},
    }
  },
  mounted() {
    console.log(this.sites)
    this.updateAllSiteImages()

    // Draw observatories with colors to denote weather/open status
    this.getSiteOpenStatus()
    this.siteOnlineStatusInterval = setInterval(this.getSiteOpenStatus, 5000)

  },
  beforeDestroy() {
    clearInterval(this.siteOnlineStatusInterval)
  },
  watch: {
    sites() {
      this.updateAllSiteImages()
    },
  },
  methods: {
    getSiteOpenStatus() {
      const url = `https://status.photonranch.org/status/allopenstatus`
      axios.get(url).then(resp => {
        this.site_online_status = _.orderBy(resp.data, [s => s.site], ['asc'])
      })
    },
    isOnline(site) {
      if (!Object.keys(this.site_online_status).includes(site)) {
        return false
      }
      const max_online_age = 300  // 5 minutes
      const site_status = this.site_online_status[site]
      let a = site_status.status_age_s <= max_online_age && site_status.weather_ok && site_status.open_ok
      return a
    },
    updateSiteImage(site) {
      const url = this.$store.state.dev.active_api + `/${site}/latest_images/1` 
      axios.get(url).then(response => {
        if (response.data.length > 0) {
          if (site =='wmd2') {console.log(response)}
          this.$set(this.site_images, site, response.data[0].jpg_url)
        } else {
          this.$set(this.site_images, site, '') 
        }
      })
    },
    updateAllSiteImages() {
      this.all_sites.forEach(s => {
        this.updateSiteImage(s.site)
      })
    },

  },

  computed: {
    sorted_sites() {
      return _.orderBy(this.sites, [s => s.site], ['asc'])
    },
    ...mapGetters('site_config', [
      'available_sites',
      'all_sites',
    ])
  }

}
</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";

.card-row {
  display:flex;
  flex-direction: column;
  justify-content: space-between;
  @include tablet {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    grid-gap: 1rem;
  }
}

.quick-links {
  display: flex;
  justify-content: center;
  a {
    margin: 0 3px;
    color: white;
    text-decoration: underline;
  }
}
.online {
  border-color: greenyellow ;
}
img {
  object-fit:cover;  // crop, don't distort
}
</style>