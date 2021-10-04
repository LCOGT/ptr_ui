<template>

  <div class="site-observe-wrapper">
  
  <div class="content-column">

    <b-modal :active.sync="telescopeModal"
      trap-focus
      :can-cancel="['escape']"
      scroll="clip"
      full-screen
      style="z-index:1000;"
      >
      <skychart-modal
        style="background-color:#151718; overflow-y:auto; height: 100%;"
        :sitecode="sitecode"
        :deviceStatus="deviceStatus"
      />
    </b-modal>

  </div>

  <!--div class="spacer" style="height: 2em;" /-->

  <site-data :deviceStatus="deviceStatus" />

  <!--log-stream :site="sitecode" /-->

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
import { status_mixin } from '../../mixins/status_mixin'
import { user_mixin } from '../../mixins/user_mixin'

// Components
import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import ScriptSettings from '@/components/ScriptSettings/ScriptSettings'
import TheDomeCam from '@/components/TheDomeCam'
import SideInfoPanel from '@/components/SideInfoPanel'
import SiteData from '@/components/sitepages/SiteData'
import SkychartModal from '@/components/SkychartModal'
import ImagesTable from '@/components/ImagesTable'
import StatusColumn from '@/components/status/StatusColumn'
import LogStream from '@/components/LogStream'

