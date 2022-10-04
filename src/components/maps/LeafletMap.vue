<template>
  <span>
    <div
      :id="mapName"
      class="leaflet-map"
    />
  </span>
</template>

<script>

import nite from './nite-overlay'
export default {
  name: 'LeafletMap',
  props: ['name', 'latitude', 'longitude'],
  data () {
    return {
      mapName: this.name + '-map',
      map: null,
      tileLayer: null,
      layers: []
    }
  },
  mounted () {
    this.initMap()
  },
  watch: {
    latitude: function () {
      this.recenterMap()
    },
    longitude: function () {
      this.recenterMap()
    }

  },
  methods: {
    /* eslint-disable */
    initMap () {
      let map
      const OWM_API_KEY = '48ee9521eef663b4566e27689741916f'

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a>'
      })
      const owm_clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid={apiKey}', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
        apiKey: OWM_API_KEY,
        opacity: 0.9
      })
      const owm_wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid={apiKey}', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
        apiKey: OWM_API_KEY,
        opacity: 0.2,
        showLegend: true
      })
      const owm_temp = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid={apiKey}', {
        maxZoom: 19,
        attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
        apiKey: '0b9ae90c37b492b7da3c843ff795f217',
        opacity: 0.4,
        showLegend: true
      })
      const googleMaps = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        detectRetina: true
      })

      const baseMaps = {
        Google: googleMaps
      }
      const overlays = {
        Clouds: owm_clouds,
        Wind: owm_wind,
        Temperature: owm_temp
      }

      this.map = L.map(this.mapName, {
        center: new L.LatLng(this.latitude || 0, this.longitude || 0),
        zoom: 7,
        layers: [googleMaps, owm_clouds]
      })

      const layerControl = L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(this.map)
      nite.init()

      // this.map = L.map(this.mapName).setView([this.latitude, this.longitude], 8);
      // this.tileLayer = L.tileLayer(
      // 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png',
      // {
      // maxZoom: 10,
      // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>',
      // }
      // );
      // this.tileLayer.addTo(this.map);
    },

    /* eslint-enable */

    recenterMap () {
      this.map.setView([this.latitude, this.longitude])
    }
  }
}

</script>

<style scoped>
    .leaflet-map {
        width: 100%;
        height: 400px;
        background-color: grey;
        margin: 20px auto;
        max-height: 90vh;
        z-index: 1;
    }
</style>
