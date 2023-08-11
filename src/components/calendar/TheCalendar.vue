<template>
  <div class="calendar-container">
    <FullCalendar
      ref="fullCalendar"
      class="fullCalendar-observatory-calendar"
      height="parent"
      :views="fc_views"
      :default-view="fc_defaultView"
      :custom-buttons="fc_customButtons"
      :date-increment="fc_dateIncrement"
      :header="fc_header"
      :slot-duration="fc_slotDuration"
      :slot-label-interval="fc_slotLabelInterval"
      :slot-label-format="fc_slotLabelFormat"
      :event-time-format="fc_eventTimeFormat"
      :locale="fc_locale"
      :time-zone="fc_timeZone"
      :min-time="fc_minTime"
      :max-time="fc_maxTime"
      :scroll-time="fc_scrollTime"
      :nav-links="fc_navLinks"
      :selectable="fc_selectable"
      :select-mirror="fc_selectMirror"
      :unselect-auto="fc_unselectAuto"
      :weekends="fc_weekends"
      :now-indicator="fc_nowIndicator"
      :now="fc_now"
      :progressive-event-rendering="fc_progressiveEventRendering"
      :theme-system="fc_themeSystem"
      :scheduler-license-key="fc_schedulerLicenseKey"
      :event-sources="fc_eventSources"
      :event-render="fc_eventRender"
      :day-render="dayRender"
      :resources="fc_resources"
      :plugins="fc_plugins"
      :editable="fc_editable"
      :all-day-maintain-duration="fc_allDayMaintainDuration"
      :event-resizable-from-start="fc_eventResizableFromStart"
      :event-resource-editable="fc_eventResourceEditable"
      :droppable="fc_droppable"
      :event-allow="fc_eventAllow"
      :snap-duration="fc_snapDuration"
      :drag-scroll="fc_dragScroll"
      :event-overlap="fc_eventOverlap"
      @eventDrop="fc_eventDrop"
      @eventResize="fc_eventResize"
      @loading="fc_isLoading"
      @select="newEventSelected"
      @eventClick="existingEventSelected"
      @eventMouseEnter="eventMouseEnter"
      @eventMouseLeave="eventMouseLeave"
      @eventDragStart="eventDragStart"
      @eventDragStop="eventDragStop"
    />

    <div
      class="level"
      style="margin: 0;"
    >
      <div class="level-left">
        <div class="level-item">
          <button
            class="button"
            style="opacity: 0;"
          >
            padding only
          </button>
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <button
            v-if="isLoading"
            class="level-item button is-text is-loading"
          >
            loading
          </button>
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
            :event-details="activeEvent"
            :is-new-event="isNewEvent"
            :event-is-loading="isLoading"
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
      <p>Illumination: &emsp;{{ (moon_hover_data.illumination * 100)?.toFixed(1) }} %</p>
      <p>Rise: &emsp;&emsp;&emsp;&emsp;&ensp;{{ moon_hover_data.rise }}</p>
      <p>Transit: &emsp;&emsp;&emsp;&ensp;{{ moon_hover_data.transit }}</p>
      <p>Set: &emsp;&emsp;&emsp;&emsp;&emsp;{{ moon_hover_data.set }}</p>
    </div>
  </div>
</template>

<script>
// { import scripts (collapsible)
import axios from 'axios'
import moment from 'moment'
import { mapState, mapGetters } from 'vuex'

import CalendarEventEditor from '@/components/calendar/CalendarEventEditor'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import bootstrapPlugin from '@fullcalendar/bootstrap'
import momentTimezonePlugin from '@fullcalendar/moment-timezone'

import { makeUniqueID, copyFcEvent, convertFullCalendarEventToPtrFormat, convertEventEditorResponseToPtrFormat, getMoonPhaseDays, rgba_from_illumination, oneDayTwilight } from '@/utils/calendar_utils.js'

// must manually include stylesheets for each plugin
import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'
import '@fullcalendar/resource-timeline/main.css'

// This function is used to convert the calendar's left time column into the UTC
// values on the right column
function transformLocalTimeToUTC (timezoneName, localTime) {
  // localTime is a string formatted as hh:mm in 24hr time
  const offsetInt = moment.tz(timezoneName).utcOffset() / 60
  const time = localTime.split(':')
  const hours = time[0]
  const minutes = time[1]
  const utcHours = (hours - (offsetInt - 24)) % 24
  return `${utcHours}:${minutes}`
}

