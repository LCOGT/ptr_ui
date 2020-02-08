

<template><div>
  
  <section class="page">

  <div style="height: 5em"></div>
  <div class="columns">

    <div class="column is-narrow menu-column">
      <b-menu>
        <b-menu-list label="Menu">
            <!--b-menu-item icon="home" label="Site Home"></b-menu-item-->
            <!--b-menu-item icon="target" label="Target Explorer"></b-menu-item-->
            <!--b-menu-item icon="folder-multiple-image" label="Data & Images"></b-menu-item-->
            <router-link 
              :to="'/ux1/' + sitecode + '/home'" 
              class="navbar-item"> 
              Site Home 
            </router-link>
            <router-link 
              :to="'/ux1/' + sitecode + '/observe'" 
              class="navbar-item"> 
              Observe
            </router-link>
            <router-link 
              :to="'/ux1/' + sitecode + '/targets'" 
              class="navbar-item"> 
              Target Explorer 
            </router-link>
            <router-link 
              :to="'/ux1/' + sitecode + '/planning'" 
              class="navbar-item"> 
              Planning
            </router-link>
            <router-link 
              :to="'/ux1/' + sitecode + '/data'" 
              class="navbar-item"> 
              Data & Images 
            </router-link>
        </b-menu-list>
      </b-menu>
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

    <div class="column content">
      <subpage-home v-if="subpage == 'home'" :sitecode="sitecode"/>
      <subpage-observe v-if="subpage == 'observe'" :sitecode="sitecode"/>
      <subpage-targets v-if="subpage == 'targets'" :sitecode="sitecode"/>
      <subpage-planning v-if="subpage == 'planning'" :sitecode="sitecode"/>
      <subpage-data v-if="subpage == 'data'" :sitecode="sitecode"/>
    </div>



  </div>

  </section>


  <footer class="footer">
    <div class="content has-text-centered">
      <p>
        You are currently observing from site 
        <span class="is-uppercase">{{sitecode}}</span> in the 
        <strong>photon ranch</strong> network.
      </p>
    </div>
  </footer>

</div></template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios';
import { commands_mixin } from '../mixins/commands_mixin'
import CommandButton from '@/components/CommandButton'
import SubpageHome from '@/components/SubpageHome'
import SubpageObserve from '@/components/SubpageObserve'
import SubpageTargets from '@/components/SubpageTargets'
import SubpagePlanning from '@/components/SubpagePlanning'
import SubpageData from '@/components/SubpageData'

export default {
  name: 'ux1',
  components: {
    CommandButton,
    SubpageHome,
    SubpageObserve,
    SubpageTargets,
    SubpagePlanning,
    SubpageData,
  },
  props: ['sitecode', 'subpage'],
  mixins: [commands_mixin],
  data () {
    return {

      cam_exposure: '',
      cam_repeat: '',
      cam_filter: '',
      cam_bin: '1', 

    }
  },
  async created() {
    console.log('From UX1, sitecode: '+this.sitecode)
    console.log('From UX1, subpage: '+this.subpage)
    this.$store.commit('observatory_configuration/setActiveSite', this.sitecode)
    this.$store.dispatch('images/refresh_latest_images')
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

    // Set the initial devices for convenience.
    if (true) {
      this.selected_site = this.sitecode;
      console.log('selected site')
      this.selected_mount = 'mount1';
      this.selected_telescope = 't1';
      this.selected_camera = 'cam1';
    }
  },
  
}

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');

.menu-column {
  border-right: var(--light-grey) 1px solid;
  width: 220px;
  height: auto;
  padding-right: 2em;
}
.content {
  padding: 0 4em;
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

.page {
  --light-grey: #ddd;
  --mid-grey: #aaa;
  --dark-grey: #444;
  max-width: 1200px;
  margin: 0 auto; /* center the main div */
  padding: 0 20px;
}


#bottom-section {
  column-span: all;
  height: 6em;
}

</style>
