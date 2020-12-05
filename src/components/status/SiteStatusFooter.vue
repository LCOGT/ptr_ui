<template>
    <div class="statusbar">

        <div class="status-bar-1">

            <!-- User status logs -->
            <div 
                :class="{'expanded': status_bar_1_expanded}"
                class="user-status container" ref="loglist">

                <div class="default-log-message" 
                    v-if="status_bar_1_expanded || logs_to_display.length==0">
                    observatory logs will appear here
                </div>
                <div 
                    v-for="(log, idx) in logs_to_display"
                    v-bind:key="idx"
                    class="log-line"
                    >
                    <div class="log-timestamp">
                        <b-tooltip 
                            position="is-right" 
                            type="is-dark" 
                            :label="timestamp_to_date(log.timestamp)">
                            {{timestamp_to_logdate(log.timestamp)}}
                        </b-tooltip>
                    </div>
                    <pre 
                        class="log-message"
                        :class="get_log_level_classes(log)"
                        >
                        {{format_log_message_text(log)}}
                    </pre>
                </div>
            </div>

            <a class="toggle" @click='toggle_status_bar_height_1'>
            <b-icon
                type="is-text" 
                square
                :icon="status_bar_1_expanded ? 'chevron-up' : 'chevron-left'" />
            </a>
        </div>


        <div class="status-bar-2">
            <div class="status-content">
                <div id="status-2-expanded" 
                    class="container"
                    v-if="status_bar_2_expanded">
                    <div></div>
                    <div></div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildGeneralStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildWeatherStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildFocusRotatorCameraStatus"/>
                    </div>
                </div>
                <div id="status-2-primary" class="container">
                    <div>
                        
                        <div style="display: flex; flex-direction: column;">
                            <div class="online-status">
                                <div :class="{'status-on':isOnline, 'status-off':!isOnline}" ></div>
                                <p v-if="isOnline" style="font-weight: bold; color: greenyellow;">online</p>
                                <p v-if="!isOnline" style="font-weight: bold; color: orangered;">offline</p>
                            </div>
                            <div class="sidereal-time" :class="{'offline': !isOnline}">
                                <site-sidereal-time :longitude="site_longitude"/> 
                            </div>
                            <div class="sidereal-label">
                                sidereal time
                            </div>
                        </div>

                    </div>
                    <div>
                        <div style="margin-left: 50%; border-left: solid 1px grey; height: 100%; width: 1px;"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="open_safety_status"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="ra_dec_ha_status"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="az_alt_airmass_status"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildFocuserTabStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildRotatorTabStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildCameraTabStatus"/>
                    </div>
                </div>
            </div>
            <a class="toggle" @click="toggle_status_bar_height_2">
                <b-icon
                    type="is-text" 
                    :icon="status_bar_2_expanded ? 'chevron-up' : 'chevron-left'" />
            </a>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios';
