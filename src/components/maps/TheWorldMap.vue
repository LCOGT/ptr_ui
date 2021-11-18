<template>
    <div style="z-index: 1;">
        <div class="google-map" :id="mapName"></div>
    </div>
</template>

<script>
import nite from './nite-overlay'
import { mapState, mapGetters, mapActions } from 'vuex'
import google_map_styles from './google-styles'
import { makeIcon } from './mapHelpers'

export default {
  name: 'TheWorldMap',
  props: ['name', ],
  data: function () {
    return {

      // The google map object
      map: '',

      mapName: this.name + '-map',
      infoWindows: [],

      iw: '', // infoWindow
      oms: '', // OverlappingMarkerSpiderfier

      // The marker depicting the sun's position
      sunMapMarker: '',
    }
  },
  async mounted() {
    this.initMap()
  },
  beforeDestroy() {
    // Remove the looping intervals that update the sun and daylight regions on the map.
    clearInterval(this.updateTwilightInterval)
    clearInterval(this.updateSunInterval)
  },
  
  methods: {

    addMarkerWithData(markerData) {
      const white = { r: 255, g: 255, b: 255};
      const marker = new google.maps.Marker({
          position: markerData,
          draggable: true,
      });

      function darkenColor(rgb) {
        return {
            r: rgb.r - 50,
            g: rgb.g - 50,
            b: rgb.b - 50,
        }
      }
      google.maps.event.addListener(marker, 'spider_format', function (status) {
          const markerStatus = OverlappingMarkerSpiderfier.markerStatus
          const showName = status == markerStatus.UNSPIDERFIABLE || status == markerStatus.SPIDERFIED
          const showPlus = status == markerStatus.SPIDERFIABLE
          const sizeCoefficient = showName ? 1.5 : 1.5

          marker.setIcon({
              url: makeIcon(markerData.rgb, white,
                  showPlus ? white : false,
                  showName ? markerData.name : false),
              scaledSize: new google.maps.Size(23*sizeCoefficient, 32*sizeCoefficient)  // makes SVG icons work in IE
          });
      });
      this.oms.addMarker(marker, e => {
          this.iw.setContent(markerData.content);
          this.iw.open(this.map, marker);
      });
    },


    async initMap() {
      await this.$store.dispatch('sitestatus/getSiteOpenStatus')
      const sun_pos = { lat: nite.calculatePositionOfSun().lat(), lng: nite.calculatePositionOfSun().lng() }
      const map_center_latitude = 15 // puts sites at a more visibly comfortable location
      this.map = new google.maps.Map(document.getElementById(this.mapName), {
        zoom: 2,
        center: new google.maps.LatLng(map_center_latitude, sun_pos.lng + 180),
        styles: google_map_styles
      });

      // Draw the daylight regions, and update every few seconds.
      nite.init(this.map)
      this.updateTwilightInterval = setInterval(function () { nite.refresh() }, 10000) // every 10s

      // Get position of the sun and display on map, and update every few seconds.
      this.drawSunMarker()
      this.updateSunInterval = setInterval(this.updateSunPosition, 10000)

      let sites = this.all_sites
       
      const oms = new OverlappingMarkerSpiderfier(this.map, {
        markersWontMove: true,
        markersWontHide: true,
        keepSpiderfied: true,
        circleFootSeparation: 35,
        nearbyDistance: 35,
      });
      this.oms = oms

      const iw = new google.maps.InfoWindow();
      this.iw = iw

      function iwClose() { iw.close(); }
      google.maps.event.addListener(this.map, 'click', iwClose);

      console.log(sites.map(s => s.site))

      const markers = sites.filter(site => {
        // First, remove sites that don't have an available status 
        return Object.keys(this.site_open_status).includes(site.site)
      }).map(site => {

        const markerData = {
          lat: site.latitude,
          lng: site.longitude, 
          rgb: this.getSiteMapColor(this.site_open_status[site.site]),
          content: this.renderSiteContent(site.name, site.site, this.site_open_status[site.site]),
          name: site.site.toUpperCase(),
        }

        this.addMarkerWithData(markerData)
      })

    },

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
                  ${openStatus.weather_ok ? "placeholder" : "placeholder"}
                  </span>
                </div>
                <div class="val">
                  <span style="color:${openStatus.open_ok ? 'greenyellow' : 'red'}">
                  ${openStatus.open_ok ? "placeholder" : "placeholder"}</div>
                    </span>
                </div>
            </div>
        `
        }

        let style = `
        <style>
          .status-entry {
            font-weight: normal;
            display:flex;
            flex-direction:row;
            flex-wrap:wrap;
            width: 100%;
            margin-top: 1em;
            align-items: center;
          }
          .col {
              flex-direction: column;
              width:50%;
          }
          .status-entry .key {
            color:black;
            padding: 4px 8px;
            white-space: nowrap;
            margin-bottom: 3px;
            text-align: right;
            flex-grow:1;
            height: 2em;
          }
          .status-entry .val{
            color: greenyellow;
            background-color: black;
            padding: 4px 8px;
            margin-bottom: 3px;
            white-space: nowrap;
            flex-grow:1;
            height: 2em;
          }
          .site-title {
            color: blue;
          }
        </style>
        `

        let contentString = `

          ${style}

          <div class="" style="max-width: 200px; background-color:white; border-color: white;">
            <div class="">
              <div class="">
                <div style="padding-bottom: 4px; border-bottom: 1px solid black;">
                  <p class="title is-5" style="color: black;">${name}</p>
                  <p class="subtitle is-6" style="color: #333;">site code: ${sitecode}</p>
                </div>
              </div>
          
              ${weather_status}

              <div class="">
                <a class="button is-success" href="site/${sitecode}/home" style="font-weight: bold; margin-top: 1em;">View this site!</a>
              </div>
            </div>
          </div>`
        return contentString
    },

    getSiteMapColor(siteOpenStatus) {
      const colors = {
        yellow: {r: 221, g: 156, b: 0},
        red: {r: 205, g: 0, b: 0},
        green: {r: 53, g: 154, b: 34},
        grey: {r: 100, g: 100, b: 100},
      }
      if (parseFloat(siteOpenStatus.status_age_s) > 300) { return colors['grey'] }
      if (!siteOpenStatus.hasWeatherStatus) { return colors['green']}
      if (siteOpenStatus.weather_ok && siteOpenStatus.open_ok) {return colors['green']}
      if (siteOpenStatus.weather_ok || siteOpenStatus.open_ok) {return colors['green']}
      return colors['green']
    },

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
      //this.redrawMapSites()
    },
    site_open_status() {
      //this.initMap()
    },
  },
  
  computed: {
    ...mapGetters('site_config', ['all_sites']),
    ...mapState('sitestatus', ['site_open_status']),
    ...mapActions('sitestatus', ['getSiteOpenStatus']),
  },
}
</script>

<style lang="scss" scoped>
.google-map {
    //width: 100vw;
    //height: 50vh;
    min-width: 50px;
    min-height: 50px;
    width: 100%;
    height: 100%;
    background-color: grey;
    max-height: 90vh;
    z-index: 1;
}
</style>
