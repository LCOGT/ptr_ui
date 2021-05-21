<template>
  <div class="page">

    <b-navbar wrapper-class="container site-menu" :mobile-burger="false" class="is-hidden-touch">
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
    
    <div class=" page-view">

    <div class="mobile-site-menu is-hidden-desktop">
      <router-link :to="'/site/'+sitecode+'/home'">
        <button class="button" >Home</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/targets'">
        <button class="button" >Targets</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/observe'">
        <button class="button" >Observe</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/calendar'">
        <button class="button" >Calendar</button>
      </router-link>
      <router-link :to="'/site/'+sitecode+'/projects'">
        <button class="button" >Projects</button>
      </router-link>
    </div>


    <div class="columns main-page-content" >
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
      class="is-hidden-mobile status-footer"
      :site="sitecode" />

    <site-status-footer-mobile 
      class="is-hidden-tablet status-footer"
      :site="sitecode" />

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

      //deviceStatus: {
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
      //},

      flatSampleStatuss: [
          {"name": "enclosure", "val": "open"},
          {"name": "temp", "val": "5"},
          {"name": "spacer", "val": "spacer"},
          {"name": "wind", "val": "15m/s"},
          {"name": "age", "val": "seconds"},
          {"name": "age", "val": "seconds"},
      ],

    }
  },

  async created() {
  },

  beforeDestroy() {
    this.$store.dispatch('site_config/remove_active_site')
    this.$store.dispatch('sitestatus/closeStatusConnection')

  },

  // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
  watch: {
    sitecode() {

      console.log('new sitecode in site watcher: ', this.sitecode)
      this.$store.commit('site_config/setActiveSite', this.sitecode)
      this.$store.dispatch('sitestatus/updateSite', this.sitecode)

      this.setDefaultDevices()

      //// Change status subscriptions to the new site
      //this.updateStatusSubscriptionSite(this.sitecode)

      //// Get status for the new site.
      //this.getSiteDeviceStatus()

      console.log('Sitecode changed. Refreshing latest images.')
      this.$store.dispatch('images/load_latest_images')
      this.$store.dispatch('images/load_latest_info_image')

      // Refresh the active reservations list for the new site.
      this.$store.dispatch('calendar/fetchActiveReservations', this.sitecode)
    },
  },

  async mounted() {
    const site = this.$route.params.sitecode
    this.$store.dispatch('sitestatus/openStatusConnection')
    this.$store.dispatch('sitestatus/updateSite', site)

    this.$store.commit('site_config/setActiveSite', site)

    // Load the active reservations for this site. 
    this.$store.dispatch('calendar/fetchActiveReservations', site)

    await this.setDefaultDevices()

    // Listen for new images on websocket, and refresh the list when a new image arrives.
    // Note: this happens for a new image on any site, not just the one being viewed.
    this.$store.dispatch('images/load_latest_images')
    this.imageSubscriber = new ReconnectingWebSocket("wss://6raa648v43.execute-api.us-east-1.amazonaws.com/dev")
    this.imageSubscriber.onmessage = (message) => {
      let data = JSON.parse(message.data);
      data["messages"].forEach((message) => {
        console.log("new image: ",message)
        let content = message.content.messages[0]
        // Refresh the image list
        let base_filename = content.base_filename
        console.log('new image: ', base_filename)
        let image_type = content.s3_directory
        // TODO: improve websocket message content so we know whether to fetch data or info-image.
        if (image_type == "data") {
          this.$store.dispatch('images/update_new_image', base_filename)
        }
        else if (image_type == "info-images") {
          this.$store.dispatch('images/load_latest_info_image')
        }
      });
    }
    


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
@import "@/style/_variables.scss";
@import "@/style/_responsive.scss";

.main-page-content {
  width: 100vw;
  margin-bottom: 150px;
  height: 100%;
}

.menu-column {
  height: auto;
  padding: 0 auto;
}

.subpage-menu {
  margin-bottom: 3em;
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
  border: 1px solid $grey-dark;
}

.status-footer {
  position:sticky; 
  bottom: 0; 
  width: 100vw;
}


</style>
