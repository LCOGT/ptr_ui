<template>
<section class="site-targets">

    <div class="page-layout">

        <div class="query-box">
            <b-field label="Search for objects...">
                <b-field>
                    <b-input v-model="simbad_query" @keyup.enter.native="submit_simbad_query"></b-input>
                </b-field>
            </b-field>
            <button style="width: 100%;" class="button" @click="submit_simbad_query">search</button>
        </div>

        <div class="ptr-aladin-parent-div">
            <div id="aladin-lite-div" @click="sendCoordinatesToSkychart"/>
        </div>

        <div class="parameters-box">
            <div style="display:flex; flex-direction:column; width: 100%;">
                <b-field>
                    <b-field>
                        <p class="control">
                            <span style="width: 42px;" class="button is-static">Ra</span>
                        </p>
                        <b-input 
                            expanded 
                            name="subject" 
                            type="search" 
                            icon-clickable 
                            v-model="mount_ra" 
                            autocomplete="off" />
                    </b-field>
                </b-field>
                <b-field>
                    <b-field>
                        <p class="control">
                            <span style="width: 42px;" class="button is-static">Dec</span>
                        </p>
                        <b-input 
                            expanded
                            name="subject" 
                            type="search" 
                            icon-clickable 
                            v-model="mount_dec" 
                            autocomplete="off" />
                    </b-field>
                </b-field>

                <div style="
                        width: 100%; 
                        height:1px;
                        margin-bottom:10px; 
                        border-bottom: 1px solid grey;"/>

                <b-field >
                    <b-field>
                        <p class="control">
                            <span style="width: 42px;" class="button is-static">Obj</span>
                        </p>
                        <b-input 
                            expanded 
                            name="subject" 
                            type="search" 
                            icon-clickable 
                            v-model="mount_object" 
                            autocomplete="off" />
                    </b-field>
                </b-field>
                <command-button :data="mount_slew_command" style="" class="is-success">
                    <p slot="title">Point Telescope</p>
                </command-button>
            </div>
        </div>

    </div>

    <div class="skychart-box">
        <the-sky-chart :deviceStatus="deviceStatus" />
    </div>



</section>
</template>


<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import { status_mixin } from '../mixins/status_mixin'
import helpers from '@/utils/helpers'

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import CommandButton from '@/components/CommandButton'
import Celestial from '@/components/celestialmap/celestial'

export default {
    name: "SiteTargets",
    props: [ "sitecode"],
    mixins: [commands_mixin,status_mixin],
    components: {
        CommandButton,
        TheSkyChart,
    },
    data() {
        return {
            aladin: '',
            mapEl: '',

            simbad_query: '',

            telescopeModal: false,
            isComponentModalActive: false,
        }
    },

    mounted(){

        this.$loadScript("https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js")
            .then(() => {
                console.log('Aladin script has finished loading.')

                // Default: load aladin on m33, but use coords in mount fields if possible.
                let target = "M33"
                if (parseFloat(this.ra) && parseFloat(this.dec)) {
                    console.log('changing target')
                    target = `${15*this.ra} ${this.dec}`
                }

                // Initialize Aladin
                this.aladin = A.aladin('#aladin-lite-div', {
                    survey: "P/DSS2/color", 
                    fov:1, 
                    target: target, 
                    cooFrame: "ICRSd", 
                    showFullscreenControl: false, 
                    showGotoControl: false, 
                    showSimbadPointerControl: true
                });
                // cheap way to sync the skymap and mount coordinates to the aladin view.
                setTimeout(this.sendCoordinatesToSkychart, 1000) 
            })
            .catch(() => {
                console.log('failed to load Aladin')
            });

        // Clicking on the sky chart should update the Aladin view.
        this.mapEl = document.getElementById("celestial-map")
        this.mapEl.addEventListener('mousedown', this.handleMapClick)
        this.mapEl.addEventListener('mouseup', this.handleMapClick)
    },

    beforeDestroy() {
        // Remove event listeners when we're done with this component.
        this.mapEl.removeEventListener('mousedown', this.handleMapClick)
        this.mapEl.removeEventListener('mouseup', this.handleMapClick)
    },

    methods: {

        submit_simbad_query() {
            this.aladin.gotoObject(this.simbad_query, {success: () => {
                this.sendCoordinatesToSkychart(); // update the sky chart 
                this.mount_object = this.simbad_query; // save the searched object to mount_object to send with command.
            }
            });
        },

        sendCoordinatesToSkychart() {
            var [aladin_ra, aladin_dec] = this.aladin.getRaDec();
            aladin_ra = aladin_ra / 15;

            this.$store.dispatch('skyChart/setSelected', [aladin_ra, aladin_dec] )
            this.$store.commit('command_params/mount_ra', aladin_ra.toFixed(4))
            this.$store.commit('command_params/mount_dec', aladin_dec.toFixed(4))
            this.$store.commit('command_params/mount_object', ' ') // clear teh mount_object entry
        }, 

        handleMapClick(e) {
            let dim = document.getElementById('celestial-map').getBoundingClientRect()
            let cx = e.clientX - dim['x']
            let cy = e.clientY - dim['y']
            let eq = Celestial.mapProjection.invert([cx, cy])

            // Only update other things if the click was registered on the visible map.
            if (Celestial.clip(eq)) {
                this.aladin.gotoRaDec(eq[0], eq[1])

                // convert from degrees to positive hours
                let raHours = eq[0] > 0 ? eq[0] / 15 : (eq[0] / 15) + 24
                this.$store.commit('command_params/mount_ra', raHours.toFixed(4))
                this.$store.commit('command_params/mount_dec', eq[1].toFixed(4))
                this.$store.commit('command_params/mount_object', ' ') // clear the mount_object entry
            }

        },
    },
    watch: {
        // Update the aladin view if the coordinates change. 
        mount_ra() {
            console.log('moving aladin')
            let ra = parseFloat(this.mount_ra) * 15
            let dec = parseFloat(this.mount_dec)
            this.aladin.gotoRaDec(ra, dec)
        },
        mount_dec() {
            console.log('moving aladin')
            let ra = parseFloat(this.mount_ra) * 15
            let dec = parseFloat(this.mount_dec)
            this.aladin.gotoRaDec(ra, dec)
        },

    },
    computed: {

        ...mapGetters('site_config', [
            'site_config',
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


<style scoped>
@import "https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css";

.site-targets {
    width: 100%;
}

.page-layout{
    height: min-content;
    display:flex ;
    flex-wrap: wrap;
    margin-bottom: 30px;
}
.parameters-box {
    padding-top: 20px;
    margin: 10px;
    display: flex;
    min-width: 150px;
    flex: 1 0 min-content;
}
#aladin-lite-div {
    min-height: 250px;
    width: 100%;
    height: 250px;
}
.ptr-aladin-parent-div {
    margin: 10px;
    min-width: 100px;
    min-height: 100px;
    width: 100%;
    height: 100%;
    flex: 3 0 200px;
    background-color:grey;
}
.query-box {
    padding-top: 10px;
    margin: 10px;
    min-width: 150px;
    flex: 1 0 min-content;
}
.skychart-box {
    width: 100%;
    height: 100%;
}

</style>