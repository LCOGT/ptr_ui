<template>
    <the-dome-cam />
</template>


<script>

import TheDomeCam from '@/components/TheDomeCam'
export default {
    name: "SubpageHome",
    props: ["sitecode"],
    components: {
        TheDomeCam,
    },
    
}

</script>


<style scoped>

</style>