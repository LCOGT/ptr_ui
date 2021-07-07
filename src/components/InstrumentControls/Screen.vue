<template>
  <div class="instrument-control-wrapper">

    <status-column 
      class="status-column"
      :statusList="buildScreenTabStatus" 
      :isOffline="!isOnline"
    />

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
import { status_mixin } from '../../mixins/status_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
export default {
  name: "Screen",
  mixins: [commands_mixin, status_mixin, user_mixin],
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
