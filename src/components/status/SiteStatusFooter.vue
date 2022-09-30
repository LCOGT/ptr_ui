<template>
  <div class="statusbar">
    <div
      class="status-bar-1"
      @mouseover="mouseover_status_1 = true"
      @mouseleave="collapse_status_bar_1"
    >
      <a
        class="toggle"
        @click="toggle_status_bar_height_1"
      >
        <b-icon
          type="is-text"
          :icon="status_bar_1_expanded ? 'chevron-up' : 'chevron-left'"
        />
      </a>

      <div
        v-if="status_bar_1_expanded"
        class="lock-button"
        title="keep expanded"
        @click="status_bar_1_lock = !status_bar_1_lock"
      >
        <b-icon
          type="is-text"
          :icon="status_bar_1_lock ? 'pin' : 'pin-off'"
          class="pin-icon"
        />
      </div>

      <!-- User status logs -->
      <div
        ref="loglist"
        :class="{ expanded: status_bar_1_expanded }"
        class="user-status container"
      >
        <div
          v-if="logs_to_display.length == 0"
          class="default-log-message"
        >
          observatory logs will appear here
        </div>
        <div
          v-for="(log, idx) in logs_to_display"
          :key="idx"
          class="log-line"
        >
          <div class="log-timestamp-group">
            <span class="user-status-title">{{ idx==logs_to_display.length - 1 ? 'OBSY LOG: ' : '' }}</span>
            <b-tooltip
              position="is-top"
              type="is-dark"
              :label="''/*timezone timestamp_to_date(log.timestamp)*/"
            >
              <span class="log-timestamp">{{ timestamp_to_logdate(log.timestamp) }}</span>
            </b-tooltip>
          </div>
          <pre
            class="log-message"
            :class="get_log_level_classes(log)"
          >
            {{ format_log_message_text(log) }}
          </pre>
        </div>
      </div>
      <PhaseStatusBar class="phase-status-bar" />
    </div>

    <div
      class="status-bar-2"
      @mouseover="mouseover_status_2 = true"
      @mouseleave="collapse_status_bar_2"
    >
      <a
        class="toggle"
        @click="toggle_status_bar_height_2"
      >
        <b-icon
          type="is-text"
          :icon="status_bar_2_expanded ? 'chevron-up' : 'chevron-left'"
        />
      </a>

      <div
        v-if="status_bar_2_expanded"
        class="lock-button"
        @click="status_bar_2_lock = !status_bar_2_lock"
      >
        <b-icon
          type="is-text"
          :icon="status_bar_2_lock ? 'pin' : 'pin-off'"
          class="pin-icon"
        />
      </div>

      <div class="status-content">
        <div
          v-if="status_bar_2_expanded"
          id="status-2-expanded"
          class="container"
        >
          <div class="status-container container">
            <div class="status-container-header">
              Weather + Enclosure
              <div class="status-container-header-status-age">
                <status-column :status-list="[weather_status_age_display]" />
              </div>
            </div>
            <div class="status-container-content">
              <status-column
                style="padding: 0"
                :status-list="weather_status_display_1"
              />
              <status-column
                style="padding: 0"
                :status-list="weather_status_display_2"
              />
            </div>
          </div>

          <div class="status-container container">
            <div class="status-container-header">
              Device Status
              <div class="status-container-header-status-age">
                <status-column :status-list="[device_status_age_display]" />
              </div>
            </div>
            <div class="status-container-content">
              <status-column
                style="padding: 0"
                :status-list="device_status_display_1"
              />
              <div style="display:flex; flex-direction:column;">
                <status-column
                  style="padding: 0"
                  :status-list="device_status_display_2"
                />
                <ObservatoryRestartCommand
                  :site="site"
                  class="site-restart-button"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          id="status-2-primary"
          class="container"
        >
          <div class="clock-displays">
            <div style="display: flex; flex-direction: column">
              <SiteOperationalStatus :site="site" />
              <div
                style="
                  display: flex;
                  flex-wrap: wrap;
                  height: 55px;
                  overflow: hidden; "
              >
                <div class="mr-5">
                  <site-sidereal-time
                    v-if="site_longitude"
                    class="sidereal-time"
                    :longitude="site_longitude"
                  />
                  <div class="sidereal-label">
                    LMST
                  </div>
                </div>
                <div class="mr-5">
                  <site-local-time
                    v-if="timezone"
                    class="sidereal-time"
                    :timezone="timezone"
                  />
                  <div
                    v-else
                    class="sidereal-time"
                  >
                    --
                  </div>
                  <div class="sidereal-label">
                    Obs Time
                  </div>
                </div>
                <div class="mr-1">
                  <utc-time
                    v-if="timezone"
                    class="sidereal-time"
                    :timezone="timezone"
                  />
                  <div
                    v-else
                    class="sidereal-time"
                  >
                    --
                  </div>
                  <div class="sidereal-label">
                    UTC Time
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div class="clock-border" />
          </div>

          <div>
            <status-column
              style="padding: 0"
              :status-list="primary_status_group_1"
            />
          </div>
          <div>
            <status-column
              style="padding: 0"
              :status-list="primary_status_group_2"
            />
          </div>
          <div>
            <status-column
              style="padding: 0"
              :status-list="primary_status_group_3"
            />
          </div>
          <div>
            <status-column
              style="padding: 0"
              :status-list="primary_status_group_4"
            />
          </div>
          <div>
            <status-column
              style="padding: 0"
              :status-list="primary_status_group_5"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/** * TODO: Refactor out the user status into its own component, like the phase status ***/

