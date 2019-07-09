

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
        <div class="title">Mount</div>

        <b-field horizontal label="Ra">
          <b-input name="subject" v-model="slew_ra"></b-input>
        </b-field>
        <b-field horizontal label="Dec">
          <b-input name="subject" v-model="slew_dec"></b-input>
        </b-field>

        <command-button :data="mount_slew_command"/>
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

        <!--br>
        <div> (or) </div>
        <br>

        <div class="buttons has-addons">
          <command-button :data="mount_slew_command" style="width: 100%" />
          <command-button :data="mount_slew_chart_command" style="width: 100%;" />
        </div>

        <div class="buttons has-addons">
          <command-button :data="mount_screenflat_command" style="width: 50%" />
          <command-button :data="mount_skyflat_command" style="width: 50%" />
        </div>

        <div class="buttons has-addons">
          <command-button :data="mount_raSidDec0_command" style="width: 100%"/>
        </div>

        <div class="buttons has-addons">
          <command-button :data="mount_home_command" style="width: 50%" />
          <command-button :data="mount_park_command" style="width: 50%" />

        </div>

        <command-button :data="mount_stop_command" style="width: 100%" /-->

    </div>

    <!-- Buttons for camera controls -->
    <div class="column" style="background:orangered">
        <div class="title">Camera + Filter</div>

        <b-field horizontal label="Expose">
            <b-field>
                <b-input name="subject" v-model="cam_exposure"></b-input>
                <p class="control"> <span class="button is-static">s</span> </p>
            </b-field>
        </b-field>

        <b-field horizontal label="Count">
            <b-field>
                <b-input name="subject" v-model="cam_repeat"></b-input>
            </b-field>
        </b-field>


        <b-field horizontal label="Filter">
            <!--b-select placeholder="Select filter" v-model="cam_filter" style="width: 100%">
                <option value="LUMINANCE">luminance</option>
                <option value="RED">red</option>
                <option value="GREEN">green</option>
                <option value="BLUE">blue</option>
            </b-select-->

            <b-select placeholder="select filter..." v-model="filter_options_selection" style="width: 100%">
              <option 
                v-for="(filter, index) in filter_options"
                v-bind:value="filter" 
                v-bind:selected="index === 0"
                v-bind:key="index"
                >
                {{ filter }}
              </option>
            </b-select>

            <div class="buttons has-addons">
              <command-button :data="filter_command" style="width: 50%"/>
              <command-button :data="filter_home_command" style="width: 50%" />
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

    <!-- Other controls -->
    <div class="column" style="background:#ff8800">
        <div class="title">Focus</div>

          <b-dropdown aria-role="list" style="width: 100%;">
            <button class="button" slot="trigger" style="width: 100%;">
                <span>Focus Action...</span>
                <b-icon icon="menu-down"></b-icon>
            </button>
            <b-dropdown-item aria-role="listitem">
              <command-button :data="focus_home_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_auto_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_fine_command" class="dropdown-button-command"/>
            </b-dropdown-item>
            <b-dropdown-item>
              <command-button :data="focus_vcurve_command" class="dropdown-button-command"/>
            </b-dropdown-item>
          </b-dropdown>
          <br>

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
        <!--div class="title">Info</div-->
        <!--button class="button" @click="getLastCommand">get prior command</button-->
        <!--br-->
        <!--pre><code>{{ prior_command }}</code></pre-->

        <div class="title">Image</div>
        <button class="button" @click="update_status">refresh image</button>
        <br>
        <img v-bind:src="current_image.url" style="width: 100%; background-color: grey;"></img>
        <div>Filename:</div>
        <div>{{current_image.name}}</div>
        <br>
    </div>

  </div>

  <!-- Raw status for the active devices -->
  <div class="status">
    <div class="status-item">
      <div class="title2">
        Mount Status  
        <span v-if="status_age < 10" style="color: lightgreen;"> {{" < 10 seconds old"}} </span>
        <span v-if="status_age < 120 && status_age > 10" style="color: yellow;">{{" < 2 minutes old"}}</span>
        <span v-if="status_age > 120" style="color:red;">{{" > 2 minutes old"}}</span>
      </div>
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
import { commands_mixin } from '../mixins/commands_mixin'


export default {
  name: 'ctrl',
  components: {
    CommandButton,
    TheSkyChart,
    ObjectTable,
  },
  mixins: [commands_mixin],
  data () {
    return {

      // This is a setInterval object initialized in `created()`. 
      // Fetches status every few seconds.
      update_status_interval: 2000,

      local_timestamp: Date.now(),

      // If a user enters a value in an input field, that value maps here.
      // When commands are sent, values are read from here.
      slew_ra: '',
      slew_dec: '',

      cam_exposure: '1',
      cam_repeat: '1',
      //cam_filter: '',
      cam_area: null,
      cam_bin: '1', 
      cam_dither: 'off',
      cam_image_type: 'light',
      cam_image_type_options: ['light', 'toss', 'auto focus',  'fine focus', 'dark', 'bias', 'screen flat', 'sky flat', 'lamp', 'NeAr', 'ThAr', 'sun'],

      focus_relative: '',
      focus_absolute: '',

      rotate_relative: '',
      rotate_absolute: '',


      // This is displayed as the prior command. Updated on button click.
      prior_command: null,

      latest_image_url: '',
      latest_image_name: '',
      download_path: '',
      

    }
  },

  beforeCreate() {
    // Make sure we're using the latest site configuration.
    this.$store.dispatch('device_selection/update_config')
  },

  created() {
    // Every two seconds, we refresh the site status.
    // This interval is stopped in the `beforeDestroy` lifecycle hook.
    this.update_status_interval = setInterval(this.update_status, 3000)
    this.update_time_interval = setInterval(this.update_time, 1000)

    // Default site/device values.
    if (true) {
      this.active_site= 'WMD';
      this.active_enclosure= 'enclosure1';
      this.active_mount= 'mnt1';
      this.active_telescope= 'tel1';
      this.active_camera= 'cam1';
      this.active_filter= 'filter1';
      this.active_focuser= 'focuser1';
      this.active_rotator= 'rotator1';
    }
  },
  
  methods: {

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

      // Dispatch the vuex action that refreshes the site status. 
      this.$store.dispatch('observatory/updateStatus')

      // Refresh the image
      this.$store.dispatch('images/refresh_latest_images')
    },

    update_time() {
      this.local_timestamp= Date.now()
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
        status_timestamp: 'timestamp',
    }),

    ...mapGetters('images', [
      'current_image',
    ]),

    status_age() {
      return (this.local_timestamp/1000 - this.status_timestamp).toFixed(1)
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


</style>
