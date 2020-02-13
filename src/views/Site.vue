

<template><div class="page">
  
  <section class="page-view">

  <div style="height: 3em"></div>
  <div class="columns">

    <!-- Menu for site subpages -->
    <div class="column is-narrow is-full-mobile menu-column">
      <b-menu class="subpage-menu">
        <b-menu-list label="Menu">
            <b-menu-item 
              icon="home" 
              label="Site Home" 
              tag="router-link" 
              :to="'/site/'+sitecode+'/home'"></b-menu-item>
            <b-menu-item 
              icon="camera" 
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
          <b-icon icon="circle" size="is-small" type="is-success" />
          {{user}}
        </li>
      </ul>
      
      <!-- Chat module. Also feeds online users list. -->
      <chat-module 
        :sitecode="sitecode" 
        :username="username"
        @whosonline="makeOnlineUsersList" />

    </div>


    <!-- Primary content of the page. Selects from the various site subpages. -->
    <div class="column page-content">
      <site-home v-if="subpage == 'home'" :sitecode="sitecode"/>
      <site-observe v-if="subpage == 'observe'" :sitecode="sitecode"/>
      <site-targets v-if="subpage == 'targets'" :sitecode="sitecode"/>
      <site-calendar v-if="subpage == 'calendar'" :sitecode="sitecode"/>
      <site-data v-if="subpage == 'data'" :sitecode="sitecode"/>
    </div>
  </div>
  </section>

  <footer class="footer">
    <div class="has-text-centered">
      <p>
        You are currently observing from site 
        <span class="is-uppercase" style="color: greenyellow">{{sitecode}}</span> in the 
        <strong>photon ranch</strong> network.
      </p>
    </div>
  </footer>


</div></template>

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
    }
  },

  // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
  watch: {
    sitecode: function () {
      this.$store.commit('observatory_configuration/setActiveSite', this.sitecode)
      this.$store.dispatch('images/refresh_latest_images')
    },
  },

  async mounted() {
    // Make sure the default instruments are selected at the initial load.
    this.$store.dispatch('observatory_configuration/update_config')
    this.$store.dispatch('observatory_configuration/set_default_active_devices', this.sitecode)
    this.$store.dispatch('instrument_state/updateStatus')
    this.$store.dispatch('images/refresh_latest_images')

    // Get the global configuration for all sites from an api call.
    let apiName = this.$store.getters['dev/api'];
    let path = '/all/config/';
    const config_g = await axios.get(apiName+path);
    this.config_g = config_g

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

  },
}

</script>

<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');

.menu-column {
  width: 300px;
  height: auto;
  padding: 0 2em;
  padding-right: 11.25px;
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
  margin-right: 1em;
}
.page-view {
  /* min height: screen + footer + visual buffer */
  height: calc(100% - 90%);
  max-width: 1200px;
  margin: 0 auto; /* center the main div */
}

footer {
  position:fixed;
  bottom: 0;
  width: 100%;
  padding: 2em 1em 2em; 
}

</style>
