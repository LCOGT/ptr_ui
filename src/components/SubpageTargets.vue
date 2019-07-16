<template>
    <the-sky-chart />
</template>


<script>

import TheDomeCam from '@/components/TheDomeCam'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
export default {
    name: "SubpageTargets",
    props: ["sitecode"],
    components: {
        TheDomeCam,
        TheSkyChart,
    },
    
}

</script>


<style scoped>

</style>