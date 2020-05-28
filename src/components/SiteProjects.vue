<template>
<div style="margin-left: 2em;">

    <create-project-form :sitecode="sitecode" />
    <div style='height: 50px;' />

    <h1 class="subtitle"> Projects</h1>
    <user-projects-table :user="user"/>

    <h1 class="subtitle"> Reservations</h1>
    <user-events-table :user="user"/>

</div>
</template>


<script>
import UserEventsTable from '@/components/UserEventsTable'
import UserProjectsTable from '@/components/UserProjectsTable'
import CreateProjectForm from '@/components/CreateProjectForm'
import {mapGetters} from 'vuex'
import axios from 'axios'
import moment from 'moment'

export default {
    name: "SiteProjects",
    props: ["sitecode"],
    components: { 
        UserEventsTable,
        UserProjectsTable,
        CreateProjectForm,
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