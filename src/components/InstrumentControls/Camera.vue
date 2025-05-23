
<template>
  <div class="instrument-control-wrapper">
    <div class="autofocus-and-selected-camera">
      <CommandButton
        :data="sequencer_autofocus_command"
        style="margin-bottom: 1em;"
        class="is-outlined"
      >
        Autofocus
      </CommandButton>
      <CommandButton
        :data="sequencer_fix_pointing_command"
        style="margin-bottom: 1em;"
        class="is-outlined"
      >
        Fix Pointing
      </CommandButton>
      <CommandButton
        :data="mount_home_command"
        style="margin-bottom: 1em;"
        class="is-outlined"
      >
        Home Scope
      </CommandButton>
      <b-field
        label-position="on-border"
        label="selected:"
      >
        <b-select
          v-model="active_camera"
          placeholder="choose camera..."
        >
          <option
            v-for="(val, key) in site_config.camera"
            :key="key"
            :value="key"
          >
            {{ val.name }}
          </option>
          <option
            v-if="Object.keys(site_config.camera).length == 2"
            value="both"
          >
            both
          </option>
        </b-select>
      </b-field>
    </div>

    <div class="buttons has-addons expose-cancel-buttons">
      <CommandButton
        :data="camera_expose_command"
        style="width: 70%;"
        class="is-outlined is-success"
      />
      <CancelButton
        :site="sitecode"
        style="width: 30%; border-left: 1px solid #00be65"
        class="is-outlined"
      />
    </div>

    <b-field
      horizontal
      label="Object"
    >
      <b-input
        v-model="object_name"
        placeholder="Enter your object Name here"
        type="text"
        min="0"
        max="64"
        size="is-small"
      />
    </b-field>

    <b-field
      horizontal
      label="Expose"
    >
      <b-field>
        <b-input
          v-model="camera_exposure"
          name="subject"
          size="is-small"
          autocomplete="off"
        />
        <p class="control">
          <span class="button is-static is-small">seconds</span>
        </p>
      </b-field>
    </b-field>

    <b-field
      horizontal
      label="Count"
    >
      <b-field>
        <b-numberinput
          v-model="camera_count"
          name="subject"
          type="is-button"
          min="1"
          size="is-small"
          controls-position="compact"
          autocomplete="off"
        />
      </b-field>
    </b-field>

    <b-field
      horizontal
      label="Filter"
    >
      <b-select
        v-model="filter_wheel_options_selection"
        placeholder="select filter..."
        size="is-small"
      >
        <option
          v-for="(filter, index) in filter_wheel_options"
          :key="index"
          :value="filter[0]"
          :selected="index === 0"
        >
          {{ filter[0] }}
        </option>
        <option
          disabled
          value="------"
        >
          ---- Quick Stacks ----
        </option>
        <option
          v-for="filter in quick_stacks_filter_list"
          :key="filter"
          :value="filter"
        >
          {{ filter }}
        </option>
        <option
          disabled
          value="------"
        >
          ---- Generic Filters ----
        </option>
        <option
          v-for="filter in generic_filter_list"
          :key="filter"
          :value="filter"
        >
          {{ filter }}
        </option>
      </b-select>
    </b-field>
    <b-field
      horizontal
      label="Zoom"
    >
      <b-select
        v-model="zoom_options_selection"
        placeholder="select zoom..."
        size="is-small"
      >
        <option
          v-for="(zoom, index) in zoom_options"
          :key="index"
          :value="zoom"
          :selected="index === 0"
        >
          {{ zoom }}
        </option>
      </b-select>
    </b-field>

    <b-field
      v-if="camera_can_bin"
      horizontal
      label="Resolution"
    >
      <CameraBinSelectField
        v-model="camera_bin"
        :bin-options="camera_bin_options"
        :horizontal="true"
      />
    </b-field>

    <!-- Hide this field until we need it (requested march 2023) -->
    <b-field
      v-if="camera_areas && camera_areas.length != 0"
      horizontal
      label="Area"
    >
      <b-select
        v-model="camera_areas_selection"
        placeholder="Select chip area"
        style="width: 100%"
        size="is-small"
      >
        <option
          v-for="(area, index) in camera_areas"
          :key="index"
          :value="area"
          :selected="index === 0"
        >
          {{ area }}
        </option>
      </b-select>
    </b-field>

    <b-field
      horizontal
      label="Smart Stack"
    >
      <b-switch
        v-model="smartstackIsActive"
        size="is-small"
        type="is-info"
      >
        {{ smartstackIsActive ? "Smart stack is active" : "Smart stack not active" }}
      </b-switch>
    </b-field>

    <b-field
      horizontal
      label="Sub Stack"
    >
      <b-switch
        v-model="subStackIsActive"
        size="is-small"
        type="is-info"
      >
        {{ subStackIsActive ? "Sub stack is active" : "Sub stack not active" }}
      </b-switch>
    </b-field>

    <b-field
      v-if="userIsAdmin"
      horizontal
      label="Image Type"
    >
      <b-select
        v-model="camera_image_type"
        placeholder="Select image type"
        size="is-small"
      >
        <option
          v-for="(image_type, index) in camera_image_type_options"
          :key="index"
          :value="image_type"
          :selected="index === 0"
        >
          {{ image_type }}
        </option>
      </b-select>
    </b-field>

    <!-- Hide this field until we need it (requested march 2023) -->
    <b-field
      v-show="false"
      horizontal
      label="Dither"
    >
      <b-checkbox
        v-model="camera_dither"
        true-value="on"
        false-value="off"
      >
        {{ camera_dither }}
      </b-checkbox>
    </b-field>

    <b-field
      horizontal
      label="Cam Note"
    >
      <b-input
        v-model="cam_note"
        placeholder="a camera note for the FITS header..."
        type="text"
        min="0"
        max="64"
        size="is-small"
      />
    </b-field>

    <br>

    <b-field
      v-if="camera_has_darkslide"
      horizontal
      style="height: auto;"
      label="Darkslide"
    >
      <StatusVal :status-item="camera_darkslide" />
      <div
        v-if="userIsAdmin"
        class="buttons has-addons"
      >
        <command-button
          :data="camera_darkslide_open_command"
          admin
          style="width: 50%;"
          class="is-small mb-0"
        />
        <command-button
          :data="camera_darkslide_close_command"
          admin
          style="width: 50%"
          class="is-small mb-0"
        />
      </div>
    </b-field>

    <div class="horizontal-border" />

    <!--div class="val" v-if="camera_state && camera_state.message">{{camera_state.message}}</div-->

    <status-column
      class="status-column"
      :status-list="buildCameraTabStatus"
      :is-offline="!site_is_online"
    />

    <div
      class="status-toggle-bar"
      @click="isExpandedStatusVisible= !isExpandedStatusVisible"
    >
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <!--simple-device-status
        :device_name="active_camera"
        device_type="Camera"
        :device_status="camera_state" /-->
      <simple-device-status
        :device_name="active_filter_wheel"
        device_type="Filter Wheel"
        :device_status="filter_wheel_state"
