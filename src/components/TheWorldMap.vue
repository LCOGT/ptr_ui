<template>
    <span style="z-index: 1;">
        <div class="google-map" :id="mapName"></div>
    </span>
</template>

<script>
import nite from '@/utils/nite-overlay'
import axios from 'axios'
// import test1 from '@/utils/test';

export default {
  name: 'TheWorldMap',
  props: ['name', 'g_config'],
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
  async mounted () {
    const element = document.getElementById(this.mapName)
    const options = {
      zoom: 2,
      center: new google.maps.LatLng(0, 0),
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

    // Fetch the list of sites to display on the map
    let sites = await this.getSitesForMap()

    // For each site, draw a marker with a popup (on click) to visit the site.
    sites.forEach(site => {
      var marker = new google.maps.Marker({
        position: { lat: site.latitude, lng: site.longitude },
        map: this.map,
        title: site.name
      })
      let siteInfoWindow = new google.maps.InfoWindow({
        content: this.renderSiteContent(site.name, site.site)
      })
      this.infoWindows.push(siteInfoWindow)
      marker.addListener('click', () => {
        this.infoWindows.map(x => x.close())
        siteInfoWindow.open(this.map, marker)
      })
    })

    // Draw the daylight regions, and update every few seconds.
    nite.init(this.map)
    this.updateTwighlightInterval = setInterval(function () { nite.refresh() }, 10000) // every 10s

    // Get position of the sun and display on map, and update every few seconds.
    this.drawSunMarker()
    this.updateSunInterval = setInterval(this.updateSunPosition, 10000)

  },
  beforeDestroy() {
    // Remove the looping intervals that update the sun and daylight regions on the map.
    clearInterval(this.updateTwighlightInterval)
    clearInterval(this.updateSunInterval)
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
      var sun_pos = { lat: nite.getSunPosition().lat(), lng: nite.getSunPosition().lng() }
      this.sunMapMarker.setPosition(sun_pos)
    },

    // Return the list of sites to render on the map. 
    async getSitesForMap() {
      let sites = []
      let resp = await axios.get('https://api.photonranch.org/api/all/config')
      let data = resp.data
      Object.keys(data).forEach(site => {
        let s = {
          "name":data[site].name.toString(),
          "site": data[site].site.toString(),
          "latitude":  parseFloat(data[site].latitude),
          "longitude": parseFloat(data[site].longitude),
        }
        sites.push(s)
      })
      return sites
    },

    renderSiteContent(name, sitecode) {
      let contentString = `
        <div class="card" style="max-width: 200px">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${name}</p>
                <p class="subtitle is-6">site code: ${sitecode}</p>
              </div>
            </div>

            <div class="content">
              <a class="button is-success" href="site/${sitecode}/home" style="font-weight: bold">View this site!</a>
            </div>
          </div>
        </div>`
      return contentString
    },

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
