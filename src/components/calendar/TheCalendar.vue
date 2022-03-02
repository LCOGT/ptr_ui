<template>
  <div class="calendar-container">

    <!-- for development -->
    <!--button class="level-item button is-danger" @click="refreshCalendarView">refresh</button-->
    <!--button class="level-item button is-danger" @click="refreshIfUserIsScheduled">refresh current user is scheduled</button-->
    <!--button class="level-item button is-danger" @click="ping">ping</button-->
    <!--button class="level-item button is-danger" @click="updateNowIndicator">refresh</button-->
    <!--div>{{currentUserScheduled}}</div-->
    <!--button @click="resize">resize</button-->


    <FullCalendar
      class="demo-app-calendar"
      ref="fullCalendar"
      height="parent"
      :views="fc_views"
      :defaultView="fc_defaultView"
      :header="fc_header"
      :slotDuration="fc_slotDuration"
      :slotLabelInterval="fc_slotLabelInterval"
      :slotLabelFormat="fc_slotLabelFormat"
      :eventTimeFormat="fc_eventTimeFormat"
      :locale="fc_locale"
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
      :themeSystem="fc_themeSystem"
      :schedulerLicenseKey="fc_schedulerLicenseKey"
      :eventSources="fc_eventSources"
      :eventRender="fc_eventRender"
      :dayRender="dayRender"
      :firstDay="fc_firstDay"
      :resources="fc_resources"
      :plugins="fc_plugins"
      @loading="fc_isLoading"
      @select="newEventSelected"
      @eventClick="existingEventSelected"
      @eventMouseEnter="eventMouseEnter"
      @eventMouseLeave="eventMouseLeave"
    />

    <div class="level" style="margin: 0;">
      <div class="level-left">
        <div class="level-item">
          <button class="button" style="opacity: 0;">padding only</button>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button v-if="isLoading" class="level-item button is-text is-loading">loading</button>
        </div>
      </div>
    </div>

    <!-- popup for creating calendar events -->
    <b-modal
      :active.sync="eventEditorIsActive"
      :width="640"
      scroll="keep"
      @close="eventModalClosed"
    >
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

    <!-- Moon info box that appears when hovering over a moon event -->
    <div id="moon-info">
      <p>Moon is above the horizon</p>
      <p>---</p>
      <p>Illumination: &emsp;{{(moon_hover_data.illumination * 100).toFixed(1)}} %</p>
      <p>Rise: &emsp;&emsp;&emsp;&emsp;&ensp;{{moon_hover_data.rise}}</p>
      <p>Transit: &emsp;&emsp;&emsp;&ensp;{{moon_hover_data.transit}}</p>
      <p>Set: &emsp;&emsp;&emsp;&emsp;&emsp;{{moon_hover_data.set}}</p>
    </div>

  </div>
</template>

<script>
//{ import scripts (collapsible)
import axios from "axios";
import moment from "moment";
import titleGenerator from "@/utils/titleGenerator";
import SunCalc from "suncalc";
import { mapState, mapGetters } from "vuex";

import CalendarEventEditor from "@/components/calendar/CalendarEventEditor";

import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import bootstrapPlugin from "@fullcalendar/bootstrap";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import { toMoment } from "@fullcalendar/moment"; // only for formatting

// must manually include stylesheets for each plugin
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import "@fullcalendar/resource-timeline/main.css";

/* TODO:
    - merge the idea of 'resources' with the existing site-based event filtering
    */
//}

