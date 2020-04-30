<template><div>

    <div class="level site-welcome-text">
        <div class="level-item">
        Welcome to {{sitecode.toUpperCase()}}
        </div>
    </div>

    <div class="spacer" style="height: 2em;" />

    <the-dome-cam v-if="sitecode=='wmd'"/>
    <br>

    <!--leaflet-map 
        name="leafmap"
        :latitude="latitude"
        :longitude="longitude"
    ></leaflet-map-->

    <div style="width: 100%; height: 500px; margin-bottom: 1em;">
        <iframe style="width: 100%; height: 100%;" :src="`https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=7&level=surface&overlay=clouds&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&detailLat=${latitude}&detailLon=${longitude}&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1`" frameborder="0"></iframe>
    </div>


    <!-- This is a temporary solution only. Does not scale. -->
    <!-- Add ClearDarkSky charts to site homepage -->
    <div class="level" v-if="sitecode=='wmd'">
        <a href=https://www.cleardarksky.com/c/SaBarbCAkey.html>
        <img src="https://www.cleardarksky.com/c/SaBarbCAcsk.gif?c=1594801"></a>
    </div>
    <div class="level" v-if="sitecode=='saf'">
        <a href=https://www.cleardarksky.com/c/LmyRdgObNMkey.html>
        <img src="https://www.cleardarksky.com/c/LmyRdgObNMcsk.gif?c=1594801"></a>
    </div>



    <div style="height: 2em;" />



</div>
</template>


<script>
import TheDeviceSelectors from '@/components/TheDeviceSelectors'
import TheDomeCam from '@/components/TheDomeCam'
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import ImageView from '@/components/ImageView'
import LeafletMap from '@/components/LeafletMap'
import StatusOverview from '@/components/StatusOverview'

export default {
    name: "SiteHome",
    props: ["deviceStatus", "sitecode"],
    mixins: [commands_mixin],
    components: {
        TheDeviceSelectors,
        TheDomeCam,
        ImageView,
        LeafletMap,
        StatusOverview,
    },
    computed: {
        ...mapGetters('images', ['current_image']),
        ...mapGetters('site_config', ['site_config']),

        latitude() { return this.site_config(this.sitecode).latitude },
        longitude() { return this.site_config(this.sitecode).longitude },
    }
    
    
}

</script>


<style scoped>

.site-welcome-text {
    font: 64px "Share Tech Mono", monospace;
}
.quick-status {
    background-color: #232929;
    height: 5em;
    text-align: center;
    vertical-align: middle;
    padding-top: 1em;
}

.line-divider {
    width: 1px;
    background: rgb(255,255,255,.0); 
    padding-top: 2em;
}

.preview-image {
    width: 100%; 
    background-color: grey; 
    cursor: pointer; 
    position: absolute; 
    top:0; 
    left:0;
}

.quick-image-column {
    margin: 2em;
}


</style>