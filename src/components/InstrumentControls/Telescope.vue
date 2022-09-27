
<template>
  <div class="instrument-control-wrapper">
    <div class="val" v-if="mount_message.val != '-'">
      {{ mount_message }}
    </div>
    <div class="val" v-if="telescope_message.val != '-'">
      {{ telescope_message }}
    </div>

    <button
      class="button"
      style="width: 100%; margin-bottom: 1rem"
      @click="move_telescope_and_expose"
    >
      Move Telescope and Expose
    </button>

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

    <div class="columns">
      <status-column
        style="font-size: 0.8em"
        class="status-column"
        :statusList="buildTelescopeTabStatus1Shorter"
        :isOffline="!site_is_online"
      />
      <status-column
        style="font-size: 0.8em"
        class="status-column column"
        :isOffline="!site_is_online"
        :statusList="buildTelescopeTabStatus2"
      />
    </div>

    <div style="border-bottom: 0.5px solid grey; margin: 1em 0" />

    <TargetSearchField
      label="Object"
      v-model="mount_object"
      size="is-small"
      horizontal
      @results="handle_coordinate_search_results"
    />

    <p><small>The default values for RA and Dec
      are in RA decimal hours and Dec decimal degrees. To use RA decimal degrees, include the letter d at the end of your RA (e.g. 34.54d). Sexagesimal will be converted as normal. 
    </small></p>
    <div style="border-bottom: 0.5px solid grey; margin: 1em 0" />
    
    

    <b-field horizontal label="Right Asc.">
      <b-field>
        <b-input
          name="subject"
          type="search"
          size="is-small"
          v-model="mount_ra"
          autocomplete="off"
        ></b-input>
        <!--p class="control"><span class="button is-static is-small">hrs</span></p-->
      </b-field>
    </b-field>

    <b-field horizontal label="Declination">
      <b-field>
        <b-input
          name="subject"
          type="search"
          size="is-small"
          v-model="mount_dec"
          autocomplete="off"
        ></b-input>
        <!--p class="control"><span class="button is-static is-small">deg</span></p-->
      </b-field>
    </b-field>
    
    
    <b-field horizontal label="Frame">
      <b-select
        placeholder="Select bin"
        v-model="telescope_coordinate_frame"
        size="is-small"
      >
        <option
          v-for="(frame_option, index) in telescope_coordinate_frame_options"
          v-bind:value="frame_option"
          v-bind:selected="index === 0"
          v-bind:key="index"
        >
          {{ frame_option }}
        </option>
      </b-select>

      <p class="control">
        <command-button
          :data="mount_slew_radec_command"
          style="margin-bottom: 1em"
          class="is-small is-success is-outlined"
        />
      </p>

    </b-field>



    <b-field horizontal label="Hour Angle">
      <b-field>
        <b-input
          name="subject"
          type="search"
          size="is-small"
          v-model="mount_ha"
          autocomplete="off"
        ></b-input>
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

    <b-field horizontal label="Azimuth">
      <b-field>
        <b-input
          name="subject"
          type="search"
          size="is-small"
          v-model="mount_az"
          autocomplete="off"
        ></b-input>
        <!--p class="control"><span class="button is-static is-small">hrs</span></p-->
      </b-field>
    </b-field>

    <b-field horizontal label="Altitude">
      <b-field>
        <b-input
          name="subject"
          type="search"
          size="is-small"
          v-model="mount_alt"
          autocomplete="off"
        ></b-input>
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

    <b-dropdown aria-role="list" style="width: 100%" size="is-small" scrollable>
      <button class="button is-small" slot="trigger" style="width: 100%">
        <span>Slew to...</span>
        <b-icon icon="menu-down"></b-icon>
      </button>
      <template
        v-for="(command, idx) in [
          mount_screenflat_command,
          mount_skyflat_command,
          mount_home_command,
          mount_ngp_command,
          mount_sgp_command,
          mount_park_command,
          mount_raSidDec0_command,
          mount_stop_command,
          mount_tracking_on_command,
          mount_tracking_off_command,
        ]"
      >
        <b-dropdown-item :key="idx" aria-role="listitem">
          <command-button
            :data="command"
            class="dropdown-button-command is-small"
          />
        </b-dropdown-item>
      </template>
    </b-dropdown>

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
        :device_status="mount_state" />
      <simple-device-status 
        :device_name="active_telescope" 
        device_type="Telescope" 
        :device_status="telescope_state" />
    </pre>
  </div>
</template>

