
<template>
  <div class="instrument-control-wrapper">
    <b-modal :active.sync="skychartModalIsOpen"
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

    <div class="val" 
      v-if="mount_state && mount_state.message && mount_state.message != '-'">
      {{mount_state.message}}
    </div>
    <div class="val" 
      v-if="telescope_state && telescope_state.message && telescope_state.message != '-'">
      {{telescope_state.message}}
    </div>

    <b-field>
      <b-radio-button v-model="telescope_selection"
        size="is-small"
        expanded
        :native-value="1">
        Primary
      </b-radio-button>
      <b-radio-button v-model="telescope_selection"
        size="is-small"
        expanded
        :native-value="2">
        Aux
      </b-radio-button>
    </b-field>

    <div class="columns">
      <status-column
        style="font-size: 0.8em;"
        class="status-column"
        :statusList="buildTelescopeTabStatus1Shorter"
        :isOffline="!isOnline" />
      <status-column
        style="font-size: 0.8em;"
        class="status-column column"
        :isOffline="!isOnline"
        :statusList="buildTelescopeTabStatus2"/>
    </div>


    <div v-if="'site_in_automatic' in mount_state" style="display: flex">
      <command-button 
        admin
        class="is-small"
        v-if="'site_in_automatic' in mount_state && mount_state.site_in_automatic" 
        :data="site_manual_command" 
        :disabled="!userIsAdmin"
        style="margin-bottom: 1em; width:50%;" 
        />
      <command-button 
        admin
        class="is-small"
        v-if="'site_in_automatic' in mount_state && !mount_state.site_in_automatic" 
        :data="site_automatic_command" 
        style="margin-bottom: 1em; width:50%;" 
        :disabled="!userIsAdmin"
        />
        <div style="flex-grow: 1;"></div>
      <div style="margin-left: 1rem; color: grey;">Site mode: </div>
      <div style=" margin-left: 1rem;">{{mount_state.site_in_automatic ? "Auto" : "Manual"}}</div>
    </div>

    <b-field horizontal label="Ra/Az/Long">
      <b-field>
        <b-input name="subject" type="search" icon-clickable size="is-small" v-model="mount_ra" autocomplete="off"></b-input>
        <!--p class="control"><span class="button is-static is-small">hrs</span></p-->
      </b-field>
    </b-field>
    <b-field horizontal label="Dec/Alt/Lat">
      <b-field>
        <b-input name="subject" type="search" icon-clickable size="is-small" v-model="mount_dec" autocomplete="off"></b-input>
        <!--p class="control"><span class="button is-static is-small">deg</span></p-->
      </b-field>
    </b-field>
    <b-field horizontal label="Object">
      <b-input name="subject" type="search" icon-clickable size="is-small" v-model="mount_object" autocomplete="off"></b-input>
    </b-field>

    <b-field horizontal label="Frame">
      <b-select placeholder="Select bin" 
        v-model="telescope_coordinate_frame" size="is-small">
        <option
          v-for="(frame_option, index) in telescope_coordinate_frame_options"
          v-bind:value="frame_option"
          v-bind:selected="index === 0"
          v-bind:key="index"
          >
          {{ frame_option }}
        </option>
      </b-select>
    </b-field>

    <b-field>
      <p class="control">
        <command-button :data="mount_slew_radec_command" 
          style="margin-bottom: 1em;" class="is-small"/>
      </p>
      <p class="control">
        <command-button :data="mount_slew_azalt_command" 
          style="margin-bottom: 1em;" class="is-small"/>
      </p>
    </b-field>
    <br>

    <b-dropdown aria-role="list" style="width: 100%;" size="is-small">
      <button class="button is-small" slot="trigger" style="width: 100%;">
          <span>Slew to...</span>
          <b-icon icon="menu-down"></b-icon>
      </button>
      <template
        v-for="(command, idx) in [
            mount_slew_chart_command,
            mount_screenflat_command,
            mount_skyflat_command,
            mount_home_command,
            mount_park_command,
            mount_raSidDec0_command,
            mount_stop_command,
            mount_tracking_on_command,
            mount_tracking_off_command
          ]"
        >
        <b-dropdown-item :key="idx" aria-role="listitem">
          <command-button :data="command" class="dropdown-button-command is-small"/>
        </b-dropdown-item>
      </template>
    </b-dropdown>

    <b-button class="button" 
      style="width:100%; margin:1em 0;" 
      @click=" skychartModalIsOpen = !skychartModalIsOpen" 
      icon-right="arrow-top-right">view skychart</b-button>


    <div class="status-toggle-bar" 
      @click="isExpandedStatusVisible= !isExpandedStatusVisible">
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status 
        :device_name="active_mount" 
        device_type="Mount" 
        :device_status="mount_state" />
      <simple-device-status 
        :device_name="active_telescope" 
        device_type="Telescope" 
        :device_status="telescope_state" />
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
import SkychartModal from '@/components/SkychartModal'
export default {
  name: "Screen",
  mixins: [commands_mixin, status_mixin, user_mixin],
  components: {
    CommandButton, 
    StatusColumn,
    SimpleDeviceStatus,
    SkychartModal,
  },
  data() {
    return {
      isExpandedStatusVisible: false,
      skychartModalIsOpen: false,
    }
  },

  computed: {
    sitecode() {
      return this.$route.params.sitecode
    },

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
  },

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
