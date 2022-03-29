<template>
  <div class="card-row">
    <template v-for="s in all_sites_real">
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

export default {
  name: 'SitesOverviewCards',
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
    updateAllSiteImages() {
      const url = this.$store.state.dev.active_api + `/latest_image_all_sites`
      axios.get(url).then(response => {
        this.site_images = response.data
      })
    },

  },

  computed: {
    ...mapGetters('site_config', [
      'all_sites_real',
      'all_sites_simulated',
    ]),

    // We want to add enough empty (invisible) test sites so that the cards are sized the same as real sites.
    // Compute the difference in number. If there are more test sites than real sites, don't add any empty sites.
    empty_test_sites_needed() {
      return Math.max(0, Object.keys(this.all_sites_real).length - Object.keys(this.all_sites_simulated).length)
    }
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
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 1rem;
  }
}

.subtitle {
  font-size: 1rem;
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

.divider {
  border-bottom: 1px solid grey;
}
</style>