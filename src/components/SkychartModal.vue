<template>


<section>


    <div class="modal-container">

        <div class="sticky-buttons">
            <b-button class="button is-danger" @click="$parent.close()">
                <b-icon
                pack="mdi"
                icon="close"
                size="is-medium"/>
            </b-button>

            <div style="flex-grow:1"/>

            <div style="flex-grow: 0;display:flex; justify-content:flex-end;">

                <b-field style="margin-right: 10px;flex-basis:160px; flex:0 1 180px;" >
                    <b-field>
                    <p class="control">
                        <span class="button is-static">Ra</span>
                    </p>
                    <b-input name="subject" type="search" icon-clickable v-model="mount_ra" autocomplete="off"></b-input>
                    </b-field>
                </b-field>

                <b-field style="margin-right: 10px;flex-basis:160px; flex:0 1 180px;" >
                    <b-field>
                    <p class="control">
                        <span class="button is-static">Dec</span>
                    </p>
                    <b-input name="subject" type="search" icon-clickable v-model="mount_dec" autocomplete="off"></b-input>
                    </b-field>
                </b-field>

                <command-button :data="mount_slew_command" style="margin-right: 10px;" class="is-success">
                    <p slot="title">Go</p>
                </command-button>

            </div>
        </div>

        <!-- Only show when modal is not open because can't have 2 charts open at once. -->
        <div class="skychart-container" >
            <!-- Note: only render once the config is populated (needs lat/long to load) -->
            <the-sky-chart :deviceStatus="deviceStatus" :siteConfig="config" v-if="Object.keys(config).length>0"/>
        </div>

        <div class="non-skychart-container">

        <div class="status-bar">

            <div class="columns">
            <div class="status-items column">
                <div class="keys">
                    <div class="key">Ra:</div>
                    <div class="key">Dec:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(telescope_state.right_ascension)}}</div>
                    <div class="val">{{(telescope_state.declination)}}</div>
                </div>
            </div>
            <div class="status-items column">
                <div class="keys">
                    <div class="key">Alt:</div>
                    <div class="key">Az:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(telescope_state.altitude)}}</div>
                    <div class="val">{{(telescope_state.azimuth)}}</div>
                </div>
            </div>
            <div class="status-items column">
                <div class="keys">
                    <div class="key">Ha:</div>
                    <div class="key">Airmass:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(hour_angle)}}</div>
                    <div class="val">{{telescope_state.airmass}}</div>
                </div>
            </div>
            <div class="status-items column">
                <div class="keys">
                    <div class="key">Activity:</div>
                    <div class="key">Enclosure:</div>
                </div>
                <div class="keys">
                    <div class="val">{{mount_activity}}</div>
                    <div class="val">{{enclosure_state.shutter_status}}</div>
                </div>
            </div>
            </div>

        </div>
            <div class="aladin-container-1">
                <aladin-lite :initRa="mount_ra" :initDec="mount_dec" />
            </div>
        
            

        </div>

    </div>



</section>
</template>


<script>

import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'

import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import ModalSkyChart from '@/components/ModalSkyChart'
import AladinLite from '@/components/AladinLite'
import StatusOverview2 from '@/components/StatusOverview2'

export default {
    name: "SiteTargets",
    props: ["config", "deviceStatus", "sitecode"],
    mixins: [commands_mixin],
    components: {
        CommandButton,
        TheSkyChart,
        ModalSkyChart,
        AladinLite,
        StatusOverview2,
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
            if (ha < -12) {
                ha += 24 // hours, since we're in decimal
            }
            ha = ha.toFixed(3)
            if (ha < 0) {
                ha = '-'+ha
            }
            else {
                ha = '+'+ha
            }
            return ha
        },

        

        enclosure_state() {
            try {
                return this.deviceStatus.enclosure[this.enclosure] || {}
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
    margin-top: 55px;
}

.skychart-container {
    width: $skychart-dim;
    height: $skychart-dim;
}

.non-skychart-container {
    display:flex;
}

.aladin-container-1 {
    width:100%;
    min-width:200px;
    min-height:200px;
}


.sticky-buttons {
    background-color:#1e2223;
    width:100%;
    overflow-x:hidden;
    position:fixed;
    top: 0;
    left:0;
    z-index:5;
    display:flex;
}
.sticky-buttons > * {
    margin: 0.5em 1em;
}

.status-bar {
    margin-bottom: 1em;
    display:flex;
    justify-content:space-between;
    padding: 1em;
}

.mount-control-panel {
    display: flex;
    flex-direction: row;
    width: 100%;
    background-color: rgb(44, 49, 49);
    margin-bottom: 40px;
}

.mount-controls {
    width: 250px;
}

.status-items {
    display:flex;
    margin-right: 10px;
}
.keys {
    display:flex;
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
    .non-skychart-container {
        width: 90vw;
        flex-wrap:wrap;
        margin-bottom:3em;
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
        height: 90vh;
        flex:1;
    }
    .aladin-container-1 {
        flex:1;
    }
    .mount-status {
        flex: 0;
    }
}
</style>