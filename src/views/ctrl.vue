

<template><div class="wrapper">

  <!-- Select the active devices here -->
  <div class="instrument-selection">

    <!-- Site Selection -->
    <b-field class="select-device" label="Site">
        <b-select 
          placeholder="choose site..." 
          default="" 
          v-model="active_site"
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
          v-model="active_mount"
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
          v-model="active_telescope"
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
          v-model="active_camera"
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
          v-model="active_filter"
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
          v-model="active_focuser"
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
          v-model="active_rotator"
        >
          <option 
            v-for="(rotator, index) in available_rotators" 
            v-bind:value="rotator"
            v-bind:key="`rotator-${index}`"
          >
            {{ rotator }}
          </option>
          <option> dummy_rotator </option>
        </b-select>
    </b-field>

  <br>
  </div>

  <!-- Device control input fields -->
  <div class="columns">

    <!-- Mount Controls -->
    <div class="column" style="background: #ff0044;">
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
    <div class="column is-one-third" style="background:orangered">
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
    <div class="column" style="background:#ff8800">
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
    <div class="column" style="background: orange">
        <div class="title">Info</div>
        <button class="button" @click="getLastCommand">get prior command</button>
        <br>
        <pre><code>{{ JSON.stringify(JSON.parse(prior_command),null,2) }}</code></pre>
    </div>

  </div>

  <!-- Raw status for the active devices -->
  <div class="status">
    <div class="status-item">
      <div class="title2">Mount</div>
      <pre><code>{{ JSON.stringify(mount_state,null,2) }}</code></pre>
    </div>
    <div class="status-item">
      <div class="title2">Camera</div>
      <pre><code>{{ JSON.stringify(camera_state,null,2) }}</code></pre>
    </div>
    <div class="status-item">
      <div class="title2">Filter</div>
      <pre><code>{{ JSON.stringify(filter_state,null,2) }}</code></pre>
    </div>
    <div class="status-item">
      <div class="title2">Focuser</div>
      <pre><code>{{ JSON.stringify(focuser_state,null,2) }}</code></pre>
    </div>
    <div class="status-item">
      <div class="title2">Rotator</div>
      <pre><code>{{ JSON.stringify(rotator_state,null,2) }}</code></pre>
    </div>
  </div>

  <div class="choose-target">
    <the-sky-chart />
    <object-table class="choose-target-item"/>
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
import ObjectTable from '@/components/ObjectTable'

