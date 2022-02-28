<template>
<div id="site-targets-wrapper">

    <div  class="skychart-wrapper">
        <div class="skychart-center">
            <the-sky-chart class="the-skychart" 
                :showStars="showStars" 
                :showGalaxies="showGalaxies" 
                :showNebula="showNebula" 
                :showGlobularClusters="showGlobularClusters" 
                :showOpenClusters="showOpenClusters" 

                :showMoon="showMoon"
                :showSun="showSun"
                :showDaylight="showDaylight"
                :showMilkyWay="showMilkyWay"
                :showPlanets="showPlanets"

                :starMagMin="starMagMin"
                :starMagMax="starMagMax"
                :galaxyMagMin="galaxyMagMin"
                :galaxyMagMax="galaxyMagMax"
                :nebulaMagMin="nebulaMagMin"
                :nebulaMagMax="nebulaMagMax"
                :globularClusterMagMin="globularClusterMagMin"
                :globularClusterMagMax="globularClusterMagMax"
                :openClusterMagMin="openClusterMagMin"
                :openClusterMagMax="openClusterMagMax"

                :use_custom_date_location="use_custom_date_location"
                :show_live_chart="isLiveSkyDisplay"
                :date="skychart_date"
                :location="skychart_location"
                />
        </div>
    </div>

    <div class="quick-results">
    <p>hey is this working</p>
        <div v-for="target in targlist" :target="target" :key="target.name">
            <TargetCard :target="target" />
        </div>
    </div>

    <div class="break-column"></div>

    <div class="sidebar-wrapper">
        <a class="sidebar-button" @click="toggle_expand_sidebar">
            <div style="display: flex;">
                {{sidebar_is_expanded ? 'hide' : 'show'}}
                <b-icon
                    type="is-text"
                    square
                    :icon="sidebar_is_expanded ? 'chevron-right' : 'chevron-left'"
                />
            </div>
        </a>
        <div class="sidebar-content is-expanded">
            <div class="targets-page-content-wrapper">

                <div class="ptr-aladin-parent-div">
                    <div id="aladin-lite-div" @click="sendCoordinatesToSkychart"/>
                </div>

                <div class="sidebar-tabs">
                    <div 
                        :class="{'active': activeSidebarTab=='chart settings'}" 
                        @click="activeSidebarTab='chart settings'"
                        class="sidebar-tab-button">chart settings</div>
                    <div 
                        :class="{'active': activeSidebarTab=='telescope controls'}" 
                        @click="activeSidebarTab='telescope controls'"
                        class="sidebar-tab-button">telescope controls</div>
                    <div 
                        :class="{'active': activeSidebarTab=='quick targets'}" 
                        @click="activeSidebarTab='quick targets'"
                        class="sidebar-tab-button">quick targets</div>                    
                </div>

                <div class="sidebar-tab-content">
                    <div v-if="activeSidebarTab=='telescope controls'"> 
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

                    <div v-if="activeSidebarTab=='chart settings'">

                        <div>

                            <b-field>
                                <b-checkbox v-model="isLiveSkyDisplay" type="is-danger">
                                    LIVE sky display for 
                                    <span style="text-transform:uppercase;">{{this.sitecode}}</span>
                                </b-checkbox>
                            </b-field>
                            <date-time-location-picker 
                                @update_time_and_place="update_skychart_time_and_place"
                                :default_observatory="sitecode" 
                                :is_disabled="isLiveSkyDisplay" />
                        </div>
                        <div class="horizontal-separator"></div>

                        <div class="object-filter-label">Stars</div>
                        <div class="object-filter-group"> 
                            <b-switch style="margin-bottom: 0.75rem;" :rounded="false" v-model="showStars"></b-switch> 
                            <b-field label-position="on-border" label="max mag">
                                <b-input style="width: 80px;" size="is-small" label="max mag" type="number" min="-2" max="8" v-model="starMagMax" />
                            </b-field>
                            <b-field label-position="on-border" label="min mag">
                                <b-input style="width: 80px;" size="is-small" label="min mag" type="number" min="-2" max="8" v-model="starMagMin" />
                            </b-field>
                            <b-field/>
                        </div>
                        <div class="object-filter-label">Galaxies</div>
                        <div class="object-filter-group"> 
                            <b-switch style="margin-bottom: 0.75rem;" :rounded="false" v-model="showGalaxies"></b-switch> 
                            <b-field label-position="on-border" label="max mag">
                                <b-input style="width: 80px;" size="is-small" label="max mag" type="number" min="0" max="25" v-model="galaxyMagMax" />
                            </b-field>
                            <b-field label-position="on-border" label="min mag">
                                <b-input style="width: 80px;" size="is-small" label="min mag" type="number" min="0" max="25" v-model="galaxyMagMin" />
                            </b-field>
                            <b-field/>
                        </div>
                        <div class="object-filter-label">Nebula</div>
                        <div class="object-filter-group"> 
                            <b-switch style="margin-bottom: 0.75rem;" :rounded="false" v-model="showNebula"></b-switch> 
                            <b-field label-position="on-border" label="max mag">
                                <b-input style="width: 80px;" size="is-small" label="max mag" type="number"  min="0" max="25" v-model="nebulaMagMax" />
                            </b-field>
                            <b-field label-position="on-border" label="min mag">
                                <b-input style="width: 80px;" size="is-small" label="min mag" type="number"  min="0" max="25" v-model="nebulaMagMin" />
                            </b-field>
                            <b-field/>
                        </div>
                        <div class="object-filter-label">Globular Clusters</div>
                        <div class="object-filter-group"> 
                            <b-switch style="margin-bottom: 0.75rem;" :rounded="false" v-model="showGlobularClusters"></b-switch> 
                            <b-field label-position="on-border" label="max mag">
                                <b-input style="width: 80px;" size="is-small" label="max mag" type="number"  min="0" max="25" v-model="globularClusterMagMax" />
                            </b-field>
                            <b-field label-position="on-border" label="min mag">
                                <b-input style="width: 80px;" size="is-small" label="min mag" type="number"  min="0" max="25" v-model="globularClusterMagMin" />
                            </b-field>
                            <b-field/>
                        </div>
                        <div class="object-filter-label">Open Clusters</div>
                        <div class="object-filter-group"> 
                            <b-switch style="margin-bottom: 0.75rem;" :rounded="false" v-model="showOpenClusters"></b-switch> 
                            <b-field label-position="on-border" label="max mag">
                                <b-input style="width: 80px;" size="is-small" label="max mag" type="number"  min="0" max="25" v-model="openClusterMagMax" />
                            </b-field>
                            <b-field label-position="on-border" label="min mag">
                                <b-input style="width: 80px;" size="is-small" label="min mag" type="number" min="0" max="25" v-model="openClusterMagMin" />
                            </b-field>
                            <b-field/>
                        </div>

                        <div class="horizontal-separator"></div>

                        <div style="display: flex; justify-content: space-between;">
                            <b-field label="daylight">
                                <b-switch style="margin-bottom: 0.75rem;" v-model="showDaylight"></b-switch> 
                            </b-field>
                            <b-field label="moon">
                                <b-switch style="margin-bottom: 0.75rem;" v-model="showMoon"></b-switch> 
                            </b-field>
                            <b-field label="sun">
                                <b-switch style="margin-bottom: 0.75rem;" v-model="showSun"></b-switch> 
                            </b-field>
                            <b-field label="milky way">
                                <b-switch style="margin-bottom: 0.75rem;" v-model="showMilkyWay"></b-switch> 
                            </b-field>
                            <b-field label="planets">
                                <b-switch style="margin-bottom: 0.75rem;" v-model="showPlanets"></b-switch> 
                            </b-field>
                        </div>


                    </div>

                    <div v-if="activeSidebarTab=='quick targets'"> 
                        <form id="targform" @submit.prevent>
                        <b-field label="Date/Time of Observation">
                        <b-datetimepicker 
                            id="dateobs" 
                            v-model="dateobs"
                            :timepicker="{ incrementMinutes:15, hourFormat:timeformat}"
                            :datetime-parser="(d) => {new Date(d)}"
                            required 
                            inline 
                            @input="changeDate"/>
                        </b-field>
                        <b-field grouped>
                            <b-radio name="tzinfo" id="tzinfo" native-value="my" v-model="tzinfo" required @input="changeTimeFormat">My time</b-radio>
                            <b-radio name="tzinfo" id="tzinfo" native-value="utc" v-model="tzinfo" required @input="changeTimeFormat"> UTC</b-radio>
                            <b-radio name="tzinfo" id="tzinfo" native-value="lcl" v-model="tzinfo" @input="changeTimeFormat">Observatory time</b-radio>
                        </b-field>
                        <b-field class="buttons">
                            <b-button @click="submitForm" type="submit">Find Easy Targets</b-button>
                        </b-field>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
