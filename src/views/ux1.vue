

<template><div class="page">

  <div class="submenu">
  </div>

  <div class="view">
    <the-sky-chart />
  </div>

  <div class="controls">

    <div class="mount">
      <div class="title">Slew</div>

      <b-field horizontal label="Ra">
        <b-input name="subject" v-model="slew_ra"></b-input>
      </b-field>
      <b-field horizontal label="Dec">
        <b-input name="subject" v-model="slew_dec"></b-input>
      </b-field>

      <br>
      <div class="buttons has-addons">
        <command-button :data="mount_slew_command" style="width: 50%" />
        <command-button :data="mount_stop_command" style="width: 50%" />
      </div>
      <div class="buttons has-addons">
      <command-button :data="mount_flat_command" style="width: 50%" />
      <command-button :data="mount_park_command" style="width: 50%" />
      </div>
    </div>

    <br>
    <br>

    <div class="camera">
        <div class="title">Camera + Filter</div>

        <b-field horizontal label="Expose">
            <b-field>
                <b-input name="subject" v-model="cam_exposure"></b-input>
                <p class="control"> <span class="button is-static">s</span> </p>
            </b-field>
        </b-field>

        <b-field horizontal label="Repeat">
            <b-field>
                <b-input name="subject" v-model="cam_repeat"></b-input>
            </b-field>
        </b-field>


        <b-field horizontal label="Filter">
            <b-select placeholder="Select filter" v-model="cam_filter" style="width: 100%">
                <option value="LUMINANCE">luminance</option>
                <option value="RED">red</option>
                <option value="GREEN">green</option>
                <option value="BLUE">blue</option>
            </b-select>
            <div class="buttons has-addons">
              <command-button :data="filter_command" style="width: 60%" />
              <command-button :data="filter_home_command" style="width: 40%" />
            </div>
        </b-field>

        <b-field horizontal label="Bin">
            <b-field>
            <b-radio-button v-model="cam_bin"
                native-value="1"
                type="is-white is-outlined">
                1x
            </b-radio-button>
            <b-radio-button v-model="cam_bin"
                native-value="2"
                type="is-white is-outlined">
                2x
            </b-radio-button>
            <b-radio-button v-model="cam_bin"
                native-value="4"
                type="is-white is-outlined">
                4x
            </b-radio-button>
            </b-field>
        </b-field>

        <br>
        <div class="buttons has-addons">
        <command-button :data="camera_expose_command" style="width: 70%" />
        <command-button :data="camera_cancel_command" style="width: 30%" />
        </div>
    </div>

  </div>

</div></template>

<script>
import { API, Auth } from 'aws-amplify'
import { AmplifyEventBus } from 'aws-amplify-vue'
import { mapGetters } from 'vuex'
import axios from 'axios';
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
  display: grid;
  grid-template-columns: 10% 65% 25%;
  grid-gap: 10px;
}
.submenu {
  grid-column: 1;
  min-height: 50vh;
  background-color:#999;
}
.view {
  grid-column: 2;
  min-height: 50vh;
  background-color:silver;
}
.controls {
  grid-column: 3;
  min-height: 50vh;
  background-color:grey;
}


.controls {
  padding: 2em;
  display: flex;
  flex-direction: column;
}
</style>
