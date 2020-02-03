

<template><div class="page">

  <div class="submenu">
  </div>

  <div class="skychart">
    <the-sky-chart class="skychart" />
  </div>

  <div class="controls">
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
  </div>


</div></template>

<script>
import { API, Auth } from 'aws-amplify'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
import create_commands from '@/utils/create_command'
import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'

export default {
  name: 'ux1',
  components: {
    CommandButton,
    TheSkyChart,
  },
  data () {
    return {
      timestamp: Date.now(),
      config_g: {},

      selected_site: null,
      selected_mount: null,
      selected_telescope: null,
      selected_camera: null,
      selected_filter: 'test_filter',
      selected_rotator: 'test_rotator',
      selected_focuser: 'test_focuser',

      cam_exposure: '',
      cam_repeat: '',
      cam_filter: '',
      cam_bin: '1', 

      slew_ra: '',
      slew_dec: '',

      focus_relative: '',
      focus_absolute: '',

      rotate_relative: '',
      rotate_absolute: '',

      prior_command: null,

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
  
  methods: {
    base_command(device_type, action, name, req_params, opt_params) {

      let device
      switch (device_type) {
        case 'mount':
          device = this.selected_mount;
          break;
        case 'camera': 
          device = this.selected_camera;
          break;
        case 'filter':
          device = this.selected_filter;
          break;
        case 'rotator':
          device = this.selected_rotator;
          break;
        case 'focuser':
          device = this.selected_focuser;
          break;
      }

      return {
        name: name,
        url: this.command_url,
        http_method: 'POST',
        form: {
          device: device,
          type: 'mount',
          timestamp: this.timestamp,
          action: action,
          required_params: req_params || {},
          optional_params: opt_params || {},
        }
      }

    },
  },

  computed: {
    command_url: function () {
      return `/${this.selected_site}/${this.selected_mount}/command/`
    },
    available_sites: function () {
      try {
        return Object.keys(this.config_g)
      }
      catch(error) {
        return []
      }
    },
    available_mounts: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]['mounts'])
      }
      catch(error) {
        return []
      }
    },
    available_telescopes: function () {
      try {
        return Object.keys(
          this.config_g
          [this.selected_site]
          ['mounts']
          [this.selected_mount]
          ['telescopes']
        ) 
      }
      catch(error) {
        return []
      }
    },
    available_cameras: function () {
      try {
        return Object.keys(
          this.config_g
          [this.selected_site]
          ['mounts']
          [this.selected_mount]
          ['telescopes']
          [this.selected_telescope]
          ['cameras']
        )
      }
      catch(error) {
        return []
      }
    },
    camera_expose_command () {
      return this.base_command( 'camera', 'expose', 'expose',
        { time: this.cam_exposure },
        {
          repeat: this.cam_repeat,
          bin: this.cam_bin,
          filter: this.cam_filter,
        }
      )
    },
    camera_cancel_command () {
      return this.base_command( 'camera', 'stop', 'cancel' )
    },
    filter_command () {
      return this.base_command( 'filter', 'set_name', 'set filter',
        { filter_name: this.cam_filter },
      )
    },
    mount_slew_command () {
      return this.base_command( 'mount', 'go', 'slew here',
        { ra: this.slew_ra, dec: this.slew_dec, }
      )
    },
    mount_stop_command () {
      return this.base_command( 'mount', 'stop', 'cancel' )
    },
    mount_park_command () {
      return this.base_command( 'mount', 'park', 'park' )
    },
    mount_flat_command () {
      return this.base_command( 'mount', 'flat-panel', 'flats')
    },
    focus_relative_command () {
      return this.base_command( 'focus', 'move_relative', 'focus',
        { position: this.focus_relative, }
      )
    },
    focus_absolute_command () {
      return this.base_command( 'focus', 'move_absolute', 'focus',
        { position: this.focus_absolute, }
      )
    },
    focus_auto_command () {
      return this.base_command( 'focus', 'auto', 'autofocus' )
    },
    focus_home_command () {
      return this.base_command( 'focus', 'home', 'home' )
    },
    focus_stop_command () {
      return this.base_command( 'focus', 'stop', 'stop' )
    },
    filter_home_command () {
      return this.base_command( 'filter', 'home', 'home' )
    },
    rotate_home_command () {
      return this.base_command( 'rotator', 'home', 'home' )
    },
    rotate_relative_command () {
      return this.base_command( 'rotator', 'move_relative', 'rotate',
        { position: this.rotate_relative } 
      )
    },
    rotate_absolute_command () {
      return this.base_command( 'rotator', 'move_absolute', 'rotate',
        { position: this.rotate_absolute } 
      )
    },
  },
}
</script>

<style scoped>

.page {
  display: flex;
  flex-direction: column;
}

.submenu {
  height: 100px;
  background-color: lightgray;
  margin-top: 1em;
  margin-bottom: 1em;
}

@media (orientation: landscape) {
  .page {
    --content-width: 1000px;
    max-width: var(--content-width);
    margin: 0 auto;
  }
}
@media (orientation: portrait) {
  .page {
    --content-width: 80vw;
    max-width: var(--content-width);
    margin: 0 auto;
  }
}

.skychart {
  max-height: var(--content-width);
  background-color:silver;
  margin-bottom: 1em;
}
.controls {
  height: 150px;
  background-color:grey;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 1em;
  margin-bottom: 1em;
}
.control-item {
  background-color: black;
}


</style>
