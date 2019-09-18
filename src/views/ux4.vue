

<template><div class="page">

  <header>header</header>
  <div id="main">

  <section class="submenu">
    <div class="section-head"> head </div>
  </section>

  <section class="skychart">
    <div class="section-head"> sky chart </div>
    <div class="above-skychart"></div>

    <the-sky-chart />
    <div class="below-skychart"></div>
  </section>

  <section class="controls">
    <div class="section-head"> head </div>
    <div class="control-item">
      <button>ra</button>
      <button>dec</button>
    </div>
    <div class="control-item">
      <button>ra</button>
      <button>dec</button>
    </div>
    <div class="control-item">
      <button>ra</button>
      <button>dec</button>
    </div>
    <div class="control-item">
      <button>ra</button>
      <button>dec</button>
    </div>
  </section>

  <section>
    <div class="section-head"> camera controls </div>
    <div class="section-body">
      <the-camera-controls/>
    </div>
  </section>
  <section> i am a section </section>
  <section> i am a section </section>
  <section> i am a section </section>



  <div id="bottom-section" />

  </div>

  <div class="footer-container">
    <footer>footer</footer>
  </div>


</div></template>

<script>
import { API, Auth } from 'aws-amplify'
import { mapGetters } from 'vuex'
import CommandButton from '@/components/CommandButton'
import TheCameraControls from '@/components/TheCameraControls'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import { commands_mixin } from '../mixins/commands_mixin'

export default {
  name: 'ux1',
  components: {
    CommandButton,
    TheSkyChart,
    TheCameraControls,
  },
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
    // Get the global configuration for all sites from an api call.
    let apiName = this.$store.getters['dev/api'];
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
      this.selected_site = 'site4';
      this.selected_mount = 'mount1';
      this.selected_telescope = 't1';
      this.selected_camera = 'cam1';
    }
  },
  
}

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap');

.label {
  color: red;
}

.page {
  --light-grey: #ddd;
  --mid-grey: #aaa;
  --dark-grey: #444;
}

@media (min-width: 768px) {
  #main {
    column-count: 2;
    column-gap: 20px;
  }
  section {
    break-inside: avoid;
  }
}

#main {
  max-width: 1200px;
  margin: 0 auto; /* center the main div */
  padding: 20px;
}

header {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 20px 0;
  border: 1px solid white;
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

section {
  background-color: var(--light-grey);
  border-top: 5px solid var(--mid-grey);
  border-radius: 3px;
  margin-bottom: 20px;
  overflow: hidden;
}
.section-head {
  background-color: var(--light-grey);
  padding: 0.5em;
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 1.5em;
  color: var(--dark-grey);
}

#bottom-section {
  column-span: all;
  height: 6em;
}

</style>
