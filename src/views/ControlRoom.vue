<template>
<div class="page-wrapper" >

    <!-- top navbar -->
    <b-navbar class="navbar is-dark">
        <template slot="start">
            <b-navbar-item class="nav-item">{{sitecode}}</b-navbar-item>
        </template>
        <template slot="end">
            <b-navbar-item tag="div">
                <div v-if="$auth.isAuthenticated" class="navbar-item has-dropdown is-hoverable is-dark">
                    <div class="navbar-link">
                        <img :src="$auth.user.picture" width="25" height="25" style="border-radius: 50%;">
                        <div style="width:5px"></div>
                        <p> {{$auth.user.name}} </p>
                    </div>
                    <div class="navbar-dropdown">
                        <a v-on:click="logout" class="navbar-item has-link">Log out</a>
                    </div>
                </div>
                <!-- show login when not authenticated -->
                <button class="button" v-if="!$auth.isAuthenticated" @click="login">Log in</button>
                <!-- userway accessbility widget -->
                <UserwayButton />
            </b-navbar-item>
        </template>
    </b-navbar>

    <!-- main page content: columns -->
    <div class="cr-columns">
        <div class="command-tabs" style="display:flex; flex-direction: column;">
            <!--div style="flex-shrink: 0; height: 100%; width: 25px; border: 1px solid red;"><</div-->
            <!--CommandTabsAccordion :initInstrumentOpenView="5" /-->
            <Chatlio />
            <CommandTabsWide style="width: 100%;" :initInstrumentOpenView="5" />
            <div style="height: 5em; flex-shrink: 0;" />
        </div>
        <div class="image-view">

            <!--Tabs class="control-room-main-tabs"-->
                <!--TabItem title="images"-->
                <div>
                    <ControlRoomImages :sitecode="sitecode" />
                    <div class="analysis-tabs-wrapper">
                    <Tabs class="analysis-tools-tabs">
                        <TabItem title="statistics">
                            <ImageStatisticsViewer />
                        </TabItem>
                        <TabItem title="histogram">
                            <HistogramTool />
                        </TabItem>
                        <TabItem title="line profile">
                            <LineProfileInspection />
                        </TabItem>
                        <TabItem title="image info">
                            <ImageMetadataViewer />
                        </TabItem>
                    </Tabs>
                    </div>
                </div>
                <!--/TabItem-->
                <!--TabItem title="sky chart"-->
                    <!--SiteTargets :sitecode="sitecode" /-->
                <!--/TabItem-->
            <!--/Tabs-->

        </div>
        <div class="skychart-section">
            <div class="ptr-aladin-parent-div">
                <div id="aladin-lite-div" @click="set_coordinates_from_aladin"/>
            </div>
            <TheSkyChart class="skychart-component" />
        </div>
        <!--div class="telescope-info">
            <TelescopeLivestream class="telescope-livestream" />
            <div class="status-summary">
                <div>Telescope: Parked</div>
                <div>Roof: closed</div>
                <div>weather: ok</div>
            </div>
        </div-->
    </div>

    <!-- Status at bottom of page -->
    <SiteStatusFooter class="site-status-footer" :site="sitecode" />
</div>
</template>

<script>
import AladinLite from '@/components/AladinLite'
import CommandTabsAccordion from '@/components/CommandTabsAccordion'
import CommandTabsWide from '@/components/CommandTabsWide'
import UserwayButton from '@/components/UserwayButton'
import ControlRoomImages from '@/components/ImageDisplay/ControlRoomImages'
import ImageView from '@/components/ImageView'
import ThumbnailRow from '@/components/ImageDisplay/ThumbnailRow'
import TelescopeLivestream from '../components/TelescopeLivestream'
import SiteStatusFooter from '@/components/status/SiteStatusFooter'
import Chatlio from '@/components/Chatlio'

import HistogramTool from '@/components/AnalysisTools/HistogramTool'
import ImageStatisticsViewer from '@/components/AnalysisTools/ImageStatisticsViewer'
import ImageMetadataViewer from '@/components/AnalysisTools/ImageMetadataViewer'
import LineProfileInspection from '@/components/AnalysisTools/LineProfileInspection'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'

import Tabs from '@/components/Tabs'
import TabItem from '@/components/TabItem'
import datastreamer from "@/datastreamer";
import { user_mixin } from '@/mixins/user_mixin'

import celestial from 'd3-celestial'
let Celestial = celestial.Celestial()