export default {
  name: "TheCalendar",
  components: {
    FullCalendar, // make the <FullCalendar> tag available
    CalendarEventEditor,
  },
  props: [
    // The active site (resource) disaplyed in the calendar
    "calendarSite",

    // Resources for fullcalendar (in our case they are observatories)
    "fc_resources",

    // Timezone of the site
    "fc_timeZone",

    "showMoonEvents",
    
  ],

  mounted() {

    // Once we've mounted, we're able to access the fullCalendar $ref. 
    // We need this to access the fullCalendar.getApi() method. 
    this.isMounted = true;

    this.fullCalendarApi = this.$refs.fullCalendar.getApi()

    this.refreshCalendarView();
    this.nowIndicatorTimeInteval = setInterval(this.updateNowIndicator, 300000);
  },
  destroyed() {
    clearInterval(this.nowIndicatorTimeInterval);
  },

  watch: {
    calendarSite: function (val) {
      this.refreshCalendarView();
    },
    global_config() {
      this.refreshCalendarView();
    },
    user() {
      this.refreshCalendarView();
    },
    showMoonEvents() {
      this.refreshCalendarView();
    }
  },

  computed: {
    //fullCalendarApi() {
      //return this.$refs.fullCalendar.getApi();
    //},

    fc_now() {
      if (this.fc_timeZone) {
        // make sure timezone has loaded from the config
        return moment().tz(this.fc_timeZone).format();
      }
    },

    // Return the list of sources that feed fullCalendar with events
    fc_eventSources() {
      let sources = [
        // Astronomical twilight events (computed locally)
        { events: this.getTwilightEvents },
        // Events from dynamodb backend
        { events: this.fetchSiteEvents },
        // Now Indicator
        { events: this.getNowIndicator },
        // Moon Indicator
        { events: this.getMoonRiseSet },
      ];
      return sources
    },

    fc_selectable() {
      // whether to let user click and drag to select a time range.
      return this.$auth.isAuthenticated;
    },

    // Define the starting calendar day. 0=sunday, 1=monday, ...
    fc_firstDay() {
      // The fullCalendar ref doesn't work until the component is mounted.
      if (!this.isMounted)
        return;

      // Get the fullCalendar api
      let api = this.$refs.fullCalendar.getApi();

      // If the week view is displayed, 'today' to be the second column.
      if (api.view.type == 'timeGridWeek') {
        let today_day_number = moment().tz(this.fc_timeZone).day()
        let starting_day_number = (today_day_number - 1) % 6
        return starting_day_number
      }
      else {
        // Otherwise, Sunday is the first day. 
        return 0
      }
    },

    ...mapState('site_config', [
      'global_config',
    ]),
    ...mapGetters("site_config", [
      "site_latitude",
      "site_longitude",
      "timezone",
    ]),

    user() {
      return this.$auth.user;
    },
  },

  data: function () {
    return {
      /*===================================================/
      Configs for fullCalendar (anything with fc_ namespace)
      /===================================================*/
      fc_views: {
        // definitions for additional calendar views (eg. 10 day grid)
        resourceTimelineDay: {
          buttonText: ":15 slots",
          slotDuration: "00:15",
        },
        resourceTimelineTenDay: {
          type: "resourceTimeline",
          duration: { days: 10 },
          buttonText: "10 days",
        },
      },
      fc_defaultView: "timeGridWeek",
      fc_header: {
        // define the top row of buttons
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,listWeek",
      },
      fc_slotDuration: "00:15:00", // horizontal guides; affects event drag precision
      fc_slotLabelInterval: "01:00:00",
      fc_eventTimeFormat: { hour: "numeric", minute: "2-digit", hour12: false }, // 24hr times on events
      fc_slotLabelFormat: { hour: "numeric", minute: "2-digit", hour12: false }, // 24hr time on axis labels
      fc_locale: 'en-GB',  // so we can use 0:00 instead of 24:00
      fc_minTime: "12:00:00", // start the day column at noon
      fc_maxTime: "36:00:00", // end the day column at noon for the following day
      fc_scrollTime: "16:00:00", // calendar default view starts at 4pm.
      fc_navLinks: false, // whether to enable clicking on a day to view that day only.
      fc_selectMirror: true, // whether to draw placeholder event while user is dragging
      fc_unselectAuto: false, // whether clicking elsewhere closes the current selection
      fc_editable: true, // whether events on calendar can be modified
      fc_weekends: true, // whether to show weekends in week view
      fc_nowIndicator: false, // whether to draw line indicating current time in grid views.
      fc_progressiveEventRendering: true,
      fc_themeSystem: "bootstrap", // uses bootstrap css (see <style> below)
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

      fullCalendarApi: '',

      // Change to true when the 'mounted' hook is run. 
      // We need to know whether the component is mounted to access the 
      // $refs.fullCalendar.getApi() method. 
      isMounted: false,

      moon_cache: {},

      moon_hover_data: {
        rise: '',
        set: '',
        transit: '',
        illumination: '',
      },

      // URL for the calendar backend api
      //backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',
      backendUrl: "https://calendar.photonranch.org",

      // this informs what buttons appear in the modal event editor
      isNewEvent: false,

      // toggles the popup for setting calendar events
      eventEditorIsActive: false,

      // properties of the selected calendar event
      activeEvent: {},

      isLoading: false,

      currentUserScheduled: false,
    };
  },

  methods: {
    async updateNowIndicator() {
      this.fullCalendarApi.unselect();
      this.fullCalendarApi.refetchEvents();
    },

    getMoonPhaseDays(year, month, day) {

      // https://gist.github.com/endel/dfe6bb2fbe679781948c
      var Moon = {
        phases: ["new", "waxing-crescent", "first-quarter", "waxing-gibbous", 
          "full", "waning-gibbous", "last-quarter", "waning-crescent" ],
        phase: function (year, month, day) {
          let e
          let jd
          let b
          let c = e = jd = b = 0;

          if (month < 3) {
            year--;
            month += 12;
          }

          ++month;
          c = 365.25 * year;
          e = 30.6 * month;
          jd = c + e + day - 694039.09; // jd is total days elapsed
          jd /= 29.5305882; // divide by the moon cycle
          b = parseInt(jd); // int(jd) -> b, take integer part of jd
          jd -= b; // subtract integer part to leave fractional part of original jd
          b = Math.round(jd * 8); // scale fraction from 0-8 and round

          if (b >= 8) b = 0; // 0 and 8 are the same so turn 8 into 0
          return {phase: b, name: Moon.phases[b]};
        }
      };

      try { // ignore errors caused by the timezone not being loaded yet.
        let moment_today = moment([year, month, day]).utc()
        let moment_yesterday = moment([year, month, day]).utc().add(-1, 'days')

        let phase_today = Moon.phase(
          moment_today.year(), 
          moment_today.month(), 
          moment_today.date())
        let phase_yesterday = Moon.phase(
          moment_yesterday.year(), 
          moment_yesterday.month(), 
          moment_yesterday.date())

        // If the phase is changed from the previous day, then return it to
        // display on the calendar.
        if (phase_today.phase != phase_yesterday.phase) {
          return phase_today
        }
        else {
          return false
        }
      } catch {
        return false;
      }
    },


    // Display moon phase icons in the calendar
    dayRender(dayRenderInfo) {
      if (dayRenderInfo.view.type == "dayGridMonth" || true) {

        try { // ignore errors from the timezone not being loaded yet. 
          let date = moment(dayRenderInfo.date).tz(this.fc_timeZone)
          let moon_phase = this.getMoonPhaseDays(
            date.year(), 
            date.month(), 
            date.date())

          if (moon_phase) {
            dayRenderInfo.el.innerHTML = `<i class="moon-icon mdi \
              mdi-moon-${moon_phase.name}" aria-hidden="true"></i>`
          }
        } catch {
          console.warn('dayRender waiting for valid timezone.')
        }

      }
    },

    async getNowIndicator(info) {
      let now = [
        {
          start: moment().utc().format(),
          end: moment().utc().add("1", "minutes").format(),
          rendering: "background",
          backgroundColor: "#ff0000",
          borderColor: "#ff0000",
          id: `fc-custom-now-indicator`,
          classNames: ["fc-now-indicator", "fc-now-indicator-line"],
        },
      ];
      return now;
    },

    fc_eventRender() {
      let n = document.getElementsByClassName("fc-now-indicator")[0];
      if (n) {
        n.parentElement.style["z-index"] = "auto";
      }
    },

    // Displays loading spinner when calendar is fetching.
    fc_isLoading(val) {
      this.isLoading = val;
    },

    /**
     * Helper function for displaying moon visibility in the calendar.
     * Returns a grey color with brightness corresponding to moon brightness.
     * @param {float} illum: moon illumination between 0 and 1.
     * @returns {string}: css value, something like 'rgba(255,255,255,0.5)'
     */
    rgba_from_illumination(illum, peak) {
      let alpha = 0.1 + (0.9 * illum) // should have minimum opacity of 0.1
      return `rgba(${peak},${peak},${peak},${alpha})`
    },


    // Call the photonranch api to get moon times. 
    async getMoonTimesFromAPI(start, end) {
      let url = "https://api.photonranch.org/api/events/moon/rise-set-illum";
      let payload = {
        params: {
          start: start,
          end: end,
          lat: this.site_latitude,
          lng: this.site_longitude,
        },
      };

      // Check cache
      let payload_str = 
        start.slice(0,10) + '#' + // only take the yyyy-mm-dd part of the date
        end.slice(0,10)
      if (this.moon_cache.hasOwnProperty(payload_str)) {
        return this.moon_cache[payload_str]
      }

      // otherwise, make the api call
      let response = await axios.get(url, payload);
      let riseset = response.data;

      // update cache
      this.moon_cache[payload_str] = riseset

      return riseset
    },

    // Return an array of fullcalendar background events to display the 
    // moon visibility
    async getMoonRiseSet(info) {

      if (!this.showMoonEvents) {
        return [];
      }
      const ms_per_day = 86400000;

      // Get the time range we need to display in the UI.
      // Also convert from ms timestamp to iso utc seconds.
      let start_timestamp = info.start.valueOf();
      let end_timestamp = info.end.valueOf();

      // Add buffer of a few days to the start and end window
      start_timestamp -= ms_per_day * 12;
      end_timestamp += ms_per_day * 12;

      // Convert timestamps to utc iso format
      let start_iso = moment(start_timestamp).format("YYYY-MM-DDTHH:mm:ss[Z]");
      let end_iso = moment(end_timestamp).format("YYYY-MM-DDTHH:mm:ss[Z]");

      // Make the api call to get moon rise/set times
      let riseset = await this.getMoonTimesFromAPI(start_iso, end_iso)

      let moonEvents = [];
      riseset.map((moon) => {

        // The primary moon event
        moonEvents.push({
          start: new Date(moon.rise),
          end: new Date(moon.set),
          rendering: "background",
          backgroundColor: this.rgba_from_illumination(moon.illumination, 235),
          borderColor: "#aaaaaa",
          id: `fc-custom-moon-indicator`,
          classNames: ["fc-moon-indicator",],
          title: "Moon Event",
          extendedProps: {
            illumination: moon.illumination,
            transit: moon.transit,
          }
        });

        // The marker for transit time. 
        moonEvents.push({
          start: moment(moon.transit).format(),
          end: moment(moon.transit).add("1", "minutes").format(),
          title: "Moon Event",
          rendering: "background",
          // Opacity should vary with moon brightness, but not too much.
          backgroundColor: `rgba(255,255,255,${moon.illumination ** 0.25})`,
          classNames: ["fc-moon-transit-indicator"],
        });
      }
      );

      return moonEvents;
    },

    async getTwilightEvents(info) {
      // Timer start
      let t0 = performance.now();

      // Get the time range we need to display in the UI.
      let firstDay = info.start.valueOf();
      let lastDay = info.end.valueOf();

      // List all the days we'll need to display
      let allDays = [];
      let msPerDay = 1000 * 60 * 60 * 24;

      // Generate events for 60 days before the start time to 60 days after.
      // This is to prevent the loading flicker when changing weeks.
      // note: this still only takes ~5ms to compute.
      for (
        let day = firstDay - 60 * msPerDay;
        day < lastDay + 60 * msPerDay;
        day += msPerDay
      ) {
        // Define each day by the timestamp a little after 1:01am to avoid DST hell
        allDays.push(day + 3700000);
      }

      // Generate the twilight events (in proper fullCalendar format)
      // for one day column (evening-of and morning-after the given date.)
      function oneDayTwilight(timestamp, latitude, longitude) {
        let events = {};

        let msPerDay = 1000 * 60 * 60 * 24;
        let sunEvents = SunCalc.getTimes(
          new Date(timestamp),
          latitude,
          longitude
        );
        let nextDayEvents = SunCalc.getTimes(
          new Date(timestamp + msPerDay),
          latitude,
          longitude
        );
        let prevDayEvents = SunCalc.getTimes(
          new Date(timestamp - msPerDay),
          latitude,
          longitude
        );

        let currentDateObj = new Date(timestamp);

        // The event colors for the calendar
        //let daylightColor = "rgb(129, 212, 250)"
        //let civilColor = "rgb(52, 152, 219)"
        //let nauticalColor = "rgb(36, 113, 163)"
        //let astronomicalColor = "rgb(26, 82, 118)"

        let daylightColor = "#81D4FA";
        let civilColor = "#1B9FD8";
        let nauticalColor = "#166EA9";
        let astronomicalColor = "#084165";

        events.civilTwilightDusk = {
          title: "Civil Twilight",
          start: sunEvents.sunset,
          end: sunEvents.dusk,
          backgroundColor: civilColor,
          rendering: "background",
          id: `${currentDateObj.toISOString()}_civil_dusk`,
        };
        events.nauticalTwilightDusk = {
          title: "Nautical Twilight",
          start: sunEvents.dusk,
          end: sunEvents.nauticalDusk,
          backgroundColor: nauticalColor,
          rendering: "background",
          id: `${currentDateObj.toISOString()}_nautical_dusk`,
        };
        events.astronomicalTwilightDusk = {
          title: "Astronomical Twilight",
          start: sunEvents.nauticalDusk,
          end: sunEvents.night,
          backgroundColor: astronomicalColor,
          rendering: "background",
          id: `${currentDateObj.toISOString()}_astronomical_dusk`,
        };

        events.astronomicalTwilightDawn = {
          title: "Astronomical Twilight",
          start: nextDayEvents.nightEnd,
          end: nextDayEvents.nauticalDawn,
          backgroundColor: astronomicalColor,
          rendering: "background",
          id: `${currentDateObj.toISOString()}_astronomical_dawn`,
        };
        events.nauticalTwilightDawn = {
          title: "Nautical Twilight",
          start: nextDayEvents.nauticalDawn,
          end: nextDayEvents.dawn,
          backgroundColor: nauticalColor,
          rendering: "background",
          id: `${currentDateObj.toISOString()}_nautical_dawn`,
        };
        events.civilTwilightDawn = {
          title: "Civil Twilight",
          start: nextDayEvents.dawn,
          end: nextDayEvents.sunrise,
          backgroundColor: civilColor,
          rendering: "background",
          id: `${currentDateObj.toISOString()}_civil_dawn`,
        };
        events.daylightMorning = {
          title: "Morning Daylight",
          start: nextDayEvents.sunrise,
          end: nextDayEvents.sunset,
          //end: new Date(new Date(timestamp).setHours(36)),
          rendering: "background",
          backgroundColor: daylightColor,
          id: `${currentDateObj.toISOString()}_day_morning`,
        };
        return events;
      }

      // Collect all the events to display here
      let twilightEvents = [];

      let site_lat = parseFloat(
        this.global_config[this.calendarSite]["latitude"]
      );
      let site_lng = parseFloat(
        this.global_config[this.calendarSite]["longitude"]
      );

      // Compute events for each day.
      allDays.map((day) =>
        twilightEvents.push(
          ...Object.values(oneDayTwilight(day, site_lat, site_lng))
        )
      );

      // Finish timer
      let t1 = performance.now();
      let twilightComputeTime = t1 - t0;
      if (twilightComputeTime > 100) {
        console.warn(
          "Slow computation of astro twilight: ",
          twilightComputeTime.toFixed(2) + "ms"
        );
      }
      return twilightEvents;
    },

    async getConfigWithAuth() {
      let token, configWithAuth;
      try {
        token = await this.$auth.getTokenSilently();
      } catch (err) {
        console.error(err);
        console.warn("Did not acquire the needed token. Stopping request.");

        // small popup notification
        this.$buefy.toast.open({
          duration: 5000,
          message: "Oops! You aren't authorized to do that.",
          position: "is-bottom",
          type: "is-danger",
        });
      }

      return {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          Authorization: `Bearer ${token}`,
        },
      };
    },

    handleNotAuthorizedResponse(error) {
      if (error.response) {
        // Request made and server responded
        console.warn(error.response.data);
        console.warn(error.response.status);
        console.warn(error.response.headers);
        // small popup notification describing error
        this.$buefy.toast.open({
          duration: 5000,
          message: `${error.response.status} error: ${error.response.data}`,
          position: "is-bottom",
          type: "is-danger",
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.warn(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.warn("Error", error.message);
      }
    },

    // Make a unique id for calendar events. UUID style. This is the pk in dynamodb.
    makeUniqueID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
        c
      ) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },

    // Used when exiting event editor modals. Clear selections, close modal, and refresh events.
    async refreshCalendarView() {
      let calendarApi = this.fullCalendarApi //this.$refs.fullCalendar.getApi();
      calendarApi.unselect();
      calendarApi.refetchEvents();
      this.eventEditorIsActive = false;

      // Update the list of active reservations
      this.$store.dispatch(
        "calendar/fetchActiveReservations",
        this.calendarSite
      );
    },

    /*===================================================/
    Calendar Event Selection Handlers
    /===================================================*/
    /**
     *  This is run when a user clicks on the calendar to create a new event.
     */
    newEventSelected(event) {
      this.activeEvent.startStr = moment(event.startStr).utc().format();
      this.activeEvent.endStr = moment(event.endStr).utc().format();
      this.activeEvent.title = "";
      this.activeEvent.reservation_type = "realtime" // or "project"
      this.activeEvent.creator = this.$auth.user.name;
      this.activeEvent.id = this.makeUniqueID();
      this.activeEvent.site = this.calendarSite;
      this.activeEvent.resourceId = this.calendarSite;
      this.activeEvent.creator_id = this.$auth.user.sub;
      this.activeEvent.project_id = "none";
      this.activeEvent.reservation_note = "";

      this.isNewEvent = true; // setting for the modal event editor
      this.eventEditorIsActive = true;
    },
    /**
     *  This is run when a user clicks on an existing event in the calendar.
     */
    existingEventSelected(arg) {
      let event = arg.event;
      //console.log(event);
      (this.activeEvent.id = event.id),
        (this.activeEvent.startStr = moment(event.start).format());
      this.activeEvent.endStr = moment(event.end).format();
      this.activeEvent.title = event.title;
      this.activeEvent.reservation_type = event.extendedProps?.reservation_type ?? 'project' // legacy events may not include this key
      this.activeEvent.creator = event.extendedProps.creator;
      this.activeEvent.site = event.extendedProps.site;
      this.activeEvent.resourceId = event.getResources()[0].id;
      this.activeEvent.project_id = event.extendedProps.project_id;
      this.activeEvent.reservation_note = event.extendedProps.reservation_note || "";

      this.isNewEvent = false; // setting for the modal event editor
      this.eventEditorIsActive = true;
    },

    /*===================================================/
    Calendar mouseover events
    /===================================================*/

    eventMouseEnter( mouseInfo ) {

      // Show moon info box when hovering a moon event.
      if (mouseInfo.event.title == "Moon Event") {
        document.getElementById('moon-info').style.visibility = 'visible'

        this.moon_hover_data.rise = moment(mouseInfo.event.start)
          .tz(this.fc_timeZone).format("HH:mm MM/DD")
        this.moon_hover_data.set = moment(mouseInfo.event.end)
          .tz(this.fc_timeZone).format("HH:mm MM/DD")
        this.moon_hover_data.transit = moment(mouseInfo.event.extendedProps.
          transit).tz(this.fc_timeZone).format("HH:mm MM/DD")
        this.moon_hover_data.illumination = mouseInfo.event.extendedProps
          .illumination.toFixed(3)

        let page = document.getElementsByClassName('page-view')[0]
        let page_boundary = page.getBoundingClientRect()
        let left_position_offset = page_boundary.left
        let top_position_offset = page_boundary.top
        let top_scroll_offset = document.body.getBoundingClientRect().top

        let x = mouseInfo.jsEvent.pageX - left_position_offset;
        let y = mouseInfo.jsEvent.pageY - top_position_offset + top_scroll_offset;

        document.getElementById('moon-info').style.top = y + 'px'
        document.getElementById('moon-info').style.left = x + 'px'
      }
    },

    eventMouseLeave( mouseInfo ) {

      // Hide moon info boxes when the mouse leaves.
      if (mouseInfo.event.title == "Moon Event") {
        document.getElementById('moon-info').style.visibility = 'hidden'
      }
    },


    /*===================================================/
    Calendar CRUD
    /===================================================*/

    async refreshIfUserIsScheduled() {
      // Make request headers and include token.
      // Requires user to be logged in.
      let header = await this.getConfigWithAuth();
      let url = `${this.backendUrl}/dev/is-user-scheduled`;
      let user_id = this.$auth.user.sub;
      let body = {
        user_id: user_id,
        site: this.calendarSite,
        time: moment().utc().format(),
      };
      let response = await axios.post(url, body, header);
      this.currentUserScheduled = response.data;
    },

    /**
     * When the user clicks submit, event details are sent to the backend.
     */
    async submitButtonClicked(newEvent) {

      // Make request headers and include token.
      // Requires user to be logged in.
      let config = await this.getConfigWithAuth();

      let url = `${this.backendUrl}/dev/newevent`;
      let eventToPost = {
        event_id: newEvent.id,
        start: moment(newEvent.startStr).utc().format(),
        end: moment(newEvent.endStr).utc().format(),
        creator: newEvent.creator,
        creator_id: newEvent.creator_id,
        site: newEvent.site,
        title: newEvent.title,
        reservation_type: newEvent.reservation_type,
        resourceId: newEvent.resourceId,
        project_id: newEvent.project_id,
        reservation_note: newEvent.reservation_note,
        rendering: newEvent.rendering,
      };
      axios
        .post(url, eventToPost, config)
        .then((res) => {
          this.isLoading = true;
          this.refreshCalendarView();
        })
        .catch((error) => {
          this.eventEditorIsActive = false;
          this.handleNotAuthorizedResponse(error);
        });
    },

    /**
     * Close the event modal and deselect its associated calendar event.
     */
    cancelButtonClicked() {
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.unselect();
      this.eventEditorIsActive = false;
    },
    
    /**
     * Replicates the 'cancelButtonClicked' function for the case when the user
     * closes the modal window by clicking outside of it.
     */
    eventModalClosed() {
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.unselect();
    },

    /**
     * Delete the selected calendar event from the backend database
     */
    async deleteButtonClicked(eventToDelete) {
      let config = await this.getConfigWithAuth();
      let url = `${this.backendUrl}/dev/delete`;
      let body = {
        event_id: eventToDelete.id,
        start: moment(eventToDelete.startStr).utc().format(),
      };
      let res = await axios
        .post(url, body, config)
        .then((res) => {
          this.isLoading = true;
          this.refreshCalendarView();
        })
        .catch((error) => {
          this.eventEditorIsActive = false;
          this.handleNotAuthorizedResponse(error);
        });
    },

    async modifyButtonClicked(events) {
      let initialEvent = events.initialEvent;
      let modifiedEvent = events.modifiedEvent;

      // Maybe we don't need to update anything?
      if (JSON.stringify(initialEvent) == JSON.stringify(modifiedEvent)) {
        this.refreshCalendarView();
        return;
      }

      // Make request headers and include token.
      // Requires user to be logged in.
      let config = await this.getConfigWithAuth();
      let url = `${this.backendUrl}/dev/modifyevent`;
      let theModifiedEvent = {
        event_id: modifiedEvent.id,
        start: moment(modifiedEvent.startStr).utc().format(),
        end: moment(modifiedEvent.endStr).utc().format(),
        creator: modifiedEvent.creator,
        creator_id: modifiedEvent.creator_id,
        site: modifiedEvent.site,
        title: modifiedEvent.title,
        reservation_type: modifiedEvent.reservation_type,
        resourceId: modifiedEvent.resourceId,
        project_id: modifiedEvent.project_id,
        reservation_note: modifiedEvent.reservation_note,
        rendering: modifiedEvent.rendering,
      };
      let theInitialEvent = {
        event_id: initialEvent.id,
        start: moment(initialEvent.startStr).utc().format(),
        end: moment(initialEvent.endStr).utc().format(),
        creator: initialEvent.creator,
        creator_id: initialEvent.creator_id,
        site: initialEvent.site,
        title: initialEvent.title,
        reservation_type: initialEvent.reservation_type,
        resourceId: initialEvent.resourceId,
        project_id: initialEvent.project_id,
        reservation_note: initialEvent.reservation_note,
        rendering: initialEvent.rendering,
      };
      let body = {
        originalEvent: theInitialEvent,
        modifiedEvent: theModifiedEvent,
      };

      axios
        .post(url, body, config)
        .then((res) => {
          this.isLoading = true;
          this.refreshCalendarView();
        })
        .catch((error) => {
          this.eventEditorIsActive = false;
          this.handleNotAuthorizedResponse(error);
        });
    },

    /*===================================================/
    Fetching Calendar Events
    /===================================================*/


    async fetchSiteEvents(fetchInfo) {
      let site = this.calendarSite;
      const url = `${this.backendUrl}/dev/siteevents`;
      const options = {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
        },
      };

      // The start and end times must be formatted as UTC like 2020-12-31T23:59:59Z
      let body = {
        site: site,
        start: moment(fetchInfo.startStr).utc().format(),
        end: moment(fetchInfo.endStr).utc().format(),
      };

      let resp = await axios.post(url, body, options);

      // Format the returned items to work nicely with fullcalendar.
      let formatted_events = resp.data.map((obj) => {
        let fObj = {
          start: obj.start,
          end: obj.end,
          id: obj.event_id,
          title: obj.title,
          reservation_type: obj.reservation_type,
          creator: obj.creator,
          creator_id: obj.creator_id,
          site: obj.site,
          resourceId: obj.resourceId,
          project_id: obj.project_id,
          reservation_note: obj.reservation_note,
          rendering: obj.rendering,
        };

        // Event colors
        const projects_color = "#9c27b0" //"#4e1199"
        const user_projects_border = "gold" //"#a35ff7"
        const realtime_color = "#2196f3" //"#006e64"
        const user_realtime_border = "gold" //"#00e5d0"

        let user_owns_event = ( this.$auth.isAuthenticated && fObj.creator_id == this.$auth.user.sub) 
        if (obj.reservation_type == "realtime") {
          fObj.backgroundColor = realtime_color
          fObj.borderColor = user_owns_event ? user_realtime_border : realtime_color 
        } else if (obj.reservation_type == "project") {
          fObj.backgroundColor = projects_color
          fObj.borderColor = user_owns_event ? user_projects_border : projects_color 
        } else {
          fObj.backgroundColor = projects_color
          fObj.borderColor = user_owns_event ? user_projects_border : projects_color 
        }

        return fObj;
      });
      return formatted_events;
    },
  },
};
</script>

