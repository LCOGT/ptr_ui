

<template><div class="page">

  <div style="height: 5em"></div>
  <div class="columns">

    <b-menu class="column is-narrow menu-column">
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
            :to="'/ux1/' + sitecode + '/data'" 
            class="navbar-item"> 
            Data & Images 
          </router-link>
      </b-menu-list>
    </b-menu>

    <div class="column content">
      <subpage-home v-if="subpage == 'home'" />
      <subpage-targets v-if="subpage == 'targets'" />
      <subpage-data v-if="subpage == 'data'" />
    </div>



  </div>

  <div class="footer-container">
    <footer>footer</footer>
  </div>

</div></template>

<script>
import { API, Auth } from 'aws-amplify'
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import CommandButton from '@/components/CommandButton'
import SubpageHome from '@/components/SubpageHome'
import SubpageTargets from '@/components/SubpageTargets'
import SubpageData from '@/components/SubpageData'

export default {
  name: 'ux1',
  components: {
    CommandButton,
    SubpageHome,
    SubpageTargets,
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
  width: 180px;
  height: auto;
}
.content {
  padding: 0 4em;
}

.page {
  --light-grey: #ddd;
  --mid-grey: #aaa;
  --dark-grey: #444;
  max-width: 1200px;
  margin: 0 auto; /* center the main div */
  padding: 20px;
}

.footer-container {
  position:fixed;
  bottom: 0;
  width: 100%;
  height: auto;
  background-color: grey;
}
footer {
  max-width: 1200px;
  margin: 0 auto;
  border-left: 1px solid white;
  border-right: 1px solid white;
  height: 3em;
}

#bottom-section {
  column-span: all;
  height: 6em;
}

</style>