export default {
  name: 'TheCalendar',
  components: {
    FullCalendar, // make the <FullCalendar> tag available
    CalendarEventEditor
  },
  props: {
    // The active site (resource) disaplyed in the calendar
    calendarSite: {
      required: true
    },

    // Resources for fullcalendar (in our case they are observatories)
    fc_resources: {
      required: true
    },

    // Timezone of the site
    fc_timeZone: {
      required: true
    },

    showMoonEvents: {
      required: true
    },

    showWeatherForecast: {
      required: true
    }

  },

  mounted () {
    this.fullCalendarApi = this.$refs.fullCalendar.getApi()

    // Simple way to define the default starting position with the current date in the third column
    this.incrementDateBack()
    this.incrementDateBack()

    // Once we've mounted, we're able to access the fullCalendar $ref.
    // We need this to access the fullCalendar.getApi() method.
    this.isMounted = true

    this.refreshCalendarView()
    this.nowIndicatorTimeInteval = setInterval(this.updateNowIndicator, 300000)

    this.$store.dispatch('user_data/fetchAllProjects')
  },
  destroyed () {
    clearInterval(this.nowIndicatorTimeInterval)
  },

  watch: {
    calendarSite () {
      this.refreshCalendarView()
    },
    global_config () {
      this.refreshCalendarView()
    },
    user () {
      this.refreshCalendarView()
    },
    showMoonEvents () {
      this.refreshCalendarView()
    },
    showWeatherForecast () {
      this.refreshCalendarView()
    },
    forecast () {
      this.refreshCalendarView()
    }
  },

  computed: {

    fc_now () {
      // make sure timezone has loaded from the config
      if (!this.fc_timeZone) {
        console.error('timezone in fullcalendar is\'nt loaded yet')
        return 'timezone not loaded'
      }
      return moment().tz(this.fc_timeZone).format()
    },

    // Return the list of sources that feed fullCalendar with events
    fc_eventSources () {
      // Note: all event source functions must be async!
      const sources = [
        // Astronomical twilight events (computed locally)
        { events: this.getTwilightEvents },
        // Events from dynamodb backend
        { events: this.fetchSiteEvents },
        // Moon Indicator
        { events: this.getMoonRiseSet },
        // Weather Forecast
        { events: this.getWeatherForecast },
        // Observing Start/End times
        { events: this.getObservingStartEndIndicators },
        // Now Indicator
        { events: this.getNowIndicator }
      ]
      return sources
    },

    fc_selectable () {
      // whether to let user click and drag to select a time range.
      return this.$auth.isAuthenticated
    },

    ...mapState('site_config', [
      'global_config'
    ]),
    ...mapGetters('site_config', [
      'site_latitude',
      'site_longitude',
      'timezone',
      'site_events',
      'site_events_observing_start_time',
      'site_events_observing_end_time'
    ]),
    ...mapState('user_data', [
      'all_projects',
      'userId',
      'userIsAuthenticated'
    ]),
    ...mapGetters('sitestatus', [
      'forecast'
    ]),

    user () {
      return this.$auth.user
    }
  },

  data: function () {
    return {
      /* ===================================================/
      Configs for fullCalendar (anything with fc_ namespace)
      /=================================================== */
      fc_views: {
        // definitions for additional calendar views (eg. 10 day grid)
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
      fc_customButtons: {
        customPrev: {
          text: '<',
          click: this.incrementDateBack
        },
        customNext: {
          text: '>',
          click: this.incrementDateForward
        }
      },
      fc_defaultView: 'timeGridWeek',
      fc_dateIncrement: { days: 1 }, // how far the arrow buttons move forward and backwards in time
      fc_header: {
        // define the top row of buttons
        left: 'customPrev,customNext today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
      },
      fc_slotDuration: '00:15:00', // horizontal guides; affects event drag precision
      fc_slotLabelInterval: '01:00:00',
      fc_eventTimeFormat: { hour: 'numeric', minute: '2-digit', hour12: false }, // 24hr times on events
      fc_slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: false }, // 24hr time on axis labels
      fc_locale: 'en-GB', // so we can use 0:00 instead of 24:00
      fc_minTime: '12:00:00', // start the day column at noon
      fc_maxTime: '36:00:00', // end the day column at noon for the following day
      fc_scrollTime: '16:00:00', // calendar default view starts at 4pm.
      fc_navLinks: false, // whether to enable clicking on a day to view that day only.
      fc_selectMirror: true, // whether to draw placeholder event while user is dragging
      fc_unselectAuto: false, // whether clicking elsewhere closes the current selection
      fc_weekends: true, // whether to show weekends in week view
      fc_nowIndicator: false, // whether to draw line indicating current time in grid views.
      fc_progressiveEventRendering: true,
      fc_editable: true, // whether events on calendar can be modified
      fc_allDayMaintainDuration: true, // keep the end-time if events are moved to all-day (even though this is disabled)
      fc_eventResizableFromStart: true,
      fc_eventResourceEditable: true,
      fc_droppable: true, // specifies that external resources can be dropped on calendar
      fc_snapDuration: 300000, // milliseconds defining the increments of change for dragged events. (5 minutes)
      fc_dragScroll: true, // auto-scroll up/down when user drags an event near edge of view
      fc_themeSystem: 'bootstrap', // uses bootstrap css (see <style> below)
      fc_schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source', // free use of scheduler/resources
      // fullcalendar plugins
      fc_plugins: [
        // plugins must be defined in the JS
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin, // needed for dateClick
        bootstrapPlugin,
        resourceTimelinePlugin,
        resourceTimeGridPlugin,
        momentTimezonePlugin
      ],

      // This is set in the mounted hook, and allows access to the main fullcalendar calendar object
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
        illumination: ''
      },

      // this informs what buttons appear in the modal event editor
      isNewEvent: false,

      // toggles the popup for setting calendar events
      eventEditorIsActive: false,

      // properties of the selected calendar event
      activeEvent: {},

      // Controls a spinner in the lower right corner of the calendar that appears
      // while fetching events
      isLoading: false,

      currentUserScheduled: false,

      // To keep events displaying "naturally" during drag and drop, sometimes we need
      // to create temporary events on the calendar that are placeholders before the
      // actual event can be saved and rendered. This array marks all the temp events
      // to be cleared when the main event renders.
      tempPlaceholderEvent: '',
      // When the event with this ID renders to the calendar, the tempPlaceholderEvent will be removed.
      eventIdWithPlaceholder: '',

      // Use this to remember when a user starts dragging an event with the shift key pressed.
      // Even if they lift it before dropping, we want to make sure to duplicate the event rather
      // than simply moving it.
      eventDuplicateStarted: false,

      // Flag to indicate whether the eventDrop function ran (which means that our event was
      // drag-and-dropped in a successful location)
      eventDropDidRun: false
    }
  },

  methods: {

    // This is connected to the < button in the calendar header left
    incrementDateBack () {
      // Move one day in week view
      if (this.fullCalendarApi.state.viewType == 'timeGridWeek') {
        this.fullCalendarApi.incrementDate({ days: -1 })
      }
      // Move one month in the month view
      else if (this.fullCalendarApi.state.viewType == 'dayGridMonth') {
        this.fullCalendarApi.incrementDate({ months: -1 })
      }
      else {
        console.warn('Unknown calendar viewType, failed to increment date backwards')
      }
    },

    // This is connected to the > button in the calendar header left
    incrementDateForward () {
      // Move one day in week view
      if (this.fullCalendarApi.state.viewType == 'timeGridWeek') {
        // Do this +7 - 6 weirdness because the calendar only likes to move forward in 7 day chunks
        // while in week view, and the sensible { days: 1 } doesn't do anything unless you press it 7 times.
        // See this general issue https://github.com/fullcalendar/fullcalendar/issues/4678
        this.fullCalendarApi.incrementDate({ days: 7 })
        this.fullCalendarApi.incrementDate({ days: -6 })
      }
      // Move one month in the month view
      else if (this.fullCalendarApi.state.viewType == 'dayGridMonth') {
        this.fullCalendarApi.incrementDate({ months: 1 })
      }
      else {
        console.warn('Unknown calendar viewType, failed to increment date forwards')
      }
    },

    // This method inserts a duplicate event of the event passed in as an argument.
    // It is used to preserve the original event when we want to make a copy by dragging.
    // Without this, it would look like the user is modifying the original event, since it
    // would leave a vacancy behind.
    createPlaceholderEvent (e) {
      const placeholder = copyFcEvent(e)
      const tempDragEvent = this.fullCalendarApi.addEvent(placeholder)

      // Save this placeholder to be deleted later (see the eventRender method)
      this.tempPlaceholderEvent = tempDragEvent
    },

    // Method used to modify events in our backend database
    // Arguments must be events that have been formatted to work with the ptr calendar server
    async modifyEvent (originalEvent, modifiedEvent) {
      // Maybe we don't need to update anything?
      if (JSON.stringify(originalEvent) == JSON.stringify(modifiedEvent)) {
        this.refreshCalendarView()
        return
      }

      // Make request headers and include token.
      // Requires user to be logged in.
      const config = await this.getConfigWithAuth()
      const url = `${this.$store.state.api_endpoints.calendar_api}/modifyevent`
      const body = { originalEvent, modifiedEvent }
      axios
        .post(url, body, config)
        .then((res) => {
          this.isLoading = true
          this.refreshCalendarView()
        })
        .catch((error) => {
          this.eventEditorIsActive = false
          this.handleNotAuthorizedResponse(error)
        })
    },

    // Input must be formatted correctly to work with the ptr calendar server
    async createNewEvent (event) {
      // Make request headers and include token.
      // Requires user to be logged in.
      const config = await this.getConfigWithAuth()
      const url = `${this.$store.state.api_endpoints.calendar_api}/newevent`
      axios
        .post(url, event, config)
        .then((res) => {
          this.isLoading = true
          this.refreshCalendarView()
        })
        .catch((error) => {
          this.eventEditorIsActive = false
          this.handleNotAuthorizedResponse(error)
        })
    },

    // Prevent drag and drop into all-day slots
    fc_eventAllow (dropLocation) {
      return !dropLocation.allDay
    },

    // This method is run whenever a calendar event is dragged
    eventDragStart (e) {
      // reset this in case there is a stale value lingering
      this.eventDuplicateStarted = false
      // Dragging an event with shift means we need to preserve the original, and make a copy
      // wherever the event is dropped.
      if (e.jsEvent.shiftKey) {
        this.eventDuplicateStarted = true
        // remove the original event so the placeholder we add in its place doesn't render as an overlap
        e.event.remove()
        // put a placeholder event in the place of the original event being dragged.
        // This will be removed when the event is dropped.
        this.createPlaceholderEvent(e.event)
      } else {
        // Without the shift key, a drag means the event time will be modified to wherever it is dropped.
        // So, nothing to do here.
      }
    },

    // This method is guaranteed to run even if fc_eventDrop does not. So we can use it to handle
    // cleanup in cases where fc_eventDrop doesn't run due to trying to drag and drop into a
    // disallowed spot
    eventDragStop (e) {
      // Wrapping the functionality in this timeout forces it to run after fc_eventDrop
      setTimeout(() => {
        if (!this.eventDropDidRun) {
          // Replace the placeholder event with the real event which we refetch from the database
          this.tempPlaceholderEvent.remove()
          this.refreshCalendarView()
        }
        this.eventDropDidRun = false // reset the flag
      }, 0)
    },

    // Save events to the databse when they have been dragged to a new time
    fc_eventDrop (info) {
      this.eventDropDidRun = true
      // Get a format that we can use to send to the ptr calendar server
      const originalEvent = convertFullCalendarEventToPtrFormat(info.oldEvent)
      const modifiedEvent = convertFullCalendarEventToPtrFormat(info.event)

      // Check if we are in the process of duplicating an event or simply moving it.
      if (this.eventDuplicateStarted) {
        this.eventDuplicateStarted = false

        // Remove the placeholder where the event initially came from. This is because we
        // are about to revert the dropped event back to its origin.
        // The reasoning is that we want that original event to stay unchanged, and we'll create
        // a new event where the original drag was dropped.
        this.tempPlaceholderEvent.remove()

        // Create a new placeholder where the drag was dropped. This will be cleared when
        // the new event is saved in our database and then rendered.
        const placeholderEventDetails = copyFcEvent(info.event)
        const placeholderEvent = this.fullCalendarApi.addEvent(placeholderEventDetails)
        this.tempPlaceholderEvent = placeholderEvent

        // Put the original event back where it came from (don't update it to the drop location)
        info.revert()

        // Create the new event we want to save as a duplicate
        const duplicatedEvent = Object.assign({}, modifiedEvent)
        duplicatedEvent.event_id = makeUniqueID() // new event means it should have a new id
        // When the event with this ID is finally rendered, it will remove the placeholder we've saved
        this.eventIdWithPlaceholder = duplicatedEvent.event_id
        this.createNewEvent(duplicatedEvent)

      // If no key is pressed, simply modify the original event
      } else {
        this.modifyEvent(originalEvent, modifiedEvent)
      }
    },

    // This runs whenever an event is rendered to the calendar
    fc_eventRender (e) {
      // If the eventIdWithPlaceholder matches the event rendering, it means that there was
      // a placeholder event in its place, and we want to remove that event now.
      if (this.eventIdWithPlaceholder !== '' && e.event.id == this.eventIdWithPlaceholder) {
        this.tempPlaceholderEvent.remove() // remove the placeholder event
        this.eventIdWithPlaceholder = '' // neutralize the trigger
      }
      // Make sure the red line "now indicator" is visible above other elements.
      const n = document.getElementsByClassName('fc-now-indicator')[0]
      if (n) {
        n.parentElement.style['z-index'] = 'auto'
      }
    },

    // Save events to the database when they have been resized by dragging
    // This method runs after an event has been resized by dragging on the bottom edge
    fc_eventResize (info) {
      const originalEvent = convertFullCalendarEventToPtrFormat(info.prevEvent)
      const modifiedEvent = convertFullCalendarEventToPtrFormat(info.event)
      this.modifyEvent(originalEvent, modifiedEvent)
    },

    // Allow drag and drop events to overlap if the non-dragged one is a background event
    // This method runs continuously while an event is being dragged to determine if that
    // event can be dropped or not.
    fc_eventOverlap (stillEvent, movingEvent) {
      if (stillEvent.rendering === 'background') {
        return true
      } else {
        return false
      }
    },

    // Displays loading spinner when calendar is fetching events.
    fc_isLoading (val) {
      this.isLoading = val
    },

    // This method does some manual DOM manipulation to add the right-side UTC column to the calendar.
    // It's pretty hacky and will likely break if we update fullCalendar beyond v4
    addUTCTimeColumn () {
      const rows = document.querySelectorAll('.fc-slats > table.table-bordered tbody > tr')
      rows.forEach(r => {
        if (r.querySelectorAll('.fc-axis.fc-time').length < 2) {
          const timecol = r.querySelector('.fc-axis.fc-time')
          const timecolUtc = timecol.cloneNode(true)
          if (timecolUtc.querySelector('span')) {
            const timeText = timecolUtc.querySelector('span').textContent
            const utcTime = transformLocalTimeToUTC(this.fc_timeZone, timeText)
            timecolUtc.querySelector('span').textContent = utcTime
          }
          r.appendChild(timecolUtc)
        }
      })
      const skeleton = document.querySelectorAll('.fc-content-skeleton > table > tbody > tr')
      skeleton.forEach(e => {
        if (e.querySelectorAll('td.fc-axis').length < 2) {
          e.appendChild(e.querySelector('td.fc-axis').cloneNode(true))
        }
      })
      const tableBorderedRows = document.querySelectorAll('.fc-bg table.table-bordered tbody tr')
      tableBorderedRows.forEach(e => {
        if (e.querySelectorAll('.fc-axis').length < 2) {
          if (e.querySelector('.fc-axis span')) {
            e.querySelector('.fc-axis span').textContent = 'Obs. Local'
          }
          const utc_el = e.querySelector('.fc-axis').cloneNode(true)
          if (utc_el.querySelector('span')) {
            utc_el.querySelector('span').textContent = 'UTC'
          }
          e.appendChild(utc_el)
        }
      })
      const tableBorderedRows2 = document.querySelectorAll('.fc-head-container table.table-bordered tr')
      if (tableBorderedRows2.length > 0 && tableBorderedRows2[0].querySelectorAll('.fc-axis').length < 2) {
        tableBorderedRows2.forEach(e => {
          e.appendChild(e.querySelector('.fc-axis').cloneNode(true))
        })
      }
    },

    async updateNowIndicator () {
      this.fullCalendarApi.unselect()
      this.fullCalendarApi.refetchEvents()
    },

    // Display moon phase icons in the calendar
    dayRender (dayRenderInfo) {
      // Check if the current view is week view
      if (this.fullCalendarApi?.view?.type === 'timeGridWeek') {
        this.addUTCTimeColumn()
      }

      try { // ignore errors from the timezone not being loaded yet.
        const date = moment(dayRenderInfo.date).tz(this.fc_timeZone)
        const moon_phase = getMoonPhaseDays(
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
    },

    // Call the photonranch api to get moon times.
    async getMoonTimesFromAPI (start, end) {
      const url = `${this.$store.state.api_endpoints.active_api}/events/moon/rise-set-illum`
      const payload = {
        params: {
          start,
          end,
          lat: this.site_latitude,
          lng: this.site_longitude
        }
      }

      // Check cache
      const payload_str =
        start.slice(0, 10) + '#' + // only take the yyyy-mm-dd part of the date
        end.slice(0, 10)
      if (payload_str in this.moon_cache) {
        return this.moon_cache[payload_str]
      }

      // otherwise, make the api call
      const response = await axios.get(url, payload)
      const riseset = response.data

      // update cache
      this.moon_cache[payload_str] = riseset

      return riseset
    },

    async getConfigWithAuth () {
      let token
      try {
        token = await this.$auth.getTokenSilently()
      } catch (err) {
        console.error(err)
        console.warn('Did not acquire the needed token. Stopping request.')

        // small popup notification
        this.$buefy.toast.open({
          duration: 5000,
          message: "Oops! You aren't authorized to do that.",
          position: 'is-bottom',
          type: 'is-danger'
        })
      }

      return {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Authorization': `Bearer ${token}`
        }
      }
    },

    handleNotAuthorizedResponse (error) {
      if (error.response) {
        // Request made and server responded
        console.warn(error.response.data)
        console.warn(error.response.status)
        console.warn(error.response.headers)
        // small popup notification describing error
        this.$buefy.toast.open({
          duration: 5000,
          message: `${error.response.status} error: ${error.response.data}`,
          position: 'is-bottom',
          type: 'is-danger'
        })
      } else if (error.request) {
        // The request was made but no response was received
        console.warn(error.request)
      } else {
        // Something happened in setting up the request that triggered an Error
        console.warn('Error', error.message)
      }
    },

    // Used when exiting event editor modals. Clear selections, close modal, and refresh events.
    async refreshCalendarView () {
      this.fullCalendarApi.unselect()
      this.fullCalendarApi.refetchEvents()
      this.eventEditorIsActive = false

      // Update the list of active reservations
      this.$store.dispatch('calendar/fetchActiveReservations', this.calendarSite)
    },

    /* ===================================================/
    Calendar Event Selection Handlers
    /=================================================== */
    /**
     *  This is run when a user clicks on the calendar to create a new event.
     */
    newEventSelected (event) {
      this.activeEvent.startStr = moment(event.startStr).utc().format()
      this.activeEvent.endStr = moment(event.endStr).utc().format()
      this.activeEvent.title = this.$auth.user.name
      this.activeEvent.reservation_type = 'realtime' // or "project"
      this.activeEvent.creator = this.$auth.user.name
      this.activeEvent.id = makeUniqueID()
      this.activeEvent.site = this.calendarSite
      this.activeEvent.resourceId = this.calendarSite
      this.activeEvent.creator_id = this.$auth.user.sub
      this.activeEvent.project_id = 'none'
      this.activeEvent.reservation_note = ''

      this.isNewEvent = true // setting for the modal event editor
      this.eventEditorIsActive = true
    },
    /**
     *  This is run when a user clicks on an existing event in the calendar.
     */
    async existingEventSelected (arg) {
      const event = arg.event
      this.activeEvent.id = event.id
      this.activeEvent.startStr = moment(event.start).format()
      this.activeEvent.endStr = moment(event.end).format()
      this.activeEvent.title = event.title
      this.activeEvent.reservation_type = event.extendedProps?.reservation_type ?? 'project' // legacy events may not include this key
      this.activeEvent.creator = event.extendedProps.creator
      this.activeEvent.site = event.extendedProps.site
      this.activeEvent.resourceId = event.getResources()[0].id
      this.activeEvent.project_id = event.extendedProps.project_id
      this.activeEvent.reservation_note = event.extendedProps.reservation_note || ''

      this.isNewEvent = false // setting for the modal event editor
      this.eventEditorIsActive = true
    },

    /* ===================================================/
    Calendar mouseover events
    /=================================================== */

    eventMouseEnter (mouseInfo) {
      // Show moon info box when hovering a moon event.
      if (mouseInfo.event.title == 'Moon Event') {
        document.getElementById('moon-info').style.visibility = 'visible'

        this.moon_hover_data.rise = moment(mouseInfo.event.start)
          .tz(this.fc_timeZone).format('HH:mm MM/DD')
        this.moon_hover_data.set = moment(mouseInfo.event.end)
          .tz(this.fc_timeZone).format('HH:mm MM/DD')
        this.moon_hover_data.transit = moment(mouseInfo.event.extendedProps
          .transit).tz(this.fc_timeZone).format('HH:mm MM/DD')
        this.moon_hover_data.illumination = mouseInfo.event.extendedProps
          .illumination?.toFixed(3)

        const page = document.getElementsByClassName('page-view')[0]
        const page_boundary = page.getBoundingClientRect()
        const left_position_offset = page_boundary.left
        const top_position_offset = page_boundary.top
        const top_scroll_offset = document.body.getBoundingClientRect().top

        const x = mouseInfo.jsEvent.pageX - left_position_offset
        const y = mouseInfo.jsEvent.pageY - top_position_offset + top_scroll_offset

        document.getElementById('moon-info').style.top = y + 'px'
        document.getElementById('moon-info').style.left = x + 'px'
      }
    },

    eventMouseLeave (mouseInfo) {
      // Hide moon info boxes when the mouse leaves.
      if (mouseInfo.event.title == 'Moon Event') {
        document.getElementById('moon-info').style.visibility = 'hidden'
      }
    },

    /* ===================================================/
    Calendar CRUD
    /=================================================== */

    async refreshIfUserIsScheduled () {
      // Make request headers and include token.
      // Requires user to be logged in.
      const header = await this.getConfigWithAuth()
      const url = `${this.$store.state.api_endpoints.calendar_api}/is-user-scheduled`
      const user_id = this.$auth.user.sub
      const body = {
        user_id,
        site: this.calendarSite,
        time: moment().utc().format()
      }
      const response = await axios.post(url, body, header)
      this.currentUserScheduled = response.data
    },

    /**
     * When the user clicks submit, event details are sent to the backend.
     */
    async submitButtonClicked (newEvent) {
      const eventToPost = convertEventEditorResponseToPtrFormat(newEvent)
      // Make request headers and include token.
      // Requires user to be logged in.
      const config = await this.getConfigWithAuth()
      const url = `${this.$store.state.api_endpoints.calendar_api}/newevent`
      axios
        .post(url, eventToPost, config)
        .then((res) => {
          this.isLoading = true
          this.refreshCalendarView()
        })
        .catch((error) => {
          this.eventEditorIsActive = false
          this.handleNotAuthorizedResponse(error)
        })
    },

    /**
     * Close the event modal and deselect its associated calendar event.
     */
    cancelButtonClicked () {
      const calendarApi = this.$refs.fullCalendar.getApi()
      calendarApi.unselect()
      this.eventEditorIsActive = false
    },

    /**
     * Replicates the 'cancelButtonClicked' function for the case when the user
     * closes the modal window by clicking outside of it.
     */
    eventModalClosed () {
      const calendarApi = this.$refs.fullCalendar.getApi()
      calendarApi.unselect()
    },

    /**
     * Delete the selected calendar event from the backend database
     */
    async deleteButtonClicked (eventToDelete) {
      const config = await this.getConfigWithAuth()
      const url = `${this.$store.state.api_endpoints.calendar_api}/delete`
      const body = {
        event_id: eventToDelete.id,
        start: moment(eventToDelete.startStr).utc().format()
      }
      await axios
        .post(url, body, config)
        .then((res) => {
          this.isLoading = true
          this.refreshCalendarView()
        })
        .catch((error) => {
          this.eventEditorIsActive = false
          this.handleNotAuthorizedResponse(error)
        })
    },

    modifyButtonClicked (events) {
      const originalEvent = convertEventEditorResponseToPtrFormat(events.initialEvent)
      const modifiedEvent = convertEventEditorResponseToPtrFormat(events.modifiedEvent)
      this.modifyEvent(originalEvent, modifiedEvent)
    },

    /* ===================================================/
    Calendar Event Sources
    /=================================================== */

    // This is an eventSource that provides the red line indicating the current time
    async getNowIndicator (info) {
      const now = [
        {
          start: moment().utc().format(),
          end: moment().utc().add('1', 'minutes').format(),
          rendering: 'background',
          backgroundColor: '#ff0000',
          borderColor: '#ff0000',
          id: 'fc-custom-now-indicator',
          classNames: ['fc-now-indicator', 'fc-now-indicator-line']
        }
      ]
      return now
    },

    // This method serves as an eventSource for the calendar.
    // It provides indicators for the start and end time of the present observing night.
    // These values are sourced from the site config, in the site events.
    async getObservingStartEndIndicators () {
      const observeStart = moment(this.site_events_observing_start_time).tz(this.fc_timeZone)
      const observeEnd = moment(this.site_events_observing_end_time).tz(this.fc_timeZone)
      const startAndEnd = [
        {
          start: observeStart.format(),
          end: observeStart.add('1', 'minutes').format(),
          rendering: 'background',
          classNames: ['fc-observing-start-end-time', 'start']
        },
        {
          start: observeEnd.format(),
          end: observeEnd.add('1', 'minutes').format(),
          rendering: 'background',
          classNames: ['fc-observing-start-end-time', 'end']
        }
      ]
      return startAndEnd
    },

    // This eventSource creates and returns the background events that shade the
    // various stages of twilight each day
    async getTwilightEvents (info) {
      // Timer start
      const t0 = performance.now()

      // Get the time range we need to display in the UI.
      const firstDay = info.start.valueOf()
      const lastDay = info.end.valueOf()

      // List all the days we'll need to display
      const allDays = []
      const msPerDay = 1000 * 60 * 60 * 24

      // Generate events for 60 days before the start time to 60 days after.
      // This is to prevent the loading flicker when changing weeks.
      // note: this still only takes ~5ms to compute.
      for (
        let day = firstDay - 60 * msPerDay;
        day < lastDay + 60 * msPerDay;
        day += msPerDay
      ) {
        // Define each day by the timestamp a little after 1:01am to avoid DST hell
        allDays.push(day + 3700000)
      }

      // Collect all the events to display here
      const twilightEvents = []

      const site_lat = parseFloat(
        this.global_config[this.calendarSite].latitude
      )
      const site_lng = parseFloat(
        this.global_config[this.calendarSite].longitude
      )

      // Compute events for each day.
      allDays.map((day) =>
        twilightEvents.push(
          // Note oneDayTwilight generates all the twilight events for a single day
          ...Object.values(oneDayTwilight(day, site_lat, site_lng))
        )
      )

      // Finish timer
      const t1 = performance.now()
      const twilightComputeTime = t1 - t0
      if (twilightComputeTime > 100) {
        console.warn(
          'Slow computation of astro twilight: ',
          twilightComputeTime.toFixed(2) + 'ms'
        )
      }
      return twilightEvents
    },

    // This is a fullCalendar eventSource
    // Return an array of fullcalendar background events to display the moon visibility.
    async getMoonRiseSet (info) {
      if (!this.showMoonEvents) {
        return []
      }
      const ms_per_day = 86400000

      // Get the time range we need to display in the UI.
      // Also convert from ms timestamp to iso utc seconds.
      let start_timestamp = info.start.valueOf()
      let end_timestamp = info.end.valueOf()

      // Add buffer of a few days to the start and end window
      start_timestamp -= ms_per_day * 12
      end_timestamp += ms_per_day * 12

      // Convert timestamps to utc iso format
      const start_iso = moment(start_timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]')
      const end_iso = moment(end_timestamp).format('YYYY-MM-DDTHH:mm:ss[Z]')

      // Make the api call to get moon rise/set times
      const riseset = await this.getMoonTimesFromAPI(start_iso, end_iso)

      const moonEvents = []
      riseset.forEach((moon) => {
        // The primary moon event
        moonEvents.push({
          start: new Date(moon.rise),
          end: new Date(moon.set),
          rendering: 'background',
          backgroundColor: rgba_from_illumination(moon.illumination, 235),
          borderColor: '#aaaaaa',
          id: 'fc-custom-moon-indicator',
          classNames: ['fc-moon-indicator'],
          title: 'Moon Event',
          extendedProps: {
            illumination: moon.illumination,
            transit: moon.transit
          }
        })

        // The marker for transit time.
        moonEvents.push({
          start: moment(moon.transit).format(),
          end: moment(moon.transit).add('1', 'minutes').format(),
          title: 'Moon Event',
          rendering: 'background',
          // Opacity should vary with moon brightness, but not too much.
          backgroundColor: `rgba(255,255,255,${moon.illumination ** 0.25})`,
          classNames: ['fc-moon-transit-indicator']
        })
      })
      return moonEvents
    },

    // This eventSource gets the latest weather forecast to display as vertical colored bars
    async getWeatherForecast () {
      if (!this.showWeatherForecast) {
        return []
      }
      const forecast = this.$store.getters['sitestatus/forecast']
      if (forecast.length == 0) {
        return []
      } else {
        return forecast.map(f => {
          return {
            start: moment(f.utc_long_form).utc().format(),
            end: moment(f.utc_long_form).utc().add('1', 'hours').format(),
            rendering: 'background',
            title: 'weather forecast',
            id: 'fc-custom-weather-forecast',
            classNames: ['fc-forecast-event', `quality-${f.weather_quality_number}`]
          }
        })
      }
    },

    // This is the eventSource that gets the user reservations stored in the ptr calendar database
    async fetchSiteEvents (fetchInfo) {
      const site = this.calendarSite
      const url = `${this.$store.state.api_endpoints.calendar_api}/siteevents`
      const options = {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'
        }
      }

      // The start and end times must be formatted as UTC like 2020-12-31T23:59:59Z
      const body = {
        site,
        start: moment(fetchInfo.startStr).utc().format(),
        end: moment(fetchInfo.endStr).utc().format()
      }

      const resp = await axios.post(url, body, options)

      // Format the returned items to work nicely with fullcalendar.
      const formatted_events = resp.data.map((obj) => {
        const fObj = {
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
          project_priority: obj?.project_priority || 'standard',
          editable: obj.creator_id === this.userId || this.userIsAdmin,
          durationEditable: obj.reservation_type !== 'realtime' && (obj.creator_id === this.userId || this.userIsAdmin)
        }

        // Event colors
        const projects_color = getComputedStyle(document.documentElement).getPropertyValue('--ptr-calendar-project-color')
        const realtime_color = getComputedStyle(document.documentElement).getPropertyValue('--ptr-calendar-realtime-color')
        const user_projects_border = getComputedStyle(document.documentElement).getPropertyValue('--ptr-calendar-user-border')
        const user_realtime_border = user_projects_border

        const user_owns_event = (this.userIsAuthenticated && fObj.creator_id == this.userId)
        if (obj.reservation_type == 'realtime') {
          fObj.backgroundColor = realtime_color
          fObj.borderColor = user_owns_event ? user_realtime_border : realtime_color
        } else if (obj.reservation_type == 'project') {
          fObj.backgroundColor = projects_color
          fObj.borderColor = user_owns_event ? user_projects_border : projects_color
        } else {
          fObj.backgroundColor = projects_color
          fObj.borderColor = user_owns_event ? user_projects_border : projects_color
        }

        if (obj.project_priority === 'time_critical') {
          fObj.className = 'time-critical-calendar-event'
        } else if (obj.project_priority === 'low_priority') {
          fObj.className = 'low-priority-calendar-event'
        }
        return fObj
      })
      return formatted_events
    }
  }
}
</script>