/>
    </pre>
  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/FormElements/CommandButton'
import CancelButton from '@/components/FormElements/CancelButton'
import StatusColumn from '@/components/status/StatusColumn'
import StatusVal from '@/components/status/StatusVal'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import CameraBinSelectField from './instrumentFields/CameraBinSelectField.vue'
import { mapGetters } from 'vuex'
export default {
  name: 'Camera',
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton,
    CancelButton,
    StatusColumn,
    StatusVal,
    SimpleDeviceStatus,
    CameraBinSelectField
  },
  mounted () {
    // set the initial value for camera areas based on the options specified in the config
    if (this.camera_areas.length) {
      this.camera_areas_selection = this.camera_areas[0]
    }
  },
  data () {
    return {
      isExpandedStatusVisible: false,
      zoom_options: [
        '30\'x30\'', 'Small sq.', 'Full', 'Big sq.', '1.5X', '2X', '3X', '4X', '6X', '8X', '12X', '16X', 'Planet'
      ],
      quick_stacks_filter_list: [
        'RGB irg', 'LRGB wirg', 'UBV ugr', 'O3HaS2'
      ],
      generic_filter_list: [
        'Lum', 'Red', 'Green', 'Blue', 'UV', 'IR Block', 'DUO', 'NIR', 'Exo', 'HA', 'O3', 'S2'
      ]
    }
  },

  watch: {
    // If the user changes the chip area parameter, deactivate the subframe.
    camera_areas_selection () {
      this.subframe_is_active = false
    }

  },

  computed: {
    sitecode () {
      return this.$route.params.sitecode
    },
    ...mapGetters('sitestatus', [
      'site_is_online',
      'buildCameraTabStatus',
      'camera_state',
      'camera_darkslide',
      'filter_wheel_state'
    ]),

    ...mapGetters('site_config', [
      'site_config',
      'selected_camera_config',
      'camera_has_darkslide',
      'camera_can_bin'
    ]),

    smartstackIsActive: {
      get () { return this.$store.getters['command_params/smartstackIsActive'] },
      set (val) { this.$store.commit('command_params/smartstackIsActive', val) }
    },

    subStackIsActive: {
      get () { return this.$store.getters['command_params/subStackIsActive'] },
      set (val) { this.$store.commit('command_params/subStackIsActive', val) }
    },

    subframe_is_active: {
      get () { return this.$store.getters['command_params/subframeIsActive'] },
      set (val) { this.$store.commit('command_params/subframeIsActive', val) }
    },

    camera_areas_selection: {
      get () { return this.$store.getters['command_params/camera_areas_selection'] },
      set (val) { this.$store.commit('command_params/camera_areas_selection', val) }
    },
    cam_note: {
      get () { return this.$store.getters['command_params/cam_note'] },
      set (val) { this.$store.commit('command_params/cam_note', val) }
    },

    object_name: {
      get () { return this.$store.getters['command_params/object_name'] },
      set (val) { this.$store.commit('command_params/object_name', val) }
    },
    camera_exposure: {
      get () { return this.$store.getters['command_params/camera_exposure'] },
      set (val) { this.$store.commit('command_params/camera_exposure', val) }
    },
    camera_count: {
      get () { return this.$store.getters['command_params/camera_count'] },
      set (val) { this.$store.commit('command_params/camera_count', val) }
    },
    camera_bin: {
      get () { return this.$store.getters['command_params/camera_bin'] },
      set (val) { this.$store.commit('command_params/camera_bin', val) }
    },
    camera_dither: {
      get () { return this.$store.getters['command_params/camera_dither'] },
      set (val) { this.$store.commit('command_params/camera_dither', val) }
    },
    camera_extract: {
      get () { return this.$store.getters['command_params/camera_extract'] },
      set (val) { this.$store.commit('command_params/camera_extract', val) }
    },
    camera_image_type: {
      get () { return this.$store.getters['command_params/camera_image_type'] },
      set (val) { this.$store.commit('command_params/camera_image_type', val) }
    },

    filter_wheel_options_selection: {
      get () { return this.$store.getters['command_params/filter_wheel_options_selection'] },
      set (val) { this.$store.commit('command_params/filter_wheel_options_selection', val) }
    },

    zoom_options_selection: {
      get () { return this.$store.getters['command_params/zoom_options_selection'] },
      set (val) { this.$store.commit('command_params/zoom_options_selection', val) }
    },

    selector_position: {
      get () { return this.$store.getters['command_params/selector_position'] },
      set (val) { this.$store.commit('command_params/selector_position', val) }
    }

  }

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
.autofocus-and-selected-camera {
  display: flex;
  justify-content: space-between;
}
.expose-cancel-buttons {
  margin-bottom: 1em;
}
</style>
