<template>
  <fieldset :disabled="is_disabled">
    <div
      class="field has-addons"
      style="margin-bottom: 2rem;"
    >
      <p class="control">
        <b-field
          is-small
          label="PTR Site"
          type="is-disabled"
        >
          <b-select
            v-model="selected_observatory"
            size="is-small"
          >
            <option
              v-for="s in all_sites"
              :key="s.site"
              :value="s.site"
            >
              {{ s.site }}
            </option>
            <option value="custom">
              Custom Location
            </option>
          </b-select>
        </b-field>
      </p>
      <p
        class="control"
        style="max-width: 90px;"
      >
        <b-field label="Latitude">
          <b-input
            v-model.number="selected_latitude"
            size="is-small"
            lazy
            :disabled="selected_observatory !== 'custom'"
          />
        </b-field>
      </p>
      <p
        class="control"
        style="max-width: 90px;"
      >
        <b-field label="Longitude">
          <b-input
            v-model.number="selected_longitude"
            type="text"
            size="is-small"
            lazy
            :disabled="selected_observatory !== 'custom'"
          />
        </b-field>
      </p>
    </div>

    <div class="timegroup-label">
      choose an offset time...
    </div>
    <div class="right-align">
      <b-field>
        <p class="control">
          <b-field>
            <b-select
              v-model="offset_direction"
              size="is-small"
              value="future"
            >
              <option value="future">
                in the future
              </option>
              <option value="past">
                in the past
              </option>
              <option value="now">
                now
              </option>
            </b-select>
          </b-field>
        </p>
        <p class="control">
          <b-field
            label="Days"
            label-position="on-border"
          >
            <b-input
              v-model.number="offset_days"
              type="number"
              size="is-small"
              :disabled="offset_direction == 'now'"
              style="width: 60px;"
            />
          </b-field>
        </p>
        <p class="control">
          <b-field
            label="Hours"
            label-position="on-border"
          >
            <b-input
              v-model.number="offset_hours"
              type="number"
              size="is-small"
              :disabled="offset_direction == 'now'"
              style="width: 60px;"
            />
          </b-field>
        </p>
        <p class="control">
          <b-field
            label="Minutes"
            label-position="on-border"
          >
            <b-input
              v-model.number="offset_minutes"
              type="number"
              size="is-small"
              :disabled="offset_direction == 'now'"
              style="width: 70px;"
            />
          </b-field>
        </p>
        <p class="control">
          <b-field>
            <b-button
              size="is-small"
              @click="apply_settings(true)"
            >
              go
            </b-button>
          </b-field>
        </p>
      </b-field>
    </div>

    <div class="timegroup-label">
      ...or choose a specific date and time
    </div>
    <div class="right-align">
      <b-field>
        <p class="control">
          <b-field>
            <b-datetimepicker
              v-model="selected_datetime"
              :timepicker="{ incrementMinutes: 15, hourFormat: time_format }"
              :datetime-parser=" (d) => { new Date(d); } "
              required
              size="is-small"
            />
          </b-field>
        </p>
        <p class="control">
          <b-field
            label="timezone"
            label-position="on-border"
          >
            <b-select
              v-model="datetime_picker_timezone_selection"
              size="is-small"
            >
              <option value="site">
                site
              </option>
              <option
                style="width: 80px;"
                value="user"
              >
                user
              </option>
              <option value="utc">
                utc
              </option>
              <option value="custom">
                custom
              </option>
            </b-select>
          </b-field>
        </p>
        <p class="control">
          <b-field
            label="UTC offset"
            label-position="on-border"
            title="+/- hours"
          >
            <b-input
              v-model="datetime_picker_timezone_offset"
              size="is-small"
              :disabled="datetime_picker_timezone_selection != 'custom' "
              style="width: 80px;"
            />
          </b-field>
        </p>
        <p class="control">
          <b-field>
            <b-button
              size="is-small"
              @click="apply_settings(false)"
            >
              go
            </b-button>
          </b-field>
        </p>
      </b-field>
    </div>
  </fieldset>
</template>

<script>