<!-- TODO: reduce the bootstrap css (below) to the minimum required for button groups. -->
<style lang='scss'>
@import "@/style/buefy-styles.scss";
@import "@/style/_variables.scss";

$moon-width: 16px;

$event-left-margin: 4px;

$moon-info-z-index: 20; // this should be above all other events
$now-indicator-z-index: 19;
$moon-icon-z-index: 18;
$forecast-z-index: 16; // this should be above the moon
$moon-z-index: 15;
$observing-start-end-z-index: 15;
$sky-darkness-z-index: 15;

/* Styles for the overall calendar component */
.calendar-container {
  margin: 0 auto;
  height: 100%;
}
.fullCalendar-observatory {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
 .fullCalendar-observatory-calendar {
   position: relative;
 }
.fullCalendar-observatory-top {
  margin: 0 0 3em;
}

/* Styles for the calendar grid itself */
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
// Decrease event width so they don't cover the weather/moon stripes
.fc-time-grid-event {
  margin-left: $event-left-margin;
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

/* Styles for special types of user-created calendar events */
.fc-event.low-priority-calendar-event {
  border-width: 1px;
  box-shadow: 0 0 0 1px #000; /* outer border */
}
// This is the colored corner indicating a low priority reservation
.fc-event.low-priority-calendar-event::before {
  content: "";
  border-bottom-right-radius: 3px;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-bottom: 20px solid $ptr-calendar-low-priority-color; /* size and color of triangle */
}
.fc-event.time-critical-calendar-event {
  border-width: 1px;
  box-shadow: 0 0 0 1px #000; /* outer border */
}
// This is the colored corner indicating a time critical reservation
.fc-event.fc-event.time-critical-calendar-event::before {
  content: "";
  border-bottom-right-radius: 3px;
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-bottom: 20px solid $ptr-calendar-time-critical-color; /* size and color of triangle */
}

/* Styles for line showing the current time */
.fc-now-indicator {
  &.fc-now-indicator-line {
    border-color: rgb(255, 0, 0);
    z-index: $now-indicator-z-index;
    opacity: 1;
    background-color: red;
  }
  &.fc-now-indicator-arrow {
    border-color: rgb(255, 0, 0);
    z-index: $now-indicator-z-index;
    opacity: 1;
  }
}

/* Styles for the lines showing the start and end of observing
These times are obtained from the events in the site config */
.fc-observing-start-end-time {
  --line-color: rgb(22, 179, 163);
  border-color: var(--line-color);
  color: var(--line-color);
  height: 3px;
  z-index: $observing-start-end-z-index;
  opacity: 1;
  background-color: var(--line-color);
  font-size: 10px;
  text-justify: center;
  margin-left: 2px;

}
.fc-observing-start-end-time.start:before {
  content: "Observing Starts";
  position: absolute;
  top: -15px;
  right: 2px;
}
.fc-observing-start-end-time.end:before {
  content: "Observing Ends";
  position: absolute;
  top: 3px;
  right: 2px;
}

/* Styles for the moon elements */
#moon-info {
  background-color: black;
  opacity: 0.9;
  border-radius: 8px;
  padding: 1em;
  margin-bottom: 1em;
  position: absolute;
  visibility: hidden;
  z-index: $moon-info-z-index;
  top: 0px;
  left: 0px;
  pointer-events: none;
}
.moon-icon {
  padding: 5px;
  z-index: $moon-icon-z-index; // note: position: static means this does nothing
  color: yellow;
}
.fc-moon-transit-indicator {
  z-index: $moon-z-index;
  opacity: 1;
  width: $moon-width;
}
.fc-moon-indicator {
  z-index: $moon-z-index;
  width: $moon-width;
  transition: 0.2s;
}
.fc-moon-indicator:hover {
  opacity: 0.8;
  transition: 0.2s;
}

/* Styles for the weather forecast line events */
.fc-forecast-event {
  $background-opacity: 0;
  $border-width: $forecast-width;
  // z-index: $forecast-z-index !important;
  opacity: 1;
  background-color: rgba(0,0,0,0);
  width: 0;

  &.quality-1 {
    border-left: $border-width solid $ptr-calendar-forecast-1 !important;
  }
  &.quality-2 {
    border-left: $border-width solid $ptr-calendar-forecast-2 !important;
  }
  &.quality-3 {
    border-left: $border-width solid $ptr-calendar-forecast-3 !important;
  }
  &.quality-4 {
    border-left: $border-width solid $ptr-calendar-forecast-4 !important;
  }
  &.quality-5 {
    border-left: $border-width solid $ptr-calendar-forecast-5 !important;
  }
}

/* The following styles are copied over from bootstrap and are required
to style the calendar buttons */

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
.btn[disabled] {
  cursor: not-allowed;
  filter: alpha(opacity=65);
  opacity: 0.65;
  -webkit-box-shadow: none;
  box-shadow: none;
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
.btn-primary.active {
  color: #ffffff;
  background-color: #286090;
  background-image: none;
  border-color: #204d74;
}

.btn-primary.disabled:hover,
.btn-primary[disabled]:hover {
  background-color: #337ab7;
  border-color: #2e6da4;
}

.btn-group {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.btn-group > .btn {
  position: relative;
  float: left;
}

.btn-group .btn + .btn {
  margin-left: -1px;
}
</style>
