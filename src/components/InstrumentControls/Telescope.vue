
<template>
  <div class="instrument-control-wrapper">
    <div
      v-if="mount_message.val != '-'"
      class="val"
    >
      {{ mount_message }}
    </div>
    <div
      v-if="telescope_message.val != '-'"
      class="val"
    >
      {{ telescope_message }}
    </div>

    <b-field>
      <b-radio-button
        v-model="telescope_selection"
        size="is-small"
        expanded
        :native-value="1"
      >
        Primary
      </b-radio-button>
      <b-radio-button
        v-model="telescope_selection"
        size="is-small"
        expanded
        :native-value="2"
      >
        Aux
      </b-radio-button>
    </b-field>

    <div class="horizontal-border" />

    <TargetSearchField
      v-model="mount_object"
      label="Object Search"
      size="is-small"
      horizontal
      @results="handle_coordinate_search_results"
    />

    <b-field
      horizontal
      label="Right Asc."
    >
      <RightAscensionInput
        v-model="mount_ra"
        size="is-small"
      />
    </b-field>

    <b-field
      horizontal
      label="Declination"
    >
      <DeclinationInput
        v-model="mount_dec"
        size="is-small"
      />
    </b-field>

    <b-field
      horizontal
      label="Frame"
    >
      <b-select
        v-model="telescope_coordinate_frame"
        placeholder="Select bin"
        size="is-small"
      >
        <option
          v-for="(frame_option, index) in telescope_coordinate_frame_options"
          :key="index"
          :value="frame_option"
          :selected="index === 0"
        >
          {{ frame_option }}
        </option>
      </b-select>
    </b-field>

    <b-field
      horizontal
      label=""
    >
      <b-field>
        <command-button
          :data="mount_slew_radec_command"
          style="margin-bottom: 1em"
          class="command-slew-button is-small is-outlined is-success"
        >
          slew to RA/Dec
        </command-button>
        <p class="control">
          <command-button
            :data="mount_slew_and_center_radec_command"
            style="margin-bottom: 1em"
            class="command-slew-button is-small is-outlined"
          >
            slew & center
          </command-button>
        </p>
      </b-field>
    </b-field>

    <div class="horizontal-border" />
    <b-field
      horizontal
      label="Hour Angle"
    >
      <b-field>
        <b-input
          v-model="mount_ha"
          name="subject"
          type="search"
          size="is-small"
          autocomplete="off"
        />
        <!--p class="control"><span class="button is-static is-small">deg</span></p-->
      </b-field>
      <p class="control">
        <command-button
          :data="mount_slew_hadec_command"
          style="margin-bottom: 1em"
          class="is-small"
        />
      </p>
    </b-field>

    <b-field
      horizontal
      label="Azimuth"
    >
      <b-field>
        <b-input
          v-model="mount_az"
          name="subject"
          type="search"
          size="is-small"
          autocomplete="off"
        />
        <!--p class="control"><span class="button is-static is-small">hrs</span></p-->
      </b-field>
    </b-field>

    <b-field
      horizontal
      label="Altitude"
    >
      <b-field>
        <b-input
          v-model="mount_alt"
          name="subject"
          type="search"
          size="is-small"
          autocomplete="off"
        />
        <!--p class="control"><span class="button is-static is-small">deg</span></p-->
      </b-field>
      <p class="control">
        <command-button
          :data="mount_slew_azalt_command"
          style="margin-bottom: 1em"
          class="is-small"
        />
      </p>
    </b-field>
    <div class="horizontal-border" />
    <b-field
      horizontal
      label="Tel Note"
    >
      <b-input
        v-model="tel_note"
        type="text"
        min="0"
        max="64"
        size="is-small"
      />
    </b-field>

    <!-- "Park" and "Slew To..." button row -->
    <div style="display: flex; gap: 1em;">
      <command-button
        :data="mount_park_command"
        class="is-small"
        style="margin-left: auto;"
      >
        Park
      </command-button>
      <b-dropdown
        aria-role="list"
        size="is-small"
        position="is-top-left"
      >
        <button
          slot="trigger"
          class="button is-small"
          style="width: 100%"
        >
          <span>Slew to...</span>
          <b-icon icon="menu-down" />
        </button>
        <b-dropdown-item
          v-for="(command, idx) in [
            mount_park_command,
            mount_unpark_command,
            mount_home_command,
            mount_skyflat_command,
            mount_screenflat_command,
            mount_tracking_on_command,
            mount_tracking_off_command,
            mount_stop_command,
          ]"
          :key="idx"
          aria-role="listitem"
        >
          <command-button
            :data="command"
            class="dropdown-button-command is-small"
          />
        </b-dropdown-item>
      </b-dropdown>
    </div>
    <div class="horizontal-border" />
    <div class="columns">
      <status-column
        style="font-size: 0.8em"
        class="status-column"
        :status-list="buildTelescopeTabStatus1Shorter"
        :is-offline="!site_is_online"
      />
      <status-column
        style="font-size: 0.8em"
        class="status-column column"
        :is-offline="!site_is_online"
        :status-list="buildTelescopeTabStatus2"
      />
    </div>

    <div style="height: 1em" />

    <div
      class="status-toggle-bar"
      @click="isExpandedStatusVisible = !isExpandedStatusVisible"
    >
      {{ isExpandedStatusVisible ? "collapse status" : "expand status" }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status
        :device_name="active_mount"
        device_type="Mount"
        :device_status="mount_state"
/>
      <simple-device-status
        :device_name="active_telescope"
        device_type="Telescope"
        :device_status="telescope_state"
/>
    </pre>
  </div>
</template>

<script>
import { commands_mixin } from '@/mixins/commands_mixin'
import { target_names } from '@/mixins/target_names'
import { user_mixin } from '@/mixins/user_mixin'
import CommandButton from '@/components/FormElements/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import { mapGetters } from 'vuex'
import TargetSearchField from '@/components/FormElements/TargetSearchField'
import RightAscensionInput from '@/components/FormElements/RightAscensionInput'
import DeclinationInput from '@/components/FormElements/DeclinationInput'
import helpers from '@/utils/helpers'
export default {
  name: 'Telescope',
  mixins: [commands_mixin, user_mixin, target_names],
  components: {
    CommandButton,
    StatusColumn,
    SimpleDeviceStatus,
    TargetSearchField,
    RightAscensionInput,
    DeclinationInput
  },
  data () {
    return {
      isExpandedStatusVisible: false,
      object_is_searching: false,
      object_search_input: ''
    }
  },

  methods: {
    move_telescope_and_expose () {
      if (!this.mount_ra) {
        this.$buefy.toast.open({
          message: 'Please specify a right ascension to point the telescope',
          type: 'is-danger'
        })
      }
      if (!this.mount_dec) {
        this.$buefy.toast.open({
          message: 'Please specify a declination to point the telescope',
          type: 'is-danger'
        })
      }

      // If the coordinates are specified, send the command
      if (this.mount_dec && this.mount_ra) {
        // First parse the entry
        // Is it degrees?
        console.log(this.mount_ra)
        if (this.mount_ra.includes('d')) {
          this.mount_ra.replace('d', '')
          this.mount_ra = this.mount_ra / 15
          console.log(this.mount_ra)
        }

        const move_telescope_command_params = this.mount_slew_radec_command.form
        const camera_expose_command_params = this.camera_expose_command.form

        // First send the goto command, then send the expose command.
        // Order of the commands is important.
        this.send_site_command(move_telescope_command_params).then(
          (response) => {
            this.send_site_command(camera_expose_command_params)
          }
        )
      }
    },

    handle_coordinate_search_results (search_results) {
      if (!search_results.error) {
        this.mount_ra = search_results.ra.toFixed(4)
        this.mount_dec = search_results.dec.toFixed(4)
        const date = new Date()
        const altaz = helpers.eq2altaz(search_results.ra.toFixed(4), search_results.dec.toFixed(4), this.site_latitude, this.site_longitude, date)
        this.mount_ha = helpers.eq2hourangle(search_results.ra.toFixed(4), this.site_longitude, date).toFixed(4)
        const az = altaz[1]
        this.mount_az = az.toFixed(4)
        const alt = altaz[0]
        this.mount_alt = alt.toFixed(4)

        this.mount_object = search_results.searched_name
      } else {
        this.mount_ra = ''
        this.mount_dec = ''
        this.mount_ha = ''
        this.mount_az = ''
        this.mount_alt = ''
        this.$buefy.toast.open({
          message: `Could not resolve object with name ${search_results.searched_name}`,
          type: 'is-warning',
          duration: 4000
        })
      }
    }
  },

  computed: {
    sitecode () {
      return this.$route.params.sitecode
    },

    ...mapGetters('sitestatus', [
      'site_is_online',
      'mount_state',
      'telescope_state',
      'buildTelescopeTabStatus1Shorter',
      'buildTelescopeTabStatus2',
      'telescope_message',
      'mount_message'
    ]),
    ...mapGetters('site_config', [
      'site_latitude',
      'site_longitude'
    ]),

    mount_ra: {
      get () {
        return this.$store.getters['command_params/mount_ra']
      },
      set (val) {
        this.$store.commit('command_params/mount_ra', val)
      }
    },
    mount_dec: {
      get () {
        return this.$store.getters['command_params/mount_dec']
      },
      set (val) {
        this.$store.commit('command_params/mount_dec', val)
      }
    },
    mount_object: {
      get () {
        return this.$store.getters['command_params/mount_object']
      },
      set (val) {
        this.$store.commit('command_params/mount_object', val)
      }
    },
    mount_ha: {
      get () {
        return this.$store.getters['command_params/mount_ha']
      },
      set (val) {
        this.$store.commit('command_params/mount_ha', val)
      }
    },
    mount_az: {
      get () {
        return this.$store.getters['command_params/mount_az']
      },
      set (val) {
        this.$store.commit('command_params/mount_az', val)
      }
    },
    mount_alt: {
      get () {
        return this.$store.getters['command_params/mount_alt']
      },
      set (val) {
        this.$store.commit('command_params/mount_alt', val)
      }
    },
    tel_note: {
      get () { return this.$store.getters['command_params/tel_note'] },
      set (val) { this.$store.commit('command_params/tel_note', val) }
    },

    telescope_selection: {
      get () {
        return this.$store.getters['command_params/telescope_selection']
      },
      set (val) {
        this.$store.commit('command_params/telescope_selection', val)
      }
    },

    telescope_coordinate_frame: {
      get () {
        return this.$store.getters['command_params/telescope_coordinate_frame']
      },
      set (val) {
        this.$store.commit('command_params/telescope_coordinate_frame', val)
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
.button-state-group {
  display: flex;
  justify-content: space-between;
  gap: 1em;
  margin-bottom: 15px;
}
.button-state-divider {
  border-top: 1px dotted grey;
  height: 2px;
  margin-top: 42px;
  flex-grow: 1;
}
.status-label {
  color: grey;
  font-weight: lighter;
}
</style>
