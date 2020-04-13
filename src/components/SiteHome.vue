<template><div>

    <div class="level site-welcome-text">
        <div class="level-item">
        Welcome to {{sitecode.toUpperCase()}}
        </div>
    </div>

    <status-overview 
        :config="config"
        :sitecode="sitecode"  
        :deviceStatus="deviceStatus" 
    style="margin:0"/>
    <div class="spacer" style="height: 2em;" />

    <pre>{{deviceStatus}}</pre>

    <the-dome-cam v-if="sitecode=='wmd'"/>
    <br>


    <leaflet-map 
        name="leafmap"
        :latitude="latitude"
        :longitude="longitude"
        v-if="Object.keys(config).length>0"
    ></leaflet-map>


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


    <br>

    <div style="height: 2em;" />


    <br>
    <!--the-device-selectors /-->

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
    props: ["config", "deviceStatus", "sitecode"],
    mixins: [commands_mixin],
    components: {
        TheDeviceSelectors,
        TheDomeCam,
        ImageView,
        LeafletMap,
        StatusOverview,
    },
    data () {
        return {
            isImageModalActive: false,
            latitude: 0,
            longitude: 0,
        }
    },
    mounted() {
        this.latitude = this.config.latitude
        this.longitude = this.config.longitude
    },
    watch: {
        config: function() {
            // New config (new site) should rerender map with updated location.
            this.latitude = this.config.latitude
            this.longitude = this.config.longitude
        },
    },
    computed: {
        ...mapGetters('images', [
        'current_image',
        ]),
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