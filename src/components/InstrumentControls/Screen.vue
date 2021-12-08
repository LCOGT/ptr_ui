<template>
  <div class="instrument-control-wrapper">

    <status-column 
      class="status-column"
      :statusList="buildScreenTabStatus" 
      :isOffline="!site_is_online"
    />

		<div style="border-bottom: 0.5px solid grey; margin: 1em 0;" />

    <b-field label="Brightness">
      <b-field>
        <b-input 
          expanded 
          size="is-small" 
          name="subject" 
          v-model="screen_brightness" 
          type="number" 
          :step="1" 
          min="0" 
          max="100" 
          autocomplete="off" />
          <p class="control"> <command-button :data="screen_on_command" class="is-small control" /> </p>
          <p class="control"> <command-button :data="screen_off_command" class="is-small control" /> </p>
      </b-field>
    </b-field>

    <b-field 
      label="Flip-Flat Telescope Cover" 
      v-if="telescope_has_flip_flat"
      style="margin: 1rem 0;">
      <p class="control">
        <command-button 
          :data="screen_close_and_turn_on_command" 
          class="is-small">
        </command-button>
      </p>
      <p class="control">
        <command-button 
          :data="screen_turn_off_and_close_command" 
          class="is-small">
        </command-button>
      </p>
      <p class="control">
        <command-button 
          :data="screen_open_and_turn_off_command" 
          class="is-small">
        </command-button>
      </p>
    </b-field>

    <div class="status-toggle-bar" 
      @click="isExpandedStatusVisible= !isExpandedStatusVisible">
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status 
        :device_name="active_screen" 
        device_type="Screen" 
        :device_status="screen_state" />
    </pre>

  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import { mapGetters } from 'vuex'
export default {
  name: "Screen",
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton, 
    StatusColumn,
    SimpleDeviceStatus,
  },
  data() {
    return {
      isExpandedStatusVisible: false,
    }
  },

  computed: {
    sitecode() {
      return this.$route.params.sitecode
    },
    ...mapGetters('site_config', [
      'telescope_has_flip_flat',
    ]),
    ...mapGetters('sitestatus', [
      'site_is_online',
      'buildScreenTabStatus',
      'screen_state',
    ]),
    screen_brightness: {
      get() { return this.$store.getters['command_params/screen_brightness'] },
      set(val) {this.$store.commit('command_params/screen_brightness', val)}
    },
  },

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
