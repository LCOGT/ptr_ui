<template>
  <div class="instrument-control-wrapper">

    <div class="val">{{enclosure_message}}</div>

    <status-column 
      class="status-column"
      :statusList="buildEnclosureTabStatus" 
      :isOffline="!isOnline"
    />

		<div style="border-bottom: 0.5px solid grey; margin: 1em 0;" />

    <b-field label="Set Enclosure Mode" v-if="userIsAdmin" class="is-small" style="margin-bottom: 2em;">
      <b-select v-model="selected_enclosure_mode" size="is-small" >
				<option value="setAuto" >Automatic</option> 
				<option value="setManual">Manual</option> 
				<option value="shutDown">Shut down</option> 
      </b-select>
			<p class="control">
				<button class="button is-admin is-small" :disabled="!userIsAuthenticated" @click="set_enclosure_mode" > apply </button>
			</p>
    </b-field>

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
import { mapGetters } from 'vuex'
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
			selected_enclosure_mode: "setAuto",
    }
  },

	methods: {

		set_enclosure_mode() {
			const command_body = this.base_command(
				'enclosure',  // inst type
				this.selected_enclosure_mode,  // action setAuto setManual setStayClosed
				'',	 // name (only used for rendering button names) 
				{}, // reqired params
				{ username: this.username } // optional params
			)
			this.send_site_command(command_body.form)

		}

	},

  computed: {
    sitecode() {
      return this.$route.params.sitecode
    },
    ...mapGetters('sitestatus', ['enclosure_message'])
  },
  
}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";

.is-admin {
    background-color: rgba(68, 0, 255, 0.164);
    border-color: rgba(76, 0, 255, 0.541);
}
</style>
