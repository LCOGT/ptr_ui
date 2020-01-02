 
<template>
  <div class="demo-app container">
    <div class="demo-app-top">
      <!--button @click="gotoPast">go to a date in the past</button-->
      <b-field label="Site">
        <b-select v-model="calendarSite">
          <option value="wmd">wmd</option>
          <option value="other">other</option>
        </b-select>
      </b-field>
    </div>
    <FullCalendar
      class="demo-app-calendar"
      ref="fullCalendar"
      defaultView="timeGridWeek"
      :header="{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      }"
      :plugins="calendarPlugins"
      :weekends="calendarWeekends"
      :events="fetchSiteEvents"
      :nowIndicator="true"
      :themeSystem="themeSystem"
      :selectable="selectable"
      :unselectAuto="unselectAuto"
      :selectMirror="true"
      :editable="true"
      slotDuration="00:30:00"
      min-time="12:00:00"
      max-time="36:00:00"
      scrollTime="17:00:00"
      @select="newEventSelected"
      @eventClick="existingEventSelected"
    />

    <!-- popup for creating calendar events -->
    <b-modal :active.sync="isEventModalActive " @close="eventModalClosed" :width="640" scroll="keep">
      <div class="card">
          <div class="card-content">

              <b-field horizontal label="Owner">
                  <p class="is-family-primary">{{activeEvent.creator}}</p>
              </b-field>
              
              <b-field horizontal label="Event Name">
                  <b-input :default="activeEvent.title" v-model="activeEvent.title"></b-input>
              </b-field>

              <b-field horizontal label="Start Time">
                  <b-input v-model="activeEvent.startStr"></b-input>
              </b-field>

              <b-field horizontal label="End Time">
                  <b-input name="subject" v-model="activeEvent.endStr" autocomplete="off"></b-input>
              </b-field>

              <b-field horizontal>
                <b-field>
                <button class="button is-info" :disabled="isSubmitDisabled" @click="submitButtonClicked" style="margin-right: 1em; background-color: #55f;">submit</button>
                <button class="button is-grey" @click="cancelButtonClicked">cancel</button>
                <div style="width: 1em;" />
                <button class="button is-danger" @click="deleteButtonClicked">delete event</button>
                </b-field>
              </b-field>

          </div>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { Auth } from "aws-amplify";
import axios from 'axios'
import moment from 'moment'

import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from '@fullcalendar/bootstrap';

// must manually include stylesheets for each plugin
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";

