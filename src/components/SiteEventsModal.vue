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
                        <button class="button" @click="getSiteEvents('configg')">refresh</button>
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
            <div v-if="site_events.length == 0" class="empty-warning">
                No events found in the site config.
            </div>
      
        </div>
    </div>
  <!--/b-modal-->
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import {mapGetters} from 'vuex'
export default {
    name: 'SiteEventsModal',
    props: ['sitecode'],
    beforeMount() {
        this.getSiteEvents('config')
    },
    watch: {
        sitecode() {
            this.getSiteEvents('config')
        }
    },
    computed: {
        ...mapGetters('site_config', {
            config_site_events: 'site_events',
            timezone: 'timezone',
        }),

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
            site_events: [],
            time_display_format: "user", // 'user' or 'observatory',
        }
    },
    methods: {
        async getSiteEvents(source="config") {

            let site_events

            // The site events are also calculated at site and sent in the config. 
            // So to avoid overengineering an unneeeded solution, let's just use that
            // instead of the (now outdated) calculations running in AWS. 2021-09-27
            if (source == "config") {
                site_events = {...this.config_site_events}
                // convert dublin julian days to julian days to match the output of the photonranch-api results
                Object.keys(site_events).forEach(key => site_events[key] += 2415020)  
            } else {
                let url = `https://api.photonranch.org/api/events?site=${this.sitecode}`
                site_events = await axios.get(url)
                site_events = site_events.data
            }

            // Function to convert from julian days to unix time
            // Subtract difference in JD start vs unix start, then mulitply by 
            // the number of miliseconds in a day.
            let jd2unix = t => (t - 2440587.5) * 86400 * 1000

            let tableData = []

            // Configure the time display format
            let formatString = 'YYYY/MM/DD HH:mm:ss'

            for (const property in site_events) {
                let time = moment(jd2unix(site_events[property]))
                // Exclude the 'day_directory' which is not actually a site event
                if (property != "day_directory") {
                    tableData.push({
                        key: property.toLowerCase(),
                        time: time.format('HH:mm:ss'),
                        user: time.format(formatString),
                        UTC: time.tz('utc').format(formatString),
                        observatory: this.timezone ? time.tz(this.timezone).format(formatString) : "unknown",
                        unix: time.unix(),
                    })
                }
            }
            this.site_events = tableData
        },
    },
}
</script>

<style scoped>
.empty-warning {
    width: 100%;
    margin: 10px 0;
    color: rgb(255, 239, 20);
    text-align: center;
}

</style>