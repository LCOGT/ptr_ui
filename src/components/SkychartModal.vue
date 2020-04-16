<template>


<section>


    <div class="modal-container">

        <!-- Only show when modal is not open because can't have 2 charts open at once. -->
        <div class="skychart-container" >
            <!-- Note: only render once the config is populated (needs lat/long to load) -->
            <the-sky-chart :siteConfig="config" v-if="Object.keys(config).length>0"/>
        </div>

        <div class="non-skychart-container">
        
            
            <div class="columns">
            <div class="status-items column">
                <div class="keys">
                    <div class="key">Ra:</div>
                    <div class="key">Dec:</div>
                    <div class="key">Alt:</div>
                    <div class="key">Az:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(telescope_state.right_ascension)}}</div>
                    <div class="val">{{(telescope_state.declination)}}</div>
                    <div class="val">{{(telescope_state.altitude)}}</div>
                    <div class="val">{{(telescope_state.azimuth)}}</div>
                </div>
            </div>
            <div class="status-items column">
                <div class="keys">
                    <div class="key">Ha:</div>
                    <div class="key">Airmass:</div>
                    <div class="key">Activity:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(hour_angle)}}</div>
                    <div class="val">{{telescope_state.airmass}}</div>
                    <div class="val">{{mount_activity}}</div>
                </div>
            </div>
            </div>

            <div class="aladin-container">
                <aladin-lite />
            </div>


        </div>


    </div>
        <div class="sticky-buttons">
            <button class="button is-warning" @click="$parent.close()">close</button>
        </div>


</section>
</template>


<script>

import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import ModalSkyChart from '@/components/ModalSkyChart'
import AladinLite from '@/components/AladinLite'

export default {
    name: "SiteTargets",
    props: ["config", "deviceStatus", "sitecode"],
    components: {
        TheSkyChart,
        ModalSkyChart,
        AladinLite,
    },
    data() {
        return {
            isComponentModalActive: false,
        }
    },
    methods: {
        parseTrueFalse(str) {
            if (str.toLowerCase()=="true") {return true}
            if (str.toLowerCase()=="false") {return false}
            console.error("Could not parse true or false. Check for bad behavior.")
            console.log(str)
            return false
        },
    },
    computed: {

        ...mapGetters('observatory_configuration', [
        'enclosure',
        'mount',
        'telescope',
        'camera',
        'filter_wheel',
        'focuser',
        'rotator',
        'screen',
        'weather',
        ]),


        // single status items
        mount_activity() {
        let activity = "idle"

        if (this.parseTrueFalse(this.mount_state.is_parked)) {
            activity = "parked"
        }
        else if (this.parseTrueFalse(this.mount_state.is_tracking)) {
            activity = "tracking"
        }
        else if (this.parseTrueFalse(this.mount_state.is_slewing)) {
            activity = "slewing"
        }
        return activity
        },
        hour_angle() {
        let ha = this.telescope_state.sidereal_time - this.telescope_state.right_ascension
        if (ha < 0) {
            ha += 24 // hours, since we're in decimal
        }
        return ha
        },

        

        enclosure_state() {
            try {
                return this.deviceStatus.enclosure[this.enclosure]
            } catch { return {} }
        },
        mount_state() {
            try {
                return this.deviceStatus.mount[this.mount]
            } catch { return {} }
        },
        telescope_state() {
            try {
                return this.deviceStatus.telescope[this.telescope]
            } catch(error) { return {} }
        },

        // command_params
        mount_ra: {
            get() { return this.$store.getters['command_params/mount_ra']},
            set(val) { this.$store.commit('command_params/mount_ra', val)},
        },
        mount_dec: {
            get() { return this.$store.getters['command_params/mount_dec']},
            set(val) { this.$store.commit('command_params/mount_dec', val)},
        },

    },

    
}

</script>


<style lang="scss" scoped>

$skychart-dim: 100%;
$background-color: #151718;

.animation-content .modal-content {
    background-color:hotpink;
}

.modal-container {
    display:flex;
    align-items:center;
    position:relative;
}

.skychart-container {
    width: $skychart-dim;
    height: $skychart-dim;
}

.non-skychart-container {
    display:flex;
}

.aladin-container {
    width:100%;
    min-width:200px;
}


.sticky-buttons {
    position:absolute;
    bottom:0;
}

.mount-control-panel {
    display: flex;
    flex-direction: horizontal;
    width: 100%;
    background-color: rgb(44, 49, 49);
    margin-bottom: 40px;
}

.mount-controls {
    width: 250px;
}

.status-items {
  margin:15px 0;
  display:flex;
  width:100%;
}
.keys {
  flex-direction:column;
}
.status-header {
  font-weight: bold;
  text-align: center;
  padding: 3px 0;
  margin-bottom: 5px;
  background-color: #283030;
}
.key {
  text-align: right;
  padding-right: 10px;
  color:silver;
  padding: 0 8px;
  margin-bottom: 3px;
  background-color: #283030;
  white-space: nowrap;
}
.val{
  color: greenyellow;
  background-color: black;
  padding: 0 8px;
  margin-bottom: 3px;
}

@media (orientation: portrait) {
    .modal-container {
        flex-direction:column;
    }
    .skychart-container{
        width:90vw;
        height:90vw;
        /*background-color:red;*/
    }
}
@media (orientation:landscape) {
    .modal-container {
        flex-direction:row;
    }
    .skychart-container{
        width: 90vh;
        height:90vh;
        /*background-color:blue;*/
    }
    .non-skychart-container {
        flex-direction:column;
        flex-grow:1;
    }
}
</style>