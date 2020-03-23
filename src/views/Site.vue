

<template>
<div class="page">
  
  <div class="container">
  <section class="page-view">

  <div style="height: 3em"></div>
  <div class="columns" style="padding: 1em;">

    <!-- Menu for site subpages -->
    <div class="column menu-column is-one-fifth is-full-mobile">
      <b-menu class="subpage-menu">
        <b-menu-list label="Menu">
            <b-menu-item 
              icon="home" 
              label="Site Home" 
              tag="router-link" 
              :to="'/site/'+sitecode+'/home'"></b-menu-item>
            <b-menu-item 
              icon="telescope" 
              tag="router-link"
              :to="'/site/' + sitecode + '/observe'" 
              label="Observe"></b-menu-item>
            <b-menu-item 
              icon="target" 
              tag="router-link"
              :to="'/site/' + sitecode + '/targets'" 
              label="Target Explorer"></b-menu-item>
            <b-menu-item 
              icon="folder-multiple-image"
              tag="router-link"
              :to="'/site/' + sitecode + '/data'" 
              label="Data & Images"></b-menu-item>
            <b-menu-item 
              icon="calendar"
              tag="router-link"
              :to="'/site/' + sitecode + '/calendar'" 
              label="Calendar"></b-menu-item>
        </b-menu-list>
      </b-menu>

      <!-- List of online users -->
      <div class="menu-label"> online users </div>
      <ul class="online-users-list">
        <li v-for="(user, idx) in displayedOnlineUsers">
          <div v-bind:key="idx">
            <b-icon icon="circle" size="is-small" type="is-success"/>
            {{user}}
          </div>
        </li>
      </ul>
      
      <!-- Chat module. Also feeds online users list. -->
      <chat-module 
        :sitecode="sitecode" 
        :username="username"
        @whosonline="makeOnlineUsersList" />

    </div>


    <!-- Primary content of the page. Selects from the various site subpages. -->
    <!-- Note: wait for parent (this component) to mount before loading child components. 
    Otherwise, props may initially load as null. -->
    <div class="column page-content ">
      <site-home 
        v-if="subpage == 'home' && siteIsMounted" 
        :config="config" 
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
      />
      <site-observe 
        v-if="subpage == 'observe' && siteIsMounted" 
        :config="config" 
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
      />
      <site-targets 
        v-if="subpage == 'targets' && siteIsMounted" 
        :config="config" 
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
      />
      <site-calendar 
        v-if="subpage == 'calendar' && siteIsMounted" 
        :config="config" 
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
      />
      <site-data 
        v-if="subpage == 'data' && siteIsMounted" 
        :config="config" 
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
      />
    </div>
  </div>
  </section>
  </div>

  <footer class="footer">
    <div class="has-text-centered">
      <p>
        You are currently observing from site 
        <span class="is-uppercase" style="color: greenyellow">{{sitecode}}</span> in the 
        <strong>photon ranch</strong> network.
      </p>
    </div>
  </footer>


</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import CommandButton from '@/components/CommandButton'
import SiteHome from '@/components/SiteHome'
import SiteObserve from '@/components/SiteObserve'
import SiteTargets from '@/components/SiteTargets'
import SiteCalendar from '@/components/SiteCalendar'
import SiteData from '@/components/SiteData'
import ChatModule from '@/components/ChatModule'

import axios from 'axios';
import ReconnectingWebSocket from 'reconnecting-websocket';