import moment from 'moment';
import { status_mixin } from '../../mixins/status_mixin'
import { user_status_mixin } from '../../mixins/user_status_mixin'
import StatusColumn from '@/components/status/StatusColumn'
import SiteSiderealTime from '@/components/SiteSiderealTime'
export default {
    name: 'SiteStatusFooter',
    mixins: [status_mixin, user_status_mixin],
    components: {
        StatusColumn,
        SiteSiderealTime,
    },
    props: {
        site: String,
    },

    data() {
        return {

            status_bar_1_expanded: false,
            status_bar_2_expanded: false,
        }
    },

    created() {
        this.set_user_status_active_site(this.site)
    },

    watch: {

        site() {
            this.set_user_status_active_site(this.site)
        },

        status_bar_1_expanded() {
            this.scrollToBottom()
        },

        user_status_logs() {
            const div = this.$refs.loglist;
            if (this.status_bar_1_expanded && this.isScrolledToBottom(div)) {
                this.$nextTick(this.scrollToBottom)
            }
        },

    },

    methods: {

        toggle_status_bar_height_1() {
            if (this.status_bar_1_expanded) {
                this.status_bar_1_expanded = false;
            }
            else {
                this.status_bar_1_expanded = true;
                this.$nextTick(this.scrollToBottom)
            }
        },
        toggle_status_bar_height_2() {
            this.status_bar_2_expanded = !this.status_bar_2_expanded;
        },

        // Returns true if the element is scrolled to the bottom
        isScrolledToBottom(el) {
            var $el = $(el);
            return el.scrollHeight - $el.scrollTop() - $el.outerHeight() < 1;
        },
            
        // This method will scroll the log window to the bottom (to the latest 
        // message)
        scrollToBottom() {
            const div = this.$refs.loglist;
            div.scrollTop = div.scrollHeight - div.clientHeight;
        },


        // Method for converting timestamp(seconds) to a date that reads easily
        //  in the log UI
        timestamp_to_logdate(timestamp) {
            const timestamp_ms = timestamp * 1000
            return moment(timestamp_ms).format('HH:mm:ss')
        },            

        // Used to format the time for the timestmap tooltip.
        // (reveals the yyyy/mm/dd, not included in the default view)
        timestamp_to_date(timestamp) {
            const timestamp_ms = timestamp * 1000
            return moment(timestamp_ms).format('YYYY/MM/DD')
        },

    },
    computed: {

        ...mapGetters('site_config', ['site_longitude']),

        // Sitecode and site both refer to the 3-leter site abbreviation.
        // They are duplicated because the status mixin expects 'sitecode'.
        sitecode() {
            return this.site;
        },


        // Assemble the list of status elements for the status-column components
        open_safety_status() {
            return [
                {"name": "Weather OK", ...this.weather_ok},
                {"name": "Open OK", ...this.open_ok},
                {"name": "Enclosure", "val": this.enclosure_status},
            ]
        },
        ra_dec_ha_status() {
            return [
                {"name": "Ra", "val": this.ra},
                {"name": "Dec", "val": this.dec},
                {"name": "HA", "val": this.hour_angle},
            ]
        },
        az_alt_airmass_status() {
            return [
                {"name": "Azimuth", "val": this.azimuth},
                {"name": "Altitude", "val": this.altitude},
                {"name": "Airmass", "val": this.airmass},
            ]
        },

        // Control the status indicator dot in the title bar.
        isOnline() {
            if (this.status_age < 60) {return true}
            else return false;
        },

        /**
         *  This will return either the single latest log message, or the full
         *  list of logs, depending on whether the view is expanded or not.
         */ 
        logs_to_display() {
            // If user status bar is collapsed, just show the last log message
            if (!this.status_bar_1_expanded) {
                return this.user_status_logs.length ? [this.user_status_logs.slice(-1)[0]] : []
            }
            // Otherwise show all the logs
            else {
                return this.user_status_logs
            }
        },

    },


}
</script>


<style lang="scss" scoped>
@import "@/style/_variables.scss";
@import "@/style/buefy-styles.scss";


/**     
 *  Component styling
 */
.statusbar {
    z-index: 100;
}
.hidden {
    display: none;
}

$toggle-button-width: 60px;
$status-col-width: 150px;

$main-status-background: #0f1313;
$user-status-background: darken($main-status-background, 3);
$toggle-button-color: darken($main-status-background, 5);


/**
 *  User status (log) styles (the top status bar)
 */

$log-debug: #aaa;
$log-info: #bbb;
$log-warning: $warning;
$log-error: $danger;
$log-critical: $danger;


.status-bar-1 {
    display: grid;
    grid-template-columns: 1fr 60px;
    background-color: $user-status-background;
}
.status-1-content {
    height: 2em;
}

.user-status {
    display: flex;
    flex-direction: column;
    width: 100%;
    // align with the .container margins:
    padding-left: #{$toggle-button-width / 2};
    line-height: 2em;
}
.user-status.expanded {
    height: 200px;
    line-height: 1.3em;
    overflow-y: scroll;
    overscroll-behavior: contain;
    padding-top: 2pt;
}// keep to a single line when user status is collapsed 
.user-status:not(.expanded) * .log-message {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    padding-top: 2px;
}

.default-log-message {
    color: #bbb;
    font-size: 11pt;
    font-family:'Courier New', Courier, monospace;
    margin: 0 12px;
}

