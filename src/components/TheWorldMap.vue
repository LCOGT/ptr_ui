<template>
    <span style="z-index: 1;">
        <div class="google-map" :id="mapName"></div>
    </span>
</template>

<script>
import nite from '@/utils/nite-overlay'
import axios from 'axios'
import { mapState, mapGetters, mapActions } from 'vuex'
// import test1 from '@/utils/test';

export default {
  name: 'TheWorldMap',
  props: ['name', ],
  data: function () {
    return {

      // The google map object
      map: '',

      mapName: this.name + '-map',
      infoWindows: [],

      // The marker depicting the sun's position
      sunMapMarker: '',
    }
  },
  async mounted() {

    let sun_pos = { lat: nite.calculatePositionOfSun().lat(), lng: nite.calculatePositionOfSun().lng() }
    
    const element = document.getElementById(this.mapName)
    const options = {
      scrollwheel: false,
      zoom: 2,
      center: new google.maps.LatLng(sun_pos.lat, sun_pos.lng + 180),
      styles: [
        {
          'featureType': 'poi',
          'elementType': 'labels.text.fill',
          'stylers': [
            {
              'color': '#747474'
            },
            {
              'lightness': '23'
            }
          ]
        },
        {
          'featureType': 'poi.attraction',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#f38eb0'
            }
          ]
        },
        {
          'featureType': 'poi.government',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#ced7db'
            }
          ]
        },
        {
          'featureType': 'poi.medical',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#ffa5a8'
            }
          ]
        },
        {
          'featureType': 'poi.park',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#c7e5c8'
            }
          ]
        },
        {
          'featureType': 'poi.place_of_worship',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#d6cbc7'
            }
          ]
        },
        {
          'featureType': 'poi.school',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#c4c9e8'
            }
          ]
        },
        {
          'featureType': 'poi.sports_complex',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#b1eaf1'
            }
          ]
        },
        {
          'featureType': 'road',
          'elementType': 'geometry',
          'stylers': [
            {
              'lightness': '100'
            }
          ]
        },
        {
          'featureType': 'road',
          'elementType': 'labels',
          'stylers': [
            {
              'visibility': 'off'
            },
            {
              'lightness': '100'
            }
          ]
        },
        {
          'featureType': 'road.highway',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#ffd4a5'
            }
          ]
        },
        {
          'featureType': 'road.arterial',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'color': '#ffe9d2'
            }
          ]
        },
        {
          'featureType': 'road.local',
          'elementType': 'all',
          'stylers': [
            {
              'visibility': 'simplified'
            }
          ]
        },
        {
          'featureType': 'road.local',
          'elementType': 'geometry.fill',
          'stylers': [
            {
              'weight': '3.00'
            }
          ]
        },
        {
          'featureType': 'road.local',
          'elementType': 'geometry.stroke',
          'stylers': [
            {
              'weight': '0.30'
            }
          ]
        },
        {
          'featureType': 'road.local',
          'elementType': 'labels.text',
          'stylers': [
            {
              'visibility': 'on'
            }
          ]
        },
        {
          'featureType': 'road.local',
          'elementType': 'labels.text.fill',
          'stylers': [
            {
              'color': '#747474'
            },
            {
              'lightness': '36'
            }
          ]
        },
        {
          'featureType': 'road.local',
          'elementType': 'labels.text.stroke',
          'stylers': [
            {
              'color': '#e9e5dc'
            },
            {
              'lightness': '30'
            }
          ]
        },
        {
          'featureType': 'transit.line',
          'elementType': 'geometry',
          'stylers': [
            {
              'visibility': 'on'
            },
            {
              'lightness': '100'
            }
          ]
        },
        {
          'featureType': 'water',
          'elementType': 'all',
          'stylers': [
            {
              'color': '#d2e7f7'
            }
          ]
        }
      ]
    }

    // Create the google maps object
    this.map = new google.maps.Map(element, options)

    // Draw observatories with colors to denote weather/open status
    this.redrawMapSites()
    this.updateSiteColorInterval = setInterval(this.redrawMapSites, 10000)

    // Draw the daylight regions, and update every few seconds.
    nite.init(this.map)
    this.updateTwilightInterval = setInterval(function () { nite.refresh() }, 10000) // every 10s

    // Get position of the sun and display on map, and update every few seconds.
    this.drawSunMarker()
    this.updateSunInterval = setInterval(this.updateSunPosition, 10000)

  },
  beforeDestroy() {
    // Remove the looping intervals that update the sun and daylight regions on the map.
    clearInterval(this.updateTwilightInterval)
    clearInterval(this.updateSunInterval)
    clearInterval(this.updateSiteColorInterval)
  },
  
  methods: {

    // Draw the sun for the first time
    drawSunMarker() {
      let sun_pos = { lat: nite.getSunPosition().lat(), lng: nite.getSunPosition().lng() }
      this.sunMapMarker = new google.maps.Marker({
        position: sun_pos,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: 'gold',
          fillOpacity: 0.7,
          strokeColor: 'gold',
          strokeWeight: 3,
          strokeOpacity: 0.8
        },
        title: 'Sun',
        map: this.map
      })
    },

    // Reposition the sun to its current position
    updateSunPosition() {

      // Pan to the center of the night region. Disabled for now because it 
      // interrupts the user if they pan around.  
      //this.map.panTo(nite.calculatePositionOfSun(new Date()));

      var sun_pos = { lat: nite.getSunPosition().lat(), lng: nite.getSunPosition().lng() }
      this.sunMapMarker.setPosition(sun_pos)
    },

    renderSiteContent(name, sitecode, openStatus) {

      let weather_status = ` 
        <div class="status-entry">
            <div class="col">
              <div class="key">Status</div>
            </div>
            <div class="col">
              <div class="val">
                <span style="color:${openStatus.status_age_s > 60 ? 'red' : 'greenyellow'}"> 
                ${openStatus.status_age_s > 60 ? 'Offline' : 'Online'} 
                </span>
              </div>
            </div>
        </div>
        `

      if (openStatus.hasWeatherStatus && openStatus.status_age_s < 60) {
        weather_status = `
          <div class="status-entry">
              <div class="col">
                <div class="key">Status</div>
                <div class="key">Weather:</div>
                <div class="key">Can open:</div>
              </div>
              <div class="col">
                <div class="val">
                  <span style="color:${openStatus.status_age_s > 60 ? 'red' : 'greenyellow'}">
                  ${openStatus.status_age_s > 60 ? 'Offline' : 'Online'}
                  </span>
                </div>
                <div class="val">
                  <span style="color:${openStatus.weather_ok ? 'greenyellow' : 'red'}">
                  ${openStatus.weather_ok ? "Good" : "Not good"}
                  </span>
                </div>
                <div class="val">
                  <span style="color:${openStatus.open_ok ? 'greenyellow' : 'red'}">
                  ${openStatus.open_ok ? "Yes" : "No"}</div>
                    </span>
                </div>
            </div>
        `
        }

        let style = `
        <style>
          .status-entry {
            display:flex;
            flex-direction:row;
            flex-wrap:wrap;
            padding: 0 0px;
            width: 100%;
          }
          .col {
              flex-direction: column;
              width: 50%;
          }
          .status-entry .key {
            color:silver;
            padding: 0 8px;
            white-space: nowrap;
            margin-bottom: 3px;
            text-align: right;
            flex-grow:1;
          }
          .status-entry .val{
            color: greenyellow;
            background-color: black;
            padding: 0 8px;
            margin-bottom: 3px;
            white-space: nowrap;
            flex-grow:1;
          }
        </style>
        `

        let contentString = `

          ${style}

          <div class="card" style="max-width: 200px">
            <div class="card-content">
              <div class="media">
                <div class="media-content">
                  <p class="title is-4">${name}</p>
                  <p class="subtitle is-6">site code: ${sitecode}</p>
                </div>
              </div>
          
              ${weather_status}

              <div class="content">
                <a class="button is-success" href="site/${sitecode}/home" style="font-weight: bold; margin-top: 1em;">View this site!</a>
              </div>
            </div>
          </div>`
        return contentString
    },

    getSiteMapColor(siteOpenStatus) {
      if (parseFloat(siteOpenStatus.status_age_s) > 300) { return 'red' }
      if (!siteOpenStatus.hasWeatherStatus) { return 'yellow'}
      if (siteOpenStatus.weather_ok && siteOpenStatus.open_ok) {return 'green'}
      if (siteOpenStatus.weather_ok || siteOpenStatus.open_ok) {return 'yellow'}
      return 'yellow'
    },

    //async getSiteOpenStatus() {
      //this.$store.dispatch('sitestatus/getSiteOpenStatus')
      //let resp = await axios.get(`https://status.photonranch.org/status/allopenstatus`)
      //return resp.data
    //},

    async redrawMapSites() {
      // Fetch the list of sites to display on the map
      await this.$store.dispatch('sitestatus/getSiteOpenStatus')
      let sites = this.all_sites.reverse()

      // For each site, draw a marker with a popup (on click) to visit the site.
      sites.forEach(site => {

        // Skip if the site doesn't have any status available
        if (!Object.keys(this.site_open_status).includes(site.site)) { return }

        let icon_color = this.getSiteMapColor(this.site_open_status[site.site])
        var marker = new google.maps.Marker({
          position: { lat: site.latitude, lng: site.longitude },
          map: this.map,
          icon: {
            url: `http://maps.google.com/mapfiles/ms/icons/${icon_color}-dot.png`
          },
          title: site.name,
        })
        let siteInfoWindow = new google.maps.InfoWindow({
          content: this.renderSiteContent(site.name, site.site, this.site_open_status[site.site])
        })
        this.infoWindows.push(siteInfoWindow)
        marker.addListener('click', () => {
          this.infoWindows.map(x => x.close())
          siteInfoWindow.open(this.map, marker)
        })
      })
    },

  },

  watch: {
    all_sites() {
      this.redrawMapSites()
    }
  },
  
  computed: {
    ...mapState('site_config', ['global_config']),
    ...mapGetters('site_config', ['all_sites']),
    ...mapState('sitestatus', ['site_open_status']),
    ...mapActions('sitestatus', ['getSiteOpenStatus']),
  },
}
</script>

<style scoped>
.google-map {
    width: 100vw;
    height: 50vh;
    background-color: grey;
    max-height: 90vh;
    z-index: 1;
}
</style>
