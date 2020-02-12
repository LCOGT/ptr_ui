

<template><div class="page">
  
  <section class="page-view">

  <div style="height: 3em"></div>
  <div class="columns">

    <div class="column is-narrow menu-column">
      <b-menu>
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

      <div style="height: 3em;" />


      <div class="menu-label"> online users </div>
      <ul class="online-users-list">
        <li v-for="(user, idx) in displayedOnlineUsers">
          <b-icon
            icon="circle"
            size="is-small"
            type="is-success">
          </b-icon>
          {{user}}
        </li>
      </ul>

      <div style="height: 300px"></div>
      <div class="menu-label"> telescope status </div>
      <div class="left-status-box">
        <div>
          <p class="heading">Active Site:</p>
          <p class="title">{{active_site}}</p>
        </div>
        <div>
          <p class="heading">Active Mount:</p>
          <p class="title">{{active_mount}}</p>
        </div>
      </div>

    </div>

    <div class="column page-content">
      <site-top-info-panel :sitecode="sitecode" />
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
import SiteTopInfoPanel from '@/components/SiteTopInfoPanel'

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
    SiteTopInfoPanel,
  },
  props: ['sitecode', 'subpage'],
  mixins: [commands_mixin],
  data () {
    return {

      cam_exposure: '',
      cam_repeat: '',
      cam_filter: '',
      cam_bin: '1', 
      
      onlineUsersList: [],

    }
  },
  // Make sure that the props change when switching from /site/saf/observe to /site/wmd/observe
  watch: {
    sitecode: function () {
      this.$store.commit('observatory_configuration/setActiveSite', this.sitecode)
      this.$store.dispatch('images/refresh_latest_images')

      // Reopen the chat websocket with the new site.
      this.siteChat.close()
      this.openChatWebsocket()
    },

    // If the user changes, we should update the chat server 
    username: function() {
      this.siteChat.close()
      this.openChatWebsocket()
    }

  },
  async mounted() {

    console.log('From UX1, sitecode: '+this.sitecode)
    console.log('From UX1, subpage: '+this.subpage)
    this.$store.commit('observatory_configuration/setActiveSite', this.sitecode)
    this.$store.dispatch('images/refresh_latest_images')

    // Make sure the default instruments are selected at the initial load.
    await this.$store.dispatch('observatory_configuration/update_config')
    await this.$store.dispatch('observatory_configuration/set_default_active_devices', this.sitecode)
    await this.$store.dispatch('instrument_state/updateStatus')

    // Get the global configuration for all sites from an api call.
    let apiName = this.$store.getters['dev/api'];
    let path = '/all/config/';
    const config_g = await axios.get(apiName+path);
    this.config_g = config_g
    console.log(config_g)

    // Update timestamp every second (sent with command)
    var self = this;
    setInterval(function() {
      self.timestamp = parseInt(Date.now() / 1000)
    }, 1000)


    let onlineUserURL = `https://327l4vns8i.execute-api.us-east-1.amazonaws.com/dev/onlineusers?room=${encodeURIComponent(this.sitecode)}`
    let headers = {
      'Content-Type': 'application/json;charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    }
    axios.get(onlineUserURL).then(response => {
      console.log(response)
      this.onlineUsersList = response.data.map(x => x.Username)
      console.log(this.onlineUsersList)
    })

    this.openChatWebsocket()
  },
  computed: {

    // Get the username from Auth0
    username() {
      if (this.$auth.isAuthenticated) {
        return this.$auth.user.name
      }
      return "anonymous"
    },

    // Format the displayed list of online users
    displayedOnlineUsers() {
      let theList = new Set(this.onlineUsersList) // Remove duplicates
      theList.delete("anonymous")
      theList.delete(this.username)
      if (this.username != "anonymous") {
        theList.add(`${this.username} (me)`)
      }
      return theList
    }

  },
  beforeDestroy() {
    this.siteChat.close()
  },
  methods: {

    async openChatWebsocket() {
      let url = "wss://urp0eh13o3.execute-api.us-east-1.amazonaws.com/dev"
      url += `?room=${encodeURIComponent(this.sitecode)}`
      url += `&username=${encodeURIComponent(await this.username)}`

      this.siteChat = new ReconnectingWebSocket(url)
      //this.siteChat.onopen = this.getRecent()
      this.siteChat.onmessage = (message) => {
        console.log(message)
          let data = JSON.parse(message.data);

          // Handle case where incoming message is the online users
          if ("onlineUsers" in data) {
            this.onlineUsersList = data.onlineUsers.map(x => x.Username)
          }

          // Handle case where incoming message is a chat message
          else {
            data["messages"].forEach((message) => {
              //console.log(message)
              this.messages.push(message)
            });
          }
      }

    }

  },
  
}

</script>

<style lang="css" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');

.online-users-list > * {
  padding-left: 1em;
}

.menu-column {
  border-right: #ddd 1px solid;
  width: 220px;
  height: auto;
  padding: 0 2em;
}

.left-status-box {
  background-color: #232929;
  width: 100%;
  height: 500px;
}
.left-status-box > * {
  vertical-align: center;
  text-align: center;
  padding-top: 2em;
}
.page-content {
  margin: 0 1em;
  margin-bottom: 200px;
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

}



</style>
