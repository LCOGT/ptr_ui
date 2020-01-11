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

    <the-calendar :calendarSite="calendarSite"/>

  </div>
</template>

<script>
import TheCalendar from '@/components/TheCalendar';

export default {
  name: 'calendarPage',
  components: {
    TheCalendar,
  },
  data: function() {
    return {

      // prototype of the active observatory site
      calendarSite: "wmd",

      // Calendar Resources (Observatories)
      listOfObservatories: [
        {
          'id': 'wmd',
          'title': 'West Mountain Drive',
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
        },
        {
          'id': 'other',
          'title': 'Another Observatory',
          'eventColor': '#f6903d',
          'eventBackgroundColor': '#f6903d',
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
        },
      ],

      // Define alternate calendar views (eg. 10 days at a time)
      resourceViews: {
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

    };
  },
  methods: {

    listObservatories() {

      let allResources = [];

      // A resource (an observatory) to return.
      // Defined here: https://fullcalendar.io/docs/resource-parsing
      const wmd = {
        'id': 'wmd',
        'title': 'West Mountain Drive',
        'eventColor': '#7d12ff',
        'eventBackgroundColor': '#200589',
        'eventBorderColor': '#000000',
        'eventTextColor': '#fbf8fd',
        'eventClassNames': '',
        'eventOverlap': false, // defines whether events are allowed to overlap
        'eventConstraint': '',
        'eventAllow': '',
        'businessHours': '',
        'children': '',
        'parentId': '',
        'anyOtherPropsHere': 'call from key extendedProps of this resource object',
      }

      allResources.push(wmd)
      return allResources;

    },
  }
}

</script>

<!-- TODO: reduce the bootstrap css (below) to the minimum required for button groups. -->
<style lang='scss'>

/* the line showing the current time */
.fc-now-indicator.fc-now-indicator-line {
  border-color: rgba(255, 0, 0, 0.5);
}
.fc-now-indicator.fc-now-indicator-arrow {
  border-color: rgba(255, 0, 0, 0.5);
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

.demo-app-calendar {
  margin: 0 auto;
  max-width: 900px;
}
</style>
