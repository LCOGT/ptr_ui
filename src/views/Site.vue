

<template>
<div class="page">
  
  <div class="container">
  <section class="page-view">

  <div style="height: 1em"></div>
  <div class="columns" style="margin: 1em;">

    <div class="column menu-column is-one-fifth is-hidden-touch is-hidden-desktop-only">

      <!-- Show whether a site is currently reserved or not -->
      <!-- TODO: refactor into it's own component -->
      <div class="site-reservation-status-box">
        <!-- Display if there are no current reservations --> 
        <div v-if="!hasActiveReservation"> 
          <p class="menu-label site-not-reserved-notice">
            no active reservations
          </p>
          <p>Next in: 0h 0m</p>
          <p style="color: #555">(timer not implemented)</p>
        <div style="height: 5px;" />
        </div>

        <!-- Display if the site is currently reserved for use (and not by current user). --> 
        <div v-if="hasActiveReservation && !userHasActiveReservation"> 
          <p class="menu-label site-reserved-notice">
            Site is reserved 
          </p>
          <p>Remaining: {{timeRemainingForSoonestCurrentReservation}}</p>
        </div>

        <!-- Display if the site is currently reserved by the active user --> 
        <div v-if="userHasActiveReservation"> 
          <p class="menu-label site-reserved-current-user">
            Reserved for you
          </p>
          <p>Remaining: {{userReservationTimeRemaining}}</p>
        </div>

        <div style="height: 5px;" />
        <router-link :to="`/site/${sitecode}/calendar`"> 
          <b-button size="is-small" class="button is-dark" icon-right="calendar">view calendar</b-button>
        </router-link>
      </div>

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
              :to="'/site/' + sitecode + '/projects'" 
              label="Projects"></b-menu-item>
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
        <li v-for="(user, idx) in displayedOnlineUsers"
          v-bind:key="idx">
            <!--b-icon icon="circle" size="is-small" type="is-success"/-->
            <span style="font-weight:lighter;">{{user}}</span>
        </li>
      </ul>
      
      <!-- Chat module. Also feeds online users list. -->
      <chat-module 
        :sitecode="sitecode" 
        :username="username"
        @whosonline="makeOnlineUsersList" />

      <div style="height:3em;"/>

      <status-panel-collapsible
        :sitecode="sitecode"
        :fullStatus="weather_state"
        :statusList="buildWeatherStatus"
        :statusAge="status_age"
        >
        <p slot="title">{{sitecode}} weather</p>
      </status-panel-collapsible>

      <status-panel-collapsible
        :sitecode="sitecode"
        :fullStatus="deviceStatus"
        :statusList="buildGeneralStatus"
        :statusAge="status_age"
        >
        <p slot="title">{{sitecode}} status</p>
      </status-panel-collapsible>

    </div>


    <!-- Primary content of the page. Selects from the various site subpages. -->
    <!-- Note: wait for parent (this component) to mount before loading child components. 
    Otherwise, props may initially load as null. -->
      <component 
        style="width: 100%"
        v-bind:is="`site-${subpage}`"
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
        />
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
    <status-row
      :statusList="buildGeneralStatus" 
      class="is-mobile is-hidden-widescreen"
      style="margin: 0; padding: 0; background-color: #151718;"
      :statusAge="status_age" />
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

      <b-tooltip label="Projects" type="is-dark" class="level-item">
        <b-button tag="router-link"
          class="mobile-menu-button level-item"
          size="is-large"
          :to="'/site/'+sitecode+'/projects'"
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
import CommandButton from '@/components/CommandButton'
import ChatModule from '@/components/ChatModule'
import SideInfoPanel from '@/components/SideInfoPanel'
import StatusPanelCollapsible from '@/components/status/StatusPanelCollapsible'
import StatusRow from '@/components/status/StatusRow'

import SiteHome from '@/components/sitepages/SiteHome'
import SiteObserve from '@/components/sitepages/SiteObserve'
import SiteTargets from '@/components/sitepages/SiteTargets'
import SiteCalendar from '@/components/sitepages/SiteCalendar'
import SiteProjects from '@/components/sitepages/SiteProjects'
import SiteData from '@/components/sitepages/SiteData'

import axios from 'axios';
import moment from 'moment'
import ReconnectingWebSocket from 'reconnecting-websocket';

import { commands_mixin } from '../mixins/commands_mixin'
import { status_mixin } from '../mixins/status_mixin'

