<template>
    <image-view :site="sitecode"/>
</template>


<script>

import ImageView from '@/components/ImageView'
export default {
    name: "SubpageData",
    props: ["sitecode"],
    components: {
        ImageView,
    },
    beforeMount() {
        // TODO: create a cleaner system of tracking the active site and devices.
        /*
        this.active_site = 'WMD'
        this.active_mount = 'mnt1'
        this.$store.dispatch('images/refresh_latest_images')
        */
    },
    
}

</script>


<style scoped>

</style>