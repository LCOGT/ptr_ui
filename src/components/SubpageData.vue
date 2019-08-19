<template><section>
    <image-view :site="sitecode"/>
    <images-table style="margin-top: 3em;"/>
</section></template>


<script>

import ImageView from '@/components/ImageView'
import ImagesTable from '@/components/ImagesTable'
export default {
    name: "SubpageData",
    props: ["sitecode"],
    components: {
        ImageView,
        ImagesTable,
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