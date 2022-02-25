
/**
 * This is a page to test simple functions as a proof of concept.
 * Each button should have a single basic task. 
 * The goal is to use this page to outline the full capabilities of the site.
 */

<template>
  <div class="container">
  <div class="columns">


    <!-- Buttons for mount and camera controls -->
    <div class="column buttons">
        <div class="title">Imaging</div>
        <button class="button" disabled>GOTO bright star</button>
        <command-button :data="buttonData.goM81" />
        <command-button :data="buttonData.focusAuto" />
        <hr>
        <div class="buttons has-addons">
        <command-button :data="buttonData.captureImage1" />
        <command-button :data="buttonData.captureImage10" />
        <command-button :data="buttonData.captureImage30" />
        <command-button :data="buttonData.captureImage300" />
        </div>
        <div class="buttons has-addons">
        <command-button :data="buttonData.filterL" :isDisabled="true" />
        <command-button :data="buttonData.filterR" :isDisabled="true" />
        <command-button :data="buttonData.filterG" :isDisabled="true" />
        <command-button :data="buttonData.filterB" :isDisabled="true" />
        </div>
        <hr>
    </div>

    <!-- Buttons for site functions -->
    <div class="column buttons">
        <div class="title">Site</div>
        <div class="buttons has-addons"> 
        <command-button :data="buttonData.park" /> 
        <command-button :data="buttonData.unpark" />
        </div>
        <div class="buttons has-addons"> 
        <command-button :data="buttonData.roofOpen" :isDisabled="true" /> 
        <command-button :data="buttonData.roofClose" :isDisabled="true" />
        </div>
    </div>

    <!-- Miscellaneous buttons go here -->
    <div class="column buttons">
        <div class="title">Misc</div>
        <button class="button" @click="calculations">altaz calcs</button>
        <button class="button" @click="testWCS">wcs function</button>
        <button class="button" @click="getLastCommand">last cmd (mnt1)</button>
    </div>
    
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios';
import helpers from '@/utils/helpers'
import create_commands from '@/utils/create_command'
import CommandButton from '@/components/FormElements/CommandButton'
import all_objects from '../assets/all_objects.json'

import wcs from '@/utils/pix2wcs'

export default {
  name: 'btns',
  components: {
    CommandButton,
  },
  data () {
    return {

      // Each object in buttonData defines the parameters for a commandButton.
      buttonData: {
          park: {
              'name': 'Park',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              'form': create_commands.cmd('mount1', 'mount', 'park')
          },
          unpark: {
              'name': 'Unpark',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              'form': create_commands.cmd('mount1', 'mount', 'tracking', {tracking: 'on'})
          },
          roofOpen: {
              'name': 'Open Roof',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              'form': create_commands.cmd('enclosure_1', 'enclosure', 'open')
          },
          roofClose: {
              'name': 'Close Roof',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              'form': create_commands.cmd('enclosure_1', 'enclosure', 'close')
          },
          focusAuto: {
              'name': 'autofocus',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              'form': create_commands.cmd('focuser_1', 'focuser', 'auto')
          },
          goM81: {
              name: 'Go to M81',
              url: '/site1/mount1/command/',
              http_method: 'POST',
              form: create_commands.cmd('mount1', 'mount', 'go', {ra: 9.93, dec: 69.07})
          },
          filterL: {
              name: 'L',
              url: '/site1/mount1/command/',
              http_method: 'POST',
              form: create_commands.cmd('filter1', 'filter', 'set_name', {filter_name: 'L'})
          },
          filterR: {
              name: 'R',
              url: '/site1/mount1/command/',
              http_method: 'POST',
              form: create_commands.cmd('filter1', 'filter', 'set_name', {filter_name: 'R'})
          },
          filterG: {
              name: 'G',
              url: '/site1/mount1/command/',
              http_method: 'POST',
              form: create_commands.cmd('filter1', 'filter', 'set_name', {filter_name: 'G'})
          },
          filterB: {
              name: 'B',
              url: '/site1/mount1/command/',
              http_method: 'POST',
              form: create_commands.cmd('filter1', 'filter', 'set_name', {filter_name: 'B'})
          },
          captureImage1: {
            'name': '1s',
            'url': '/site1/mount1/command/',
            'http_method': 'POST',
            form: create_commands.cmd('cam1','camera','expose',{time:'1s'})
          },
          captureImage10: {
              'name': '10s',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              form: {
                  time: '10', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
          captureImage30: {
              'name': '30s',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              form: {
                  time: '30', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
          captureImage300: {
              'name': '300s',
              'url': '/site1/mount1/command/',
              'http_method': 'POST',
              form: {
                  time: '300', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
      }
    }
  },

  methods: {



    calculations() {
      let ra = 1
      let dec = 85
      let lat = 34
      let long = -119
      console.log(helpers.eq2altaz(ra, dec, lat, long))
    },
    
    /**
     * Helper function used for printing object tables.
     * @param {geojson} obj Geojson representing an astronomical object
     * @return {array} Return condensed object with a few useful values in an array.
     */
    getObj(obj) {
        return [
          ...obj.geometry.coordinates, 
          obj.properties.mag, 
          obj.properties.type, 
          obj.properties.name,
          ...helpers.eq2altaz(obj.geometry.coordinates[0]/15, obj.geometry.coordinates[1], 34, -119)
        ]
    },


    /**
     * Test a function from pix2wcs.js
     */
    testWCS() {
      console.log(wcs.pix2wcs(10,10))
    },

    /**
     * Get the most recent command sent to site1 -> mount1. For testing.
     * Note: this deletes the command from the queue!
     */
    getLastCommand() {
      let apiName = this.api;
      axios.get(apiName+'/site1/mount1/command/').then(response => {
        console.log(response)
      }).catch(error => {
        console.log(error.response)
      });
    },

  },

  computed: {
    ...mapGetters('auth', {
      user: 'user',
      username: 'username',
      isLoggedIn: 'isLoggedIn',
      token: 'getToken',
    }),
    ...mapGetters('dev', [
      'api',
    ])
  },
}
</script>

<style scoped>
.column {
  padding: 3em;
  display: flex;
  flex-direction:column;
  align-items:baseline;
}
</style>
