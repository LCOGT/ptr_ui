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

        <div class="card-header subtitle">
          <router-link :to="'/site/'+s.site+'/observe'">
            <span style="color: white; height: 2em;">{{s.name}}</span>
          </router-link>
        </div>

        <div class="card-image">
          <router-link :to="'/site/'+s.site+'/observe'">
            <figure class="image is-2by1"> <img :src="site_images[s.site]" /> </figure>
          </router-link>
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
      const url = this.$store.state.dev.status_endpoint + '/allopenstatus'
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

.subtitle {
	padding: 0.25em;
	line-height: 1.25;
	height: 3em;
	margin-bottom: 0 !important;
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