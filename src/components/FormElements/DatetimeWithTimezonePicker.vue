<template>
   <div> 
        <b-field 
            :label="label"
            >
            <p class="control">
            <b-field>
                <b-datetimepicker
                    v-model="selected_datetime_naive"
                    :timepicker="{ incrementMinutes: 15, hourFormat: time_format }"
                    :datetime-parser=" (d) => { new Date(d); } "
                    required
                    :size="size"
                />
            </b-field>
            </p>
            <p class="control">
                <b-field label="timezone" label-position="on-border">
                    <b-select :size="size" v-model="timezone_selection">
                        <option value="site" v-if="site != ''">site</option>
                        <option style="width: 80px;" value="user">user</option>
                        <option value="utc">utc</option>
                        <option value="custom">custom</option>
                    </b-select>
                </b-field>
            </p>
            <p class="control">
                <b-field label="UTC offset" label-position="on-border" title="+/- hours">
                    <b-input 
                        :size="size" 
                        v-model="timezone_offset"
                        :disabled="timezone_selection != 'custom' "
                        style="width: 80px;"></b-input>
                </b-field>
            </p>
        </b-field>
    </div>
</template>

<script>
import { utc_offset_from_coordinates } from '@/utils/timezones'
import { mapState, mapGetters } from 'vuex'
export default {
    name: 'DownloadInterface',
    props: {
        size: {
            type: String,
            ValidityState(val) {
                let valid = ['', 'is-small', 'is-medium', 'is-large']
                return valid.includes(val)
            },
            default: () => ''
        },
        site: {
            type: String,
            default: () => '',
        },
        label: {
            type: String
        },
        date: {
            type: Date,
            default: () => new Date()
        },

    },
    mounted() {
        this.$emit('input', this.selected_datetime_tz_corrected)        
    },
    data() {
        return {
            // Rounded to nearest half hour
            selected_datetime_naive: this.date,
            timezone_selection: 'user',

            // Flip the sign because getTimezoneOffset uses the opposite of most offset conventions
            // Divide by 60 to convert minutes to hours.
            timezone_offset: new Date().getTimezoneOffset() / -60, 

            // Occasionally set to '24' for utc displays, but undefined defaults to users system clock preference
            time_format: undefined,
        }
    },

    methods: {

        get_site_tz_name(site) {
            return this.global_config[site].TZ_database_name
        },

        calculate_site_tz_offset() {
            if (this.datetime_picker_timezone_selection == 'user') {
                // NOTE: getTimezoneOffset returns minutes with the opposite sign of the conventional UTC offset display
                // So UTC-8 would return 480, while UTC+8 would return -480.
                // We divide by -60 to convert to hours in the conventional +/- signage. 
                this.datetime_picker_timezone_offset = new Date().getTimezoneOffset() / -60 
            } else if (this.datetime_picker_timezone_selection == 'utc') {
                this.datetime_picker_timezone_offset = 0
            } else if (this.datetime_picker_timezone_selection == 'site') {
                let site_tz = this.get_site_tz_name(this.selected_observatory)
                this.datetime_picker_timezone_offset = this.getOffset(site_tz, this.selected_datetime) / 60 // convert minutes to hours
            } 
        },
        calculate_site_tz_offset() {
            if (this.timezone_selection == 'user') {
                // NOTE: getTimezoneOffset returns minutes with the opposite sign of the conventional UTC offset display
                // So UTC-8 would return 480, while UTC+8 would return -480.
                // We divide by -60 to convert to hours in the conventional +/- signage. 
                this.timezone_offset = new Date().getTimezoneOffset() / -60 
            } else if (this.timezone_selection == 'utc') {
                this.timezone_offset = 0
            } else if (this.site != '' && this.timezone_selection == 'site') {
                let site_tz = this.get_site_tz_name(this.site)
                this.timezone_offset = this.getOffset(site_tz, this.selected_datetime) / 60 // convert minutes to hours
            } 
        },

        /* @return A timezone offset in minutes */
        getOffset(timeZone = 'UTC', date = new Date()) {
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
            return (tzDate.getTime() - utcDate.getTime()) / 6e4;
        },
    },

    computed: {

        naive_datetime_timestamp() {
            return this.selected_datetime_naive.getTime()
        },

        // The selected_datetime is a js date object defined by a user selection in the datetime picker.
        // It assumes the year/month/day/hour/minute expression is defined in the user's timezone.
        // But the user actually has a field to select other timezones if they wish.
        // Solution: this computed property returns a date that accounts for the selected timezone.
        selected_datetime_tz_corrected() {
            // requested timezone offset from UTC
            let requested_offset_ms = this.timezone_offset * 60 * 60 * 1000 // convert hours to ms

            // user's timezone offset from UTC
            // NOTE: getTimezoneOffset returns minutes with the opposite sign of the conventional UTC offset display
            // So UTC-8 would return 480, while UTC+8 would return -480.
            // We multiply by (60 * 1000 * -1) to convert minutes to milliseconds with the normal +/- sign usage. 
            let user_offset_ms = new Date().getTimezoneOffset() * 60 * 1000 * -1  // convert minutes to ms

            // The difference between the user's tz and the requested tz
            let offset_difference_ms = user_offset_ms - requested_offset_ms

            // (this is because js dates use the user's timezone when created)
            return new Date(this.selected_datetime_naive.getTime() + offset_difference_ms)
        },
        ...mapState('site_config', ['global_config']),
        ...mapGetters('site_config', [ 'all_sites', ]),
    },
    watch: {
        site() {
            this.calculate_site_tz_offset()
        },
        timezone_selection() {
            this.calculate_site_tz_offset()
        },
        selected_datetime_tz_corrected(current_val) {
            this.$emit("input", current_val);
        },
    },
}
</script>

<style lang="scss" scoped>

</style>
