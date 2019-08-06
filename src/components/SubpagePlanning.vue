<template><div>

    <week-of-events />

</div></template>


<script>
import WeekOfEvents from '@/components/WeekOfEvents'

export default {
    name: "SubpagePlanning",
    props: ["sitecode"],
    components: { 
        WeekOfEvents,
    },
    
}

</script>


<style scoped>

</style>