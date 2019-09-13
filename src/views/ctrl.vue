

<template><div class="wrapper container">

  <!-- Select the active devices here -->
  <div class="instrument-selection">

    <!-- Site Selection -->
    <b-field class="select-device" label="Site">
        <b-select 
          placeholder="choose site..." 
          default="" 
          size="is-small"
          v-model="active_site"
         >
          <option 
            v-for="(site, index) in available_sites" 
            v-bind:value="site"
            v-bind:key="`site-${index}`"
          >
            {{ site }}
          </option>
        </b-select>
    </b-field>


    <!-- Mount Selection -->
    <b-field class="select-device" label="Mount">
        <b-select 
          placeholder="choose mount..." 
          default="" 
          size="is-small"
          v-model="active_mount"
        >
          <option 
            v-for="(mount, index) in available_mounts" 
            v-bind:value="mount"
            v-bind:key="`mount-${index}`"
          >
            {{ mount }}
          </option>
        </b-select>
    </b-field>

    <!-- Telescope Selection -->
    <b-field class="select-device" label="Telescope">
        <b-select 
          placeholder="choose telescope..." 
          default="" 
          size="is-small"
          v-model="active_telescope"
        >
          <option 
            v-for="(ota, index) in available_telescopes" 
            v-bind:value="ota"
            v-bind:key="`ota-${index}`"
          >
            {{ ota }}
          </option>
        </b-select>
    </b-field>
    
    <!-- Camera Selection -->
    <b-field class="select-device" label="Camera">
        <b-select 
          placeholder="choose camera..." 
          default="" 
          size="is-small"
          v-model="active_camera"
        >
          <option 
            v-for="(cam, index) in available_cameras" 
            v-bind:value="cam"
            v-bind:key="`cam-${index}`"
          >
            {{ cam }}
          </option>
        </b-select>
    </b-field>

    <!-- Filter Wheel Selection -->
    <b-field class="select-device" label="Filter Wheel">
        <b-select 
          placeholder="choose filter wheel..." 
          default="" 
          size="is-small"
          v-model="active_filter_wheel"
        >
          <option 
            v-for="(filter_wheel, index) in available_filter_wheels" 
            v-bind:value="filter_wheel"
            v-bind:key="`filter_wheel-${index}`"
          >
            {{ filter_wheel }}
          </option>
        </b-select>
    </b-field>

    <!-- Focuser Selection -->
    <b-field class="select-device" label="Focuser">
        <b-select 
          placeholder="choose focuser..." 
          default="" 
          size="is-small"
          v-model="active_focuser"
        >
          <option 
            v-for="(focuser, index) in available_focusers" 
            v-bind:value="focuser"
            v-bind:key="`focuser-${index}`"
          >
            {{ focuser }}
          </option>
        </b-select>
    </b-field>

    <!-- Rotator Selection -->
    <b-field class="select-device" label="Rotator">
        <b-select 
          placeholder="choose rotator..." 
          default="" 
          size="is-small"
          v-model="active_rotator"
        >
          <option 
            v-for="(rotator, index) in available_rotators" 
            v-bind:value="rotator"
            v-bind:key="`rotator-${index}`"
          >
            {{ rotator }}
          </option>
        </b-select>
    </b-field>

  <br>
  </div>
  
  <!-- Device control input fields -->
  <div class="columns">

    <!-- Mount Controls -->
    <div class="column" style="padding: 0">
    <div class="" style="background: #ff0044; padding: 2em;">
        <div class="title">Telescope</div>

        <b-field horizontal label="Ra">
          <b-input name="subject" v-model="slew_ra" autocomplete="off"></b-input>
        </b-field>
        <b-field horizontal label="Dec">
          <b-input name="subject" v-model="slew_dec" autocomplete="off"></b-input>
        </b-field>

        <command-button :data="mount_slew_command" style="margin-bottom: 1em;"/>
        <br>

        <b-dropdown aria-role="list" style="width: 100%;">
          <button class="button" slot="trigger" style="width: 100%;">
              <span>Slew to...</span>
              <b-icon icon="menu-down"></b-icon>
          </button>
          <b-dropdown-item aria-role="listitem">
            <command-button :data="mount_slew_chart_command" class="dropdown-button-command"/>
          </b-dropdown-item>
          <b-dropdown-item>
            <command-button :data="mount_screenflat_command" class="dropdown-button-command"/>
          </b-dropdown-item>
          <b-dropdown-item>
            <command-button :data="mount_skyflat_command" class="dropdown-button-command"/>
          </b-dropdown-item>
          <b-dropdown-item>
            <command-button :data="mount_home_command" class="dropdown-button-command"/>
          </b-dropdown-item>
          <b-dropdown-item>
            <command-button :data="mount_park_command" class="dropdown-button-command"/>
          </b-dropdown-item>
          <b-dropdown-item>
            <command-button :data="mount_raSidDec0_command" class="dropdown-button-command"/>
          </b-dropdown-item>
          <b-dropdown-item>
            <command-button :data="mount_stop_command" class="dropdown-button-command"/>
          </b-dropdown-item>
        </b-dropdown>
    </div>

    <pre>
      <simple-device-status :device_name="active_mount" device_type="Mount" :device_status="mount_state" />
      <simple-device-status :device_name="active_telescope" device_type="Telescope" :device_status="telescope_state" />
    </pre>

    </div>

    <!-- Buttons for camera controls -->
    <div class="column" style="padding: 0">
    <div style="background:orangered; padding: 2em;">
        <div class="title">Camera + Filter</div>

        <b-field horizontal label="Expose">
            <b-field>
                <b-input name="subject" v-model="cam_exposure" autocomplete="off"></b-input>
                <p class="control"> <span class="button is-static">s</span> </p>
            </b-field>
        </b-field>

        <b-field horizontal label="Count">
            <b-field>
                <b-numberinput name="subject" type="is-light" min="1" controls-position="compact" v-model="cam_count" autocomplete="off"></b-numberinput>
            </b-field>
        </b-field>


        <b-field horizontal label="Filter">
            <!--b-select placeholder="Select filter" v-model="cam_filter" style="width: 100%">
                <option value="LUMINANCE">luminance</option>
                <option value="RED">red</option>
                <option value="GREEN">green</option>
                <option value="BLUE">blue</option>
            </b-select-->

            <b-select placeholder="select filter..." v-model="filter_wheel_options_selection" style="width: 100%">
              <option 
                v-for="(filter, index) in filter_wheel_options"
                v-bind:value="filter[0]" 
                v-bind:selected="index === 0"
                v-bind:key="index"
                >
                {{ filter[0] }}
              </option>
            </b-select>

            <div class="buttons has-addons">
              <command-button :data="filter_wheel_command" style="width: 50%"/>
              <command-button :data="filter_wheel_home_command" style="width: 50%" />
            </div>
        </b-field>

        <b-field horizontal label="Area" v-if="camera_areas.length != 0">
            <b-select placeholder="Select chip area" v-model="camera_areas_selection" style="width: 100%">
              <option
                v-for="(area, index) in camera_areas"
                v-bind:value="area"
                v-bind:selected="index === 0"
                v-bind:key="index"
                >
                {{ area }}
              </option>
            </b-select>
        </b-field>

        <b-field horizontal label="Image Type">
          <b-select placeholder="Select image type" v-model="cam_image_type">
            <option
              v-for="(image_type, index) in cam_image_type_options"
              v-bind:value="image_type"
              v-bind:selected="index === 0"
              v-bind:key="index"
              >
              {{ image_type }}
            </option>
          </b-select>
        </b-field>

        <b-field horizontal label="Dither">
          <b-checkbox
            v-model="cam_dither"
            true-value="on"
            false-value="off"
            >
            {{ cam_dither }}
          </b-checkbox>
        </b-field>

        <b-field horizontal label="Bin" v-if="camera_can_bin=='True'">
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

    <div style="background:orangered; padding: 2em; margin-top: 10px;">
        <div class="title">Sequencer</div>

        <b-field label="Script">
          <b-field>
            <b-select value="none" v-model="selected_script" style="width: 100;">
              <option value="none">none</option>
              <option value="stop_script">Stop Script</option>
              <option value="focus_auto">Focus Auto</option>
              <option value="focus_fine">Focus Fine</option>
              <option value="focus_vcurve">Focus V-Curve</option>
              <option value="takeLRGBStack">Take LRGB Stack</option>
              <option value="takeO3HaS2N2Stack">Take O3HaS2N2 Stack</option>
              <option value="takeUGRIZSStack">Take ugrizs Stack</option>
              <option value="takePlanetStack">Take Planet Stack</option>
              <option value="takeLunarStack">Take Lunar Stack</option>
              <option value="genBiasDarkMaster">Gen Bias/Dark Master</option>
              <option value="genScreenFlatMasters">Gen Screen Flat Masters</option>
              <option value="take_pre-open_calibrations">Take Pre-open Calibrations</option>
              <option value="takeSkyFlats">Take SkyFlats</option>
              <option value="find_field_center">Find Field Center</option>
              <option value="calibrate_focus_v-curve">Calibrate Focus V-curve</option>
              <option value="32_target_pointing_run">32 Target Pointing Run</option>
              <option value="128_target_pointing_run">128 Target Pointing Run</option>
              <option value="run_using_acp">Run Using ACP</option>
              <option value="stop_using_acp">Stop Using ACP</option>
            </b-select>
            <p class="control">
              <button 
                class="button is-light" 
                :disabled="!scriptHasSettings"
                @click="isScriptSettingsActive = true"
                >
                <b-icon icon="settings"></b-icon>
              </button>
            </p>
          </b-field>
        </b-field>

        <b-modal :active.sync="isScriptSettingsActive" has-modal-card>
            <script-settings :script="selected_script" />
        </b-modal>

        <div class="status-item">
          <div class="title2">Sequencer Status</div>
          <pre>{{ sequencer_state }}</pre>
        </div>

        <div class="buttons has-addons">
          <button class="button" @click="script_run_command" style="width: 70%;"> run script</button>
          <button class="button" @click="script_stop_command" style="width: 30%"> stop script</button>
        </div>

    </div>
    <pre>
      <simple-device-status :device_name="active_camera" device_type="Camera" :device_status="camera_state" />
      <simple-device-status :device_name="active_filter_wheel" device_type="Filter Wheel" :device_status="filter_wheel_state" />
    </pre>

    </div>

    <!-- Other controls -->
    <div class="column" style="padding: 0">
    <div style="background:#ff8800; padding: 2em;">
        <div class="title">Focuser</div>

          <b-dropdown aria-role="list" style="width: 100%; margin-bottom: 1em;">
            <button class="button" slot="trigger" style="width: 100%;">
                <span>Focus Action...</span>
                <b-icon icon="menu-down"></b-icon>
            </button>
            <b-dropdown-item aria-role="listitem">
              <command-button :data="focus_home_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_gotoreference_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_gotocompensated_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_saveasreference_command" class="dropdown-button-command"/>
            </b-dropdown-item>
          </b-dropdown>
          <br>

          <b-field label="Relative">
            <b-field>
              <b-input expanded name="subject" size="is-small" v-model="focus_relative" type="number" :step="focuser_step_size" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="focus_relative_command" class="is-small"/>  </p><br>
            </b-field>
          </b-field>

          <b-field label="Absolute">
            <b-field>
              <b-input expanded name="subject" size="is-small" v-model="focus_absolute" type="number" :step="focuser_step_size" :min="focuser_min" :max="focuser_max" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="focus_absolute_command" class="is-small"/>  </p>
            </b-field>
          </b-field>
          <br>

        <div class="title">Rotator</div>
          <command-button :data="rotate_home_command" />
          <br>
          <b-field label="Relative">
            <b-field>
              <b-input expanded size="is-small" name="subject" v-model="rotate_relative" type="number" :step="rotator_step_size" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="rotate_relative_command" class="is-small"/>  </p>
            </b-field>
          </b-field>
          <b-field label="Absolute">
            <b-field>
              <b-input expanded size="is-small" name="subject" v-model="rotate_absolute" type="number" :step="rotator_step_size" autocomplete="off"></b-input>
              <p class="control"> <command-button :data="rotate_absolute_command" class="is-small" />  </p>
            </b-field>
          </b-field>
          <br>

        <div class="title">Flat Screen</div>
          <b-field label="Brightness">
            <b-field>
              <b-input expanded size="is-small" name="subject" v-model="screen_brightness" type="number" :step="1" min="0" max="100" autocomplete="off"></b-input>
              <command-button :data="screen_on_command" class="is-small control" />
              <command-button :data="screen_off_command" class="is-small control" /> 
            </b-field>
          </b-field>

    </div>
    <pre>
      <simple-device-status :device_name="active_focuser" device_type="Focuser" :device_status="focuser_state" />
      <simple-device-status :device_name="active_rotator" device_type="Rotator" :device_status="rotator_state" />
      <simple-device-status :device_name="active_screen" device_type="Screen" :device_status="screen_state" />
    </pre>
    </div>

    <!-- Verify expected data in this column. -->
    <div class="column" style="padding: 0">
      <div style="background: orange; padding: 2em;">
          <div class="title">Image</div>
          <button class="button" @click="refresh_latest_image" style="margin-bottom: 1em;">latest image</button>
          <br>
          <div style="width:100%;height:0; padding-top:100%;position:relative; background-fill: yellow;">
              <img
                  v-bind:src="current_image.jpg13_url" 
                  @click="isImageModalActive = true" 
                  style="width: 100%; background-color: grey; cursor: pointer; position: absolute; top:0; left:0" />
          </div>
          <b-modal :active.sync="isImageModalActive" :width="800">
              <p class="image">
                  <image-view :site="active_site" />
              </p>
          </b-modal>
          <div>Filename:</div>
          <div>{{current_image.base_filename}}</div>
          <br>
      </div>
      <div style="background-color: #282f2f; padding: 2em;">
        <p class="heading">Status Age: </p>
        <p class="has-text-weight-semibold is-size-5">
        <span v-if="status_age < 15" style="color: lightgreen;"> {{' < 15 seconds old'}} </span>
        <span v-else-if="status_age < 120" style="color: yellow;">{{' < 2 minutes old'}}</span>
        <span v-else-if="status_age < 3600" style="color:red;">{{(status_age/60).toFixed(0)+' minutes old'}}</span>
        <span v-else-if="status_age < 86400" style="color:red;">{{(status_age/3600).toFixed(0)+' hours old'}}</span>
        <span v-else-if="status_age < 18000*86400" style="color:red;">{{(status_age/86400).toFixed(0)+' days old'}}</span>
        <span v-else-if="status_age > 18000*86400" style="color:red;">{{'unavailable'}}</span>
        </p>
      </div>
    </div>

  </div>

  <div class="choose-target">
    <the-sky-chart />
  </div>

