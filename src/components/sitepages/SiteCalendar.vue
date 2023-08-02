<template>
  <div class="cal-page-wrapper">
    <the-calendar
      v-if="timezone"
      class="the-calendar"
      :fc_time-zone="timezone"
      :calendar-site="sitecode"
      :fc_resources="listOfObservatories"
      :show-moon-events="showMoonEvents"
      :show-weather-forecast="showWeatherForecast"
    />

    <div class="calendar-adjacent">
      <site-reservation-status
        :sitecode="sitecode"
        class=""
      />

      <div class="projects-section">
        <p class="menu-label">
          Your Projects
        </p>
        <p style="text-decoration: line-through;">
          Drag projects to the calendar to schedule them
        </p>
        <p>under construction</p>
        <div class="projects-container">
          <!-- <b-tag
            v-for="(p, index) in user_projects"
            :key="index"
            class="draggable-project-tag"
            type="is-info"
            rounded
          >
            {{ p.project_name }}
          </b-tag> -->
        </div>
      </div>

      <div class="fc-settings-box">
        <div>
          <p class="menu-label">
            Settings
          </p>
          <div class="field">
            <b-switch v-model="showMoonEvents">
              Show moon events
            </b-switch>
          </div>
          <div class="field">
            <b-switch v-model="showWeatherForecast">
              Show Weather Forecast
            </b-switch>
          </div>
        </div>
        <div style="border-bottom: 1px solid grey; width: 100%; height: 1em; margin-bottom: 1em;" />
        <p class="menu-label">
          Calendar Legend
        </p>
        <div class="legend">
          <div class="legend-item">
            <div class="reservation-visual" />
            <div>
              <b>Weather Forecast</b>
              <p class="forecast forecast-1">Excellent</p>
              <p class="forecast forecast-2">Good</p>
              <p class="forecast forecast-3">Ok</p>
              <p class="forecast forecast-4">Poor</p>
              <p class="forecast forecast-5">Terrible</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="reservation-visual realtime" />
            <div>
              <b>Realtime Session</b>
              <p>Blue events are used to reserve time for manual observing via the "Observe" tab.</p>
              <p>You can schedule time in a 30 or 45 minute block.</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="reservation-visual project" />
            <div>
              <b>Project Session</b>
              <p>Purple events designate a project that has been created by the user.</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="reservation-visual low-priority" />
            <div>
              <b>Low Priority Event</b>
              <p>Events with the green corner are ok to remove if you want to observe during this time</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="reservation-visual time-critical" />
            <div>
              <b>Time Critical Observation</b>
              <p>Events with the red corner require precise time schedules. </p>
              <p>While they behave the same as standard events, they are shown here for informative purposes.</p>
            </div>
          </div>
          <div class="legend-item">
            <div class="reservation-visual self-owned" />
            <div>
              <b>Your Reservations</b>
              <p>Calendar events created by you will be outlined in gold.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TheCalendar from '@/components/calendar/TheCalendar'
import SiteReservationStatus from '@/components/calendar/SiteReservationStatus'
import { mapGetters, mapState } from 'vuex'
import moment from 'moment'

