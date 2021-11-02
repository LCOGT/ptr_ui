<template>
  <fieldset :disabled="is_disabled">

    <div class="field has-addons" style="margin-bottom: 2rem;">
        <p class="control">
            <b-field is-small label="PTR Site" type="is-disabled">
                <b-select
                v-model="selected_observatory"
                size="is-small"
                >
                <option
                    v-for="s in all_sites"
                    :key="s.site"
                    :value="s.site"
                >
                    {{ s.site}}
                </option>
                <option value="custom">Custom Location</option>
                </b-select>
            </b-field>
        </p>
        <p class="control">
          <b-field label="Latitude">
            <b-input
              type="text"
              size="is-small"
              v-model="selected_latitude"
              :disabled="selected_observatory !== 'custom'"
            />
          </b-field>
        </p>
        <p class="control">
          <b-field label="Longitude">
            <b-input
              type="text"
              size="is-small"
              v-model="selected_longitude"
              :disabled="selected_observatory !== 'custom'"
            />
          </b-field>
        </p>
      </div>

    <div class="timegroup-label">choose an offset time...</div>
    <div class="right-align">
    <b-field>
        <p class="control">
            <b-field>
                <b-select size="is-small" value="future" v-model="offset_direction">
                    <option value="future">in the future</option>
                    <option value="past">in the past</option>
                    <option value="now">now</option>
                </b-select>
            </b-field>
        </p>
        <p class="control">
            <b-field label="Days" label-position="on-border">
                <b-input 
                    v-model.number="offset_days" 
                    type="number"
                    size="is-small" 
                    :disabled="offset_direction == 'now'"
                    style="width: 60px;"></b-input>
            </b-field>
        </p>
        <p class="control">
            <b-field label="Hours" label-position="on-border">
                <b-input 
                    v-model.number="offset_hours" 
                    type="number"
                    size="is-small" 
                    :disabled="offset_direction == 'now'"
                    style="width: 60px;"></b-input>
            </b-field>
        </p>
        <p class="control">
            <b-field label="Minutes" label-position="on-border">
                <b-input 
                    v-model.number="offset_minutes" 
                    type="number"
                    size="is-small" 
                    :disabled="offset_direction == 'now'"
                    style="width: 70px;"></b-input>
            </b-field>
        </p>
        <p class="control">
            <b-field>
            <b-button size="is-small" @click="apply_settings(true)">go</b-button>
            </b-field>
        </p>
    </b-field>
    </div>


    <div class="timegroup-label">...or choose a specific date and time</div>
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
            <b-field label="timezone" label-position="on-border">
                <b-select size="is-small" v-model="selected_timezone">
                    <option style="width: 80px;" value="user">user</option>
                    <option value="utc">utc</option>
                    <option value="custom">custom</option>
                </b-select>
            </b-field>
        </p>
        <p class="control">
            <b-field label="UTC offset" label-position="on-border" title="+/- hours">
                <b-input 
                    size="is-small" 
                    v-model="custom_observatory_offset"
                    :disabled="selected_timezone != 'custom' "
                    style="width: 80px;"></b-input>
            </b-field>
        </p>
        <p class="control">
            <b-field>
            <b-button size="is-small" @click="apply_settings(false)">go</b-button>
            </b-field>
        </p>

    </b-field>
    </div>

  </fieldset>
</template>

<script>

// TODO: make these settings persistant using vuex to store state


