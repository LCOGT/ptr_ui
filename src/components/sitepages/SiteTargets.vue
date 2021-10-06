<template>
<div id="site-targets-wrapper">

    <div  class="skychart-wrapper">
        <div class="skychart-center">
            <the-sky-chart class="the-skychart" />
        </div>
    </div>

    <div class="sidebar-wrapper">
        <a class="sidebar-button button" @click="toggle_expand_sidebar">
            <b-icon
                type="is-text"
                square
                :icon="sidebar_is_expanded ? 'chevron-right' : 'chevron-left'"
            />
        </a>
        <div class="sidebar-content is-expanded">
            <div class="targets-page-content-wrapper">
                <div class="ptr-aladin-parent-div">
                    <div id="aladin-lite-div" @click="sendCoordinatesToSkychart"/>
                </div>
                <b-field label="Search for objects...">
                    <b-input v-model="simbad_query" @keyup.enter.native="submit_simbad_query"></b-input>
                    <p class="control">
                        <b-button @click="submit_simbad_query"><b-icon icon="magnify" /></b-button>
                    </p>
                </b-field>
                <command-tabs-accordion 
                    :controls="['Telescope', 'Camera']" 
                    :initInstrumentOpenView="0"
                    class="command-tab-accordion"/>
            </div>
        </div>
    </div>

</div>
</template>


<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
import helpers from '@/utils/helpers'
import $ from 'jquery'

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import CommandButton from '@/components/CommandButton'
import CommandTabsAccordion from "@/components/CommandTabsAccordion"
//import Celestial from '@/components/celestialmap/celestial'
import celestial from 'd3-celestial'
let Celestial = celestial.Celestial()

