<template>
  <div class="container">
    
    <b-field class="site-selector" label="Site">
      <b-select v-model="calendarSite">
        <option value="wmd">wmd</option>
        <option value="other">other</option>
      </b-select>
    </b-field>

    <the-calendar :calendarSite="calendarSite" :fc_resources="listOfObservatories"/>

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

      // Calendar Resources (Observatories) to feed into the calendar component
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

    };
  },
  methods: {}
}
</script>

<style lang='scss'>

.site-selector {
  margin-top: 2em;
  padding-bottom: 2em;
  margin-left: 2em;
}

</style>
