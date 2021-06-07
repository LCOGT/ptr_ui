<template>
    
  <!--b-modal :active="showSiteEvents"-->
    <div class="card">
      <div class="card-content">
            <div style="display:flex; justify-content: space-between; padding-bottom: 1em;">
                <p class="title" style="overflow-wrap: anywhere; margin-left: 10px;">{{sitecode}} events: </p>

                <div style="display: flex;">
                    <div>
                        <p>Display Time</p>
                        <b-select v-model="time_display_format">
                            <option value="user">User</option>
                            <option value="observatory">Observatory</option>
                        </b-select>
                    </div>

                    <div style="padding-left: 10px;">
                        <p>&nbsp;</p>
                        <button class="button" @click="getSiteEvents">refresh</button>
                    </div>
                </div>
            </div>

            <b-table
                :mobile-cards="false" 
                :narrowed="true"
                :data="site_events"
                :columns="columns"
                :hoverable="true"
                default-sort="unix"
                style="width: auto; flex:0"
                >
            </b-table>
      
        </div>
    </div>
  <!--/b-modal-->
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import {mapState} from 'vuex'
export default {
    name: 'SiteEventsModal',
    props: ['sitecode'],
    beforeMount() {
        this.getSiteEvents()
    },
    watch: {
        sitecode() {
            this.getSiteEvents()
        }
    },
    computed: {
        ...mapState('site_config', ['global_config']),
        timezone() { return this.global_config[this.sitecode].TZ_database_name},

        columns() {
            return [
                {
                    field: 'key',
                    label: 'key',
                    searchable:false,
                },
                {
                    field: 'time',
                    label: 'time',
                    searchable: false,
                    visible: false,
                    sortable: true,
                },
                {
                    field: 'UTC',
                    label: 'UTC',
                    searchable: false,
                    sortable: true,
                },
                {
                    field: 'user',
                    label: 'user',
                    visible: this.time_display_format == 'user',
                    sortable: true,
                },
                {
                    field: 'observatory',
                    label: 'observatory',
                    visible: this.time_display_format == 'observatory',
                    sortable: true,
                },
                {
                    field: 'unix',
                    label: 'unix',
                    visible: false,
                    sortable: true,
                },
            ]
        },
    },
    data() {
        return {
            site_events: JSON.parse(window.localStorage.getItem(`${this.sitecode}Events`)) || [],
            time_display_format: "user", // 'user' or 'observatory',
        }
    },
    methods: {
        async getSiteEvents() {
            let url = `https://api.photonranch.org/api/events?site=${this.sitecode}`
            let site_events = await axios.get(url)
            site_events = site_events.data

            // Function to convert from dublin julian days to unix time
            // Subtract difference in JD start vs unix start, then mulitply by 
            // the number of miliseconds in a day.
            let jd2unix = t => (t - 2440587.5) * 86400 * 1000

            let tableData = []

            let formatString = 'MM-DD ___ HH:mm'

            for (const property in site_events) {
                let time = moment(jd2unix(site_events[property]))
                tableData.push({
                    key: property.toLowerCase(),
                    time: time.format('HH:mm'),
                    user: time.format(formatString),
                    UTC: time.tz('utc').format(formatString),
                    observatory: this.timezone ? time.tz(this.timezone).format(formatString) : "unknown",
                    unix: time.unix(),
                })
            }
            this.site_events = tableData
            window.localStorage.setItem(`${this.sitecode}Events`, JSON.stringify(tableData))
        },
    },
}
</script>

<style scoped>

</style>