
<template>
  <div class="demo-app container">
<link rel="stylesheet" type="text/css" href="">
    <div class="demo-app-top">
      <!--button @click="gotoPast">go to a date in the past</button-->
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
      :events="calendarEvents"
      :themeSystem="themeSystem"
      :selectable="selectable"
      :unselectAuto="unselectAuto"
      :selectMirror="true"
      @select="handleSelection"
      @dateClick="handleDateClick"
    />
  </div>
</template>

<script>
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
    FullCalendar // make the <FullCalendar> tag available
  },
  data: function() {
    return {
      themeSystem: 'bootstrap',
      calendarPlugins: [
        // plugins must be defined in the JS
        dayGridPlugin,
        timeGridPlugin,
        interactionPlugin, // needed for dateClick
        bootstrapPlugin
      ],
      selectable: true,
      unselectAuto: true,
      calendarWeekends: true,
      calendarEvents: [
        // initial event data
        { 
          title: "Event Now", 
          start: new Date(),
        }
      ]
    };
  },
  mounted() {
    let btns = document.querySelectorAll(".btn")
    let len = btns.length
    for (let i=0; i<len; i+=1) {
      btns[i].classList.add('button')
    }
  },
  methods: {
    gotoPast() {
      let calendarApi = this.$refs.fullCalendar.getApi(); // from the ref="..."
      calendarApi.gotoDate("2000-01-01"); // call a method on the Calendar object
    },
    handleDateClick(arg) {
      //if (confirm("Would you like to add an event to " + arg.dateStr + " ?")) {
        //this.calendarEvents.push({
          //// add new event data
          //title: "New Event",
          //start: arg.date,
          //allDay: arg.allDay
        //});
      //}
    },
    handleSelection(arg) {
      if (confirm("Would you like to add an event to " + arg.startStr+ " ?")) {
        this.calendarEvents.push({
          // add new event data
          title: "New Event",
          start: arg.startStr,
          end: arg.endStr,
          allDay: arg.allDay
        });
      }
    },
  }
};
</script>

<!--style lang="css" src="../style/bootstrap.css" scoped></style-->
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
</style>
<!--style lang="scss" src="../style/darkly.scss" scoped></style-->