import { mapState, mapGetters } from 'vuex'
export default {
    name: "DateTimeLocationPicker",
    props: {
        default_observatory: {
            type: String,
            default: "mrc"
        },
        is_disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {

            selected_observatory: '',
            selected_latitude: '',
            selected_longitude: '',
            custom_latitude: '',
            custom_longitude: '',

            // Rounded to nearest half hour
            selected_datetime: new Date(Math.round(new Date().getTime() / (30 * 60 * 1000)) * (30 * 60 * 1000)),
            selected_timezone: 'user',

            // Initialize with user's timezone offset
            custom_observatory_offset: new Date().getTimezoneOffset() / -60,

            // Occasionally set to '24' for utc displays, but undefined defaults to users system clock preference
            time_format: undefined,

            // offset_direction can be 'future', 'past', or 'now'
            offset_direction: 'future',
            offset_days: 0,
            offset_hours: 0,
            offset_minutes: 0,

        }
    },
    mounted() {
        this.selected_observatory = this.default_observatory
        this.set_lat_lng(this.selected_observatory)
    },
    methods: {
        /* @return A timezone offset in minutes */
        getOffset(timeZone = 'UTC', date = new Date()) {
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
            return (tzDate.getTime() - utcDate.getTime()) / 6e4;
        },
        set_lat_lng(site) {
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
        apply_settings(from_offset) {
            let display_date

            // calculate time from offset
            if (from_offset ?? false) {
                let ms_per_minute = 60 * 1000
                let ms_per_hour = 60 * ms_per_minute
                let ms_per_day = 24 * ms_per_hour

                // Translate the day/hour/minute offset into milliseconds
                let offset_ms = this.offset_minutes * ms_per_minute
                    + this.offset_hours * ms_per_hour
                    + this.offset_days * ms_per_day;

                // Modify based on the ['in the future','in the past','now'] selector
                if (this.offset_direction == 'past') {
                    offset_ms *= -1
                } else if (this.offset_direction == 'now') {
                    offset_ms *= 0
                }

                let time_now = Date.now()
                display_date = new Date(time_now + offset_ms)
            
            // or get the specified date 
            } else {

                // requested timezone offset from UTC
                let requested_offset_ms = this.custom_observatory_offset * 60 * 60 * 1000 // convert hours to ms

                // user's timezone offset from UTC
                let user_offset = new Date().getTimezoneOffset() * 60 * 1000 // convert minutes to ms
                console.log(user_offset)

                // First, get the requested date if it was specified in UTC
                // (this is because js dates use the user's timezone when created)
                let utc_display_date = new Date(this.selected_datetime.getTime() + user_offset)
                console.log('utc: ', utc_display_date)

                // Then, we can apply the requested timezone offset to the UTC time
                display_date = new Date(utc_display_date.getTime() + requested_offset_ms)
                console.log('requested: ', display_date)
            }

            let time_and_place = {
                date: display_date,
                tz_offset_minutes: this.selected_timezone * 60,
                location: [this.selected_latitude, this.selected_longitude],
            }

            // Send the results to the parent component
            this.$emit('update_time_and_place', time_and_place)
        },
    },
    watch: {

        selected_timezone(new_timezone) {
            if (new_timezone == 'user') {
                this.custom_observatory_offset = new Date().getTimezoneOffset() / -60 // convert to +/- hours from UTC
            } else if (new_timezone == 'utc') {
                this.custom_observatory_offset = 0
            }
        },

        // Save any custom lat/lng user inputs so that we can redisplay them if the user switches back to a custom site
        selected_latitude() {
            if (this.selected_observatory == "custom") { this.custom_latitude = this.selected_latitude }
        },
        selected_longitude() {
            if (this.selected_observatory == "custom") { this.custom_latitude = this.selected_latitude }
        },
        selected_observatory() {
            if (this.selected_observatory == "custom") {

                // If using a custom lat/lng location, then the 'site' tz doesn't make sense. Switch to utc.
                if (this.selected_timezone == 'site') {
                    this.selected_timezone = 'utc'
                }
            }
            this.selected_latitude = this.global_config?.[this.selected_observatory]?.latitude ?? 0
            this.selected_longitude = this.global_config?.[this.selected_observatory]?.longitude ?? 0
        },
    },
    computed: {
        ...mapState('site_config', ['global_config']),
        ...mapGetters('site_config', [ 'all_sites', ]),
    },
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