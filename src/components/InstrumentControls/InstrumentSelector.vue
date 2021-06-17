
<template>
  <div class="instrument-control-wrapper">

    <b-field>
      <b-select v-model="selector_position" >
        <template v-for="(inst, idx) in selector_config.instruments">
          <option :value="idx" :key="idx">{{inst}}</option> 
        </template>
      </b-select>
    </b-field>

  </div>
</template>

<script>
import { mapState } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
import { status_mixin } from '../../mixins/status_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
export default {
  name: "InstrumentSelector",
  mixins: [commands_mixin, status_mixin, user_mixin],
  components: {
    CommandButton, 
    StatusColumn,
    SimpleDeviceStatus,
  },
  data() {
    return {
    }
  },

  computed: {
    sitecode() {
      return this.$route.params.sitecode
    },
    ...mapState('site_config', ['selected_selector']),

    selector_config() {
      let selected_selector = this.$store.getters['site_config/selector']
      let conf = this.$store.state.site_config.global_config[this.sitecode].selector[selected_selector]
      return conf || ''
    },


    selector_position: {
      get() { return this.$store.getters['command_params/selector_position'] },
      set(val) { 
        this.$store.commit('command_params/selector_position', val);
        // Also send the selection to the site as a command. 
        let command_body = this.base_command(
          'selector', 
          'new_selection', 
          '', 
          {
            'port': val
          },
          {}
        )
        this.send_site_command(command_body.form)
      }
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
  },

  watch: {
    // If the user changes the chip area parameter, deactivate the subframe.
    camera_areas_selection() {
      this.subframeIsActive = false;
    }
  },

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
