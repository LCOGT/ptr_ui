
<template>
  <div class="instrument-control-wrapper">

		<status-column :statusList="statusList" />

		<div style="border-bottom: 1px solid grey; margin: 1em 0;" />

    <b-field label="Change instrument selector position">
      <b-select v-model="selector_position" >
        <template v-for="(inst, idx) in selector_config.instruments">
          <option :value="idx" :key="idx">{{inst}}</option> 
        </template>
      </b-select>
			<p class="control">
				<button class="button" :disabled="!userIsAuthenticated" @click="selector_command" > apply </button>
			</p>
    </b-field>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/FormElements/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
export default {
  name: "InstrumentSelector",
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton, 
    StatusColumn,
    SimpleDeviceStatus,
  },
  data() {
    return {
    }
  },

	methods: {
		selector_command() {
			const command_body = this.base_command(
				'selector',  // inst type
				'new_selection',  // action
				'',	 // name (only used for rendering button names) 
				{ 'port': this.selector_position }, // reqired params
				{} // optional params
			)
			this.send_site_command(command_body.form)
		},
	},

	watch() {
		this.selector_position = this.$store.getters['sitestatus/selector_port']
	},

  computed: {

    sitecode() {
      return this.$route.params.sitecode
    },

    ...mapState('site_config', [
        'selected_selector',
      ]),
    ...mapGetters('site_config', {
      selector_config: 'selected_selector_config',
    }),

		...mapGetters('sitestatus', [
				'selector_port',
				'selector_instrument',
				'selector_camera',
				'selector_guider',
		]),

		statusList() {
			return [ this.selector_port, this.selector_instrument, this.selector_camera, this.selector_guider ]
		},

    selector_position: {
      get() { return this.$store.getters['command_params/selector_position'] },
      set(val) { 
        this.$store.commit('command_params/selector_position', val);
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
    },

		// When switching sites, make the instrument selector select field value be the active one. 
		sitecode() {
			const port = parseInt(this.selector_port)
			if (port > 0 && port < this.selector_config.ports) {
				this.selector_position = port
			}
		},

  },

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
