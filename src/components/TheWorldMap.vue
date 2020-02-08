<template>
    <span>
        <div class="google-map" :id="mapName"></div>
    </span>
</template>

<script>
import nite from '@/utils/nite-overlay'
// import test1 from '@/utils/test';

export default {
  name: 'TheWorldMap',
  props: ['name'],
  data: function () {
    return {
      mapName: this.name + '-map',
      infoWindows: [],
    }
  },
  mounted: function () {
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

    const map = new google.maps.Map(element, options)

    let sites = this.getSitesForMap()

    sites.forEach(site => {

      var marker = new google.maps.Marker({
        position: { lat: site.geo.latitude, lng: site.geo.longitude },
        map: map,
        title: site.name
      })
      let siteInfoWindow = new google.maps.InfoWindow({
        content: this.renderSiteContent(site.name, site.sitecode)
      })
      this.infoWindows.push(siteInfoWindow)
      marker.addListener('click', () => {
        this.infoWindows.map(x => x.close())
        siteInfoWindow.open(map, marker)
      })

    })

    //var marker = new google.maps.Marker({
      //position: { lat: 34.7, lng: -120.0 },
      //map: map,
      //title: 'Sedgwick'
    //})
    //var contentString = '<div id="content">' +
            //'<div id="siteNotice" style="width: auto;">' +
            //'</div>' +
            //'<img src="https://www.independent.com/wp-content/uploads/2016/08/30/20160811_LCOGT_Sedgwick_009.jpg" style="width: 200px;"></img>' +
            //'<div id="bodyContent">' +
            //'<p>Sedgwick</p>' +
            //'</div>' +
            //'</div>'

    //var infowindow = new google.maps.InfoWindow({
      //content: this.renderSiteContent("West Mountain Drive Observatory", "wmd")
    //})
    //marker.addListener('click', () => {
      //infowindow.open(map, marker)
    //})

    nite.init(map)
    setInterval(function () { nite.refresh() }, 10000) // every 10s

    // Get position of the sun and display on map.
    var sun_pos = { lat: nite.getSunPosition().lat(), lng: nite.getSunPosition().lng() }
    var sun_shape = new google.maps.Marker({
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
      map: map
    })
  },
  methods: {

    getSitesForMap() {
      let sites = [
        //{
          //"name": "Sedgwick Observatory",
          //"geo": {
            //"latitude": 34.691499,
            //"longitude": -120.042252
          //},
          //"sitecode": "sqa",
        //},
        {
          "name": "Apache Ridge Observatory",
          "geo": {
            "latitude": 35.554444,
            "longitude": -105.870278,
          },
          "sitecode": "saf",
        },
        {
          "name": "West Mountain Drive Observatory",
          "geo": {
            "latitude": 34.34293028,
            "longitude": -119.68112805,
          },
          "sitecode": "wmd",
        }
      ]
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
              <a class="button is-success" href="ux1/${sitecode}/observe" style="font-weight: bold">Observe here!</a>
            </div>
          </div>
        </div>`
      return contentString
    },

    goToObservePage(site) {
      this.$router.push({path: `/ux1/${site}/observe`})
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
}
</style>