export default {
  name: 'SiteCalendar',
  props: ['sitecode'],
  components: {
    TheCalendar,
    SiteReservationStatus
  },
  data () {
    return {
      localTime: '-',
      siteTime: '-',
      utcTime: '-',

      showMoonEvents: true,
      showWeatherForecast: true
    }
  },
  created () {
    this.timeInterval = setInterval(this.updateTime, 1000)
    window.moment = moment // use moment lib in browser devtools
  },
  mounted () {
    // Load the users projects so they can add them to calendar events.
    if (this.userIsAuthenticated) {
      this.$store.dispatch('user_data/fetchUserProjects', this.userId)
    }
  },
  destroyed () {
    clearInterval(this.timeInterval)
  },
  methods: {
    displayUtcTime (time) {
      return moment(time).utc().format('MMM D, kk:mm')
    },
    updateTime () {
      this.localTime = moment().format('MMM D, kk:mm')

      if (this.timezone) {
        this.siteTime = moment().tz(this.timezone).format('MMM D, kk:mm')
      }
      else {
        this.siteTime = '---'
      }
      this.utcTime = moment().utc().format('MMM D, kk:mm')
    }
  },
  computed: {
    ...mapGetters('site_config', [
      'all_sites',
      'timezone'
    ]),
    ...mapState('user_data', [
      'userIsAuthenticated',
      'userIsAdmin',
      'userId',
      'userName',
      'user_projects'
    ]),

    // Calendar Resources (Observatories) to feed into the calendar component
    listOfObservatories () {
      const all_obs = []
      this.all_sites.forEach(o => {
        all_obs.push({
          id: o.site,
          title: o.name,
          eventColor: '#4e1199',
          eventBorderColor: '#200589',
          eventTextColor: '#fbf8fd',
          eventClassNames: '',
          children: '',
          parentId: '',
          anyOtherPropsHere:
            'call from key extendedProps of this resource object'
        })
      })
      return all_obs
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/style/_responsive.scss";
@import "@/style/_variables.scss";
@import "@/style/buefy-styles.scss";

$content-view-height: calc(100vh - #{$top-bottom-height});
$content-padding: 2em;
$calendar-height: calc(#{$content-view-height} - #{$content-padding * 2});

.cal-page-wrapper {
  width: 100%;
  padding: $content-padding;
  padding-left: calc($content-padding + 25px); // account for quick sites button column
  @include tablet {
    display: grid;
    grid-template-rows: 50vh 1fr 1fr;
    grid-template-columns: 1fr;
  }

  @include desktop {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: $calendar-height;
  }
}

.the-calendar {
  @include desktop {
    height: calc(100vh - 360px); //hacky, but make it so you don't need to scroll to see full calendar
  }
}

.calendar-adjacent {
  padding: 2em;
  display:flex;
  gap: 2em;

  @include tablet {
    flex-direction: row;
    margin: 0;
  }

  @include desktop {
    flex-direction: column;
    margin: 0;
  }

  & > div {
    padding: 1em;
    width: 100%;
    border-radius: 8px;
    background-color:rgba(10,10,10,0.8);
  }
}

.projects-section {
  & .projects-container {
    display: flex;
    gap: 1em;
  }
}

.draggable-project-tag {
  background-color: $ptr-calendar-project-color !important;
}

#moon-info {
  position: absolute;
  visibility: hidden;
  z-index: 16;
  top: 0px;
  left: 0px;
}
.fc-moon-indicator {
  z-index: 5;
  opacity: 0.5;
  width: 20px;
  border-radius: 12px;
  transition: 0.2s;
}
.fc-moon-indicator:hover {
  opacity: 0.8;
  transition: 0.2s;
}

.legend {
  display:flex;
  flex-direction: column;
  gap: 1em;
}

.legend-item {
  display: flex;
  gap: 1em;
}

.forecast {
  border-left: 4px solid;
  margin-left: -20px;
  padding-left: 20px;

  &.forecast-1 {
    border-color: $ptr-calendar-forecast-1;
  }
  &.forecast-2 {
    border-color: $ptr-calendar-forecast-2;
  }
  &.forecast-3 {
    border-color: $ptr-calendar-forecast-3;
  }
  &.forecast-4 {
    border-color: $ptr-calendar-forecast-4;
  }
  &.forecast-5 {
    border-color: $ptr-calendar-forecast-5;
  }
}
.reservation-visual {
  width: 30px;
  height: 50px;
  border-radius: 3px;
  flex-shrink: 0;
  margin-top: 6px; // align top of the visual with description to the right
  &.realtime {
    background-color: $ptr-calendar-realtime-color;
  }
  &.project{
    background-color: $ptr-calendar-project-color;
  }
  &.low-priority {
    background-color: rgba(255, 255, 255, 0.25);
    position: relative;
  }
  &.low-priority::before {
    content: "";
    border-bottom-right-radius: 3px;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-bottom: 20px solid $ptr-calendar-low-priority-color;
  }
  &.time-critical {
    background-color: rgba(255, 255, 255, 0.25);
    position: relative;
  }
  &.time-critical::before {
    content: "";
    border-bottom-right-radius: 3px;
    position: absolute;
    bottom: 0;
    right: 0;
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-bottom: 20px solid $ptr-calendar-time-critical-color;
  }
  &.self-owned {
    background-color: rgba(255, 255, 255, 0.25);
    border: 2px solid $ptr-calendar-user-border;
  }
}
</style>
