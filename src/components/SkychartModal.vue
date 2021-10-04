<template>


<div style="padding:0;">


    <div class="sticky-buttons">

        <b-button 
            class="button is-danger is-hidden-tablet" 
            @click="$parent.close()">
            <b-icon
                pack="mdi"
                icon="close"
                size="is-small"/>
        </b-button>
        <b-button 
            class="button is-danger is-hidden-mobile" 
            @click="$parent.close()">
            <b-icon
                pack="mdi"
                icon="close"
                size="is-medium"/>
        </b-button>

        <div class="is-hidden-tablet" style="display:flex; align-items:center;" >
            <div style="flex-grow: 0;display:flex; flex-direction:column;justify-content:flex-end;">
                <b-field style="margin-right: 10px; flex:0 1; width: 150px;" >
                    <b-field>
                    <p class="control">
                        <span style="width: 42px;" class="button is-static is-small">Ra</span>
                    </p>
                    <b-input name="subject" size="is-small" type="search" icon-clickable v-model="mount_ra" autocomplete="off"></b-input>
                    </b-field>
                </b-field>
                <b-field style="margin-right: 10px; flex:0 1; width: 150px;" >
                    <b-field>
                        <p class="control">
                            <span style="width: 42px;" class="button is-static is-small">Dec</span>
                        </p>
                        <b-input name="subject" size="is-small" type="search" icon-clickable v-model="mount_dec" autocomplete="off"></b-input>
                    </b-field>
                </b-field>
                <b-field style="margin-right: 10px; flex:0 1; width: 150px;" >
                    <b-field>
                        <p class="control">
                            <span style="width: 42px;" class="button is-static is-small">Obj</span>
                        </p>
                        <b-input name="subject" size="is-small" type="search" icon-clickable v-model="mount_object" autocomplete="off"></b-input>
                    </b-field>
                </b-field>
            </div>
            <command-button :data="mount_slew_command" style="" class="is-success">
                <p slot="title">Go</p>
            </command-button>
        </div>

        <div class="is-hidden-mobile" style="flex-grow: 0;display:flex; justify-content:flex-end;">

            <b-field style="margin-right: 10px;flex-basis:160px; flex:0 1 180px;" >
                <b-field>
                    <p class="control">
                        <span style="width: 42px;" class="button is-static is-medium">Obj</span>
                    </p>
                    <b-input name="subject" size="is-medium" type="search" icon-clickable v-model="mount_object" autocomplete="off"></b-input>
                </b-field>
            </b-field>

            <b-field style="margin-right: 10px;flex-basis:160px; flex:0 1 180px;" >
                <b-field>
                <p class="control">
                    <span class="button is-static is-medium">Ra</span>
                </p>
                <b-input name="subject" size="is-medium" type="search" icon-clickable v-model="mount_ra" autocomplete="off"></b-input>
                </b-field>
            </b-field>

            <b-field style="margin-right: 10px;flex-basis:160px; flex:0 1 180px;" >
                <b-field>
                <p class="control">
                    <span class="button is-static is-medium">Dec</span>
                </p>
                <b-input name="subject" size="is-medium" type="search" icon-clickable v-model="mount_dec" autocomplete="off"></b-input>
                </b-field>
            </b-field>


            <command-button :data="mount_slew_command" style="margin-right: 10px;" class="is-success is-medium">
                <p slot="title">Go</p>
            </command-button>

        </div>
    </div>

    <div class="modal-container container">

        <!-- Only show when modal is not open because can't have 2 charts open at once. -->
        <div class="skychart-container" >
            <!-- Note: only render once the config is populated (needs lat/long to load) -->
            <the-sky-chart :deviceStatus="deviceStatus" />
        </div>

        <div class="non-skychart-container">

        <div class="status-bar">

            <div class="status-items">
                <div class="keys">
                    <div class="key">Ra:</div>
                    <div class="key">Dec:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(telescope_state.right_ascension)}}</div>
                    <div class="val">{{(telescope_state.declination)}}</div>
                </div>
            </div>
            <div class="status-items">
                <div class="keys">
                    <div class="key">Az:</div>
                    <div class="key">Alt:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(telescope_state.azimuth)}}</div>
                    <div class="val">{{(telescope_state.altitude)}}</div>
                </div>
            </div>
            <div class="status-items">
                <div class="keys">
                    <div class="key">Ha:</div>
                    <div class="key">Airmass:</div>
                </div>
                <div class="keys">
                    <div class="val">{{(hour_angle)}}</div>
                    <div class="val">{{telescope_state.airmass}}</div>
                </div>
            </div>
            <div class="status-items">
                <div class="keys">
                    <div class="key">Activity:</div>
                    <div class="key">Enclosure:</div>
                </div>
                <div class="keys">
                    <div class="val">{{mount_activity}}</div>
                    <div class="val">{{enclosure_state.shutter_status || enclosure_state.roof_status}}</div>
                </div>
            </div>

        </div>
            <div class="aladin-container-1">
                <aladin-lite :initRa="mount_ra" :initDec="mount_dec" />
            </div>
        
            

        </div>

    </div>



</div>
</template>


<script>

import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'

import CommandButton from '@/components/CommandButton'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import AladinLite from '@/components/AladinLite'

export default {
    name: "SiteTargets",
    props: ["deviceStatus", "sitecode"],
    mixins: [commands_mixin],
    components: {
        CommandButton,
        TheSkyChart,
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

        ...mapGetters('site_config', [
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
        mount_object: {
            get() { return this.$store.getters['command_params/mount_object']},
            set(val) { this.$store.commit('command_params/mount_object', val)},
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
    padding:2em;
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

.aladin-container-1 {
    width:100%;
    min-width:200px;
    min-height:200px;
    max-height:50vh;
}


.sticky-buttons {
    background-color:#1e2223;
    width:100%;
    overflow-x:hidden;
    z-index:5;
    display:flex;
    justify-content:space-between;
    align-items:center;
}
.sticky-buttons > * {
    margin: 0.5em 1em;
}

.status-bar {
    margin-bottom: 1em;
    display:flex;
    justify-content:space-between;
    flex-wrap:wrap;
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
    margin-bottom: 1em;
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
        display:grid;
        grid-template-columns: 7fr 3fr;
        grid-gap: 3em;
    }
    .skychart-container{
        flex:2 0 500px;
        /*background-color:blue;*/
    }
    .non-skychart-container {
        display:flex;
        flex-direction:column;
        flex-wrap: wrap;
        flex:1 0 auto;
    }
    .aladin-container-1 {
        flex:1;
    }
    .mount-status {
        flex: 0;
    }
}
</style>