<script>
import { commands_mixin } from "@/mixins/commands_mixin";
import { target_names } from "@/mixins/target_names";
import { user_mixin } from "@/mixins/user_mixin";
import CommandButton from "@/components/FormElements/CommandButton";
import StatusColumn from "@/components/status/StatusColumn";
import SimpleDeviceStatus from "@/components/status/SimpleDeviceStatus";
import { mapGetters } from "vuex";
import { ToastProgrammatic as Toast } from "buefy";
import TargetSearchField from "@/components/FormElements/TargetSearchField";
export default {
  name: "Telescope",
  mixins: [commands_mixin, user_mixin, target_names],
  components: {
    CommandButton,
    StatusColumn,
    SimpleDeviceStatus,
    TargetSearchField,
  },
  data() {
    return {
      isExpandedStatusVisible: false,
      object_is_searching: false,
      object_search_input: "",
    };
  },

  methods: {
    move_telescope_and_expose() {
      if (!this.mount_ra) {
        this.$buefy.toast.open({
          message: "Please specify a right ascension to point the telescope",
          type: "is-danger",
        });
      }
      if (!this.mount_dec) {
        this.$buefy.toast.open({
          message: "Please specify a declination to point the telescope",
          type: "is-danger",
        });
      }

      // If the coordinates are specified, send the command
      if (this.mount_dec && this.mount_ra) {
        // First parse the entry
        // Is it degrees?
        console.log(this.mount_ra)
        if (this.mount_ra.includes("d") ) {
          this.mount_ra.replace("d","")
          this.mount_ra = this.mount_ra / 15
          console.log(this.mount_ra)
        }

      
        const move_telescope_command_params = this.mount_slew_radec_command.form;
        const camera_expose_command_params = this.camera_expose_command.form;

        // First send the goto command, then send the expose command.
        // Order of the commands is important.
        this.send_site_command(move_telescope_command_params).then(
          (response) => {
            this.send_site_command(camera_expose_command_params);
          }
        );
      }
    },

    handle_coordinate_search_results(search_results) {
      if (!search_results.error) {
        this.mount_ra = search_results.ra.toFixed(4);
        this.mount_dec = search_results.dec.toFixed(4);
        // make sure to change this after the coordinates, since the object name is cleared 
        // after large changes in the coordinate positions. Details in vuex command_params.
        this.mount_object = search_results.searched_name;
      } else {
        this.mount_ra = "";
        this.mount_dec = "";
        this.$buefy.toast.open({
          message: `Could not resolve object with name ${search_results.searched_name}`,
          type: "is-warning",
          duration: 4000,
        });
      }
    },
  },

  computed: {
    sitecode() {
      return this.$route.params.sitecode;
    },

    ...mapGetters("sitestatus", [
      "site_is_online",
      "mount_state",
      "telescope_state",
      "buildTelescopeTabStatus1Shorter",
      "buildTelescopeTabStatus2",
      "telescope_message",
      "mount_message",
    ]),

    mount_ra: {
      get() {
        return this.$store.getters["command_params/mount_ra"];
      },
      set(val) {
        this.$store.commit("command_params/mount_ra", val);
      },
    },
    mount_dec: {
      get() {
        return this.$store.getters["command_params/mount_dec"];
      },
      set(val) {
        this.$store.commit("command_params/mount_dec", val);
      },
    },
    mount_object: {
      get() {
        return this.$store.getters["command_params/mount_object"];
      },
      set(val) {
        this.$store.commit("command_params/mount_object", val);
      },
    },
    mount_ha: {
      get() {
        return this.$store.getters["command_params/mount_ha"];
      },
      set(val) {
        this.$store.commit("command_params/mount_ha", val);
      },
    },
    mount_az: {
      get() {
        return this.$store.getters["command_params/mount_az"];
      },
      set(val) {
        this.$store.commit("command_params/mount_az", val);
      },
    },
    mount_alt: {
      get() {
        return this.$store.getters["command_params/mount_alt"];
      },
      set(val) {
        this.$store.commit("command_params/mount_alt", val);
      },
    },

    telescope_selection: {
      get() {
        return this.$store.getters["command_params/telescope_selection"];
      },
      set(val) {
        this.$store.commit("command_params/telescope_selection", val);
      },
    },

    telescope_coordinate_frame: {
      get() {
        return this.$store.getters["command_params/telescope_coordinate_frame"];
      },
      set(val) {
        this.$store.commit("command_params/telescope_coordinate_frame", val);
      },
    },
  },
};
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
