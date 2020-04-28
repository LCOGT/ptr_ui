

<template>
<div class="page">
  
  <div class="container">
  <section class="page-view">

  <div style="height: 1em"></div>
  <div class="columns" style="margin: 1em;">

    <div class="column menu-column is-one-fifth is-hidden-touch is-hidden-desktop-only">

      <!-- Site menu for desktop or larger. Replaces bottom menu. -->
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

      <div style="height:3em;"/>

      <side-info-panel>
        <p slot="title">{{sitecode}} weather</p>
        <weather-status-vertical
          :sitecode="sitecode"  
          :deviceStatus="deviceStatus" 
          />
      </side-info-panel>
      <side-info-panel>
        <p slot="title">{{sitecode}} status</p>
        <status-overview-3
          :sitecode="sitecode"  
          :deviceStatus="deviceStatus" 
          />
      </side-info-panel>

    </div>


    <!-- Primary content of the page. Selects from the various site subpages. -->
    <!-- Note: wait for parent (this component) to mount before loading child components. 
    Otherwise, props may initially load as null. -->
    <div class="column page-content">
      <component 
        v-bind:is="`site-${subpage}`"
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
        />
    </div>
  </div>
  </section>
  </div>

  <footer class="footer is-hidden-touch">
    <div class="has-text-centered">
      <p>
        You are currently observing from site 
        <span class="is-uppercase" style="color: greenyellow">{{sitecode}}</span> in the 
        <strong>photon ranch</strong> network.
      </p>
    </div>
  </footer>

  <!-- Bottom site menu for tablet and mobile. Replaces left side menu. -->
  <div class="mobile-menu ">
    <status-overview-2
      :sitecode="sitecode"  
      :deviceStatus="deviceStatus" 
      class="is-mobile is-hidden-widescreen"
      style="margin:0;"/>
    <div class="level is-mobile is-hidden-widescreen">

      <b-tooltip label="Home" type="is-dark" class="level-item">
        <b-button tag="router-link"
          class="mobile-menu-button level-item"
          size="is-large"
          :to="'/site/'+sitecode+'/home'"
          icon-right="home"
          type="is-text">
        </b-button>
      </b-tooltip>

      <b-tooltip label="Observe" type="is-dark" class="level-item">
        <b-button tag="router-link"
          class="mobile-menu-button level-item"
          size="is-large"
          :to="'/site/'+sitecode+'/observe'"
          icon-right="telescope"
          type="is-text">
        </b-button>
      </b-tooltip>
      
      <b-tooltip label="Target Explorer" type="is-dark" class="level-item">
        <b-button tag="router-link"
          class="mobile-menu-button level-item"
          size="is-large"
          :to="'/site/'+sitecode+'/targets'"
          icon-right="target"
          type="is-text">
        </b-button>
      </b-tooltip>

      <b-tooltip label="Data Analysis" type="is-dark" class="level-item">
        <b-button tag="router-link"
          class="mobile-menu-button level-item"
          size="is-large"
          :to="'/site/'+sitecode+'/data'"
          icon-right="folder-multiple-image"
          type="is-text">
        </b-button>
      </b-tooltip>

      <b-tooltip label="Calendar" type="is-dark" class="level-item">
        <b-button tag="router-link"
          class="mobile-menu-button level-item"
          size="is-large"
          :to="'/site/'+sitecode+'/calendar'"
          icon-right="calendar"
          type="is-text">
        </b-button>
      </b-tooltip>
    </div>
  </div>


</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import CommandButton from '@/components/CommandButton'
import SiteHome from '@/components/SiteHome'
import SiteObserve from '@/components/SiteObserve'
import SiteTargets from '@/components/SiteTargets'
import SiteCalendar from '@/components/SiteCalendar'
import SiteData from '@/components/SiteData'
import ChatModule from '@/components/ChatModule'
import StatusOverview from '@/components/StatusOverview'
import StatusOverview2 from '@/components/StatusOverview2'
import StatusOverview3 from '@/components/StatusOverview3'
import SideInfoPanel from '@/components/SideInfoPanel'
import WeatherStatusVertical from '@/components/WeatherStatusVertical'

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
    StatusOverview,
    StatusOverview2,
    StatusOverview3,
    SideInfoPanel,
    WeatherStatusVertical,
  },
  props: ['sitecode', 'subpage'],
  mixins: [commands_mixin],

  data () {
    return {
      displayedOnlineUsers: new Set([]),

      // Websocket for status updates
      status_ws: '',

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

  async created () {

    await this.setDefaultDevices()

    // Listen for new images on websocket, and refresh the list when a new image arrives.
    // Note: this happens for a new image on any site, not just the one being viewed.
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

      status.server_timestamp_ms = data.server_timestamp_ms

      if (statusType == "deviceStatus"){
        this.deviceStatus = status
      }
    }

    // Load initial status
    this.getSiteDeviceStatus()

  },

  beforeDestroy() {
    this.$store.dispatch('site_config/remove_active_site')
  },

  // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
  watch: {
    sitecode: function () {

      this.setDefaultDevices()

      // Change status subscriptions to the new site
      this.updateStatusSubscriptionSite(this.sitecode)

      // Get status for the new site.
      this.getSiteDeviceStatus()

      this.$store.dispatch('images/refresh_latest_images')
    },
  },


  async mounted() {

    // Update timestamp every second (sent with command)
    var self = this;
    setInterval(function() {
      self.timestamp = parseInt(Date.now() / 1000)
    }, 1000)

    this.siteIsMounted = true; // child components are ready to render now
  },

  computed: {

    ...mapState('site_config', ['site_config', 'global_config']),

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

    /**
     * Set the default devices for this site.
     * First, update the config. Then use the config to specify devices.
     */
    async setDefaultDevices() {
      await this.$store.dispatch('site_config/update_config')
      this.$store.dispatch('site_config/set_default_active_devices', this.sitecode)
    },

    async getSiteDeviceStatus() {
      let url = `https://status.photonranch.org/status/${this.sitecode}/device_status`
      let response = await axios.get(url)
      let status = response.data.Item.status
      status.server_timestamp_ms = response.data.Item.server_timestamp_ms
      this.deviceStatus = status
    },

    // Changes the site that the status websocket recieves updates for.
    updateStatusSubscriptionSite(site) {
      this.status_ws.send(JSON.stringify({"action": "updateSubscriberSite", "site": site}))
    },

}
  }

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');
@import "../style/_variables.scss";


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

.mobile-menu {
  background-color: darken($dark, 3);
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 10;
}
.mobile-menu-button.level-item {
  background-color:hsla(0,0,0,0);
  border: none;
  border-radius: 0;
  color:grey;
  padding-top: 1.5em;
  padding-bottom: 2.5em;
  
}
.mobile-menu-button.is-active.router-link-active.is-large.is-text {
  background-color:hsla(0,0,0,0);
  color:white;
  box-shadow: none;
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
  display:none;
  position:absolute;
  bottom: 0;
  width: 100vw;
  padding: 2em 1em 2em; 
}


</style>