export default {
  name: 'ctrl',
  components: {
    CommandButton,
    TheSkyChart,
    ObjectTable,
  },
  data () {
    return {

      // This is a setInterval object initialized in `created()`. 
      // Fetches status every few seconds.
      update_status_interval: '',

      // If a user enters a value in an input field, that value maps here.
      // When commands are sent, values are read from here.
      slew_ra: '',
      slew_dec: '',

      cam_exposure: '',
      cam_repeat: '',
      cam_filter: '',
      cam_bin: '1', 

      focus_relative: '',
      focus_absolute: '',

      rotate_relative: '',
      rotate_absolute: '',


      // This is displayed as the prior command. Updated on button click.
      prior_command: null,

    }
  },

  beforeCreate() {
    // Make sure we're using the latest site configuration.
    this.$store.dispatch('device_selection/update_config')
  },

  created() {
    // Every second, we refresh the site status.
    // This interval is stopped in the `beforeDestroy` lifecycle hook.
    this.update_status_interval = setInterval(this.update_status, 1000)

    // Set the initial devices for convenience.
    if (true) {
      this.active_site= 'sim_site';
      this.active_enclosure= 'enclosure1';
      this.active_mount= 'mount1';
      this.active_telescope= 'telescope1';
      this.active_camera= 'cam1';
      this.active_filter= 'filter1';
      this.active_focuser= 'focuser1';
      this.active_rotator= 'rotator1';
    }
  },
  
  methods: {
    /**
     * This method is used in the 'computed' properties that are fed to
     * the CommandButton components. Whenever a command button is clicked, 
     * this method takes values from input fields and assembles everything 
     * needed by the commandbutton, including a well formed JSON command 
     * and where to send it. 
     * @param {string} device_type Used to create the JSON command.
     * @param {string} action The thing that the device should do.
     * @param {string} name The text on the button that sends the command.
     * @param {object} req_params Required parameters for the command. See 
     *  command_syntax_doc.js for details.
     * @param {object} opt_params Optional parameters for the command. See 
     *  command_syntax_doc.js for details.
     */
    base_command(device_type, action, name, req_params, opt_params) {


      // Get the active device of the requested device type. 
      let device
      switch (device_type) {
        case 'mount':
          device = this.active_mount;
          break;
        case 'camera': 
          device = this.active_camera;
          break;
        case 'filter':
          device = this.active_filter;
          break;
        case 'rotator':
          device = this.active_rotator;
          break;
        case 'focuser':
          device = this.active_focuser;
          break;
      }

      return {
        name: name,
        url: `/${this.active_site}/${this.active_mount}/command/`,
        site: this.active_site,
        mount: this.active_mount,
        http_method: 'POST',
        form: {
          device: device,
          type: device_type,
          timestamp: parseInt(Date.now() / 1000),
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
      // Parameters for api call to get last command
      let apiName = 'ptr-api';
      let url = `/${this.active_site}/${this.active_mount}/command/`;

      API.get(apiName, url).then(response => {
        console.log(response)
        this.prior_command = response
      }).catch(error => {
        console.log(error.response)
      });
    },

    /**
    * Update status by requesting data from dynamodb via vuex.
    * This function is called regularly in the `created` lifecycle hook.
    */
    update_status() {
      this.timestamp = parseInt(Date.now() / 1000)
      // The status refresh requires a site to be specified (for the url).
      // Get the active site from the device_selection vuex module.
      let the_active_site = this.active_site
      // Handle case when no site has been selected.
      // Note: sending the site '' will return and empty status.
      the_active_site = (
        typeof this.active_site=== undefined || this.active_site== 'undefined'
        ? '' 
        : this.active_site)

      // Dispatch the vuex action that refreshes the site status. 
      this.$store.dispatch('observatory/updateStatus', the_active_site)
    },

  },

  beforeDestroy() {
    clearInterval(this.update_status_interval)
  },

  computed: {

    // Getters from the observatory vuex module. 
    // Observatory status is saved here.
    ...mapGetters('observatory', {
      all_mount_state: 'mount',
      all_camera_state: 'camera',
      all_filter_state: 'filter',
      all_focuser_state: 'focuser',
      all_rotator_state: 'rotator',
    }),

    // Getters from the device_selection vuex module.
    // Available devices and currently active devices are stored here.
    ...mapGetters('device_selection', [
      'available_sites',
      'available_enclosures',
      'available_mounts',
      'available_telescopes',
      'available_rotators',
      'available_focusers',
      'available_filters',
      'available_cameras',
      'global_config',
    ]),

    // The `selected_${device}` computed properties are used for two way
    // binding between vuex (device_selection module) and the device 
    // selection inputs. 
    active_site: {
      get() { return this.$store.getters['device_selection/site'] },
      set(value) { this.$store.commit('device_selection/setActiveSite', value) }
    },
    active_enclosure: {
      get() { return this.$store.getters['device_selection/enclosure'] },
      set(value) { this.$store.commit('device_selection/setActiveEnclosure', value) }
    },
    active_mount: {
      get() { return this.$store.getters['device_selection/mount'] },
      set(value) { this.$store.commit('device_selection/setActiveMount', value) }
    },
    active_telescope: {
      get() { return this.$store.getters['device_selection/telescope'] },
      set(value) { this.$store.commit('device_selection/setActiveTelescope', value) }
    },
    active_rotator: {
      get() { return this.$store.getters['device_selection/rotator'] },
      set(value) { this.$store.commit('device_selection/setActiveRotator', value) }
    },
    active_focuser: {
      get() { return this.$store.getters['device_selection/focuser'] },
      set(value) { this.$store.commit('device_selection/setActiveFocuser', value) }
    },
    active_filter: {
      get() { return this.$store.getters['device_selection/filter'] },
      set(value) { this.$store.commit('device_selection/setActiveFilter', value) }
    },
    active_camera: {
      get() { return this.$store.getters['device_selection/camera'] },
      set(value) { this.$store.commit('device_selection/setActiveCamera', value) }
    },

    // Since the vuex observatory getters return state for all devices of
    // a type together, we need to request the specific device from that 
    // collective state. These properties do that, and handle an undefined 
    // key by returning an empty list.
    mount_state: function() {
      try {
        return this.all_mount_state[this.active_mount]
      } catch { return [] }
    },
    camera_state: function() {
      try {
        return this.all_camera_state[this.active_camera]
      } catch(error) { return [] }
    },
    filter_state: function() {
      try {
        return this.all_filter_state[this.active_filter]
      } catch(error) { return [] }
    },
    focuser_state: function() {
      try {
        return this.all_focuser_state[this.active_focuser]
      } catch(error) { return [] }
    },
    rotator_state: function() {
      try {
        return this.all_rotator_state[this.active_rotator]
      } catch(error) { return [] }
    },

    command_url: function () {
      return `/${this.active_site}/${this.active_mount}/command/`
    },

    /**
     * The following computed properties with name 
     * `${device_type}_${action}_command` are computed objects that are
     * consumed by CommandButton components. Using the 'base_command' 
     * method, they provide the required information like the JSON command
     * and url to send it.
     */
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
  margin: 2px;
  padding: 2em;
  display: flex;
  flex-direction:column;
}
.select-device {
  padding: 1em;
}
.status {
  margin: 1em;
  padding: 1em;
  min-height: 5em;
  /*background:lightskyblue;*/
  display: flex;
  border-bottom: solid grey 1px;
}
.status-item {
  margin: 1em;
}
.choose-target {
  margin: 1em;
  padding: 1em;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.choose-target-item {
  height: width;
  margin: 1em;
}
</style>
