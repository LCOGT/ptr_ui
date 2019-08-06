

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
          <p class="heading">Right Ascension</p>
          <p class="title">12.324</p>
        </div>

        <div>
          <p class="heading">Declination</p>
          <p class="title">76.52</p>
        </div>

      </div>
    </div>

    <div class="column content">
      <subpage-home v-if="subpage == 'home'" />
      <subpage-targets v-if="subpage == 'targets'" />
      <subpage-planning v-if="subpage == 'planning'" />
      <subpage-data v-if="subpage == 'data'" />
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
import { API, Auth } from 'aws-amplify'
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import CommandButton from '@/components/CommandButton'
import SubpageHome from '@/components/SubpageHome'
import SubpageTargets from '@/components/SubpageTargets'
import SubpagePlanning from '@/components/SubpagePlanning'
import SubpageData from '@/components/SubpageData'

export default {
  name: 'ux1',
  components: {
    CommandButton,
    SubpageHome,
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
    console.log(this.sitecode)
    console.log(this.subpage)
    // Get the global configuration for all sites from an api call.
    let apiName = 'ptr-api';
    let path = '/all/config/';
    const config_g = await API.get(apiName, path);
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
  height: 150vh;
  padding: 0 20px;
}


#bottom-section {
  column-span: all;
  height: 6em;
}

</style>
