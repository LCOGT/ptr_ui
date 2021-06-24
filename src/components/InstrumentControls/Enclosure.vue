<template>
  <div class="instrument-control-wrapper">

    <div class="val">{{enclosure_state.enclosure_message}}</div>

    <status-column 
      class="status-column"
      :statusList="buildEnclosureTabStatus" 
      :isOffline="!isOnline"
    />


    <div v-if="mount_state && 'site_in_automatic' in mount_state" style="display: flex">
			<command-button 
				admin
				class="is-small"
				v-if="userIsAdmin && enclosure_state.enclosure_mode != 'Manual'" 
				:data="enclosure_manual_command" 
				style="margin-bottom: 1em; width: 50%;" 
				/>
			<command-button 
				admin
				class="is-small"
				v-if="userIsAdmin && enclosure_state.enclosure_mode != 'Automatic'" 
				:data="enclosure_auto_command" 
				style="margin-bottom: 1em; width: 50%;" 
				/>
        <div style="flex-grow: 1;"></div>
      <div style="margin-left: 1rem; color: grey;">Enclosure mode: </div>
      <div style=" margin-left: 1rem;">{{enclosure_state.enclosure_mode}}</div>
    </div>

    <div v-if="mount_state && 'site_in_automatic' in mount_state" style="display: flex">
      <command-button 
        admin
        class="is-small"
        v-if="mount_state && 'site_in_automatic' in mount_state && mount_state.site_in_automatic" 
        :data="site_manual_command" 
        :disabled="!userIsAdmin"
        style="margin-bottom: 1em; width:50%;" 
        />
      <command-button 
        admin
        class="is-small"
        v-if="mount_state && 'site_in_automatic' in mount_state && !mount_state.site_in_automatic" 
        :data="site_automatic_command" 
        style="margin-bottom: 1em; width:50%;" 
        :disabled="!userIsAdmin"
        />
        <div style="flex-grow: 1;"></div>
      <div style="margin-left: 1rem; color: grey;">Site mode: </div>
      <div style=" margin-left: 1rem;">{{mount_state.site_in_automatic ? "Auto" : "Manual"}}</div>
    </div>

    <b-field>
      <p class="control">
        <command-button 
          :data="enclosure_open_command" 
          style="margin-bottom: 1em;" 
          class="is-small">
          <div slot="title">Request Roof Open</div>
        </command-button>
      </p>
      <p class="control">
        <command-button 
          :data="enclosure_close_command" 
          style="margin-bottom: 1em;" 
          class="is-small">
          <div slot="title">Request Roof Close</div>
        </command-button>
      </p>
    </b-field>
    <br>

    <div class="status-toggle-bar" 
      @click="isExpandedStatusVisible= !isExpandedStatusVisible">
      {{isExpandedStatusVisible ? 'collapse status' : 'expand status'}}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status 
        :device_name="active_enclosure" 
        device_type="enclosure" 
        :device_status="enclosure_state" />
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
  name: "Enclosure", 
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
  },
  
}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