export default {
  name: 'calendar',
  components: {
    FullCalendar, // make the <FullCalendar> tag available
  },
  data: function() {
    return {

      // prototype of the active observatory site
      calendarSite: "wmd",

      // Helper data for communicating with the calendar backend.
      axiosConfig: {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        }
      },
      backendUrl: 'https://m1vw4uqnpd.execute-api.us-east-1.amazonaws.com',

      // popup for setting calendar events
      isEventModalActive : false,
      isSubmitDisabled: false,

      // properties of the selected calendar event
      activeEvent: {
        startStr: '',
        endStr: '',
        title: '',
        creator: '',
      },

      // Settings used to configure the fullcalendar component
      themeSystem: 'bootstrap',
      calendarPlugins: [
        // plugins must be defined in the JS
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin, // needed for dateClick
        bootstrapPlugin
      ],
      selectable: true,
      unselectAuto: false,
      calendarWeekends: true,
      slotDuration: '00:30:00',
      calendarEvents: [
        // initial event data
        { 
          title: "Event Now", 
          start: new Date(),
        }
      ]
    };
  },
  methods: {

    gotoPast() {
      let calendarApi = this.$refs.fullCalendar.getApi(); // from the ref="..."
      calendarApi.gotoDate("2000-01-01"); // call a method on the Calendar object
    },

    refreshCalendarView() {
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.refetchEvents();
    },

    /*===================================================/
      Calendar Event Selection Handlers
    /===================================================*/
    /**
     *  This is run when a user clicks on the calendar to create a new event.
     */
    newEventSelected(arg){ 
      console.log('new event selected')
      this.activeEvent.startStr = arg.startStr;
      this.activeEvent.endStr = arg.endStr;
      this.activeEvent.title = "new reservation"
      this.activeEvent.creator = this.$store.getters['auth/username']
      this.activeEvent.id = Date.now()+this.$store.getters['auth/username']
      this.activeEvent.site = this.calendarSite

      let startstr = arg.startStr
      console.log(startstr)
      console.log(new Date(startstr))
      let a = new Date(startstr).toISOString()
      let b = moment(a).format()
      console.log(a)
      console.log(b)

      this.isSubmitDisabled = false
      this.isEventModalActive = true;
    },
    /**
     *  This is run when a user clicks on an existing event in the calendar.
     */
    existingEventSelected(arg) {
      console.log('existing event selected')
      let event = arg.event;
      //console.log(event)
      this.activeEvent.id = event.id,
      this.activeEvent.startStr = event.start.toISOString();
      this.activeEvent.endStr = event.end.toISOString();
      this.activeEvent.title = event.title;
      this.activeEvent.creator = event.extendedProps.creator
      this.activeEvent.site = event.extendedProps.site
      this.isSubmitDisabled = true
      this.isEventModalActive = true
    },


    /*===================================================/
      Calendar CRUD
    /===================================================*/
    /**
     * When the user clicks submit, event details are sent to the backend.
     */
    submitButtonClicked() {
      let newEvent = {
        title: this.activeEvent.title,
        start: this.activeEvent.startStr,
        end: this.activeEvent.endStr,
        id: this.activeEvent.id,
        creator: this.activeEvent.creator,
        site: this.activeEvent.site,
      }
      this.postNewEvent(newEvent)
      this.isEventModalActive = false;
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.unselect()
    },
    /**
     * Close the event modal and deselect its associated calendar event.
     */
    cancelButtonClicked() {
      this.isEventModalActive =false;
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.unselect()
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
    async deleteButtonClicked() {
      let url = `${this.backendUrl}/dev/delete`
      let body = {
        "event_id": this.activeEvent.id,
        "start": moment(this.activeEvent.startStr).format(),
      }
      console.log(body)

      let res = await axios.post(url, body, this.axiosConfig)
      console.log(res)

      // refresh to show update
      this.isEventModalActive = false
      this.refreshCalendarView()

    },
    async postNewEvent(newEvent) {
      let url = `${this.backendUrl}/dev/newevent`
      let eventToPost = {
        "event_id": newEvent.id,
        "start": newEvent.start,
        "end": newEvent.end,
        "creator": newEvent.creator,
        "site": newEvent.site,
        "title": newEvent.title,
      }
      console.log(eventToPost)

      let res = await axios.post(url, eventToPost, this.axiosConfig)
      console.log(res)

      // refresh to show update
      this.refreshCalendarView()
    },


    /*===================================================/
      Fetching Calendar Events
    /===================================================*/
    async fetchSiteEvents(fetchInfo) {
      // TODO: we don't want to hardcode the site here
      let site = this.calendarSite
      let url = `${this.backendUrl}/dev/siteevents`

      let body = {
        "site": site,
        "start": fetchInfo.startStr,
        "end": fetchInfo.endStr,
      }
      console.log(body)

      let resp = await axios.post(url, body, this.axiosConfig)
      console.log(resp)
      let formatted_events = resp.data.table_response.Items.map(obj => {
        let fObj = {
          'start': obj.start,
          'end': obj.end,
          'id': obj.event_id,
          'title': obj.title,
          'creator': obj.creator,
          'site': obj.site,
        }
        return fObj
      })
      return formatted_events
    },


  },

  watch: {
    calendarSite: function(val){
      console.log(`site changed to ${val}`)
      this.refreshCalendarView()
    }
  }
};
</script>

<!-- TODO: reduce the bootstrap css (below) to the minimum required for button groups. -->
<style lang='scss'>
/*@import url("https://bootswatch.com/4/darkly/bootstrap.min.css");*/
.demo-app {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}
.fc table * {
  border-color: grey;
}

.demo-app-top {
  margin: 0 0 3em;
}

.demo-app-calendar {
  margin: 0 auto;
  max-width: 900px;
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
