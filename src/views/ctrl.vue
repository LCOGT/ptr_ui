

<template><div class="wrapper">

  <div class="instrument-selection">

    <!-- Site Selection -->
    <b-field class="select-device" label="Site">
        <b-select 
          placeholder="choose site..." 
          default="" 
          v-model="selected_site"
         >
          <option 
            v-for="(site, index) in available_sites" 
            v-bind:value="site"
            v-bind:key="`site-${index}`"
          >
            {{ site }}
          </option>
          <option> dummy_site </option>
        </b-select>
    </b-field>

    <!-- Mount Selection -->
    <b-field class="select-device" label="Mount">
        <b-select 
          placeholder="choose mount..." 
          default="" 
          v-model="selected_mount"
        >
          <option 
            v-for="(mount, index) in available_mounts" 
            v-bind:value="mount"
            v-bind:key="`mount-${index}`"
          >
            {{ mount }}
          </option>
          <option> dummy_mount </option>
        </b-select>
    </b-field>

    <!-- Telescope Selection -->
    <b-field class="select-device" label="Telescope">
        <b-select 
          placeholder="choose telescope..." 
          default="" 
          v-model="selected_telescope"
        >
          <option 
            v-for="(ota, index) in available_telescopes" 
            v-bind:value="ota"
            v-bind:key="`ota-${index}`"
          >
            {{ ota }}
          </option>
          <option> dummy_telescope </option>
        </b-select>
    </b-field>
    
    <!-- Camera Selection -->
    <b-field class="select-device" label="Camera">
        <b-select 
          placeholder="choose camera..." 
          default="" 
          v-model="selected_camera"
        >
          <option 
            v-for="(cam, index) in available_cameras" 
            v-bind:value="cam"
            v-bind:key="`cam-${index}`"
          >
            {{ cam }}
          </option>
          <option> dummy_camera </option>
        </b-select>
    </b-field>

    <!-- Filter Selection -->
    <b-field class="select-device" label="Filter">
        <b-select 
          placeholder="choose filter..." 
          default="" 
          v-model="selected_filter"
        >
          <option 
            v-for="(filter, index) in available_filters" 
            v-bind:value="filter"
            v-bind:key="`filter-${index}`"
          >
            {{ filter }}
          </option>
          <option> dummy_filter </option>
        </b-select>
    </b-field>

    <!-- Focuser Selection -->
    <b-field class="select-device" label="Focuser">
        <b-select 
          placeholder="choose focuser..." 
          default="" 
          v-model="selected_focuser"
        >
          <option 
            v-for="(focuser, index) in available_focusers" 
            v-bind:value="focuser"
            v-bind:key="`focuser-${index}`"
          >
            {{ focuser }}
          </option>
          <option> dummy_camera </option>
        </b-select>
    </b-field>

    <!-- Rotator Selection -->
    <b-field class="select-device" label="Rotator">
        <b-select 
          placeholder="choose rotator..." 
          default="" 
          v-model="selected_rotator"
        >
          <option 
            v-for="(rotator, index) in available_rotators" 
            v-bind:value="rotator"
            v-bind:key="`rotator-${index}`"
          >
            {{ rotator }}
          </option>
          <option> dummy_camera </option>
        </b-select>
    </b-field>

  <br>
  </div>

  <div class="columns">

    <!-- Mount Controls -->
    <div class="column" style="background: blue;">
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
        <br>
        <div class="buttons has-addons">
        <command-button :data="mount_flat_command" style="width: 33%" />
        <command-button :data="mount_park_command" style="width: 34%" />
        <command-button :data="mount_home_command" style="width: 33%" />
        </div>

    </div>

    <!-- Buttons for camera controls -->
    <div class="column is-one-third" style="background: red">
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

    <!-- Other controls -->
    <div class="column" style="background: orange">
        <div class="title">Focus</div>
          <div class="buttons has-addons">
          <command-button :data="focus_home_command" style="width: 50%" />
          <command-button :data="focus_auto_command" style="width: 50%" />
          </div>
          <b-field horizontal label="Relative">
            <b-field>
              <b-input name="subject" v-model="focus_relative"></b-input>
              <p class="control"> <command-button :data="focus_relative_command" />  </p>
            </b-field>
          </b-field>
          <b-field horizontal label="Absolute">
            <b-field>
              <b-input name="subject" v-model="focus_absolute"></b-input>
              <p class="control"> <command-button :data="focus_absolute_command" />  </p>
            </b-field>
          </b-field>
          <br>
        <div class="title">Rotate</div>
          <command-button :data="rotate_home_command" />
          <br>
          <b-field horizontal label="Relative">
            <b-field>
              <b-input name="subject" v-model="rotate_relative"></b-input>
              <p class="control"> <command-button :data="rotate_relative_command" />  </p>
            </b-field>
          </b-field>
          <b-field horizontal label="Absolute">
            <b-field>
              <b-input name="subject" v-model="rotate_absolute"></b-input>
              <p class="control"> <command-button :data="rotate_absolute_command" />  </p>
            </b-field>
          </b-field>
          <br>
    </div>

    <!-- Verify expected data in this column. -->
    <div class="column" style="background: green">
        <div class="title">Info</div>
        <button class="button" @click="getLastCommand">get prior command</button>
        <br>
        <pre><code>{{ JSON.stringify(JSON.parse(prior_command),null,2) }}</code></pre>
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

