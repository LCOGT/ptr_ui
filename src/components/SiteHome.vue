<template><div>

    <div class="level site-welcome-text">
        <div class="level-item">
        Welcome to {{sitecode.toUpperCase()}}
        </div>
    </div>

    <the-dome-cam v-if="sitecode=='wmd'"/>
    <br>

    <leaflet-map 
        name="leafmap"
        :latitude="latitude"
        :longitude="longitude"
    ></leaflet-map>

    <div class="quick-status">
        quick telescope status/info will be shown here
    </div>
    <br>

    <div style="height: 2em;" />


    <br>

    <br>
    <!--the-device-selectors /-->

</div></template>


<script>
import TheDeviceSelectors from '@/components/TheDeviceSelectors'
import TheDomeCam from '@/components/TheDomeCam'
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import ImageView from '@/components/ImageView'
import LeafletMap from '@/components/LeafletMap'

export default {
    name: "SiteHome",
    props: ["sitecode"],
    mixins: [commands_mixin],
    components: {
        TheDeviceSelectors,
        TheDomeCam,
        ImageView,
        LeafletMap,
    },
    data () {
        return {
            isImageModalActive: false,
            latitude: -1,
            longitude: -1,
        }
    },
    watch: {
        sitecode: function() {

            // Update lat and long to use with map
            this.$store.dispatch('observatory_configuration/update_config').then(() => {
                this.latitude = this.$store.getters['observatory_configuration/site_latitude']
                this.longitude = this.$store.getters['observatory_configuration/site_longitude']
            })
        },
    },
    beforeCreate() {
        // Update lat and long to use with map
        this.$store.dispatch('observatory_configuration/update_config').then(() => {
            this.latitude = this.$store.getters['observatory_configuration/site_latitude']
            this.longitude = this.$store.getters['observatory_configuration/site_longitude']
        })
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