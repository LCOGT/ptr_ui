<template> <div class="calendar-container">

    <!--button class="level-item button is-danger" @click="refreshCalendarView">refresh</button-->
    <!--button class="level-item button is-danger" @click="refreshIfUserIsScheduled">refresh current user is scheduled</button-->
    <!--button class="level-item button is-danger" @click="ping">ping</button-->
    <!--button class="level-item button is-danger" @click="updateNowIndicator">refresh</button-->
    <!--div>{{currentUserScheduled}}</div-->

    <FullCalendar
        class="demo-app-calendar"
        ref="fullCalendar"

        :views="fc_views"
        :defaultView="fc_defaultView"
        :header="fc_header"
        :slotDuration="fc_slotDuration"
        :slotLabelFormat="fc_slotLabelFormat"
        :eventTimeFormat="fc_eventTimeFormat"
        :timeZone="fc_timeZone"
        :min-time="fc_minTime"
        :max-time="fc_maxTime"
        :scrollTime="fc_scrollTime"
        :navLinks="fc_navLinks"
        :selectable="fc_selectable"
        :selectMirror="fc_selectMirror"
        :unselectAuto="fc_unselectAuto"
        :editable="fc_editable"
        :weekends="fc_weekends"
        :nowIndicator="fc_nowIndicator"
        :now="fc_now"
        :progressiveEventRendering="fc_progressiveEventRendering"
        :aspect-ratio="fc_aspectRatio"
        :themeSystem="fc_themeSystem"
        :schedulerLicenseKey="fc_schedulerLicenseKey"
        :eventSources="fc_eventSources"
        :eventRender="fc_eventRender"
        :resources="fc_resources"
        :plugins="fc_plugins"

        @loading="fc_isLoading"
        @select="newEventSelected"
        @eventClick="existingEventSelected"
    />

    <div class="level">
        <div class="level-left"/>
        <div class="level-right">
        <div class="level-item"/>
        <button v-if="isLoading" class="level-item button is-text is-loading">loading</button>
        </div>
    </div>


    <!-- popup for creating calendar events -->
    <b-modal :active.sync="eventEditorIsActive" :width="640" scroll="keep" @close="eventModalClosed">
        <div class="card">
            <div class="card-content">
            <calendar-event-editor 
            :eventDetails="activeEvent" 
            :isNewEvent="isNewEvent"
            :eventIsLoading="isLoading"
            @submit="submitButtonClicked"
            @cancel="cancelButtonClicked"
            @delete="deleteButtonClicked"
            @modify="modifyButtonClicked"
            />
            </div>
        </div>
    </b-modal>

</div> 
</template>

<script>

//{ import scripts (collapsible)
    import axios from 'axios';
    import moment from 'moment';
    import titleGenerator from '@/utils/titleGenerator';
    import SunCalc from 'suncalc';
    import {mapGetters} from 'vuex'

    import CalendarEventEditor from "@/components/CalendarEventEditor";
    import CalendarEventCreator from "@/components/CalendarEventCreator";

    import FullCalendar from "@fullcalendar/vue";
    import dayGridPlugin from "@fullcalendar/daygrid";
    import timeGridPlugin from "@fullcalendar/timegrid";
    import interactionPlugin from "@fullcalendar/interaction";
    import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
    import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
    import bootstrapPlugin from '@fullcalendar/bootstrap';
    import momentTimezonePlugin from '@fullcalendar/moment-timezone';
    import { toMoment } from '@fullcalendar/moment'; // only for formatting


    // must manually include stylesheets for each plugin
    import "@fullcalendar/core/main.css";
    import "@fullcalendar/daygrid/main.css";
    import "@fullcalendar/timegrid/main.css";
    import "@fullcalendar/resource-timeline/main.css";


    /* TODO:

    - merge the idea of 'resources' with the existing site-based event filtering

    - Convert stuff to UTC instead of local times. Somehow preserve notion of local time.

    */

//}

/*
TODO: 

  - save events in UTC so that modifications are possible from any timezone.
    (currently appending -8:00 to indicate PST )

  - retrieve site lat/lon in the twighlight calculator. Don't hardcode!

  - set min/max time (start/end) to a few hours before dusk.
    use utc offset + site tz offset 

*/