export default {
    name: "ControlRoom",
    components: {
        AladinLite,
        CommandTabsAccordion,
        CommandTabsWide,
        UserwayButton,
        ControlRoomImages,
        ImageView,
        ThumbnailRow,
        TelescopeLivestream,
        SiteStatusFooter,
        HistogramTool,
        ImageStatisticsViewer,
        ImageMetadataViewer,
        LineProfileInspection,
        TheSkyChart,
        Tabs,
        TabItem,
        Chatlio,
    },
    mixins: [ user_mixin ],
    data() {
        return {
            aladin: '',
            command_tabs_collapsed: false,
        }
    },
    created() {
        this.site_changed_routine(this.$route.params.sitecode)
    },
    mounted() {
        Celestial.resize({width: 550})
        this.$loadScript("https://aladin.u-strasbg.fr/AladinLite/api/v2/latest/aladin.min.js")
            .then(async () => {

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
                setTimeout(this.set_coordinates_from_aladin, 1000) 
            })
            .catch(error => {
                console.warn('failed to load Aladin')
                console.warn(error)
            });
        
        let control_room_id = `${this.sitecode}-control-room`
        if (_chatlio) {
            _chatlio.show({expanded: false}) 
            _chatlio.identify(control_room_id )
        } else {
            document.addEventListener('chatlio.ready', function (e, data) {
                _chatlio.show({expanded: false})
                _chatlio.identify(control_room_id )
            });
        }

    },
    props: {
        sitecode: String,
    },
    methods: {

        site_changed_routine(sitecode) {

            // Update the active devices
            this.$store.dispatch("site_config/set_default_active_devices", sitecode);

            // Subscribe to datastream for the new site
            datastreamer.update_site(sitecode)

            // get initial data/valuse for images, status, calendar
            this.$store.dispatch("images/display_placeholder_image");
            this.$store.dispatch("images/load_latest_images");
            this.$store.dispatch("images/load_latest_info_images");
            this.$store.dispatch("sitestatus/clearStatus")
            this.$store.dispatch("sitestatus/getLatestStatus")
            this.$store.dispatch("userstatus/fetch_recent_logs")
            this.$store.dispatch("calendar/fetchActiveReservations", sitecode);
        },
        set_coordinates_from_aladin() {
            var [aladin_ra, aladin_dec] = this.aladin.getRaDec();
            aladin_ra = aladin_ra / 15;

            this.$store.commit('command_params/mount_ra', aladin_ra.toFixed(5))
            this.$store.commit('command_params/mount_dec', aladin_dec.toFixed(4))
            //this.$store.commit('command_params/mount_object', ' ') // clear the mount_object entry
        }, 
    },
    watch: {
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
        mount_ra: {
            get() { return this.$store.getters['command_params/mount_ra']},
            set(val) { this.$store.commit('command_params/mount_ra', val)},
        },
        mount_dec: {
            get() { return this.$store.getters['command_params/mount_dec']},
            set(val) { this.$store.commit('command_params/mount_dec', val)},
        },
    }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";

.page-wrapper {
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.navbar {
    padding-left: 3em;
    border-bottom: 1px solid grey;
    border-radius: 0;
}
.cr-columns {
    margin-left: 3em;
    display: flex;
    height: 100%;
    flex-shrink: 1;
    overflow-y: hidden;
}
.cr-columns > * {
    overflow-y:auto;
    padding: 1em;
}

.control-room-main-tabs {
    background-color: $body-background-color;
}
.control-room-main-tabs > * {
    padding: 1em 0;
}
.command-tabs {
    padding-right: 10px;
    min-height: 100%;
    flex-shrink: 0;
    overflow-y: scroll;
    overflow-x: hidden;
    width: 350px;
    font-size: 13px;
}

.analysis-tabs-wrapper {
    height: 500px;
}
.analysis-tools-tabs {
    margin: 3em 0;
}
.image-view {
    flex-shrink: 1;
    height: 100%;
    max-width: 750px;
    flex-basis: 750px;
}
.skychart-section {
    overflow-x: hidden;
    overflow-y: scroll;
}
.ptr-aladin-parent-div {
    width: 100%;
    height: 200px;
    background-color:grey;
    margin-bottom: 3em;
}
.telescope-info {
    flex-grow: 1;
    min-width: 250px;
}
.telescope-livestream {
    
    margin: 5px;
    padding: 1em;
    border: 1px solid gold;
}
.site-status-footer {
    flex-shrink: 0;
}
</style>
