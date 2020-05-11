<template><div>

    <div>The time at {{sitecode}} is: {{siteTime}}</div>
    <the-calendar :calendarSite="sitecode" :fc_resources="listOfObservatories"/>

</div>
</template>


<script>
import TheCalendar from '@/components/TheCalendar';
import {mapGetters} from 'vuex'
import moment from 'moment'

export default {
    name: "SiteCalendar",
    props: ["sitecode"],
    components: { 
        TheCalendar,
    },
    data() {
        return {
            localTime: '',
            siteTime: '',
        }
    },
    mounted() {
        this.timeInterval = setInterval(this.updateTime, 1000)
        window.moment = moment; // use moment lib in browser devtools
    },
    beforeDestroy() {
        clearInterval(this.timeInterval)
    },
    methods: {
        updateTime() {
            this.localTime = moment().format('dddd, MMM D, kk:m')
            this.siteTime = moment().tz(this.timezone).format('dddd, MMM D YYYY, k:m')
        },
    },
    computed: {
        ...mapGetters('site_config', [
            'site_config',
            'global_config',
        ]), 
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
                console.log('a_site: ',a_site)
                console.log(this.global_config)
                let o = this.global_config[a_site]
                console.log('o: ', o)
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
            console.log(all_obs)
            return all_obs
        },
    },
    
}

</script>


<style scoped>
</style>