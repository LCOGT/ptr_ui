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
            <CommandTabsWide style="width: 100%;" :initInstrumentOpenView="5" />
            <div style="height: 5em; flex-shrink: 0;" />
        </div>
        <div class="image-view">

            <Tabs class="control-room-main-tabs">
                <TabItem title="images">
                    <ControlRoomImages :sitecode="sitecode" />
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
                </TabItem>
                <TabItem title="sky chart">
                    <TheSkyChart class="skychart-component" />
                    <!--SiteTargets :sitecode="sitecode" /-->
                </TabItem>
            </Tabs>

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
import CommandTabsAccordion from '@/components/CommandTabsAccordion'
import CommandTabsWide from '@/components/CommandTabsWide'
import UserwayButton from '@/components/UserwayButton'
import ControlRoomImages from '@/components/ImageDisplay/ControlRoomImages'
import ImageView from '@/components/ImageView'
import ThumbnailRow from '@/components/ImageDisplay/ThumbnailRow'
import TelescopeLivestream from '../components/TelescopeLivestream'
import SiteStatusFooter from '@/components/status/SiteStatusFooter'

import HistogramTool from '@/components/AnalysisTools/HistogramTool'
import ImageStatisticsViewer from '@/components/AnalysisTools/ImageStatisticsViewer'
import ImageMetadataViewer from '@/components/AnalysisTools/ImageMetadataViewer'
import LineProfileInspection from '@/components/AnalysisTools/LineProfileInspection'
import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import SiteTargets from '@/components/sitepages/SiteTargets'

import Tabs from '@/components/Tabs'
import TabItem from '@/components/TabItem'
import datastreamer from "@/datastreamer";
import { user_mixin } from '@/mixins/user_mixin'

export default {
    name: "ControlRoom",
    components: {
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
        SiteTargets,
        Tabs,
        TabItem,
    },
    mixins: [ user_mixin ],
    data() {
        return {
            command_tabs_collapsed: false,
        }
    },
    created() {
        this.site_changed_routine(this.$route.params.sitecode)
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
    }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";

.page-wrapper {
    height: 100vh;
    //display: grid;
    //grid-template-rows: auto max-content;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.navbar {
    padding-left: 3em;
    //height: 50px;
    //flex-shrink: 0;
    border-bottom: 1px solid grey;
    border-radius: 0;
}
.cr-columns {
    margin-left: 3em;
    display: flex;
    height: 100%;
    //gap: 1em;
    flex-shrink: 1;
    //overflow-y: auto;
    overflow-y: hidden;
}
.cr-columns > * {
    padding-top: 1em;
    overflow-y:auto;
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
    width: 400px;
}

.analysis-tools-tabs {
    margin: 3em 0;
}
.image-view {
    flex-shrink: 1;
    flex-basis: auto;
    height: 100%;
    resize:horizontal;
    max-width: 768px;
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
