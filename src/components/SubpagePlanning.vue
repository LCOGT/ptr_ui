<template><div>

    <!--week-of-events /-->
    <the-calendar :calendarSite="sitecode" />

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
</style>