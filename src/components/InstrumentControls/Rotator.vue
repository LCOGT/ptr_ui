
<template>
  <div class="instrument-control-wrapper">

    <status-column 
      class="status-column"
      :isOffline="!site_is_online"
      :statusList="buildRotatorTabStatus" 
    />

    <command-button 
      :data="rotate_home_command" 
      class="is-small" 
      style="width:100%; margin-bottom:1em;"/>

    <b-field label="Relative">
      <b-field>
        <b-input 
          expanded size="is-small" 
          name="subject" 
          v-model="rotator_relative" 
          type="number" 
          :step="rotator_step_size" 
          autocomplete="off" />
        <p class="control"> 
          <command-button :data="rotate_relative_command" class="is-small"/>  
        </p>
      </b-field>
    </b-field>

    <b-field label="Absolute">
      <b-field>
        <b-input 
          expanded size="is-small" 
          name="subject" 
          v-model="rotator_absolute" 
          type="number" 
          :step="rotator_step_size" 
          autocomplete="off" />
        <p class="control"> 
          <command-button :data="rotate_absolute_command" class="is-small" />  
        </p>
      </b-field>
    </b-field>

    <br>

    <div class="status-toggle-bar" 
      @click="isExpandedStatusVisible= !isExpandedStatusVisible">
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status 
        :device_name="active_rotator" 
        device_type="Rotator" 
        :device_status="rotator_status" />
    </pre>

  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/FormElements/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import { mapGetters } from 'vuex'
export default {
  name: "Rotator",
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
    ...mapGetters('sitestatus', [
      'site_is_online',
      'buildRotatorTabStatus'
    ]),
    rotator_relative: {
      get() { return this.$store.getters['command_params/rotator_relative'] },
      set(val) {this.$store.commit('command_params/rotator_relative', val)}
    },
    rotator_absolute: {
      get() { return this.$store.getters['command_params/rotator_absolute'] },
      set(val) {this.$store.commit('command_params/rotator_absolute', val)}
    },
  },

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