export default {
  name: 'ctrl',
  components: {
    CommandButton,
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
      this.selected_site = 'sim_site';
      this.selected_mount = 'mount1';
      this.selected_telescope = 'telescope1';
      this.selected_camera = 'cam1';
      this.selected_filter = 'filter1';
      this.selected_focuser = 'focuser1';
      this.selected_rotator = 'rotator1';
    }
  },
  
  methods: {
    use_cam_cmd() {
      console.log(this.camera_command)
    },
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
          type: device_type,
          timestamp: this.timestamp,
          action: action,
          required_params: req_params || {},
          optional_params: opt_params || {},
        }
      }

    },

    /**
     * Get the most recent command sent to the selected site.
     * Note: this deletes the command from the queue!
     */
    getLastCommand() {
      let apiName = 'ptr-api';
      API.get(apiName, this.command_url).then(response => {
        console.log(response)
        this.prior_command = response
      }).catch(error => {
        console.log(error.response)
      });
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

    available_devices: function (device_type) {
      try {
        return Object.keys(this.config_g[this.selected_site][device_type])
      }
      catch(error) {
        return []
      }
    },

    available_mounts: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]['mount'])
        //return this.config_g[this.selected_site]["mount"]
      }
      catch(error) {
        return []
      }
    },
    available_telescopes: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]["telescope"])
      }
      catch(error) {
        return []
      }
    },
    available_cameras: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]["camera"])
      }
      catch(error) {
        return []
      }
    },
    available_filters: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]["filter"])
      }
      catch(error) {
        return []
      }
    },
    available_focusers: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]["focuser"])
      }
      catch(error) {
        return []
      }
    },
    available_rotators: function () {
      try {
        return Object.keys(this.config_g[this.selected_site]["rotator"])
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
    mount_home_command () {
      return this.base_command( 'mount', 'home', 'home' )
    },
    mount_flat_command () {
      return this.base_command( 'mount', 'flat-panel', 'flats')
    },
    focus_relative_command () {
      return this.base_command( 'focuser', 'move_relative', 'focus',
        { position: this.focus_relative, }
      )
    },
    focus_absolute_command () {
      return this.base_command( 'focuser', 'move_absolute', 'focus',
        { position: this.focus_absolute, }
      )
    },
    focus_auto_command () {
      return this.base_command( 'focuser', 'auto', 'autofocus' )
    },
    focus_home_command () {
      return this.base_command( 'focuser', 'home', 'home' )
    },
    focus_stop_command () {
      return this.base_command( 'focuser', 'stop', 'stop' )
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
.panel-content {
  margin: 2em;
}
.instrument-selection {
  margin: 1em;
  border-bottom: solid grey 1px;
  display: flex;
  flex-wrap: wrap;
}
.columns {
  margin: 1em;
}
.column {
  padding: 2em;
  display: flex;
  flex-direction:column;
}
.select-device {
  padding: 1em;
}
</style>
