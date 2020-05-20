<template><div>

    <div class="level">
        <div class="level-left">
            <div class="level-item" style="display:flex; flex-direction:column; align-items: flex-start;">
                <div>Time at {{sitecode.toUpperCase()}}:</div>
                <div class="time-display">{{siteTime}}</div>
            </div>
        </div>
        <div class="level-right">
            <div class="level-item" style="display:flex; flex-direction:column; align-items: flex-start;">
                <div>UTC Time:</div>
                <div class="time-display">{{utcTime}}</div>
            </div>
        </div>
    </div>
    <the-calendar :calendarSite="sitecode" :fc_resources="listOfObservatories"/>

    <!--button class="button" @click="getUserEvents">get user events</button-->

    <p class="title">Events for {{$auth.user.name}}</p>
    <b-table
        :data="user_events"
        :narrowed="isNarrowed"
        :loading="isLoading"
        :empty="user_events=={}"
        :focusable="isFocusable"
        :paginated="true"
        :per-page="20"
        class="no-margin"
        >
        <template slot-scope="props">
            <b-table-column field="site" label="site">
                {{ props.row.site }}
            </b-table-column>

            <b-table-column field="duration" label="duration">
                {{ eventDuration(props.row) }}
            </b-table-column>

            <b-table-column field="start" label="start">
                {{ formatTimeDisplay(props.row.start) }} 
            </b-table-column>

            <b-table-column field="end" label="end">
                {{ formatTimeDisplay(props.row.end) }} 
            </b-table-column>

            <b-table-column field="event name" label="event name">
                {{ props.row.title}} 
            </b-table-column>


            <!--b-table-column field="fits_download" label="Fits Download">
                <a :href="props.row.fits13_url">download</a>
            </b-table-column>

            <b-table-column field="observation" label="Observation Time" centered>
                    {{ new Date(props.row.capture_date).toUTCString() }}
            </b-table-column-->
        </template>

        <template slot="empty">
            <section class="section">
                <div class="content has-text-grey has-text-centered">
                    <p>
                        <b-icon
                            icon="emoticon-sad"
                            size="is-large">
                        </b-icon>
                    </p>
                    <p>Nothing here.</p>
                </div>
            </section>
        </template>
    </b-table>

</div>
</template>


<script>
import TheCalendar from '@/components/TheCalendar';
import {mapGetters} from 'vuex'
import axios from 'axios'
import moment from 'moment'

export default {
    name: "SiteCalendar",
    props: ["sitecode"],
    components: { 
        TheCalendar,
    },
    data() {
        return {
            localTime: '-',
            siteTime: '-',
            utcTime: '-',

            // URL for the calendar backend api
            backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',

            // Events Table Settings
            isEmpty: true,
            isNarrowed: true,
            isFocusable:true,
            isLoading: false,
            isSelectable: true,

            user_events: {},
        }
    },
    created() {
        this.timeInterval = setInterval(this.updateTime, 1000)
        window.moment = moment; // use moment lib in browser devtools

        this.getUserEvents()
    },
    beforeDestroy() {
        clearInterval(this.timeInterval)
    },
    watch: {

        user() {
            console.log('user: ', this.user)
            this.getUserEvents()
        },

    },
    methods: {
        formatTimeDisplay(time) {
            return moment(time).tz(this.timezone).format("MMM D, kk:mm")
        },
        eventDuration(event) {
            var start = moment(event.start)
            var end = moment(event.end)

            var ms = end.diff(start);
            var d = moment.duration(ms);
            var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
            return s
        },
        getUserEvents() {
            this.isLoading = true
            const url = `${this.backendUrl}/dev/user-events-ending-after-time`
            let time = moment().utc().format()
            let user = this.$auth.user.sub

            const header = {
                'headers': {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                }
            }
            let body = {
                "site": this.sitecode,
                "time": time,
                "user_id": user,
            }
            axios.post(url, body, header).then(response => {
                this.isLoading = false
                this.user_events = response.data
            }).catch(err => {
                this.isLoading = false
                console.log("error fetching user events: ", err)
            })

        },
        updateTime() {
            this.localTime = moment().format('MMM D, kk:mm')
            this.siteTime = moment().tz(this.timezone).format('MMM D, kk:mm')
            this.utcTime = moment().utc().format('MMM D, kk:mm')
        },
    },
    computed: {
        ...mapGetters('site_config', [
            'site_config',
            'global_config',
        ]), 

        user() {
            return this.$auth.user
        },

        timezone() {
          let tz = {
            "wmd": "America/Los_Angeles",
            "saf": "America/Denver",
            "ALI-sim": "Asia/Kashgar",
          }
          return  tz[this.sitecode]
        },

        // Calendar Resources (Observatories) to feed into the calendar component
        listOfObservatories() {
            let all_obs = []
            for (let a_site in this.global_config) {
                let o = this.global_config[a_site]
                all_obs.push({
                    'id': o.site,
                    'title': o.name,
                    'eventColor': '#7d12ff',
                    //'eventBackgroundColor': '#ab20fd',
                    'eventBorderColor': '#200589',
                    'eventTextColor': '#fbf8fd',
                    'eventClassNames': '',
                    'eventOverlap': false, // defines whether events are allowed to overlap
                    'eventConstraint': '',
                    'eventAllow': '',
                    'businessHours': '',
                    'children': '',
                    'parentId': '',
                    'anyOtherPropsHere': 'call from key extendedProps of this resource object',
                })
            }
            return all_obs
        },
    },
    
}

</script>


<style scoped>
.time-display {
    font-size: 1.3em;
}
</style>