</div></template>

<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import helpers from '@/utils/helpers'
import store from '../store/index'

// Components
import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import ImageView from '@/components/ImageView'
import SimpleDeviceStatus from '@/components/SimpleDeviceStatus'
import ScriptSettings from '@/components/ScriptSettings'


export default {
  name: 'ctrl',
  components: {
    CommandButton,
    TheSkyChart,
    ImageView,
    SimpleDeviceStatus,
    ScriptSettings,
  },
  mixins: [commands_mixin],
  data () {
    return {

      // This is a setInterval object initialized in `created()`. 
      // Fetches status every few seconds.
      update_status_interval: 2000,
      local_timestamp: Date.now(),

      // Controls the toggle for image preview modal.
      isImageModalActive: false,

      // Toggles the script settings visiblity
      isScriptSettingsActive: false,

    }
  },

  created() {
    var that = this;
    // Make sure we're using the latest site configuration.
    this.$store.dispatch('observatory_configuration/update_config').then(function() {

      // Default site/device values.
      that.$store.dispatch('observatory_configuration/set_default_active_devices', 'wmd')
      that.$store.dispatch('instrument_state/updateStatus')

    }())

    // Every two seconds, we refresh the site status.
    // This interval is stopped in the `beforeDestroy` lifecycle hook.
    this.update_status_interval = setInterval(this.update_status, 3000)
    this.update_time_interval = setInterval(this.update_time, 1000)
  },
  
  beforeDestroy() {
    clearInterval(this.update_status_interval)
  },


  methods: {
    /**
    * Update status by requesting data from dynamodb via vuex.
    * This function is called regularly in the `created` lifecycle hook.
    */
    update_status() {
      // Dispatch the vuex action that refreshes the site status. 
      this.$store.dispatch('instrument_state/updateStatus')
      // Refresh the image list
      this.$store.dispatch('images/refresh_latest_images')
    },

    update_time() {
      this.local_timestamp= Date.now()
    },

    refresh_latest_image() {
      this.$store.dispatch('images/set_latest_image')
    },
  },


  computed: {

    ...mapGetters('images', [
      'current_image',
    ]),
    ...mapGetters([
      'scriptHasSettings',
    ]),

    status_age() {
      let status_timestamp = this.$store.getters['instrument_state/timestamp']
      return (this.local_timestamp/1000 - status_timestamp).toFixed(1)
    },

    selected_script: {
      get() { return this.$store.getters['selectedScript']},
      set(val) { this.$store.commit('selectedScript', val)},
    }
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
  flex-wrap: wrap;
}
.column {
  margin: 5px;
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
  flex-wrap: wrap;
}
.status-item {
  margin: 1em;
  flex: 1;
}
.choose-target {
  margin: 1em;
  padding: 1em;
  display: grid;
  grid-template-columns: 1fr 0fr;
}
.choose-target-item {
  height: width;
  margin: 1em;
}
.label {
  color: #dbdee0;
}

.dropdown-button-command {
  border: none;
}
.dropdown-button-command:hover {
  color:grey;
  font:bolder;
}

.modal-dialog {
    max-width: 100%;
    margin: 0;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 110vh;
    display: flex;
}

</style>
