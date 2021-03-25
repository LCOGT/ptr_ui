<template>
  <div class="cal-page-wrapper">


    <the-calendar 
      class="the-calendar"
      v-if="timezone"
      :fc_timeZone="timezone"
      :calendarSite="sitecode" 
      :fc_resources="listOfObservatories" 
      :showMoonEvents="showMoonEvents"
      />

    <div class="calendar-adjacent">

      <site-reservation-status :sitecode="sitecode" class=""/>

      <div class="projects-section">
        <p>Projects will be shown here.</p>
        <p>You will be able to drag them onto the calendar to schedule them.</p>   
      </div>

      <div class="fc-settings-box">
        <div>
          <p class="menu-label">Settings</p>
          <div class="field">
              <b-switch v-model="showMoonEvents">
                  Show moon events
              </b-switch>
          </div>
        </div>
      </div>

    </div>
    <!--button class="button" @click="getUserEvents">get user events</button-->

  </div>
</template>


<script>
import TheCalendar from "@/components/calendar/TheCalendar";
import UserEventsTable from "@/components/UserEventsTable";
import SiteReservationStatus from "@/components/SiteReservationStatus"
import { mapState, mapGetters } from "vuex";
import axios from "axios";
import moment from "moment";

export default {
  name: "SiteCalendar",
  props: ["sitecode"],
  components: {
    TheCalendar,
    UserEventsTable,
    SiteReservationStatus,
  },
  data() {
    return {
      localTime: "-",
      siteTime: "-",
      utcTime: "-",

      showMoonEvents: true,

      // URL for the calendar backend api
      //backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',
      backendUrl: "https://calendar.photonranch.org",
    };
  },
  created() {
    this.timeInterval = setInterval(this.updateTime, 1000);
    window.moment = moment; // use moment lib in browser devtools
  },
  mounted() {
    // Load the users projects so they can add them to calendar events. 
    if (this.$auth.isAuthenticated) {
      this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
    }
  },
  destroyed() {
    clearInterval(this.timeInterval);
  },
  watch: {
    // Update the user's schedulable projects if the user changes. 
    user() {
      this.$store.dispatch('user_data/fetchUserProjects', this.user.sub)
    }
  },
  methods: {
    displayUtcTime(time) {
      return moment(time).utc().format("MMM D, kk:mm");
    },
    updateTime() {
      this.localTime = moment().format("MMM D, kk:mm");

      if (this.timezone) {
        this.siteTime = moment().tz(this.timezone).format("MMM D, kk:mm");
      }
      else {
        this.siteTime = '---'
      }
      this.utcTime = moment().utc().format("MMM D, kk:mm");
    },
  },
  computed: {
    ...mapGetters("site_config", [
      "site_config", 
      "global_config", 
      "timezone"
    ]),

    ...mapState("site_config", [
      "did_config_load_yet"
    ]),

    user() {
      return this.$auth.user;
    },
    username() {
      if (this.$auth.isAuthenticated) {
        return this.$auth.user.name;
      }
      return "-";
    },

    // Calendar Resources (Observatories) to feed into the calendar component
    listOfObservatories() {
      let all_obs = [];
      for (let a_site in this.global_config) {
        let o = this.global_config[a_site];
        all_obs.push({
          id: o.site,
          title: o.name,
          eventColor: "#4e1199",
          eventBorderColor: "#200589",
          eventTextColor: "#fbf8fd",
          eventClassNames: "",
          eventOverlap: false, // defines whether events are allowed to overlap
          eventConstraint: "",
          eventAllow: "",
          businessHours: "",
          children: "",
          parentId: "",
          anyOtherPropsHere:
            "call from key extendedProps of this resource object",
        });
      }
      return all_obs;
    },
  },
};
</script>


<style scoped lang="scss">
@import "@/style/_responsive.scss";

$content-view-height: calc(100vh - #{$top-bottom-height});
$content-padding: 2em;
$calendar-height: calc(#{$content-view-height} - #{$content-padding * 2});

.cal-page-wrapper {
  width: 100%;
  padding: $content-padding;
  @include tablet {
    display: grid;
    grid-template-rows: 50vh 1fr 1fr;
    grid-template-columns: 1fr;
  }

  @include desktop {
    display: grid;
    grid-template-columns: 2fr 1fr;
    //grid-template-rows: $calendar-height;
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

  @include tablet {
    flex-direction: row;
    padding: 2em 0;
    margin: 0;
  }

  @include desktop {
    flex-direction: column;
    margin: 1em;
  }

  & > div {
    padding: 1em;
    margin: 1em;
    width: 100%;
    border-radius: 8px;
    background-color:rgba(10,10,10,0.8);
  }
}

.projects-section {
}

.fc-settings-box {
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
</style>