import { mapGetters } from 'vuex'
import moment from 'moment'
import { user_status_mixin } from '../../mixins/user_status_mixin'
import StatusColumn from '@/components/status/StatusColumn'
import SiteSiderealTime from '@/components/display/SiteSiderealTime'
import SiteLocalTime from '@/components/display/SiteLocalTime'
import UtcTime from '@/components/display/UtcTime'
import SiteOperationalStatus from '@/components/status/SiteOperationalStatus'
import PhaseStatusBar from '@/components/status/PhaseStatusBar'
import ObservatoryRestartCommand from '@/components/ObservatoryRestartCommand'
export default {
  name: 'SiteStatusFooter',
  mixins: [user_status_mixin],
  components: {
    StatusColumn,
    SiteSiderealTime,
    SiteLocalTime,
    UtcTime,
    SiteOperationalStatus,
    PhaseStatusBar,
    ObservatoryRestartCommand
  },
  props: {
    site: {
      type: String
    }
  },

  data () {
    return {
      status_bar_1_expanded: false,
      status_bar_2_expanded: false,
      status_bar_1_lock: false,
      status_bar_2_lock: false,

      mouseover_status_1: false,
      mouseover_status_2: false
    }
  },

  created () {
    this.set_user_status_active_site(this.site)
  },

  watch: {
    site () {
      this.set_user_status_active_site(this.site)
    },

    status_bar_1_expanded () {
      this.scrollToBottom()
    },

    user_status_logs () {
      const div = this.$refs.loglist
      if (this.status_bar_1_expanded && this.isScrolledToBottom(div)) {
        this.$nextTick(this.scrollToBottom)
      }
    }
  },

  methods: {
    // Get the username from Auth0
    username () {
      if (this.$auth.isAuthenticated) {
        return this.$auth.user.name
      }
      return 'anonymous'
    },

    toggle_status_bar_height_1 () {
      if (!this.status_bar_1_expanded) {
        this.status_bar_1_expanded = true
        this.$nextTick(this.scrollToBottom)
      } else {
        this.status_bar_1_lock = false
        this.status_bar_1_expanded = false
      }
    },
    toggle_status_bar_height_2 () {
      this.status_bar_2_lock = false
      this.status_bar_2_expanded = !this.status_bar_2_expanded
    },
    collapse_status_bar_1 () {
      this.status_bar_1_expanded = this.status_bar_1_lock || false
      this.mouseover_status_1 = false
    },
    collapse_status_bar_2 () {
      this.status_bar_2_expanded = this.status_bar_2_lock || false
      this.mouseover_status_2 = false
    },

    // Returns true if the element is scrolled to the bottom
    isScrolledToBottom (el) {
      const $el = $(el)
      return el.scrollHeight - $el.scrollTop() - $el.outerHeight() < 1
    },

    // This method will scroll the log window to the bottom (to the latest
    // message)
    scrollToBottom () {
      const div = this.$refs.loglist
      div.scrollTop = div.scrollHeight - div.clientHeight
    },

    // Method for converting timestamp(seconds) to a date that reads easily
    //  in the log UI
    timestamp_to_logdate (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).format('MM/DD HH:mm:ss')
    },

    // Used to format the time for the timestmap tooltip.
    // (reveals the yyyy/mm/dd, not included in the default view)
    timestamp_to_date (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).format('YYYY/MM/DD')
    }
  },
  computed: {
    ...mapGetters('site_config', ['site_longitude', 'timezone']),
    ...mapGetters('sitestatus', [
      // "status_age_display",
      'weather_status_age_display',
      'weather_status_age',
      'device_status_age',
      'device_status_age_display',
      'site_is_online',
      'buildRotatorTabStatus',

      'ra',
      'dec',
      'hour_angle',
      'azimuth',
      'altitude',
      'airmass',
      'refraction',
      'zenith_distance',

      'filter_name',
      'filter_wheel_moving',
      'focus_position',
      'focus_moving',
      'rotator_position',
      'rotator_moving',
      'camera_status',

      'weather_ok',
      'open_ok',
      'sky_temp',
      'air_temp',
      'humidity',
      'dewpoint',
      'wind',
      'surface',
      'ambient',
      'meas_sky_mpsas',
      'calc_sky_mpsas',
      'wx_hold',
      'hold_duration',

      'enclosure_open_status',
      'enclosure_mode',
      'dome_azimuth',
      'dome_slewing',
      'enclosure_synchronized'
    ]),

    // Status ages for display
    weather_status_age_display () {
      return { name: 'status age: ', ...this.$store.getters['sitestatus/weather_status_age_display'] }
    },
    device_status_age_display () {
      return { name: 'status age: ', ...this.$store.getters['sitestatus/device_status_age_display'] }
    },

    // Status columns visible in the expanded status view
    weather_status_display_1 () {
      const spacer = { name: 'spacer', val: 'spacer' }
      const status = [
        this.weather_ok,
        this.open_ok,
        spacer,
        this.enclosure_open_status,
        this.enclosure_mode,
        spacer,
        this.dome_azimuth,
        this.dome_slewing,
        this.enclosure_synchronized
      ]
      return status
    },
    weather_status_display_2 () {
      const status = [
        this.sky_temp,
        this.air_temp,
        this.humidity,
        this.dewpoint,
        this.wind,
        this.surface,
        this.ambient,
        this.meas_sky_mpsas,
        this.calc_sky_mpsas
      ]
      return status
    },
    device_status_display_1 () {
      const spacer = { name: 'spacer', val: 'spacer' }
      const status = [
        this.ra,
        this.dec,
        spacer,
        this.azimuth,
        this.altitude,
        spacer,
        this.hour_angle,
        this.airmass,
        this.zenith_distance,
        this.refraction
      ]
      return status
    },
    device_status_display_2 () {
      const spacer = { name: 'spacer', val: 'spacer' }
      const status = [
        this.filter_name,
        this.filter_wheel_moving,
        spacer,
        this.focus_position,
        this.focus_moving,
        spacer,
        this.rotator_position,
        this.rotator_moving
      ]
      return status
    },

    // Status columns appearing in the always-visible status area
    primary_status_group_1 () {
      return [
        this.weather_ok,
        this.wx_hold,
        this.hold_duration
      ]
    },
    primary_status_group_2 () {
      return [
        this.enclosure_mode,
        this.enclosure_open_status,
        this.dome_azimuth
      ]
    },
    primary_status_group_3 () {
      return [
        this.ra,
        this.dec,
        this.hour_angle
      ]
    },
    primary_status_group_4 () {
      return [
        this.azimuth,
        this.altitude,
        this.airmass
      ]
    },
    primary_status_group_5 () {
      return [
        this.camera_status,
        this.filter_name
      ]
    },

    /**
     *  This will return either the single latest log message, or the full
     *  list of logs, depending on whether the view is expanded or not.
     */
    logs_to_display () {
      // If user status bar is collapsed, just show the last log message
      if (!this.status_bar_1_expanded) {
        return this.user_status_logs.length
          ? this.user_status_logs.slice(-2)
          : []
      }
      // Otherwise show all the logs
      else {
        return this.user_status_logs
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
@import "@/style/_responsive.scss";
@import "@/style/buefy-styles.scss";

/**
 *  Component styling
 */
.statusbar {
  // Bulma modal z-index is 40, and we don't want to cover modal windows.
  z-index: 39;
}
.hidden {
  display: none;
}

$left-padding: 1em;
$main-status-background: #0f1313;
$user-status-background: darken($main-status-background, 3);
$toggle-button-color: darken($main-status-background, 5);

$status-1-collapsed-height: 25px;
$status-2-collapsed-height: 80px;
$toggle-button-width: 50px;

/**
 *  User status (log) styles (the top status bar)
 */

 $user-status-font-family: unset;

$log-debug: #aaa;
$log-info: #eee;
$log-warning: $ptr-yellow;
$log-error: $ptr-blue;
$log-critical: $ptr-red;

.status-bar-1 {
  //padding-left: $left-padding;
  //padding-right: $toggle-button-width;
  position:relative;
  background-color: $user-status-background;
}
.status-1-content {
  height: 2em;
}

.user-status {
  display: flex;
  flex-direction: column;
  //width: 100%;
  line-height: 2em;
}
.user-status.expanded {
  height: 200px;
  line-height: 1.3em;
  overflow-y: scroll;
  overscroll-behavior: contain;
  padding-top: 2pt;
} // keep to a single line when user status is collapsed
.user-status:not(.expanded) * .log-message {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  padding-top: 2px;
}
.user-status-title {
    font-size: 12px;
    text-transform: uppercase;
}

.default-log-message {
  color: #bbb;
  font-size: 11pt;
  font-family: $user-status-font-family;
}

.log-line {
  display: grid;
  grid-template-columns: 220px 1fr;
  width: 90%;
  line-height: 25px;
}
.log-timestamp-group {
  display: flex;
  justify-content: space-between;
}
.log-timestamp {
  color: #bbb;
  animation: blinkonce 1s;
  grid-column-start: 1;
  padding-top: 2pt;
  padding-right: 15px;
  font-size: 9pt;
  font-family: $user-status-font-family;
  font-family: monospace;
  align-items: center;
  text-align: right;
}
.user-status-title {
  font-family: unset;
}
pre.log-message {
  color: #bbb;
  font-size: 11pt;
  font-family: $user-status-font-family;
  width: 100%;
  background-color: $user-status-background;
  grid-column-start: 2;
  text-align: left;
  white-space: pre-line;
  hyphens: auto;
  padding: 0;
  padding-top: 2pt;
  margin-left: 15px;
}
// Style the log message based on its log level class.
pre.log-message.debug {
  color: $log-debug;
}
pre.log-message.info {
  color: $log-info;
}
pre.log-message.warning {
  color: $log-warning;
}
pre.log-message.error {
  color: $log-error;
}
pre.log-message.critical {
  color: $log-critical;
  font-weight: bold;
}

// New messages enter yellow to grab attention, then fade to their
// destination color (based on the log level, see above)
@keyframes blinkonce {
  0% {
    color: yellow;
  }
}
div.log-line:last-of-type * {
  animation: blinkonce 1s;
}
.log-line:hover * {
  color: white;
}

.phase-status-bar {
  position:relative;
  background-color: $user-status-background;
  border-top: 1px grey solid;
  border-bottom: 1px $grey-dark solid;
  line-height: 2em;
}

/**
 * Style rules for the bottom status bar
 */

.status-bar-2 {
  padding-left: $left-padding;
  padding-right: $toggle-button-width;
  position:relative;
  background-color: $main-status-background;
  border-top: 1px grey solid;
  border-bottom: 1px $grey-dark solid;
  overflow-x: hidden;
}

// This is the site status content that is always displayed
#status-2-primary {
  width: 100%;
  display:flex;
  flex-wrap: wrap;
  height: $status-2-collapsed-height;
  overflow: hidden;
  gap: 15px;

  // align with the .container margins:
  margin-top: 10px;
  margin-bottom: 10px;
}

// This is the site status for the expanded view
#status-2-expanded {
  padding-bottom: 1em;
  padding-top: 1em;
  border-bottom: 1px solid grey;
  // align with the .container margins:
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.status-column-list {
  display:flex;
  flex-wrap: wrap;
  height: 77px;
  overflow: hidden;
  gap: 20px;
}

.lock-button {
  position: absolute;
  bottom: 20px;
  right: calc(20px + #{$toggle-button-width});
  cursor: pointer;
  z-index: 5;
}
.pin-icon {
  color: silver;
}

.site-restart-button {
  display:flex;
  flex-direction: row-reverse;
  border-top: 1px solid silver;
  width: 100%;
  margin-left: auto;
  margin-right: 0;
  margin-top: 1em;
  padding-top: 1em;
}

// Style the status container boxes in the expanded status panel
.status-container {
  border: 0px solid red;
}
.status-container-header {
  border: 1px solid lighten($grey-dark, 3);
  padding: 0 8px;
  color: lightgray;
  margin-bottom: 20px;
  background-color: $background;
  display:flex;
  justify-content: space-between;
}
.status-container-header-status-age {
  padding: 0;
}
.status-container-content {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: flex-start;
}

/**
 * Toggle expand/collaps button style
 */
.toggle {
  position: absolute;
  right: 0;
  height: 100%;
  width: $toggle-button-width;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: whitesmoke;
  background-color: $toggle-button-color;
  z-index: 11;
}

.clock-displays {
  width: 220px;
}

/**
 * Individual Status Items
 */
.sidereal-time {
  padding-top: 10px;
  font-size: 20px;
}
.sidereal-time.offline {
  color: grey;
}
.sidereal-label {
  color:rgb(160, 160, 160);
  text-transform: uppercase;
  font-size: 10px;
}
.clock-border {
  margin-left: 50%;
  border-left: solid 1px grey;
  height: 100%;
  width: 1px;
}
</style>
