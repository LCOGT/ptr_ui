<template>
    <div class="wrapper">
        <div class="object-query">
            <b-field label="Search for objects...">
                <b-field>
                    <b-input v-model="simbad_query" @keyup.enter.native="submit_simbad_query"></b-input>
                    <p class="control"> 
                        <button class="button" @click="submit_simbad_query">search</button>
                    </p>
                </b-field>
            </b-field>
        </div>

        <div id="aladin-lite-div" @click="sendCoordinatesToSkychart"></div>

    </div>
</template>

<script>

import { mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
import Celestial from '@/components/celestialmap/celestial'

export default {

    props: ['initRa', 'initDec'],
    data() {
        return {
            aladin: '',
            mapEl: '',

            simbad_query: '',
        }
    },

    mounted() {

        // Default: load aladin on m33, but use coords in mount fields if possible.
        let target = "M33"
        console.log('initRa')
        console.log(this.initRa)
        console.log(parseFloat(this.initRa))
        console.log(isNaN(parseFloat(this.initRa)))
        if (parseFloat(this.initRa) && parseFloat(this.initDec)) {
            console.log('chaging target')
            target = `${15*this.initRa} ${this.initDec}`
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
            console.log('Submitting simbad query for: ', this.simbad_query)
            this.aladin.gotoObject(this.simbad_query, {success: this.sendCoordinatesToSkychart});
        },

        sendCoordinatesToSkychart() {
            var [aladin_ra, aladin_dec] = this.aladin.getRaDec();
            aladin_ra = aladin_ra / 15;

            console.log(aladin_ra, aladin_dec)
            this.$store.dispatch('skyChart/setSelected', [aladin_ra, aladin_dec] )
            this.$store.commit('command_params/mount_ra', aladin_ra.toFixed(4))
            this.$store.commit('command_params/mount_dec', aladin_dec.toFixed(4))
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
            }


        },
    },

    computed: {


        // command params
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

<style scoped>
@import "https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css";

#aladin-lite-div {
    min-height:450px;
    min-width:450px;
    width:100%;
    height:100%;
    flex:1;
}

.wrapper {
    display:flex;
    flex-direction:column;
    height:100%;
}

.object-query {
    padding: 1em 0;
}

</style>