export default {
  name: 'SiteObserve',
  components: {
    CommandButton,
    TheSkyChart,
    SimpleDeviceStatus,
    ScriptSettings,
    TheDomeCam,
    SideInfoPanel,
    SiteData,
    SkychartModal,
    ImagesTable,
    StatusColumn,
    LogStream,
  },
  mixins: [commands_mixin, status_mixin, user_mixin],
  props: ['sitecode'],
  data () {
    return {

      self: this,

      // This is a setInterval object initialized in `created()`. 
      // Fetches status every few seconds.
      update_status_interval: 2000,
      local_timestamp: Date.now(),

      // Controls the toggle for image preview modal.
      isImageModalActive: false,

      isCmdTabsExpanded: false,

      // Toggles the script settings visiblity
      isScriptSettingsActive: false,

      testSubframeIsActive: false,

      isDeviceSelectorActive: false,

      isEnclosureStatusVisible: false,
      isMountStatusVisible: false,
      isCameraStatusVisible: false,
      isFocuserStatusVisible: false,
      isRotatorStatusVisible: false,
      isScreenStatusVisible: false,
      isSequencerStatusVisible: false,

      // Full screen modal for sky map and mount commands
      telescopeModal: false,

    }
  },

  created() {
    // This interval is stopped in the `beforeDestroy` lifecycle hook.
    this.update_time_interval = setInterval(this.update_time, 1000)

    // set default values from config
    // TODO: this should go in a better place
    this.camera_bin = this.camera_default_bin
    this.camera_areas_selection = this.camera_default_area

  },
  beforeDestroy() {
    clearInterval(this.update_time_interval)
  },


  methods: {
    update_time() {
      this.local_timestamp= Date.now()
    },
  
    refresh_latest_image() {
      this.$store.dispatch('images/set_latest_image')
    },
  },

  watch: {
    // If the user changes the chip area parameter, deactivate the subframe.
    camera_areas_selection() {
      this.subframeIsActive = false;
    }
  },

  computed: {

    ...mapGetters('images', [
      'current_image',
    ]),
    ...mapGetters([
      'scriptHasSettings',
    ]),

    ...mapGetters('site_config', [
      'camera_default_bin',
      'camera_default_area',
    ]),

    selected_script: {
      get() { return this.$store.getters['selectedScript']},
      set(val) { this.$store.commit('selectedScript', val)},
    },

    // command_params
    mount_ra: {
      get() { return this.$store.getters['command_params/mount_ra']},
      set(val) { this.$store.commit('command_params/mount_ra', val)},
    },
    mount_dec: {
      get() { return this.$store.getters['command_params/mount_dec']},
      set(val) { this.$store.commit('command_params/mount_dec', val)},
    },
    mount_object: {
      get() { return this.$store.getters['command_params/mount_object']},
      set(val) { this.$store.commit('command_params/mount_object', val)},
    },

    telescope_selection: {
      get() { return this.$store.getters['command_params/telescope_selection']},
      set(val) { this.$store.commit('command_params/telescope_selection', val)},
    },

    telescope_coordinate_frame: {
      get() { return this.$store.getters['command_params/telescope_coordinate_frame']},
      set(val) { this.$store.commit('command_params/telescope_coordinate_frame', val)},
    },

    subframeIsActive: {
      get() { return this.$store.getters['command_params/subframeIsActive']},
      set(val) { this.$store.commit('command_params/subframeIsActive', val)},
    },

    camera_areas_selection: {
      get() { return this.$store.getters['command_params/camera_areas_selection'] },
      set(val) {this.$store.commit('command_params/camera_areas_selection', val)}
    },
    camera_note: {
      get() { return this.$store.getters['command_params/camera_note']},
      set(val) { this.$store.commit('command_params/camera_note', val)},
    },
    camera_exposure: {
      get() { return this.$store.getters['command_params/camera_exposure'] },
      set(val) {this.$store.commit('command_params/camera_exposure', val)}
    },
    camera_count: {
      get() { return this.$store.getters['command_params/camera_count'] },
      set(val) {this.$store.commit('command_params/camera_count', val)}
    },
    camera_bin: {
      get() { return this.$store.getters['command_params/camera_bin'] },
      set(val) {this.$store.commit('command_params/camera_bin', val)}
    },
    camera_dither: {
      get() { return this.$store.getters['command_params/camera_dither'] },
      set(val) {this.$store.commit('command_params/camera_dither', val)}
    },
    camera_extract: {
      get() { return this.$store.getters['command_params/camera_extract'] },
      set(val) {this.$store.commit('command_params/camera_extract', val)}
    },
    camera_image_type: {
      get() { return this.$store.getters['command_params/camera_image_type'] },
      set(val) {this.$store.commit('command_params/camera_image_type', val)}
    },

    filter_wheel_options_selection: {
      get() { return this.$store.getters['command_params/filter_wheel_options_selection'] },
      set(val) { this.$store.commit('command_params/filter_wheel_options_selection', val) }
    },

    selector_position: {
      get() { return this.$store.getters['command_params/selector_position'] },
      set(val) { this.$store.commit('command_params/selector_position', val) }
    },

    focuser_relative: {
      get() { return this.$store.getters['command_params/focuser_relative'] },
      set(val) {this.$store.commit('command_params/focuser_relative', val)}
    },
    focuser_absolute: {
      get() { return this.$store.getters['command_params/focuser_absolute'] },
      set(val) {this.$store.commit('command_params/focuser_absolute', val)}
    },

    rotator_relative: {
      get() { return this.$store.getters['command_params/rotator_relative'] },
      set(val) {this.$store.commit('command_params/rotator_relative', val)}
    },
    rotator_absolute: {
      get() { return this.$store.getters['command_params/rotator_absolute'] },
      set(val) {this.$store.commit('command_params/rotator_absolute', val)}
    },

    screen_brightness: {
      get() { return this.$store.getters['command_params/screen_brightness'] },
      set(val) {this.$store.commit('command_params/screen_brightness', val)}
    },
  },

}
</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";

.site-observe-wrapper {
  margin: 0;
  height: 100%;

  //@include desktop {
    //height: calc(100vh - #{$top-bottom-height});
  //}
}

.b-tabs{
  background-color: #1e2223;
  display:flex;
  align-items:center;
  flex-wrap:wrap;
}

.instrument-control-title-bar {
  display:flex;
  justify-content:space-between;
  align-items:center;
  flex-wrap:nowrap;
}
.instrument-control-title-bar > .title {
  word-break:keep-all;
  padding-right: 10px;
}
.device-instance-subtitle {
  margin-bottom:22.5px /* match the margin of .title elements */
}
.device-instance-subtitle:hover {
  cursor:pointer;
}

.content-column {
  width: 100%;
}

.info-column {
  margin-top: 2em;
}
</style>