.log-line {
    display: grid;
    grid-template-columns: 7em 1fr;
    width: 100%;
}
.log-timestamp {
    color: #bbb;
    animation: blinkonce 1s;
    grid-column-start: 1;
    padding-top: 2pt;
    font-size: 9pt;
    font-family:'Courier New', Courier, monospace;
    align-items: center;
}
pre.log-message {
    color: #bbb;
    font-size: 11pt;
    font-family:'Courier New', Courier, monospace;
    width: 100%;
    background-color: $user-status-background;
    grid-column-start: 2;
    text-align: left;
    white-space: pre-line;
    hyphens: auto;
    padding: 0;
    padding-top: 2pt;
}
// Style the log message based on its log level class.
pre.log-message.debug {
    color: $log-debug;
}
pre.log-message.info {
    color: $log-info;
}
pre.log-message.warning {
    color: $log-warning;
}
pre.log-message.error {
    color: $log-error;
}
pre.log-message.critical {
    color: $log-critical;
    font-weight: bold;
}

// New messages enter yellow to grab attention, then fade to their 
// destination color (based on the log level, see above)
@keyframes blinkonce {
    0% {
        color: yellow;
    }
}
div.log-line:last-of-type * {
    animation: blinkonce 1s;
}
.log-line:hover * {
    color:white;
}



/**
 * Style rules for the bottom status bar
 */

.status-bar-2 {
    display: grid;
    grid-template-columns: 1fr 60px;
    background-color: $main-status-background;
    border-top: 1px grey solid;
    overflow-x:hidden;
}
#status-2-primary {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 90px 50px repeat(4, $status-col-width);
    grid-auto-rows: 0px;
    grid-column-gap: 20px;
    // align with the .container margins:
    padding-left: #{$toggle-button-width / 2};
    margin-top: 20px;
    margin-bottom: 20px;
}
#status-2-expanded {
    padding-bottom: 1em;
    padding-top: 1em;
    border-bottom: 1px solid grey;
    display:grid;
    grid-template-columns: 100px 50px repeat(5,5px);// $status-col-width);
    grid-column-gap: 30px;
    // align with the .container margins:
    padding-left: #{$toggle-button-width / 2};
    display:flex;
    flex-wrap:wrap;
}
@media screen and (min-width: 768px) and (max-width: 949px ) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(3, $status-col-width);
    }
    #status-2-primary > div:nth-child(n+6) {
        display: none;
    }
}
@media screen and (min-width: 950px) and (max-width: 1023px ) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(4, $status-col-width);
    }
    #status-2-primary > div:nth-child(n+7) {
        display: none;
    }
}
@media screen and (min-width: 1024px) and (max-width: 1215px ) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(5, $status-col-width);
    }
    #status-2-primary > div:nth-child(n+7) {
        display: none;
    }
}
@media screen and (min-width: 1216px) and (max-width: 1407px ) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(6, $status-col-width);
    }
    #status-2-primary > div:nth-child(n+8) {
        display: none;
    }
}
@media screen and (min-width: 1408px) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(7, $status-col-width);
    }
    #status-2-primary > div:nth-child(n+9) {
        display: none;
    }
}

/** 
 * Toggle expand/collaps button style
 */
.toggle {
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: whitesmoke;
    background-color: $toggle-button-color;
    width: $toggle-button-width;
}

/**
 * Individual Status Items
 */
.online-status {
    display: flex;
    align-items: center;
}
.sidereal-time {
    padding-top: 10px;
    font-size: 30px;
}
.sidereal-time.offline {
    color: grey;
}
.sidereal-label {
    text-transform: uppercase;
    font-size: 10px;
}
// Blinking status colored dot indicators
@keyframes fade {
    from { opacity: 1.0; }
    50% { opacity: 0.1; }
    to { opacity: 1.0; }
}
@-webkit-keyframes fade {
    from { opacity: 1.0; }
    50% { opacity: 0.1; }
    to { opacity: 1.0; }
}
.status-on {
    animation: fade 4000ms infinite;
    -webkit-animation: fade 4000ms infinite;
    
    /* Center the content */
    align-items: center;
    display: flex;
    justify-content: center;
    margin-right: 10px;

    /* Colors */
    background-color:greenyellow;
    color: #FFF;

    /* Rounded border */
    border-radius: 9999px;
    height: 12px;
    width: 12px;
}
.status-off {
    /* Center the content */
    align-items: center;
    display: flex;
    justify-content: center;
    margin-right: 10px;

    /* Colors */
    background-color: orangered;
    color: #FFF;

    /* Rounded border */
    border-radius: 9999px;
    height: 12px;
    width: 12px;
}

</style>
