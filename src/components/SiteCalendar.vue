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

    <p class="subtitle">Future events for {{username}}</p>
    <user-events-table :user="user" />

</div>
</template>


<script>
import TheCalendar from '@/components/TheCalendar';
import UserEventsTable from '@/components/UserEventsTable'
import {mapGetters} from 'vuex'
import axios from 'axios'
import moment from 'moment'

export default {
    name: "SiteCalendar",
    props: ["sitecode"],
    components: { 
        TheCalendar,
        UserEventsTable,
    },
    data() {
        return {
            localTime: '-',
            siteTime: '-',
            utcTime: '-',

            // URL for the calendar backend api
            backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',
        }
    },
    created() {
        this.timeInterval = setInterval(this.updateTime, 1000)
        window.moment = moment; // use moment lib in browser devtools
    },
    destroyed() {
        clearInterval(this.timeInterval)
    },
    methods: {
        displayUtcTime(time) {
            return moment(time).utc().format("MMM D, kk:mm")
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
        username() {
            if (this.$auth.isAuthenticated) {
                return this.$auth.user.name
            }
            return '-'
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