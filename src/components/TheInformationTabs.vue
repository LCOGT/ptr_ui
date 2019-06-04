<template>
        <div class='information-tabs'>
            <br>
            <b-tabs v-model="activeTab" size="is-small" type="is-toggle" position="is-centered">

                <!-- Enclosure Camera and Site Info -->
                <b-tab-item>
                    <template slot="header">
                        <span> site </span>
                    </template>
                    <div> 
                        <the-dome-cam class="dome-cam" />
                        <div class="button-container">
                            <command-button :data="buttonData.park"></command-button>
                            <div style="width: 10px;"></div>
                            <command-button :data="buttonData.unpark"></command-button>
                        </div>
                    </div>
                </b-tab-item>

                <!-- Sky Chart and Object Table -->
                <b-tab-item>
                    <template slot="header">
                        <span> sky chart </span>
                    </template>
                    <div class="columns">
                        <the-sky-chart v-resize:throttle="onResize" class="column skychart-column"/> 
                        <div class="column">
                            <nav class="level is-mobile"> 
                                <div class="left-level" style="display: flex;">
                                    <span class="level-item" style="padding: 10px;"> <b-field>
                                        <b-input name="subject" v-model="buttonData.go.form.ra" style="width: 80px;"></b-input>
                                        <p class="control"> <span class="button is-static">ra</span> </p>
                                    </b-field> </span>
                                    <span class="level-item"> <b-field>
                                        <b-input name="subject" v-model="buttonData.go.form.dec" style="width: 80px;"></b-input>
                                        <p class="control"> <span class="button is-static">dec</span> </p>
                                    </b-field> </span>
                                </div>
                                <div class="right-level">
                                    <command-button class="level-item is-danger" style="margin-right: 20px; width: 100px;":data="buttonData.go"></command-button>
                                </div>
                            </nav>
                            <object-table class="object-table" />
                        </div>
                    </div>
                </b-tab-item>

                <!-- Weather -->
                <b-tab-item>
                    <template slot="header">
                        <span> weather </span>
                    </template>
                    <div>
                        <a href="http://clearoutside.com/forecast/34.42/-119.70"><img src="http://clearoutside.com/forecast_image_large/34.42/-119.70/forecast.png" /></a>
                        <table id="weather-table">
                            <td id="wx-col1">
                                <tr><th>amb_temp C</th><td>{{this.temp}}</td></tr>
                                <tr><th>wind k/h</th><td>{{this.wind}}</td></tr>
                            </td>
                            <td id="wx-col2"></td>
                        </table>
                    </div>
                </b-tab-item>

                <!-- Images -->
                <b-tab-item>
                    <template slot="header">
                    <span> images </span>
                    </template>
                    <div> images </div>
                </b-tab-item>

            </b-tabs>
        </div>
</template>

<script>
import TheDomeCam from '@/components/TheDomeCam'
import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import { mapGetters } from 'vuex'
import ObjectTable from '@/components/ObjectTable'
import Celestial from '@/components/celestialmap/celestial'
import resize from 'vue-resize-directive'

export default {
  name: 'InformationTabs',
  components: {
      TheDomeCam,
      CommandButton,
      TheSkyChart,
      ObjectTable,
  },
  directives: {
      resize,
  },
  data () {
    return {
      activeTab: 0,
      buttonData: {
          park: {
              'name': 'Park',
              'url': '/commands/park',
              'form': {'command': 'park'},
          },
          unpark: {
              'name': 'Unpark',
              'url': '/commands/park',
              'form': {'command': 'unpark'},
          },
          go: {
              name: "slew",
              url: '/commands/slew',
              form: {
                  ra: '',
                  dec: '',
              },
          },
      },
    }
  },
  methods: {
      onResize() {
          Celestial.resize()
      }
  },
  computed: {
      ...mapGetters('observatory', {
          wx: 'wx',
          temp: 'amb_temp_C',
          wind: 'wind',

      })
  },
}
</script>


<style scoped>
.information-tabs {
    margin: 2em;
    height: calc(100vh - 160.5px);
    overflow-y: auto;
}
.button-container {
    display: flex;
}
.dome-cam {
    max-width: 50vw;
}
.object-table {
    margin: 2em;
}
.goto-input {
    width: 100px;
}
.level {
    margin: 2em;
}
#weather-table {
    flex: 1 1 auto;
    margin-top: 20px;
}
#weather-table td {
    height: 30px;
}
#weather-table th {
    width: 150px;
    text-align: right;
    padding-right: 20px;
}

</style>