export default {
  name: 'Site',
  components: {
    CommandButton,
    SiteHome,
    SiteObserve,
    SiteTargets,
    SiteCalendar,
    SiteProjects,
    SiteData,
    ChatModule,
    SideInfoPanel,
    StatusPanelCollapsible,
    StatusRow,
  },
  props: ['sitecode', 'subpage'],
  mixins: [commands_mixin, status_mixin],

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

      flatSampleStatuss: [
          {"name": "enclosure", "val": "open"},
          {"name": "temp", "val": "5"},
          {"name": "spacer", "val": "spacer"},
          {"name": "wind", "val": "15m/s"},
          {"name": "age", "val": "seconds"},
          {"name": "age", "val": "seconds"},
      ],

      current_time_millis: moment().valueOf(),
      current_time_millis_updater: '', // setInterval object

    }
  },

  async created () {

    // Load the active reservations for this site. 
    this.$store.dispatch('calendar/fetchActiveReservations', this.sitecode)

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

    // Update current_time_millis every second. For reservation countdown. 
    this.current_time_millis_updater = setInterval(() => {
      this.current_time_millis = moment().valueOf()
    }, 1000)


  },

  beforeDestroy() {
    this.$store.dispatch('site_config/remove_active_site')
    clearTimeout(this.current_time_millis)
  },

  // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
  watch: {
    sitecode: function () {

      this.setDefaultDevices()

      //// Change status subscriptions to the new site
      //this.updateStatusSubscriptionSite(this.sitecode)

      //// Get status for the new site.
      //this.getSiteDeviceStatus()

      this.$store.dispatch('images/refresh_latest_images')

      // Refresh the active reservations list for the new site.
      this.$store.dispatch('calendar/fetchActiveReservations', this.sitecode)
    },
  },


  async mounted() {

    // Update timestamp every second (sent with command)
    setInterval(() => {
      this.timestamp = parseInt(Date.now() / 1000)
    }, 1000)

    this.siteIsMounted = true; // child components are ready to render now
  },

  computed: {

    ...mapState('site_config', ['site_config', 'global_config']),
    ...mapGetters('site_config', [
        'site_config',
        'enclosure',
        'mount',
        'telescope',
        'camera',
        'filter_wheel',
        'focuser',
        'rotator',
        'screen',
        'weather',
    ]),

    ...mapState('calendar', [
        'active_reservations'
    ]),
    ...mapGetters('calendar', [
        'hasActiveReservation', 
        'usersWithActiveReservation',
        'userIDsWithActiveReservation',
        'endOfUserReservation',
        'endOfNextReservation',
    ]),

    userHasActiveReservation() {
      if (this.$auth.isAuthenticated) {
        let user_id = this.$auth.user.sub
        return this.userIDsWithActiveReservation.includes(user_id)
      }
      else {
        return false
      }
    },

    timeRemainingForSoonestCurrentReservation() {
      let expire_time = this.endOfNextReservation
      let current_time = this.current_time_millis
      let delta = expire_time - current_time

      let millis_per_minute = 60 * 1000
      let millis_per_hour = 3600 * 1000

      let hours_left = Math.floor(delta / millis_per_hour)
      let minutes_left = Math.floor((delta - (hours_left * millis_per_hour)) / millis_per_minute)
      return `${hours_left}h ${minutes_left}m`
    },

    userReservationTimeRemaining() {
      if (this.$auth.isAuthenticated) {
        let user_id = this.$auth.user.sub
        let expire_time = this.endOfUserReservation(user_id)
        let current_time = this.current_time_millis
        let delta = expire_time - current_time

        let millis_per_minute = 60 * 1000
        let millis_per_hour = 3600 * 1000

        let hours_left = Math.floor(delta / millis_per_hour)
        let minutes_left = Math.floor((delta - (hours_left * millis_per_hour)) / millis_per_minute)
        return `${hours_left}h ${minutes_left}m`
      }
      else {
        return "0h 0m"
      }

    },

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
  margin-right: 40px;
}

.site-not-reserved-notice {
  color: $info;
}
.site-reserved-notice {
  color: yellow;
}
.site-reserved-current-user {
  color: greenyellow;
}

.site-reservation-status-box {
  background-color: black;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
}

.subpage-menu {
  margin-bottom: 3em;
}
.online-users-list {
  margin-bottom: 20px;
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
