<template>
  <div class="card-row">
    <template v-for="s in orderedSites">
      <div
        v-if="siteImagesLoaded"
        :key="s.site"
        :val="s.site"
        class="card"
        :class="{
          'online': isOnline(s.site)
        }"
      >
        <div class="card-image">
          <router-link :to="'/site/'+s.site+'/observe'">
            <figure class="image is-2by1">
              <img :src="getImageUrl(s.site)">
            </figure>
          </router-link>
        </div>
        <div class="card-header subtitle">
          <router-link :to="'/site/'+s.site+'/observe'">
            <span style="color: white; height: 2em;">{{ s.name }}</span>
          </router-link>
        </div>
        <div class="sitecode-overlay">
          {{ s.site }}
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import axios from 'axios'
import _ from 'lodash'

export default {
  name: 'SitesOverviewCards',
  props: {
    sites: {
      type: Array,
      default: () => { return [] }
    }
  },
  data () {
    return {
      siteOnlineStatus: {},
      siteImages: {},
      siteImagesLoaded: false
    }
  },
  mounted () {
    this.updateAllSiteImages()

    // Draw observatories with colors to denote weather/open status
    this.getSiteOpenStatus()

    // Disable the constant polling, since we're not using the online status here for now
    // this.siteOnlineStatusInterval = setInterval(this.getSiteOpenStatus, 5000)
  },
  beforeDestroy () {
    clearInterval(this.siteOnlineStatusInterval)
  },
  watch: {
    sites () {
      this.updateAllSiteImages()
    }
  },
  methods: {
    getImageUrl (site) {
      if (site in this.siteImages) {
        return this.siteImages[site]
      } else {
        return 'https://placehold.jp/30/222222/999999/600x300.png?text=no%20available%20images'
      }
    },
    getSiteOpenStatus () {
      const url = this.$store.state.api_endpoints.status_endpoint + '/allopenstatus'
      axios.get(url).then(resp => {
        this.siteOnlineStatus = _.orderBy(resp.data, [s => s.site], ['asc'])
      })
    },
    isOnline (site) {
      if (!Object.keys(this.siteOnlineStatus).includes(site)) {
        return false
      }
      const maxOnlineAge = 300 // 5 minutes
      const siteStatus = this.siteOnlineStatus[site]
      const a = siteStatus.status_age_s <= maxOnlineAge && siteStatus.weather_ok && siteStatus.open_ok
      return a
    },
    async updateAllSiteImages () {
      const url = this.$store.state.api_endpoints.active_api + '/latest_image_all_sites'
      const response = await axios.get(url)
      this.siteImages = response.data
      this.siteImagesLoaded = true
    }
  },

  computed: {
    orderedSites () {
      const getImgDate = (site) => {
        const sitecode = site.site
        if (this.siteImages !== 'undefined' && sitecode in this.siteImages) {
          const url = this.siteImages[sitecode]
          const yearmonthday = parseInt(url.split('-')[3])
          return yearmonthday
        } else {
          // This is used for sorting dates, newest to oldest.
          // If there's no image, we want the site to be placed last.
          return 0
        }
      }
      // copy the sites array; avoid mutating the prop
      const sitesCopy = [...this.sites]

      sitesCopy.sort((a, b) => {
        return getImgDate(b) - getImgDate(a)
      })
      return sitesCopy
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
  gap: 1rem;
  @include tablet {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 1rem;
  }
}

.subtitle {
  position:absolute;
  top: 0em;
  opacity: 0.8;
  pointer-events: none;
  font-size: 1rem;
  padding: 0.25em;
  line-height: 1.25;
  //height: 3em;
  width: 100%;
  margin-bottom: 0 !important;
}

.sitecode-overlay {
  position:absolute;
  height: 0;
  right: 1rem;
  bottom: 3.5rem;
  text-transform:uppercase;
  font-weight: 900;
  font-size:xx-large;
  opacity: 0.3;

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
  background-color: black;
  border: none;
}

.divider {
  border-bottom: 1px solid grey;
}
</style>
