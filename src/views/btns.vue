<template>
  <div class="columns">

    <div class="column buttons">
        <div class="title">Auth and API</div>
        <button class="button" @click="authenticate">authenticate</button>
        <button class="button" @click="currentSession">current session</button>
        <button class="button" @click="currentUserInfo">current user info</button>
        <hr>
        <button class="button" @click="signOut">sign out</button>
        <button class="button" @click="signIn">sign in as timbeccue</button>
        <hr>
        <button class="button" @click="testAPI">public flask</button>
        <button class="button" @click="testRestrictedAPI">private flask</button>
        <hr>
        <button class="button" @click="testLambdaPublic">public lambda</button>
        <button class="button" @click="testLambdaPrivate">private lambda</button>
        <button class="button" @click="sqsWrite">sqs write</button>
        <button class="button" @click="sqsRead">sqs read</button>
    </div>

    <div class="column buttons">
        <div class="title">Imaging</div>
        <button class="button" @click="" disabled>GOTO bright star</button>
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
        <button class="button" @click="printObjectTable">all objects from json</button>
        <button class="button" @click="printTopTenNebula">top 10 nebula by alt</button>
    </div>

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

    <div class="column buttons">
        <div class="title">Misc</div>
        <button class="button" @click="calculations">altaz calcs</button>
    </div>
    
    <!--div class="column" style="height: 70vh; overflow-y: scroll; background-color: #222; margin: 5em;">
      <p>example</p>
    </div-->

  </div>
</template>

<script>
import { API, Auth } from 'aws-amplify'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { mapGetters } from 'vuex'
import axios from 'axios';
import helpers from '@/utils/helpers'
import CommandButton from '@/components/CommandButton'
import all_objects from '../assets/all_objects.json'
import mapConfigs from '@/components/celestialmap/mapConfigs'

export default {
  name: 'btns',
  components: {
    CommandButton,
  },
  data () {
    return {
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
          roofOpen: {
              'name': 'Open Roof',
              'url': '/commands/roof',
              'form': {'command': 'open'},
          },
          roofClose: {
              'name': 'Close Roof',
              'url': '/commands/roof',
              'form': {'command': 'close'},
          },
          focusAuto: {
              'name': 'autofocus',
              'url': '/commands/focus',
              'form': {'command': 'auto'}
          },
          filterL: {
            name: 'L',
          },
          filterR: {
            name: 'R',
          },
          filterG: {
            name: 'G',
          },
          filterB: {
            name: 'B',
          },
          captureImage1: {
              'name': '1 s',
              'url': '/commands/camera',
              form: {
                  time: '1', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
          captureImage10: {
              'name': '10s',
              'url': '/commands/camera',
              form: {
                  time: '10', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
          captureImage30: {
              'name': '30s',
              'url': '/commands/camera',
              form: {
                  time: '30', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
          captureImage300: {
              'name': '300s',
              'url': '/commands/camera',
              form: {
                  time: '300', count: '1', delay: '0', dither: 'off', hint: '',
                  filter: 'LUMINANCE', bin: '1', size: '1', autofocus: 'false',
              }
          },
      }
    }
  },
  methods: {
    authenticate () {
      Auth.currentAuthenticatedUser({
        bypassCache: false
      }).then(user => console.log(user))
        .catch(err => console.log(err))
    },
    currentSession () {
      Auth.currentSession()
        .then(data => console.log(data))
        .catch(err => console.log(err))
    },
    currentUserInfo () {
      Auth.currentUserInfo()
        .then(data => console.log(data))
        .catch(err => console.log(err))
    },
    signOut () {
      Auth.signOut({ global: true })
        .then(data => {
          console.log(data)
          this.$store.commit('auth/setUser', '')
        })
        .catch(err => console.log(err))
    },
    signIn () {
      Auth.signIn({ username: 'timbeccue', password: 'Password1!' })
        .then(user => {
          console.log(user)
          this.$store.commit('auth/setUser', user)
        })
        .catch(err => console.log(err))
    },
    testAPI () {
      let apiName = "local flask"
      let myInit = {
        response: true,
      }
      API.post(apiName, '/api/test', myInit).then(response => {
          console.log(response)
      }).catch(error => {
          console.log(error.response)
      });
    },
    testRestrictedAPI () {
      let apiName = "local flask"
      let myInit = {
        response: true,
      }
      API.post(apiName, '/api/loginrequired', myInit).then(response => {
          console.log(response)
      }).catch(error => {
          console.log(error.response)
      });
    },
    calculations() {
      let ra = 1
      let dec = 85
      let lat = 34
      let long = -119
      console.log(helpers.eq2altaz(ra, dec, lat, long))
    },
    
    // Helper function: given a geojson object, returns an array with a few useful attributes.
    getObj(obj) {
        return [
          ...obj.geometry.coordinates, 
          obj.properties.mag, 
          obj.properties.type, 
          obj.properties.name,
          ...helpers.eq2altaz(obj.geometry.coordinates[0]/15, obj.geometry.coordinates[1], 34, -119)
        ]
    },

    // Prints a table of all the objects stored in 'all_objects.json'.
    printObjectTable() {
      console.log('printing object table')
      console.log(all_objects.features)
      let objs = []
      for (let i=0;i<all_objects.features.length; i++) {
        objs.push(this.getObj(all_objects.features[i]))
      }
      console.table(objs)
    },

    printTopTenNebula() {
      // ttn: top ten nebula
      let ttn = []

      // Function to check if an object's type is in the array of nebula types.
      function is_neb(obj) {
        return (mapConfigs.nebula.indexOf(obj.properties.type) > -1)
      }

      // Comparator to return the higher altitude
      function compareAlt(a,b) {
        return b[5] - a[5]
      }

      // For each object, if it's a nebula, put it in the ttn array.
      for (let i=0; i<all_objects.features.length; i++) {
        let obj = all_objects.features[i]
        if (is_neb(obj)) {
          ttn.push(this.getObj(obj))
        } 
      }
      // Sort by highest altitude; take the first ten.
      ttn.sort(compareAlt)
      console.table(ttn.slice(0,10))
    },

    testLambdaPublic() {
      let apiName = 'LambdaTest';
      let myInit = {
        response: true,
      }
      
      API.get(apiName, '/public', myInit).then(response => {
          // Add your code here
          console.log(response)
      }).catch(error => {
          console.log(error.response)
      });
    },
    testLambdaPrivate() {
      let apiName = 'LambdaTest';
      let myInit = {
        response: true,
      }
      API.get(apiName, '/private', myInit).then(response => {
          console.log(response)
      }).catch(error => {
          console.log(error.response)
      });
    },
    sqsWrite() {
      let apiName = 'LambdaTest';
      API.post(apiName, '/sqs_write').then(response => {
          console.log(response)
      }).catch(error => {
          console.log(error.response)
      });
    },
    sqsRead() {
      let apiName = 'LambdaTest';
      API.post(apiName, '/sqs_read').then(response => {
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
