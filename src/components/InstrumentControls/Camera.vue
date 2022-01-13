
<template>
  <div class="instrument-control-wrapper">

    <div class="buttons has-addons">
      <command-button :data="camera_expose_command" style="width: 70%;" class=" is-outlined is-success"/>
      <command-button :data="camera_cancel_command" style="width: 30%; border-left: 1px solid #00be65;" class=" is-outlined"/>
    </div>
    <br>

    <b-field horizontal label="Expose">
        <b-field>
            <b-input name="subject" size="is-small" v-model="camera_exposure" autocomplete="off"></b-input>
            <p class="control"> <span class="button is-static is-small">s</span> </p>
        </b-field>
    </b-field>

    <b-field horizontal label="Count">
        <b-field>
            <b-numberinput name="subject" type="is-button" min="1" size="is-small" controls-position="compact" v-model="camera_count" autocomplete="off"></b-numberinput>
        </b-field>
    </b-field>

    <b-field horizontal label="Filter">

        <b-select placeholder="select filter..." v-model="filter_wheel_options_selection" size="is-small" style="width: 100%">
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
          <command-button :data="filter_wheel_command" style="width: 50%" class="is-small"/>
          <command-button :data="filter_wheel_home_command" style="width: 50%" class="is-small" />
        </div>
    </b-field>

    <!--b-field horizontal label="Bin" v-if="camera_can_bin">
      <b-select placeholder="Select bin" v-model="camera_bin" size="is-small">
        <option
          v-for="(bin_option, index) in camera_bin_options"
          v-bind:value="bin_option"
          v-bind:selected="index === 0"
          v-bind:key="index"
          >
          {{ bin_option }}
        </option>
      </b-select>
    </b-field-->
    <CameraBinSelectField 
      v-if="camera_can_bin"
      v-model="camera_bin" 
      :binModes="camera_bin_options" 
      :default="camera_default_bin"
      :horizontal="true"
    />

    <b-field horizontal label="Area" v-if="camera_areas && camera_areas.length != 0">
        <b-select 
          placeholder="Select chip area" 
          v-model="camera_areas_selection" 
          style="width: 100%"
          size="is-small"
          >
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

    <b-field horizontal label="Subframe">
      <p class="is-size-7">{{ subframeIsActive ? "Active" : "Not Active"}}</p>
      <p class="is-size-7">({{subframe_x0.toFixed(2)}},{{subframe_y0.toFixed(2)}}), ({{subframe_x1.toFixed(2)}}, {{subframe_y1.toFixed(2)}})</p>
      <button class="button is-small" v-if="subframeIsActive" @click="function(){subframeIsActive = false}"> deactivate </button>
      <button class="button is-small" v-if="!subframeIsActive" @click="function(){subframeIsActive = true}"> activate </button>
    </b-field>

    <b-field horizontal label="Image Type">
      <b-select placeholder="Select image type" v-model="camera_image_type" size="is-small">
        <option
          v-for="(image_type, index) in camera_image_type_options"
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
        v-model="camera_dither"
        true-value="on"
        false-value="off"
        >
        {{ camera_dither }}
      </b-checkbox>
    </b-field>

    <b-field horizontal label="Extract">
      <b-checkbox
        v-model="camera_extract"
        true-value="on"
        false-value="off"
        >
        {{ camera_extract }}
      </b-checkbox>
    </b-field>

    <b-field horizontal label="Note">
      <b-input placeholder="a camera note for the FITS header..."
        type="text"
        min="0"
        max="64"
        size="is-small"
        v-model="camera_note">
      </b-input>
    </b-field>

    <br>

    <b-field horizontal style="height: auto;" label="Darkslide" v-if="camera_has_darkslide">
      <StatusVal :status-item="camera_darkslide" />
      <div class="buttons has-addons">
        <command-button :data="camera_darkslide_open_command" style="width: 50%;" class="is-small mb-0"/>
        <command-button :data="camera_darkslide_close_command" style="width: 50%" class="is-small mb-0" />
      </div>
    </b-field>


		<div class="horizontal-border" />

    <div class="val" v-if="camera_state && camera_state.message">{{camera_state.message}}</div>

    <status-column 
      class="status-column"
      :statusList="buildCameraTabStatus" 
      :isOffline="!site_is_online"
    />

    <div class="status-toggle-bar" 
      @click="isExpandedStatusVisible= !isExpandedStatusVisible">
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status 
        :device_name="active_camera" 
        device_type="Camera" 
        :device_status="camera_state" />
      <simple-device-status 
        :device_name="active_filter_wheel" 
        device_type="Filter Wheel" 
        :device_status="filter_wheel_state" />
    </pre>

  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import StatusVal from '@/components/status/StatusVal'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import CameraBinSelectField from './instrumentFields/CameraBinSelectField.vue'
import { mapGetters } from 'vuex'
export default {
  name: "Camera",
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton, 
    StatusColumn,
    StatusVal,
    SimpleDeviceStatus,
    CameraBinSelectField,
  },
  data() {
    return {
      isExpandedStatusVisible: false,
    }
  },

  watch: {
    // If the user changes the chip area parameter, deactivate the subframe.
    camera_areas_selection() {
      this.subframeIsActive = false;
    }
  },

  computed: {
    sitecode() {
      return this.$route.params.sitecode
    },
    ...mapGetters('sitestatus', [
      'site_is_online',
      'buildCameraTabStatus',
      'camera_state',
      'camera_darkslide',
      'filter_wheel_state',
    ]),

    ...mapGetters('site_config', [
      'selected_camera_config',
      'camera_has_darkslide',
      'camera_can_bin',
      'camera_default_bin'
    ]),

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
  },

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