export default {
    name: "SiteTargets",
    props: [ "sitecode"],
    mixins: [commands_mixin],
    components: {
        CommandButton,
        TheSkyChart,
        CommandTabsAccordion,
    },
    data() {
        return {
            aladin: '',
            mapEl: '',

            simbad_query: '',

            telescopeModal: false,
            isComponentModalActive: false,

            sidebar_is_expanded: true,
        }
    },

    mounted(){
        this.start_resize_observer()

        this.$loadScript("https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js")
            .then(() => {

                // Default: load aladin on m33, but use coords in mount fields if possible.
                let target = "M33"
                if (parseFloat(this.mount_ra) && parseFloat(this.mount_dec)) {
                    target = `${15*this.mount_ra} ${this.mount_dec}`
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

                // The following code creates an overlay element that hides aladin from mouseevents.
                // This is mainly to let the user scroll the sidebar without aladin zooming instead.
                // If the user clicks on aladin, then normal mouse behavior returns.
                let scroll_hide_overlay = document.createElement('div')
                scroll_hide_overlay.style.height = '100%'
                scroll_hide_overlay.style.width = '100%'
                scroll_hide_overlay.style.position = 'relative'
                scroll_hide_overlay.style['z-index']= 4 // the aladin-reticleCanvas layer has z-index==3
                // When user clicks on the aladin window, click and scroll events revert to normal
                scroll_hide_overlay.setAttribute('onClick', "style.pointerEvents='none'") 
                document.getElementById('aladin-lite-div').appendChild(scroll_hide_overlay)
            })
            .catch(error => {
                console.warn('failed to load Aladin')
                console.warn(error)
            });

        // Clicking on the sky chart should update the Aladin view.
        this.mapEl = document.getElementById("celestial-map")
    },

    beforeDestroy() {
        this.stop_resize_observer()
    },

    methods: {

        start_resize_observer() {

            const skychart_wrapper = document.getElementById('site-targets-wrapper')

            this.resize_observer = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const cr = entry.contentRect;
                    this.on_skychart_wrapper_resize(cr.width, cr.height)
                }
            });
            // Observe one or multiple elements
            this.resize_observer.observe(skychart_wrapper);
        },
        stop_resize_observer() {
            this.resize_observer.disconnect()
        },

        on_skychart_wrapper_resize(width, height) {

            const is_landscape = window.innerWidth > window.innerHeight;  // aspect ratio to inform layout
            const skychart_wrapper_is_landscape = width > height;  // This is the visible area between the site menu and status bar

            // Are the width and height within 20px? This is used to avoid a scenario where a
            // vertical scrollbar (in a horizontal layout) modifies the layout to become vertical, removign
            // the scrollbar, and looping forever.
            const skychart_wrapper_nearly_square = Math.abs(width - height) < 20

            const tablet_min_width = 769 //px, from @/src/style/_responsive.scss

            if (width > tablet_min_width) {  // desktop layouts

                // horizontal layout: skychart should fill the whole height
                if (skychart_wrapper_is_landscape || skychart_wrapper_nearly_square) {
                    const vertical_padding = 30 // pixels
                    Celestial.resize({width: height - vertical_padding})
                    document.getElementsByClassName('skychart-center')[0].style.width = height - vertical_padding + 'px'

                // vertical layout: skychart should fill the width of the screen
                } else {
                    Celestial.resize({width: width})
                    document.getElementsByClassName('skychart-center')[0].style.width = height + 'px'
                }

            }

            if (width <= tablet_min_width) {  // tablet and smaller layouts
                // make sure sidebar content is visible
                if (!this.sidebar_is_expanded) {
                    this.toggle_expand_sidebar()
                }
                Celestial.resize({width: width})
                document.getElementsByClassName('skychart-center')[0].style.width = height + 'px'
            }

        },
        toggle_expand_sidebar() {
            if (this.sidebar_is_expanded) {
                document.getElementsByClassName('sidebar-content')[0].classList.remove('is-expanded')
            }
            else {
                document.getElementsByClassName('sidebar-content')[0].classList.add('is-expanded')
            }
            this.sidebar_is_expanded = !this.sidebar_is_expanded;
        },

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

            this.$store.commit('command_params/mount_ra', aladin_ra.toFixed(5))
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
                this.$store.commit('command_params/mount_ra', raHours.toFixed(5))
                this.$store.commit('command_params/mount_dec', eq[1].toFixed(4))
                this.$store.commit('command_params/mount_object', ' ') // clear the mount_object entry
            }

        },
    },
    watch: {
        // Update the aladin view if the coordinates change. 
        mount_ra() {
            let ra = parseFloat(this.mount_ra) * 15
            let dec = parseFloat(this.mount_dec)
            this.aladin.gotoRaDec(ra, dec)
        },
        mount_dec() {
            let ra = parseFloat(this.mount_ra) * 15
            let dec = parseFloat(this.mount_dec)
            this.aladin.gotoRaDec(ra, dec)
        },

    },
    computed: {

        sidebar_expand_button_text() {
            return this.sidebar_is_expanded ? '>' : '<';
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
@import url("https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css");
@import "@/style/_responsive.scss";
@import "@/style/_variables.scss";

// Button to toggle the sidebar visibility
$toggle-button-height: 35px;

#site-targets-wrapper {
    display: flex;
    flex-direction: column;
    position: relative;
    //border: 1px solid purple;
    width: 100%;
    height: 100%;
    overflow-x: hidden;

    @include tablet {
        flex-direction: row;
    }
}

.skychart-wrapper {
    //border: 1px solid red;
    flex-grow: 1;
    flex-shrink: 9;
    transition: .8s ease-in-out;
    max-width: 100vw;
    height: 100%;
}
.skychart-center {
    margin: 0 auto;
    width: min-content;

    @include tablet {
        //border: 1px solid white;
        width: min-content;
    }
}

.sidebar-wrapper {
    //border: 1px solid orange;
    flex-grow: 1;
    flex-shrink: 0;
    transition: all 0.8s ease-in-out;
    min-width: 150px;
    max-width: 425px;
}



.sidebar-content {
    //border: 1px solid yellow;
    height: 100%;
    width: 100vw;
    overflow-y: hidden;
    transform: translateX(100%);
    transition: .8s ease-in-out;
    z-index: 5;

    @include tablet {
        position:absolute;
        top: $toggle-button-height;
        right: 0;
        padding: 0;
        width: unset;
        height: calc(100% - #{$toggle-button-height});
    }
}
.sidebar-content.is-expanded {
    transform: translateX(0%);
}

.targets-page-content-wrapper {
    width: 90vw;
    margin: 1em auto;

    @include tablet {
        width: 100%;
        height: calc(100% - 1em);
        color: #eee;
        overflow-x: hidden;

        padding: 0;
        padding-left: 1em;
        margin: 0;
        margin-top: 1em;
    }
}

.sidebar-button{
    position: fixed;
    //animation: blinkonce 2s ease;
    //animation-delay: 2s;
    right: 0;
    display: none;
    color: whitesmoke;
    width: 50px;
    height: $toggle-button-height;
    line-height:1em;
    margin-right: 0;
    margin-left: auto;
    z-index: 5;

    border-top-right-radius: 0;    
    border-bottom-right-radius: 0;
    border-right: 0;

    @include tablet {
        display: block
    }
}
.sidebar-wrapper:hover .sidebar-button {
    animation: blinkonce 1s ease;
}
@keyframes blinkonce {
    30% {
        width: 60px;
    }
}
.sidebar-button:hover { cursor: pointer; }

#aladin-lite-div {
    width: 100%;
    height: 100%;

    @include tablet {
        width: 410px;
        height: 300px;
    }
}
.ptr-aladin-parent-div {
    width: 100%;
    height: 300px;
    background-color:grey;
    margin-bottom: 1em;
}

.command-tab-accordion {
    margin-bottom: 1em;
    width: 100%;
}

</style>