</template>


<script>
import { commands_mixin } from '../../mixins/commands_mixin'

import { mapGetters } from 'vuex'

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import DateTimeLocationPicker from '@/components/celestialmap/DateTimeLocationPicker'
import CommandButton from '@/components/FormElements/CommandButton'
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
        DateTimeLocationPicker,
    },
    data() {
        return {
            aladin: '',
            mapEl: '',

            simbad_query: '',

            telescopeModal: false,
            isComponentModalActive: false,

            sidebar_is_expanded: true,
            activeSidebarTab: 'telescope controls',

            // Whether to show the live sky at site or a chart based on manual date/location settings.
            // Options are 'live' or 'manual'.
            chartDatetimeSource: 'live',

            isLiveSkyDisplay: true,

            showStars: true,
            showGalaxies: true,
            showNebula: true,
            showGlobularClusters: true,
            showOpenClusters: true,
            showMoon: true,
            showSun: true,
            showDaylight: false,
            showMilkyWay: true,
            showPlanets: true,

            starMagMin: 6,
            starMagMax: 0,
            galaxyMagMin: 10,
            galaxyMagMax: 0,
            nebulaMagMin: 10,
            nebulaMagMax: 0,
            globularClusterMagMin: 10,
            globularClusterMagMax: 0,
            openClusterMagMin: 10,
            openClusterMagMax: 0,

            use_custom_date_location: false,
            skychart_date: new Date(),
            skychart_location: [0,0]
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

        toggle_daylight() {
            Celestial.apply({daylight: { show: true }})
        },

        update_skychart_time_and_place(time_and_place) {
            this.use_custom_date_location = true
            this.skychart_date = time_and_place.date
            this.skychart_location = time_and_place.location
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

        // If the live sky display is activated, send the active site's lat/lng to the
        // skychart component
        isLiveSkyDisplay() {
            if (this.isLiveSkyDisplay) {
                this.skychart_location = [this.site_latitude, this.site_longitude]
                this.skychart_date = new Date()
            }
        }

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

        ...mapGetters('site_config', [
            'site_latitude',
            'site_longitude'
        ])
    },
    
}

</script>


<style lang="scss" scoped>
@import url("https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.css");
@import "@/style/_responsive.scss";
@import "@/style/_variables.scss";

// Button to toggle the sidebar visibility
$toggle-button-height: 32px;

.horizontal-separator {
    width: 100%;
    border-bottom: 1px solid silver;
    margin: 1em 0;
}

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
        //top: $toggle-button-height;
        top: 0;
        right: 0;
        padding: 0;
        width: unset;
        width: 410px;
        //height: calc(100% - #{$toggle-button-height});
        height: 100%;
    }
}
.sidebar-content.is-expanded {
    transform: translateX(0%);
}