// TODO: make these settings persistant using vuex to store state
import { mapState, mapGetters } from 'vuex'
import { utc_offset_from_coordinates } from '@/utils/timezones'
export default {
  name: 'DateTimeLocationPicker',
  props: {
    default_observatory: {
      type: String,
      default: 'mrc'
    },
    is_disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {

      selected_observatory: '',
      selected_latitude: 0,
      selected_longitude: 0,
      custom_latitude: 0,
      custom_longitude: 0,

      // Rounded to nearest half hour
      selected_datetime: new Date(Math.round(new Date().getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000)),
      datetime_picker_timezone_selection: 'user',

      // Flip the sign because getTimezoneOffset uses the opposite of most offset conventions
      // Divide by 60 to convert minutes to hours.
      datetime_picker_timezone_offset: new Date().getTimezoneOffset() / -60,

      // Occasionally set to '24' for utc displays, but undefined defaults to users system clock preference
      time_format: undefined,

      // offset_direction can be 'future', 'past', or 'now'
      offset_direction: 'future',
      offset_days: 0,
      offset_hours: 0,
      offset_minutes: 0
    }
  },
  mounted () {
    this.selected_observatory = this.default_observatory
    this.set_lat_lng(this.selected_observatory)

    // initialize the custom lat/lng to be the site's coordinates instead of 0,0
    this.custom_latitude = this.selected_latitude
    this.custom_longitude = this.selected_longitude
  },
  methods: {

    roundDate (date, minutes = 15) {
      const msPerMinute = 6e4
      const msInterval = minutes * msPerMinute
      return new Date(Math.round(date.getTime() / msInterval) * msInterval)
    },

    /* @return A timezone offset in minutes */
    getOffset (timeZone = 'UTC', date = new Date()) {
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone }))
      return (tzDate.getTime() - utcDate.getTime()) / 6e4
    },

    async set_lat_lng (site) {
      if (site == 'custom') {
        this.selected_latitude = this.custom_latitude
        this.selected_longitude = this.custom_longitude
      } else {
        this.selected_latitude = this.global_config[site].latitude
        this.selected_longitude = this.global_config[site].longitude
      }
    },

    /**
         * Package the user selections for the skychart datetime/location display, and emit to the parent component.
         *
         * @param {Boolean} from_offset: true if user specified time relative to now, false if using a specified date.
         *
         * @returns {Object} object: The datetime and location info
         * @returns {Date} object.date: the moment in time used for the skychart. Js Date objects assume UTC.
         * @returns {Number} object.tz_offset_minutes: difference between the specified datetime and UTC
         * @returns {Array} object.location: [latitude, longitude] in decimal degrees for the specified location
         */
    apply_settings (from_offset) {
      // default: assume user selected a specific date/time
      let display_date = this.selected_datetime_tz_corrected

      // BUT if the user chose an offset time, use that instead
      if (from_offset ?? false) {
        const ms_per_minute = 60 * 1000
        const ms_per_hour = 60 * ms_per_minute
        const ms_per_day = 24 * ms_per_hour

        // Translate the day/hour/minute offset into milliseconds
        let offset_ms = this.offset_minutes * ms_per_minute +
                    this.offset_hours * ms_per_hour +
                    this.offset_days * ms_per_day

        // Modify based on the ['in the future','in the past','now'] selector
        if (this.offset_direction == 'past') {
          offset_ms *= -1
        } else if (this.offset_direction == 'now') {
          offset_ms *= 0
        }

        const time_now = Date.now()
        display_date = new Date(time_now + offset_ms)
      }

      const time_and_place = {
        date: display_date,
        location: [this.selected_latitude, this.selected_longitude]
      }

      // Send the results to the parent component
      this.$emit('update_time_and_place', time_and_place)
    },

    get_site_tz_name (site) {
      return this.global_config[site].TZ_database_name
    },

    calculate_site_tz_offset () {
      if (this.datetime_picker_timezone_selection == 'user') {
        // NOTE: getTimezoneOffset returns minutes with the opposite sign of the conventional UTC offset display
        // So UTC-8 would return 480, while UTC+8 would return -480.
        // We divide by -60 to convert to hours in the conventional +/- signage.
        this.datetime_picker_timezone_offset = new Date().getTimezoneOffset() / -60
      } else if (this.datetime_picker_timezone_selection == 'utc') {
        this.datetime_picker_timezone_offset = 0
      } else if (this.datetime_picker_timezone_selection == 'site') {
        const site_tz = this.get_site_tz_name(this.selected_observatory)
        this.datetime_picker_timezone_offset = this.getOffset(site_tz, this.selected_datetime) / 60 // convert minutes to hours
      }
    }

  },

  watch: {
    default_observatory () {
      this.selected_observatory = this.default_observatory
    },

    datetime_picker_timezone_selection () {
      this.calculate_site_tz_offset()
    },

    // Save any custom lat/lng user inputs so that we can redisplay them if the user switches back to a custom site
    selected_latitude () {
      if (this.selected_observatory == 'custom') {
        this.custom_latitude = this.selected_latitude
        this.datetime_picker_timezone_offset = utc_offset_from_coordinates(
          this.selected_latitude,
          this.selected_longitude,
          this.selected_datetime
        )
      }
    },
    selected_longitude () {
      if (this.selected_observatory == 'custom') {
        this.custom_longitude = this.selected_longitude
        this.datetime_picker_timezone_offset = utc_offset_from_coordinates(
          this.selected_latitude,
          this.selected_longitude,
          this.selected_datetime
        )
      }
    },
    // If the user changes the observatory selected for the sky display, update the lat/lng coords and timezone data
    selected_observatory (site) {
      this.set_lat_lng(site)
      if (site == 'custom') {
        this.datetime_picker_timezone_offset = utc_offset_from_coordinates(this.selected_latitude, this.selected_longitude, this.selected_datetime)
      }
    }
  },
  computed: {

    // The selected_datetime is a js date object defined by a user selection in the datetime picker.
    // It assumes the year/month/day/hour/minute expression is defined in the user's timezone.
    // But the user actually has a field to select other timezones if they wish.
    // Solution: this computed property returns a date that accounts for the selected timezone.
    selected_datetime_tz_corrected () {
      // requested timezone offset from UTC
      const requested_offset_ms = this.datetime_picker_timezone_offset * 60 * 60 * 1000 // convert hours to ms

      // user's timezone offset from UTC
      // NOTE: getTimezoneOffset returns minutes with the opposite sign of the conventional UTC offset display
      // So UTC-8 would return 480, while UTC+8 would return -480.
      // We multiply by (60 * 1000 * -1) to convert minutes to milliseconds with the normal +/- sign usage.
      const user_offset_ms = new Date().getTimezoneOffset() * 60 * 1000 * -1 // convert minutes to ms

      // The difference between the user's tz and the requested tz
      const offset_difference_ms = user_offset_ms - requested_offset_ms

      // (this is because js dates use the user's timezone when created)
      return new Date(this.selected_datetime.getTime() + offset_difference_ms)
    },
    ...mapState('site_config', ['global_config']),
    ...mapGetters('site_config', ['all_sites'])
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
.right-align {
    display:flex;
    flex-direction: row-reverse;
    margin-bottom: 2rem;
}

.timegroup-label {
    color: $grey-lighter;
    margin: 1.5rem 0;
    font-weight: 700;
}
</style>
