<template>
  <div class="columns">

    <div class="column buttons">
        <div class="title">Auth and API</div>
        <button class="button" v-on:click="authenticate">authenticate</button>
        <button class="button" v-on:click="currentSession">current session</button>
        <button class="button" v-on:click="currentUserInfo">current user info</button>
        <hr>
        <button class="button" v-on:click="signOut">sign out</button>
        <button class="button" v-on:click="signIn">sign in as timbeccue</button>
        <hr>
        <button class="button" v-on:click="testAPI">testAPI</button>
        <button class="button" v-on:click="postTestAPI">postTestAPI</button>
        <button class="button" v-on:click="testRestrictedAPI">testRestrictedAPI</button>
        <button class="button" v-on:click="testPostRestrictedAPI">testPostRestrictedAPI</button>
        <hr>
        <button class="button" v-on:click="testLambdaPublic">public lambda</button>
        <button class="button" v-on:click="testLambdaPrivate">private lambda</button>
        <button class="button" v-on:click="testLambdaError">error lambda</button>
        <button class="button" v-on:click="goodbye2">callTestLambdaGoodbye2</button>
    </div>

    <div class="column buttons">
        <div class="title">Imaging</div>
        <button class="button" v-on:click="" disabled>GOTO bright star</button>
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
        <button class="button" v-on:click="printObjectTable">printObjects</button>
        <button class="button" v-on:click="printTopTenNebula">printTopTenNebula</button>
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
        <button class="button" v-on:click="calculations">altaz calcs</button>
    </div>
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
  name: 'Test',
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
      let headers = { 'Authorization': this.user }
      axios
        .get('http://localhost:5000/api/test', {headers: headers })
        .then(response => console.log(response))
    },
    postTestAPI () {
      let headers = { "Authorization": this.user }
      axios
        .post('http://localhost:5000/api/test', {headers: headers })
        .then(response => console.log(response))
    },
    testRestrictedAPI () {
      let headers = { 'Authorization': this.token }
      axios
        .get('http://localhost:5000/api/loginrequired', {headers: headers })
        .then(response => console.log(response))
    },
    testPostRestrictedAPI () {
      let headers = { "Authorization": this.token }
      axios
        .post('http://localhost:5000/api/loginrequired', {data: "restrictedPostData"}, {"headers": headers })
        .then(response => console.log(response))
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
      let url = 'https://ohtk5cazqc.execute-api.us-west-2.amazonaws.com/dev/public'
      let headers = {"Authorization": this.token}
      console.log(this.token)
      axios
        .get(url, {"headers": headers})
        .then(response => console.log(response))
    },
    testLambdaPrivate() {
      let url = 'https://ohtk5cazqc.execute-api.us-west-2.amazonaws.com/dev/private'
      let headers = {"Authorization": this.token }
      console.log(headers)
      axios
        .get(url, {"headers": headers})
        .then(response => console.log(response))
    },
    testLambdaError() {
      let url = 'https://ohtk5cazqc.execute-api.us-west-2.amazonaws.com/dev/error'
      let headers = {"Authorization": this.token }
      console.log(headers)
      axios
        .get(url, {"headers": headers})
        .then(response => console.log(response))
    },

    goodbye2() {
      let apiName = 'MyAPIGatewayAPI';
      let path = '/'; 
      let myInit = { // OPTIONAL
          headers: {"Authorization": this.token },
          response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
          queryStringParameters: {}
      }
      
      API.post(apiName, path, myInit).then(response => {
          // Add your code here
          console.log(response)
      }).catch(error => {
          console.log(error.response)
      });
    }
  },
  computed: {
    ...mapGetters('auth', {
      user: 'user',
      username: 'username',
      isLoggedIn: 'isLoggedIn',
      token: 'getToken',
      id: 'getId'
    }),
  },
}
</script>

<style scoped>
.column {
  padding: 5em;
  display: flex;
  flex-direction:column;
  align-items:baseline;
}
</style>
