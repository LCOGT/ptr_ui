<template>
  <div class="page">

    <b-navbar wrapper-class="container site-menu" class="is-hidden-touch is-hidden-desktop-only">
        <template slot="brand">
        </template>
        <template slot="start">
            <b-navbar-item tag="router-link" 
              :to="{ path: '/site/' + sitecode + '/home'}">
              Home
            </b-navbar-item>
            <b-navbar-item tag="router-link" 
              :to="{ path: '/site/' + sitecode + '/targets'}">
              Targets
            </b-navbar-item>
            <b-navbar-item tag="router-link" 
              :to="{ path: '/site/' + sitecode + '/observe'}">
              Observe
            </b-navbar-item>
            <b-navbar-item tag="router-link" 
              :to="{ path: '/site/' + sitecode + '/calendar'}">
              Calendar
            </b-navbar-item>
            <b-navbar-item tag="router-link" 
              :to="{ path: '/site/' + sitecode + '/projects'}">
              Projects
            </b-navbar-item>
        </template>

        <template slot="end">
        </template>
    </b-navbar>
    
    <div class="container page-view">

    <!--b-tabs type="is-boxed">
      <b-tab-item>
        <template #header>
          <b-icon icon="information-outline"></b-icon>
          <span> Issues <b-tag rounded> 3 </b-tag> </span>
        </template>
      </b-tab-item>
      <b-tab-item>
        <template #header>
          <b-icon icon="source-pull"></b-icon>
          <span> Pull Requests <b-tag rounded>5</b-tag> </span>
        </template>
      </b-tab-item>
    </b-tabs-->

    <div class="mobile-site-menu is-hidden-widescreen">
      <router-link :to="'/site/'+sitecode+'/home'">
        <button class="button" >Home</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/observe'">
        <button class="button" >Observe</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/targets'">
        <button class="button" >Targets</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/projects'">
        <button class="button" >Projects</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/calendar'">
        <button class="button" >Calendar</button>
      </router-link>
    </div>

    <div style="height: 1em"></div>
    <div class="columns" style="margin: 1em;">

      <div class="column menu-column is-2 is-hidden-touch is-hidden-desktop-only" v-if="false">


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
      </div>

      <!-- Primary content of the page. Selects from the various site subpages. -->
      <!-- Note: wait for parent (this component) to mount before loading child components. 
      Otherwise, props may initially load as null. -->
      <div class="column">
        <component 
          v-bind:is="`site-${subpage}`"
          :sitecode="sitecode"
          :deviceStatus="deviceStatus"
          />
          </div>
      </div>
    </div>

    <site-status-footer 
      class="is-hidden-mobile"
      :site="sitecode" 
      style="position: sticky; bottom: 0;"/>

    <site-status-footer-mobile 
      class="is-hidden-tablet"
      :site="sitecode" 
      style="position: sticky; bottom: 0;"/>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import CommandButton from '@/components/CommandButton'
import ChatModule from '@/components/ChatModule'
import SideInfoPanel from '@/components/SideInfoPanel'
import StatusPanelCollapsible from '@/components/status/StatusPanelCollapsible'
import StatusRow from '@/components/status/StatusRow'
import SiteStatusFooter from '@/components/status/SiteStatusFooter'
import SiteStatusFooterMobile from '@/components/status/SiteStatusFooterMobile'

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
    SiteStatusFooter,
    SiteStatusFooterMobile,
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

    this.$store.commit('site_config/setActiveSite', this.sitecode)

    // Load the active reservations for this site. 
    this.$store.dispatch('calendar/fetchActiveReservations', this.sitecode)

    await this.setDefaultDevices()

    // Listen for new images on websocket, and refresh the list when a new image arrives.
    // Note: this happens for a new image on any site, not just the one being viewed.
    this.$store.dispatch('images/load_latest_images')
    this.imageSubscriber = new ReconnectingWebSocket("wss://6raa648v43.execute-api.us-east-1.amazonaws.com/dev")
    this.imageSubscriber.onmessage = (message) => {
      let data = JSON.parse(message.data);
      data["messages"].forEach((message) => {
        console.log("new image: ",message)
        // Refresh the image list
        let base_filename = message.content.messages[0]
        this.$store.dispatch('images/update_new_image', base_filename)
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
    sitecode() {

      this.$store.commit('site_config/setActiveSite', this.sitecode)

      this.setDefaultDevices()

      //// Change status subscriptions to the new site
      //this.updateStatusSubscriptionSite(this.sitecode)

      //// Get status for the new site.
      //this.getSiteDeviceStatus()

      console.log('Sitecode changed. Refreshing latest images.')
      this.$store.dispatch('images/load_latest_images')

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
     */
    async setDefaultDevices() {
      this.$store.dispatch('site_config/set_default_active_devices', this.sitecode)
    },
  }
}

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');
@import "../style/_variables.scss";

.menu-column {
  height: auto;
  padding: 0 auto;
}

.status-column {
  max-width: 250px;
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


.mobile-site-menu {
  width: 100%;
  top: 0;
  bottom: 300px;
  z-index: 0;
}
.mobile-site-menu button {
  border-radius: 0;
  width: 20%;
  font-size: 12px;
  background-color: $dark;
}


.page-view {
  /* min height: screen + footer + visual buffer */
  min-height: 100vh;
}


</style>