.object-filter-group {
    padding-top: 10px;
    display: flex;
    gap: 5px;
    align-items: center;
}

.sidebar-tabs {
    display: flex;
    align-items: stretch;
    width: 100%;
}
.sidebar-tab-button {

    font-size: 16px;
    padding: 5px 8px;
    border-right: 1px solid lighten($grey-dark, 4); 
    background-color: $body-background-color;
    border-bottom: 1px solid silver;

    &:hover {
        cursor: pointer;
    }

    &.active {
        background-color: $grey-darker;
        font-weight: bold;
        border: 1px solid silver;
        border-bottom: none;
    }
    &.tab-spacer {
        flex-grow: 1;
        border-bottom: 1px solid silver;
    }
}
.sidebar-tab-content {
    padding: 1em;
    background-color: $background;
}


.targets-page-content-wrapper {
    width: 90vw;
    margin: 0em auto;
    margin-bottom: 5em;

    @include tablet {
        width: 100%;
        height: calc(100% - 1em);
        color: #eee;
        overflow-x: hidden;

        padding: 0;
        padding-left: 1em;
        padding-top: 1em;
        margin: 0;
    }
}

.sidebar-button{
    position: fixed;
    right: 0;
    z-index: 6;

    width: 70px;
    height: $toggle-button-height;
    color: whitesmoke;

    padding: 5px 8px;
    border: 1px solid grey; 
    background-color: $body-background-color;

    &:hover {
        cursor: pointer;
    }

    display: none;
    @include tablet {
        display: block
    }
}
.sidebar-wrapper:hover .sidebar-button {
    animation: blinkonce 1s ease;
}
@keyframes blinkonce {
    30% {
        width: 75px;
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
    margin-bottom: 3em;
}

.command-tab-accordion {
    margin-bottom: 1em;
    width: 100%;
}
.break-column {
    flex-basis: 100%; 
    width: 0;
}
.quick-results {

}
</style>