export default {
    name: 'TheCalendar',
    components: {
        FullCalendar, // make the <FullCalendar> tag available
        CalendarEventEditor,
        CalendarEventCreator,
    },
    props: [
        // The active site (resource) disaplyed in the calendar
        'calendarSite', 

        // Resources for fullcalendar (in our case they are observatories)
        'fc_resources'
    ],

    mounted() {
      console.log('timezone: '+ this.$refs.fullCalendar.getApi().dateEnv.timeZone)
      console.log('mounted')
      this.refreshCalendarView()
      this.nowIndicatorTimeInteval = setInterval( this.updateNowIndicator, 300000)
    },
    destroyed() {
      clearInterval(this.nowIndicatorTimeInterval)
    },

    watch: {
        calendarSite: function(val){
            console.log(`site changed to ${val}`)
            this.refreshCalendarView()
        },
        global_config() {
          this.refreshCalendarView()
        },
    },


    computed: {
        fullCalendarApi() {
          return this.$refs.fullCalendar.getApi();
        },
        fc_timeZone() {
          let tz = {
            "wmd": "America/Los_Angeles",
            "saf": "America/Denver",
            "ALI-sim": "Asia/Kashgar",
          }
          return  tz[this.calendarSite]
          //return 'local'
          //return 'America/Los_Angeles'
          //return "UTC"
        },

        fc_now() {
          return moment().tz(this.fc_timeZone).format()
        },

        // Return the list of sources that feed fullCalendar with events
        fc_eventSources() {
            return [
                // Astronomical twighlight events (computed locally)
                { events: this.getTwighlightEvents },
                // Events from dynamodb backend
                { events: this.fetchSiteEvents },
                // Now Indicator
                { events: this.getNowIndicator },
            ]
        },
        fc_selectable() { // whether to let user click and drag to select a time range.
            return this.$auth.isAuthenticated
        },
        ...mapGetters('site_config', [
          'site_config',
          'global_config',
          'site_latitude',
          'site_longitude',
        ]),

    },

    data: function() { return {

        /*===================================================/
        Configs for fullCalendar (anything with fc_ namespace)
        /===================================================*/
        fc_views: { // definitions for additional calendar views (eg. 10 day grid)
            resourceTimelineDay: {
                buttonText: ':15 slots',
                slotDuration: '00:15'
            },
            resourceTimelineTenDay: {
                type: 'resourceTimeline',
                duration: { days: 10 },
                buttonText: '10 days'
            }
        },
        fc_defaultView: "timeGridWeek", 
        fc_header: { // define the top row of buttons
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        fc_slotDuration: "00:30:00", // horizontal guides; affects event drag precision
        fc_eventTimeFormat: {hour: 'numeric', minute: '2-digit', hour12: false}, // 24hr times on events
        fc_slotLabelFormat: {hour: 'numeric', minute: '2-digit', hour12: false}, // 24hr time on axis labels
        //fc_timeZone: 'Asia/Kashgar',
        fc_minTime: "12:00:00", // start the day column at noon
        fc_maxTime: "36:00:00", // end the day column at noon for the following day
        fc_scrollTime: "16:00:00", // calendar default view starts at 4pm.
        fc_navLinks: false, // whether to enable clicking on a day to view that day only.
        fc_selectMirror: true, // whether to draw placeholder event while user is dragging
        fc_unselectAuto: false, // whether clicking elsewhere closes the current selection
        fc_editable: true, // whether events on calendar can be modified
        fc_weekends: true, // whether to show weekends in week view
        fc_nowIndicator:false, // whether to draw line indicating current time in grid views.
        fc_progressiveEventRendering: true,
        fc_aspectRatio: 1.2, // calendar window width/height
        fc_themeSystem: 'bootstrap', // uses bootstrap css (see <style> below)
        fc_schedulerLicenseKey: "GPL-My-Project-Is-Open-Source", // free use of scheduler/resources 
        // fullcalendar plugins
        fc_plugins: [
            // plugins must be defined in the JS
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin, // needed for dateClick
            bootstrapPlugin,
            resourceTimelinePlugin,
            resourceTimeGridPlugin,
            momentTimezonePlugin,
        ],

        // URL for the calendar backend api
        backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',

        // this informs what buttons appear in the modal event editor
        isNewEvent: false,

        // toggles the popup for setting calendar events
        eventEditorIsActive: false,

        // properties of the selected calendar event
        activeEvent: {},

        isLoading: false,

        currentUserScheduled: false,

    }},

    methods: {
      foo() {
        console.warn('bar')
      },

      async updateNowIndicator() {
        this.fullCalendarApi.unselect();
        this.fullCalendarApi.refetchEvents();
      },

      async getNowIndicator(info) {
        let now = [{
          start: moment().utc().format(),
          end: moment().utc().add('1', 'minutes').format(),
          rendering: "background",
          backgroundColor:"#ff0000",
          borderColor: "#ff0000",
          id: `fc-custom-now-indicator`,
          classNames: ["fc-now-indicator","fc-now-indicator-line"]
        }]
        return now
      },

      fc_eventRender() {
        let n = document.getElementsByClassName("fc-now-indicator")[0]
        if(n){
          //n.style['z-index'] = 15
          n.parentElement.style["z-index"] = "auto"
        }
      },

      
        // Displays loading spinner when calendar is fetching.

        fc_isLoading(val) { 
          this.isLoading = val; 
        },

        async getTwighlightEvents(info) {

            // Timer start
            let t0=performance.now()
            //console.log('info: ', info)

            // Get the time range we need to display in the UI.
            let firstDay = info.start.valueOf()
            let lastDay = info.end.valueOf()
            
            // List all the days we'll need to display
            let allDays = []
            let msPerDay = 1000*60*60*24

            // Generate events for 60 days before the start time to 60 days after.
            // This is to prevent the loading flicker when changing weeks.
            // note: this still only takes ~5ms to compute.
            for (let day=firstDay-(60*msPerDay); day<lastDay+(60*msPerDay); day+=msPerDay) {
                // Define each day by the timestamp a little after 1:01am to avoid DST hell
                allDays.push(day+3700000)
            }

            //console.log('allDays: ', allDays)

            // Generate the twighlight events (in proper fullCalendar format)
            // for one day column (evening-of and morning-after the given date.)
            function oneDayTwighlight(timestamp, latitude, longitude) {

                let events = {}

                let msPerDay = 1000*60*60*24
                let sunEvents = SunCalc.getTimes(new Date(timestamp), latitude, longitude)
                let nextDayEvents = SunCalc.getTimes(new Date(timestamp+msPerDay),latitude, longitude)
                let prevDayEvents = SunCalc.getTimes(new Date(timestamp-msPerDay),latitude, longitude)

                let currentDateObj = new Date(timestamp)

                // The event colors for the calendar
                //let daylightColor = "rgb(129, 212, 250)"
                //let civilColor = "rgb(52, 152, 219)"
                //let nauticalColor = "rgb(36, 113, 163)"
                //let astronomicalColor = "rgb(26, 82, 118)"

                let daylightColor = "#81D4FA"
                let civilColor = "#1B9FD8"
                let nauticalColor = "#166EA9"
                let astronomicalColor = "#084165"

                // This is redundant; replaced by the other daylight event (bottom)
                //events.daylightAfternoon = {
                    //title: "Afternoon Daylight",
                    //// Start daylight event at noon
                    //start: prevDayEvents.sunrise,
                    ////start: new Date(timestamp).setHours(12),
                    ////end: sunEvents.sunset,
                    //end: prevDayEvents.sunset,
                    //rendering: "background",
                    //backgroundColor: daylightColor,
                    //id: `${currentDateObj.toISOString()}_day_afternoon`,
                //}
                events.civilTwighlightDusk = {
                    title: "Civil Twighlight",
                    start: sunEvents.sunset,
                    end: sunEvents.dusk,
                    backgroundColor: civilColor,
                    rendering: "background",
                    id: `${currentDateObj.toISOString()}_civil_dusk`,
                }
                events.nauticalTwighlightDusk = {
                    title: "Nautical Twighlight",
                    start: sunEvents.dusk,
                    end: sunEvents.nauticalDusk,
                    backgroundColor: nauticalColor,
                    rendering: "background",
                    id: `${currentDateObj.toISOString()}_nautical_dusk`,
                }
                events.astronomicalTwighlightDusk = {
                    title: "Astronomical Twighlight",
                    start: sunEvents.nauticalDusk,
                    end: sunEvents.night,
                    backgroundColor: astronomicalColor,
                    rendering: "background",
                    id: `${currentDateObj.toISOString()}_astronomical_dusk`,
                }

                events.astronomicalTwighlightDawn = {
                    title: "Astronomical Twighlight",
                    start: nextDayEvents.nightEnd,
                    end: nextDayEvents.nauticalDawn,
                    backgroundColor: astronomicalColor,
                    rendering: "background",
                    id: `${currentDateObj.toISOString()}_astronomical_dawn`,
                }
                events.nauticalTwighlightDawn = {
                    title: "Nautical Twighlight",
                    start: nextDayEvents.nauticalDawn,
                    end: nextDayEvents.dawn,
                    backgroundColor: nauticalColor,
                    rendering: "background",
                    id: `${currentDateObj.toISOString()}_nautical_dawn`,
                }
                events.civilTwighlightDawn = {
                    title: "Civil Twighlight",
                    start:nextDayEvents.dawn,
                    end:nextDayEvents.sunrise,
                    backgroundColor: civilColor,
                    rendering: "background",
                    id: `${currentDateObj.toISOString()}_civil_dawn`,
                }
                events.daylightMorning = {
                    title: "Morning Daylight",
                    start: nextDayEvents.sunrise,
                    end: nextDayEvents.sunset,
                    //end: new Date(new Date(timestamp).setHours(36)),
                    rendering: "background",
                    backgroundColor: daylightColor,
                    id: `${currentDateObj.toISOString()}_day_morning`,
                }
                return events
            }

            // Collect all the events to display here
            let twighlightEvents = []

            let site_lat = parseFloat(this.site_config(this.calendarSite)['latitude'])
            let site_lng = parseFloat(this.site_config(this.calendarSite)['longitude'])


            // Compute events for each day. 
            allDays.map((day) => twighlightEvents.push(...Object.values(
              oneDayTwighlight(
                day, 
                site_lat,
                site_lng,
              )
            )))

            // Finish timer
            let t1=performance.now()
            let twighlightComputeTime = t1-t0
            if (twighlightComputeTime > 100) {
                console.warn('Slow computation of astro twighlight: ', twighlightComputeTime.toFixed(2)+'ms')
            }
            return twighlightEvents
        },

        async getConfigWithAuth() {
            let token, configWithAuth;
            try {
                token = await this.$auth.getTokenSilently(); 
            } catch(err) {
                console.error(err)
                console.warn('Did not acquire the needed token. Stopping request.')
                
                // small popup notification
                this.$buefy.toast.open({
                    duration: 5000,
                    message: "Oops! You aren't authorized to do that.",
                    position: 'is-bottom',
                    type: 'is-danger' ,
                })
            }

            return {
                'headers': {
                'Content-Type': 'application/json;charset=UTF-8',
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${token}`
                }
            }
        },

        handleNotAuthorizedResponse(error) {
            if (error.response) {
                // Request made and server responded
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                // small popup notification describing error
                this.$buefy.toast.open({
                    duration: 5000,
                    message: `${error.response.status} error: ${error.response.data}`,
                    position: 'is-bottom',
                    type: 'is-danger' ,
                })
            } else if (error.request) {
                // The request was made but no response was received
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
        },

        // Make a unique id for calendar events. UUID style. This is the pk in dynamodb.
        makeUniqueID() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        // Used when exiting event editor modals. Clear selections, close modal, and refresh events.
        async refreshCalendarView() {
            let calendarApi = this.$refs.fullCalendar.getApi();
            calendarApi.unselect();
            calendarApi.refetchEvents();
            this.eventEditorIsActive=false;
        },

        /*===================================================/
        Calendar Event Selection Handlers
        /===================================================*/
        /**
         *  This is run when a user clicks on the calendar to create a new event.
         */
        newEventSelected(event){ 
            //console.log(event)
            this.activeEvent.startStr = moment(event.startStr).utc().format()
            this.activeEvent.endStr = moment(event.endStr).utc().format()
            this.activeEvent.title = titleGenerator.makeTitle()
            this.activeEvent.creator = this.$auth.user.name
            this.activeEvent.id = this.makeUniqueID()
            this.activeEvent.site = this.calendarSite
            this.activeEvent.resourceId = this.calendarSite
            this.activeEvent.creator_id = this.$auth.user.sub

            console.log('actie event: ', this.activeEvent)
            this.isNewEvent = true; // setting for the modal event editor
            this.eventEditorIsActive= true;
        },
        /**
         *  This is run when a user clicks on an existing event in the calendar.
         */
        existingEventSelected(arg) {
            let event = arg.event;
            //console.log(event)
            this.activeEvent.id = event.id,
            this.activeEvent.startStr = moment(event.start).format();
            this.activeEvent.endStr = moment(event.end).format();
            this.activeEvent.title = event.title;
            this.activeEvent.creator = event.extendedProps.creator
            this.activeEvent.site = event.extendedProps.site
            this.activeEvent.resourceId = event.getResources()[0].id

            this.isNewEvent = false; // setting for the modal event editor
            this.eventEditorIsActive= true
        },


        /*===================================================/
        Calendar CRUD
        /===================================================*/
        /**testing */
        async refreshIfUserIsScheduled() {
          // Make request headers and include token. 
          // Requires user to be logged in.
          let header = await this.getConfigWithAuth();
          let url = `${this.backendUrl}/dev/is-user-scheduled`
          let user_id = this.$auth.user.sub
          let body = {
            "user_id": user_id,
            "site": this.calendarSite,
            "time": moment().utc().format()
          }
          let response = await axios.post(url, body, header)
          console.log('userIsScheduled response: ',response)
          this.currentUserScheduled = response.data
        },
        async ping() {
          let url = 'https://api.photonranch.org/api/ping/helloping'
          let header = await this.getConfigWithAuth();
          let body = {}
          console.log(await axios.post(url, body, header))
        },

        /**
         * When the user clicks submit, event details are sent to the backend.
         */
        async submitButtonClicked(newEvent) {
          //console.log('new event creation: ', newEvent)

            // Make request headers and include token. 
            // Requires user to be logged in.
            let config = await this.getConfigWithAuth();

            let url = `${this.backendUrl}/dev/newevent`
            let eventToPost = {
                "event_id": newEvent.id,
                "start": moment(newEvent.startStr).utc().format(),
                "end": moment(newEvent.endStr).utc().format(),
                "creator": newEvent.creator,
                "creator_id": newEvent.creator_id,
                "site": newEvent.site,
                "title": newEvent.title,
                "resourceId": newEvent.resourceId,
                "rendering": newEvent.rendering
            }
            axios.post(url, eventToPost, config)
                .then(res => {
                    this.isLoading = true;
                    this.refreshCalendarView()
                })
                .catch(error => {
                    this.eventEditorIsActive= false;
                    this.handleNotAuthorizedResponse(error)
                })

            // refresh to show update and close modal
        },
        /**
         * Close the event modal and deselect its associated calendar event.
         */
        cancelButtonClicked() {
            let calendarApi = this.$refs.fullCalendar.getApi();
            calendarApi.unselect()
            this.eventEditorIsActive = false;
        },
        /**
         * Replicates the 'cancelButtonClicked' function for the case when the user
         * closes the modal window by clicking outside of it.
         */
        eventModalClosed() {
            let calendarApi = this.$refs.fullCalendar.getApi();
            calendarApi.unselect()
        },
        /**
         * Delete the selected calendar event from the backend database
         */
        async deleteButtonClicked(eventToDelete) {
            let config = await this.getConfigWithAuth();
            let url = `${this.backendUrl}/dev/delete`
            //console.log('event to delete: ', eventToDelete)
            let body = {
                "event_id": eventToDelete.id,
                "start": moment(eventToDelete.startStr).utc().format(),
            }
            let res = await axios.post(url, body, config)
                .then(res => {
                    this.isLoading = true;
                    this.refreshCalendarView()
                })
                .catch(error => {
                    this.eventEditorIsActive= false;
                    this.handleNotAuthorizedResponse(error)
                })
        },

        async modifyButtonClicked(events) {
            let initialEvent = events.initialEvent
            let modifiedEvent = events.modifiedEvent

            // Maybe we don't need to update anything?
            if (JSON.stringify(initialEvent) == JSON.stringify(modifiedEvent)){
                this.refreshCalendarView()
                return;
            }

            // Make request headers and include token. 
            // Requires user to be logged in.
            let config = await this.getConfigWithAuth();
            let url = `${this.backendUrl}/dev/modifyevent`
            let theModifiedEvent = {
                "event_id":modifiedEvent.id,
                "start": moment(modifiedEvent.startStr).utc().format(),
                "end":  moment(modifiedEvent.endStr).utc().format(),
                "creator":modifiedEvent.creator,
                "creator_id":modifiedEvent.creator_id,
                "site":modifiedEvent.site,
                "title":modifiedEvent.title,
                "resourceId":modifiedEvent.resourceId,
                "rendering":modifiedEvent.rendering
            }
            let theInitialEvent = {
                "event_id":initialEvent.id,
                "start": moment(initialEvent.startStr).utc().format(),
                "end": moment(initialEvent.endStr).utc().format(),
                "creator":initialEvent.creator,
                "creator_id":initialEvent.creator_id,
                "site":initialEvent.site,
                "title":initialEvent.title,
                "resourceId":initialEvent.resourceId,
                "rendering":initialEvent.rendering
            }
            //console.log(theModifiedEvent)
            //console.log(theInitialEvent)
            let body = {
                originalEvent: theInitialEvent,
                modifiedEvent: theModifiedEvent,
            }

            axios.post(url,body,config)
                .then(res => {
                    this.isLoading = true;
                    this.refreshCalendarView()
                })
                .catch(error => {
                    this.eventEditorIsActive= false;
                    this.handleNotAuthorizedResponse(error)
                })
        },


        /*===================================================/
        Fetching Calendar Events
        /===================================================*/
        async fetchSiteEvents(fetchInfo) {

            // TODO: we don't want to define the site from the select box
            // on this page.
            let site = this.calendarSite
            const url = `${this.backendUrl}/dev/siteevents`
            const options = {
                'headers': {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                }
            }
            let body = {
                "site": site,
                "start": fetchInfo.startStr,
                "end": fetchInfo.endStr,
            }

            let resp = await axios.post(url, body, options)

            // Format the returned items to work nicely with fullcalendar.
            let formatted_events = resp.data.table_response.Items.map(obj => {
                let fObj = {
                'start': obj.start,
                'end': obj.end,
                'id': obj.event_id,
                'title': obj.title,
                'creator': obj.creator,
                'site': obj.site,
                'resourceId': obj.resourceId,
                'rendering': obj.rendering,
                }
                return fObj
            })
            return formatted_events
        },
    },

};
</script>

<!-- TODO: reduce the bootstrap css (below) to the minimum required for button groups. -->
<style lang='scss'>

/* the line showing the current time */
.fc-now-indicator.fc-now-indicator-line {
  border-color: rgb(255, 0, 0);
  z-index: 15;
  opacity: 1;
}
.fc-now-indicator.fc-now-indicator-arrow {
  border-color: rgb(255, 0, 0);
  z-index: 15;
  opacity: 1;
}
/*@import url("https://bootswatch.com/4/darkly/bootstrap.min.css");*/
.demo-app {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
.fc table * {
  border-color:#444;
}

.demo-app-top {
  margin: 0 0 3em;
}

.calendar-container {
  margin: 0 auto;
}


.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.sr-only-focusable:active,
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
}
[role="button"] {
  cursor: pointer;
}
.btn {
  display: inline-block;
  margin-bottom: 0;
  font-weight: normal;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  -ms-touch-action: manipulation;
  touch-action: manipulation;
  cursor: pointer;
  background-image: none;
  border: 1px solid transparent;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  border-radius: 4px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
.btn:focus,
.btn:active:focus,
.btn.active:focus,
.btn.focus,
.btn:active.focus,
.btn.active.focus {
  outline: 5px auto -webkit-focus-ring-color;
  outline-offset: -2px;
}
.btn:hover,
.btn:focus,
.btn.focus {
  color: #333333;
  text-decoration: none;
}
.btn:active,
.btn.active {
  background-image: none;
  outline: 0;
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.btn.disabled,
.btn[disabled],
fieldset[disabled] .btn {
  cursor: not-allowed;
  filter: alpha(opacity=65);
  opacity: 0.65;
  -webkit-box-shadow: none;
  box-shadow: none;
}
a.btn.disabled,
fieldset[disabled] a.btn {
  pointer-events: none;
}
.btn-default {
  color: #333333;
  background-color: #ffffff;
  border-color: #cccccc;
}
.btn-default:focus,
.btn-default.focus {
  color: #333333;
  background-color: #e6e6e6;
  border-color: #8c8c8c;
}
.btn-default:hover {
  color: #333333;
  background-color: #e6e6e6;
  border-color: #adadad;
}
.btn-default:active,
.btn-default.active,
.open > .dropdown-toggle.btn-default {
  color: #333333;
  background-color: #e6e6e6;
  background-image: none;
  border-color: #adadad;
}
.btn-default:active:hover,
.btn-default.active:hover,
.open > .dropdown-toggle.btn-default:hover,
.btn-default:active:focus,
.btn-default.active:focus,
.open > .dropdown-toggle.btn-default:focus,
.btn-default:active.focus,
.btn-default.active.focus,
.open > .dropdown-toggle.btn-default.focus {
  color: #333333;
  background-color: #d4d4d4;
  border-color: #8c8c8c;
}
.btn-default.disabled:hover,
.btn-default[disabled]:hover,
fieldset[disabled] .btn-default:hover,
.btn-default.disabled:focus,
.btn-default[disabled]:focus,
fieldset[disabled] .btn-default:focus,
.btn-default.disabled.focus,
.btn-default[disabled].focus,
fieldset[disabled] .btn-default.focus {
  background-color: #ffffff;
  border-color: #cccccc;
}
.btn-default .badge {
  color: #ffffff;
  background-color: #333333;
}
.btn-primary {
  color: #ffffff;
  background-color: #337ab7;
  border-color: #2e6da4;
}
.btn-primary:focus,
.btn-primary.focus {
  color: #ffffff;
  background-color: #286090;
  border-color: #122b40;
}
.btn-primary:hover {
  color: #ffffff;
  background-color: #286090;
  border-color: #204d74;
}
.btn-primary:active,
.btn-primary.active,
.open > .dropdown-toggle.btn-primary {
  color: #ffffff;
  background-color: #286090;
  background-image: none;
  border-color: #204d74;
}
.btn-primary:active:hover,
.btn-primary.active:hover,
.open > .dropdown-toggle.btn-primary:hover,
.btn-primary:active:focus,
.btn-primary.active:focus,
.open > .dropdown-toggle.btn-primary:focus,
.btn-primary:active.focus,
.btn-primary.active.focus,
.open > .dropdown-toggle.btn-primary.focus {
  color: #ffffff;
  background-color: #204d74;
  border-color: #122b40;
}
.btn-primary.disabled:hover,
.btn-primary[disabled]:hover,
fieldset[disabled] .btn-primary:hover,
.btn-primary.disabled:focus,
.btn-primary[disabled]:focus,
fieldset[disabled] .btn-primary:focus,
.btn-primary.disabled.focus,
.btn-primary[disabled].focus,
fieldset[disabled] .btn-primary.focus {
  background-color: #337ab7;
  border-color: #2e6da4;
}
.btn-primary .badge {
  color: #337ab7;
  background-color: #ffffff;
}
.btn-success {
  color: #ffffff;
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.btn-success:focus,
.btn-success.focus {
  color: #ffffff;
  background-color: #449d44;
  border-color: #255625;
}
.btn-success:hover {
  color: #ffffff;
  background-color: #449d44;
  border-color: #398439;
}
.btn-success:active,
.btn-success.active,
.open > .dropdown-toggle.btn-success {
  color: #ffffff;
  background-color: #449d44;
  background-image: none;
  border-color: #398439;
}
.btn-success:active:hover,
.btn-success.active:hover,
.open > .dropdown-toggle.btn-success:hover,
.btn-success:active:focus,
.btn-success.active:focus,
.open > .dropdown-toggle.btn-success:focus,
.btn-success:active.focus,
.btn-success.active.focus,
.open > .dropdown-toggle.btn-success.focus {
  color: #ffffff;
  background-color: #398439;
  border-color: #255625;
}
.btn-success.disabled:hover,
.btn-success[disabled]:hover,
fieldset[disabled] .btn-success:hover,
.btn-success.disabled:focus,
.btn-success[disabled]:focus,
fieldset[disabled] .btn-success:focus,
.btn-success.disabled.focus,
.btn-success[disabled].focus,
fieldset[disabled] .btn-success.focus {
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.btn-success .badge {
  color: #5cb85c;
  background-color: #ffffff;
}
.btn-info {
  color: #ffffff;
  background-color: #5bc0de;
  border-color: #46b8da;
}
.btn-info:focus,
.btn-info.focus {
  color: #ffffff;
  background-color: #31b0d5;
  border-color: #1b6d85;
}
.btn-info:hover {
  color: #ffffff;
  background-color: #31b0d5;
  border-color: #269abc;
}
.btn-info:active,
.btn-info.active,
.open > .dropdown-toggle.btn-info {
  color: #ffffff;
  background-color: #31b0d5;
  background-image: none;
  border-color: #269abc;
}
.btn-info:active:hover,
.btn-info.active:hover,
.open > .dropdown-toggle.btn-info:hover,
.btn-info:active:focus,
.btn-info.active:focus,
.open > .dropdown-toggle.btn-info:focus,
.btn-info:active.focus,
.btn-info.active.focus,
.open > .dropdown-toggle.btn-info.focus {
  color: #ffffff;
  background-color: #269abc;
  border-color: #1b6d85;
}
.btn-info.disabled:hover,
.btn-info[disabled]:hover,
fieldset[disabled] .btn-info:hover,
.btn-info.disabled:focus,
.btn-info[disabled]:focus,
fieldset[disabled] .btn-info:focus,
.btn-info.disabled.focus,
.btn-info[disabled].focus,
fieldset[disabled] .btn-info.focus {
  background-color: #5bc0de;
  border-color: #46b8da;
}
.btn-info .badge {
  color: #5bc0de;
  background-color: #ffffff;
}
.btn-warning {
  color: #ffffff;
  background-color: #f0ad4e;
  border-color: #eea236;
}
.btn-warning:focus,
.btn-warning.focus {
  color: #ffffff;
  background-color: #ec971f;
  border-color: #985f0d;
}
.btn-warning:hover {
  color: #ffffff;
  background-color: #ec971f;
  border-color: #d58512;
}
.btn-warning:active,
.btn-warning.active,
.open > .dropdown-toggle.btn-warning {
  color: #ffffff;
  background-color: #ec971f;
  background-image: none;
  border-color: #d58512;
}
.btn-warning:active:hover,
.btn-warning.active:hover,
.open > .dropdown-toggle.btn-warning:hover,
.btn-warning:active:focus,
.btn-warning.active:focus,
.open > .dropdown-toggle.btn-warning:focus,
.btn-warning:active.focus,
.btn-warning.active.focus,
.open > .dropdown-toggle.btn-warning.focus {
  color: #ffffff;
  background-color: #d58512;
  border-color: #985f0d;
}
.btn-warning.disabled:hover,
.btn-warning[disabled]:hover,
fieldset[disabled] .btn-warning:hover,
.btn-warning.disabled:focus,
.btn-warning[disabled]:focus,
fieldset[disabled] .btn-warning:focus,
.btn-warning.disabled.focus,
.btn-warning[disabled].focus,
fieldset[disabled] .btn-warning.focus {
  background-color: #f0ad4e;
  border-color: #eea236;
}
.btn-warning .badge {
  color: #f0ad4e;
  background-color: #ffffff;
}
.btn-danger {
  color: #ffffff;
  background-color: #d9534f;
  border-color: #d43f3a;
}
.btn-danger:focus,
.btn-danger.focus {
  color: #ffffff;
  background-color: #c9302c;
  border-color: #761c19;
}
.btn-danger:hover {
  color: #ffffff;
  background-color: #c9302c;
  border-color: #ac2925;
}
.btn-danger:active,
.btn-danger.active,
.open > .dropdown-toggle.btn-danger {
  color: #ffffff;
  background-color: #c9302c;
  background-image: none;
  border-color: #ac2925;
}
.btn-danger:active:hover,
.btn-danger.active:hover,
.open > .dropdown-toggle.btn-danger:hover,
.btn-danger:active:focus,
.btn-danger.active:focus,
.open > .dropdown-toggle.btn-danger:focus,
.btn-danger:active.focus,
.btn-danger.active.focus,
.open > .dropdown-toggle.btn-danger.focus {
  color: #ffffff;
  background-color: #ac2925;
  border-color: #761c19;
}
.btn-danger.disabled:hover,
.btn-danger[disabled]:hover,
fieldset[disabled] .btn-danger:hover,
.btn-danger.disabled:focus,
.btn-danger[disabled]:focus,
fieldset[disabled] .btn-danger:focus,
.btn-danger.disabled.focus,
.btn-danger[disabled].focus,
fieldset[disabled] .btn-danger.focus {
  background-color: #d9534f;
  border-color: #d43f3a;
}
.btn-danger .badge {
  color: #d9534f;
  background-color: #ffffff;
}
.btn-link {
  font-weight: 400;
  color: #337ab7;
  border-radius: 0;
}
.btn-link,
.btn-link:active,
.btn-link.active,
.btn-link[disabled],
fieldset[disabled] .btn-link {
  background-color: transparent;
  -webkit-box-shadow: none;
  box-shadow: none;
}
.btn-link,
.btn-link:hover,
.btn-link:focus,
.btn-link:active {
  border-color: transparent;
}
.btn-link:hover,
.btn-link:focus {
  color: #23527c;
  text-decoration: underline;
  background-color: transparent;
}
.btn-link[disabled]:hover,
fieldset[disabled] .btn-link:hover,
.btn-link[disabled]:focus,
fieldset[disabled] .btn-link:focus {
  color: #777777;
  text-decoration: none;
}
.btn-lg,
.btn-group-lg > .btn {
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.3333333;
  border-radius: 6px;
}
.btn-sm,
.btn-group-sm > .btn {
  padding: 5px 10px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.btn-xs,
.btn-group-xs > .btn {
  padding: 1px 5px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
}
.btn-block {
  display: block;
  width: 100%;
}
.btn-block + .btn-block {
  margin-top: 5px;
}
input[type="submit"].btn-block,
input[type="reset"].btn-block,
input[type="button"].btn-block {
  width: 100%;
}
.btn-group,
.btn-group-vertical {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}
.btn-group > .btn,
.btn-group-vertical > .btn {
  position: relative;
  float: left;
}
.btn-group > .btn:hover,
.btn-group-vertical > .btn:hover,
.btn-group > .btn:focus,
.btn-group-vertical > .btn:focus,
.btn-group > .btn:active,
.btn-group-vertical > .btn:active,
.btn-group > .btn.active,
.btn-group-vertical > .btn.active {
  z-index: 2;
}
.btn-group .btn + .btn,
.btn-group .btn + .btn-group,
.btn-group .btn-group + .btn,
.btn-group .btn-group + .btn-group {
  margin-left: -1px;
}
.btn-toolbar {
  margin-left: -5px;
}
.btn-toolbar .btn,
.btn-toolbar .btn-group,
.btn-toolbar .input-group {
  float: left;
}
.btn-toolbar > .btn,
.btn-toolbar > .btn-group,
.btn-toolbar > .input-group {
  margin-left: 5px;
}
.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {
  border-radius: 0;
}
.btn-group > .btn:first-child {
  margin-left: 0;
}
.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.btn-group > .btn:last-child:not(:first-child),
.btn-group > .dropdown-toggle:not(:first-child) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.btn-group > .btn-group {
  float: left;
}
.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {
  border-radius: 0;
}
.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,
.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
.btn-group .dropdown-toggle:active,
.btn-group.open .dropdown-toggle {
  outline: 0;
}
.btn-group > .btn + .dropdown-toggle {
  padding-right: 8px;
  padding-left: 8px;
}
.btn-group > .btn-lg + .dropdown-toggle {
  padding-right: 12px;
  padding-left: 12px;
}
.btn-group.open .dropdown-toggle {
  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
}
.btn-group.open .dropdown-toggle.btn-link {
  -webkit-box-shadow: none;
  box-shadow: none;
}
.btn .caret {
  margin-left: 0;
}
.btn-lg .caret {
  border-width: 5px 5px 0;
  border-bottom-width: 0;
}
.dropup .btn-lg .caret {
  border-width: 0 5px 5px;
}
.btn-group-vertical > .btn,
.btn-group-vertical > .btn-group,
.btn-group-vertical > .btn-group > .btn {
  display: block;
  float: none;
  width: 100%;
  max-width: 100%;
}
.btn-group-vertical > .btn-group > .btn {
  float: none;
}
.btn-group-vertical > .btn + .btn,
.btn-group-vertical > .btn + .btn-group,
.btn-group-vertical > .btn-group + .btn,
.btn-group-vertical > .btn-group + .btn-group {
  margin-top: -1px;
  margin-left: 0;
}
.btn-group-vertical > .btn:not(:first-child):not(:last-child) {
  border-radius: 0;
}
.btn-group-vertical > .btn:first-child:not(:last-child) {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.btn-group-vertical > .btn:last-child:not(:first-child) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {
  border-radius: 0;
}
.btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,
.btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.btn-group-justified {
  display: table;
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
}
.btn-group-justified > .btn,
.btn-group-justified > .btn-group {
  display: table-cell;
  float: none;
  width: 1%;
}
.btn-group-justified > .btn-group .btn {
  width: 100%;
}
.btn-group-justified > .btn-group .dropdown-menu {
  left: auto;
}
[data-toggle="buttons"] > .btn input[type="radio"],
[data-toggle="buttons"] > .btn-group > .btn input[type="radio"],
[data-toggle="buttons"] > .btn input[type="checkbox"],
[data-toggle="buttons"] > .btn-group > .btn input[type="checkbox"] {
  position: absolute;
  clip: rect(0, 0, 0, 0);
  pointer-events: none;
}
.clearfix:before,
.clearfix:after,
.btn-toolbar:before,
.btn-toolbar:after,
.btn-group-vertical > .btn-group:before,
.btn-group-vertical > .btn-group:after {
  display: table;
  content: " ";
}
.clearfix:after,
.btn-toolbar:after,
.btn-group-vertical > .btn-group:after {
  clear: both;
}
.center-block {
  display: block;
  margin-right: auto;
  margin-left: auto;
}
.pull-right {
  float: right !important;
}
.pull-left {
  float: left !important;
}
.hide {
  display: none !important;
}
.show {
  display: block !important;
}
.invisible {
  visibility: hidden;
}
.text-hide {
  font: 0/0 a;
  color: transparent;
  text-shadow: none;
  background-color: transparent;
  border: 0;
}
.hidden {
  display: none !important;
}
.affix {
  position: fixed;
}
</style>
