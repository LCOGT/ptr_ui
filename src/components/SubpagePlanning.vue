<template><div>

  <div class="demo-app container">
    <div class="demo-app-top">
    <!--week-of-events /-->
    <the-calendar :calendarSite="sitecode" />
    </div>
    </div>

</div></template>


<script>
import WeekOfEvents from '@/components/WeekOfEvents'
import TheCalendar from '@/components/TheCalendar';

export default {
    name: "SubpagePlanning",
    props: ["sitecode"],
    components: { 
        WeekOfEvents,
        TheCalendar,
    },
    
}

</script>


<style scoped>
.demo-app {
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-top {
  margin: 0 0 3em;
}

.demo-app-calendar {
  margin: 0 auto;
  max-width: 900px;
}

</style>