export default {
  name: 'Site',
  components: {
    CommandButton,
    SiteHome,
    SiteObserve,
    SiteTargets,
    SiteCalendar,
    SiteData,
    ChatModule,
  },
  props: ['sitecode', 'subpage'],
  mixins: [commands_mixin],

  data () {
    return {
      displayedOnlineUsers: new Set([]),
      config: {},

      // Websocket for status updates
      status_ws: '',

      // Config prop might be null, so children should wait until this component is mounted
      siteIsMounted: false, 

      deviceStatus: {
        /*
        mount: {},
        telescope: {},
        camera: {},
        filter_wheel: {},
        focuser: {},
        rotator: {},
        screen: {},
        sequencer: {},
        observingConditions: {},
        timestamp: {},
        */
      },
      weatherStatus: {},

    }
  },

  created () {

    // Listen for new images on websocket, and refresh the list when a new image arrives.
    this.$store.dispatch('images/refresh_latest_images')
    this.imageSubscriber = new ReconnectingWebSocket("wss://6raa648v43.execute-api.us-east-1.amazonaws.com/dev")
    this.imageSubscriber.onmessage = (message) => {
      let data = JSON.parse(message.data);
      data["messages"].forEach((message) => {
        console.log("new image: ",message)
        // Refresh the image list
        this.$store.dispatch('images/refresh_latest_images')
        //this.$store.dispatch('images/set_latest_image')
      });
    }

    // Connect to websocket to get state of devices/weather
    let status_ws_url = 'wss://2q5zz6ppch.execute-api.us-east-1.amazonaws.com/dev'
    status_ws_url += `?site=${encodeURIComponent(this.sitecode)}`
    this.status_ws= new ReconnectingWebSocket(status_ws_url)
    this.status_ws.onmessage = (message) => {
      let data = JSON.parse(message.data);
      let statusType = data.statusType
      let status = data.status
      let status_timestamp = data.server_timestamp_ms

      if (statusType == "deviceStatus"){
        this.deviceStatus = status
      }
    }

    // Load initial status
    this.getSiteDeviceStatus()

    // Get the site configuration
    this.getSiteConfig()


  },

  // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
  watch: {
    sitecode: function () {
      this.$store.commit('observatory_configuration/setActiveSite', this.sitecode)
      this.$store.dispatch('images/refresh_latest_images')

      // Load the config for the new site
      this.getSiteConfig()

      // Change status subscriptions to the new site
      this.updateStatusSubscriptionSite(this.sitecode)

      // Get status for the new site.
      this.getSiteDeviceStatus()
    },
  },


  async mounted() {

    this.siteIsMounted = true; // child components are ready to render now

    // Make sure the default instruments are selected at the initial load.
    this.$store.dispatch('observatory_configuration/update_config')
    this.$store.dispatch('observatory_configuration/set_default_active_devices', this.sitecode)
    this.$store.dispatch('images/refresh_latest_images')

    // Update timestamp every second (sent with command)
    var self = this;
    setInterval(function() {
      self.timestamp = parseInt(Date.now() / 1000)
    }, 1000)
  },

  computed: {
    // Get the username from Auth0
    username() {
      if (this.$auth.isAuthenticated) {
        return this.$auth.user.name
      }
      return "anonymous"
    },
  },

  methods: {
    // Format the displayed list of online users
    makeOnlineUsersList(listOfUsers) {
      let theList = new Set(listOfUsers) // Remove duplicates
      theList.delete("anonymous")
      theList.delete(this.username)
      if (this.username != "anonymous") theList.add(`${this.username} (me)`)
      this.displayedOnlineUsers = theList;
    },

    async getSiteConfig() {
      let baseUrl = this.$store.getters['dev/api'];
      let path = `/${this.sitecode}/config`
      let response = await axios.get(baseUrl + path)
      this.config = response.data.configuration
      console.log(`${this.sitecode} config: `,this.config)
    },

    async getSiteDeviceStatus() {
      let url = `https://status.photonranch.org/status/${this.sitecode}/device_status`
      let response = await axios.get(url)
      this.deviceStatus = response.data.Item.status
    },

    // Changes the site that the status websocket recieves updates for.
    updateStatusSubscriptionSite(site) {
      this.status_ws.send(JSON.stringify({"action": "updateSubscriberSite", "site": site}))
    },

}
  }

</script>

<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');

.menu-column {
  width: 300px;
  height: auto;
  padding: 0 auto;
}

.subpage-menu {
  margin-bottom: 3em;
}
.online-users-list {
  margin-bottom: 3em;
}
.online-users-list > * {
  padding-left: 1em;
}


.page-content {
  margin-bottom: 200px;
}
.page-view {
  /* min height: screen + footer + visual buffer */
  height: 1400px;
  margin: 0 auto; /* center the main div */
}

footer {
  position:fixed;
  bottom: 0;
  width: 100vw;
  padding: 2em 1em 2em; 
}

</style>