<!-- TODO: reduce the bootstrap css (below) to the minimum required for button groups. -->
<style lang='scss'>

// Calendar grid styling
.fc table * {
  border-color: #444;
  border-width: 1.8px;
}
.fc-minor td {
  border-width: 0.3px;
  border-color: #333;
}
.fc-time-grid .fc-slats td {
  height: 0.6em;
  border-bottom: 0;
}

// Prevent the row time labels from changing the row heights
.fc-axis {
  position: relative;
  span {
    color: #aaa;
    position:absolute;
    left: 5px;
    top: -1px;
    overflow:visible;
    font-size: 0.9em;
  }
}

/* the line showing the current time */
.fc-now-indicator {
  &.fc-now-indicator-line {
    border-color: rgb(255, 0, 0);
    z-index: 15;
    opacity: 1;
    background-color: red;
  }
  &.fc-now-indicator-arrow {
    border-color: rgb(255, 0, 0);
    z-index: 15;
    opacity: 1;
  }
}

#moon-info {
  background-color: black;
  opacity: 0.9;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
  position: absolute;
  visibility: hidden;
  z-index: 16;
  top: 0px;
  left: 0px;
  pointer-events: none;
}
.moon-icon {
  padding: 5px;
  color: yellow;
}
.fc-moon-transit-indicator {
  z-index: 15;
  opacity: 1;
  width: 20px;
}
.fc-moon-indicator {
  z-index: 15;
  opacity: 0.5;
  width: 20px;
  border-radius: 12px;
  transition: 0.2s;
}
.fc-moon-indicator:hover {
  opacity: 0.8;
  transition: 0.2s;
}

/*@import url("https://bootswatch.com/4/darkly/bootstrap.min.css");*/
.demo-app {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
 .demo-app-calendar {
   position: relative;
 }

.demo-app-top {
  margin: 0 0 3em;
}

.calendar-container {
  margin: 0 auto;
  height: 100%;
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
.btn-group-vertical
  > .btn-group:first-child:not(:last-child)
  > .dropdown-toggle {
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.btn-group-vertical
  > .btn-group:last-child:not(:first-child)
  > .btn:first-child {
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
