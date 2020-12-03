<template>
    <div class="statusbar">

        <div class="status-bar-1">


                <div 
                    v-if="status_bar_1_expanded"
                    class="user-status expanded container" ref="loglist">

                    <div class="default-log-message">
                        observatory logs will appear here
                    </div>

                    <div 
                        v-for="(log, idx) in logs"
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

                <div 
                    v-if="!status_bar_1_expanded"
                    class="user-status container" ref="loglist">

                    <div 
                        class="default-log-message"
                        v-if="logs.length == 0">
                        observatory logs will appear here
                    </div>

                    <div 
                        v-if="logs.length > 0"
                        class="log-line">
                        <div class="log-timestamp">
                            <b-tooltip 
                                position="is-right" 
                                type="is-dark" 
                                :label="timestamp_to_date(last_log.timestamp)">
                                {{timestamp_to_logdate(last_log.timestamp)}}
                            </b-tooltip>
                        </div>
                        <pre
                            class="log-message"
                            :class="get_log_level_classes(last_log)"
                            >
                            {{format_log_message_text(last_log)}}
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
                            :statusList="buildWeatherStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :statusList="buildFocuserTabStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :statusList="buildRotatorTabStatus"/>
                    </div>
                    <div>
                        <status-column 
                            style="padding: 0;"
                            :statusList="buildCameraTabStatus"/>
                    </div>
                </div>
                <div id="status-2-primary" class="container">
                    <div class="one">
                        
                        <div style="display: flex; flex-direction: column;">
                            <div class="online-status">
                                <div :class="{'status-on':isOnline, 'status-off':!isOnline}" ></div>
                                <p v-if="isOnline" style="font-weight: bold; color: greenyellow;">online</p>
                                <p v-if="!isOnline" style="font-weight: bold; color: orangered;">offline</p>
                            </div>
                            <div class="sidereal-time" :class="{'offline': !isOnline}">
                                {{ decimalToHHMMSS(sidereal_time).slice(0,-3) }}
                            </div>
                            <div class="sidereal-label">
                                sidereal time
                            </div>
                        </div>

                    </div>
                    <div class="two">
                        <div style="margin-left: 50%; border-left: solid 1px grey; height: 100%; width: 1px;"/>
                    </div>
                    <div class="three">
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="status_col_3"/>
                    </div>
                    <div class="four">
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="status_col_4"/>
                    </div>
                    <div class="five">
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="status_col_5"/>
                    </div>
                    <div class="five">
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="status_col_5"/>
                    </div>
                    <div class="five">
                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="status_col_5"/>
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
import { mapState } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios';
import moment from 'moment';
import { status_mixin } from '../../mixins/status_mixin'
import StatusColumn from '@/components/status/StatusColumn'
export default {
    name: 'SiteStatusFooter',
    mixins: [status_mixin],
    components: {
        StatusColumn
    },
    props: {
        site: String,
        statusList: Array,
    },
    filters: {
        decimal_to_hhmm(value) {

        }
    },

    data() {
        return {

            status_bar_1_expanded: false,
            status_bar_2_expanded: false,
                
            // user status (logs)
            logs: [],
            is_collapsed: false,
            supported_log_levels: [
                "debug",
                "info", 
                "warning",
                "error",
                "critical",
            ]
        }
    },

    created() {

        this.get_recent_logs()

        this.connect_to_logs_ws()
            
    },

    watch: {

        // If the site changes:
        site() {
            console.log('changing site detected from sitestatusfooter.')
            // Close old logs connection
            this.logs_ws.close()

            this.logs = []
            this.get_recent_logs()

            // Open connection with new site
            this.connect_to_logs_ws(this.site)
        },

        status_bar_1_expanded() {
            this.scrollToBottom()
        }
    },

    beforeDestroy() {
        this.close_logs_websocket()
    },


    methods: {

        connect_to_logs_ws(site) {

            if (!site) return;

            // Connect to websocket
            let logs_url = this.logs_ws_endpoint
            logs_url += `?site=${encodeURIComponent(site)}`
            this.logs_ws = new ReconnectingWebSocket(logs_url)

            // Define websocket incoming message behavior
            this.logs_ws.onmessage = this.handle_new_log
        },

        close_logs_websocket(site) {
            try {
                this.logs_ws.close()
            } catch {
                return;
            }
        },

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
        getRandomInt(max) {

            return Math.floor(Math.random() * Math.floor(max));
        },
        get_timestamp_seconds() {
            return Math.floor(Date.now() / 1000)
        },

        // Open or collapse the logs window
        toggle_open() {
            if (this.is_collapsed) {                    
                this.is_collapsed = false;
                this.$nextTick(this.scrollToBottom)
            } else {
                this.is_collapsed = true;
            }
        },

        // Used to test sending a message.
        send_fake_log_ws() {
            let body = {
                action: "newlog",
                log_message: "This is a log message for testing. It is sent from the frontend.",
                site: this.site, 
                log_level: this.supported_log_levels[this.getRandomInt(5)],
                timestamp: this.get_timestamp_seconds()
            }
            console.log(body)
            this.logs_ws.send(JSON.stringify(body))
        },

        // Used to test sending a message.
        send_fake_log_http() {
            const url = this.logs_endpoint + '/newlog'
            let body = {
                log_message: `multiline\nlog\nmessage`,
                site: this.site,
                timestamp: this.get_timestamp_seconds()
            }
            //console.log(body.log_message)
            axios.post(url, body)

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

        // This function is run whenever the websocket gets a new message.
        handle_new_log(message) {
            const new_log = JSON.parse(message.data)
            //console.log("new log entry: ")
            console.log(new_log)
            if (this.isScrolledToBottom(this.$refs.loglist)) {
                this.logs.push(new_log)
                //console.log('scroll to bottom')
                this.$nextTick(this.scrollToBottom)
            }
            else {
                this.logs.push(new_log)
            }
        },

        // Fetch logs from the last day and display them in the log window 
        // in chronological order (newest at bottom)
        get_recent_logs() {

            // Fetch any logs that are under a day old
            const seconds_per_day = 86400
            const after_time_param = this.get_timestamp_seconds() - seconds_per_day

            // Only fetch logs from the current site
            const site_param = this.site

            // Form the url with query params
            let url = this.logs_endpoint + '/recent-logs'
            url += '?after_time=' + encodeURIComponent(after_time_param)
            url += '&site=' + encodeURIComponent(site_param)

            axios.get(url).then(logs => {
                //console.log(logs.data)
                this.logs = [...this.logs, ...logs.data].sort((a,b) => a.timestamp - b.timestamp)
                this.$nextTick(this.scrollToBottom)
            })
        },

        // Returns class names used to style a log message based on the 
        // supplied log level. 
        get_log_level_classes(log) {
                
            // Default level of info if none supplied
            if (!('log_level' in log)) {
                return "info"
            }

            let log_level = log.log_level
            if (this.supported_log_levels.includes(log_level.toLowerCase())) {
                return log_level.toLowerCase()
            }
            else {
                console.warn("Unrecognized log level in log: ", log_level)
                return "info"
            }
        },

        // Add the log level in front of the message if it is a warning, error,
        // or critical level.
        format_log_message_text(log) {
            // Handle case of no message
            if (!("message" in log)) {
                return ""
            }
            
            let message = log.message
            let log_level = log.log_level || "info"

            if (["debug", "info"].includes(log_level.toLowerCase())) {
                return message
            }
            else {
                return `[${log_level.toUpperCase()}]  ${message}`
            }
        },

        // Method for converting timestamp(seconds) to a date that reads easily
        // in the log UI
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
        ...mapState('dev', [
            'logs_ws_endpoint',
            'logs_endpoint',
        ]),
        ...mapState('site_config', ['site_config', 'global_config']),


        // The latest user status log to display in collapsed view. 
        last_log() {
            return this.logs.slice(-1)[0]
        },


        // Sitecode and site both refer to the 3-leter site abbreviation.
        // They are duplicated because the status mixin expects 'sitecode'.
        sitecode() {
            return this.site;
        },


        // Assemble the list of status elements for the status-column components
        status_col_3() {
            return [
                {"name": "Weather OK", ...this.weather_ok},
                {"name": "Open OK", ...this.open_ok},
                {"name": "Enclosure", "val": this.enclosure_status},
            ]
        },
        status_col_4() {
            return [
                {"name": "Ra", "val": this.ra},
                {"name": "Dec", "val": this.dec},
                {"name": "Azimuth", "val": this.azimuth},
                {"name": "Altitude", "val": this.altitude},
            ]
        },
        status_col_5() {
            return [
                {"name": "Airmass", "val": this.airmass},
                {"name": "HA", "val": this.hour_angle},
            ]
        },

        /** 
         * Control the status indicator dot in the title bar.
         */
        isOnline() {
            if (this.status_age < 60) {return true}
            else return false;
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

$margin-x-768: 30px;
$margin-x-1024: 100px;
$margin-x-1216: 200px;
$margin-x-1408: 250px;

$toggle-button-width: 60px;

$status-col-width: 150px;

$user-status-background: #050505;




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
}
.log-line {
    display: grid;
    grid-template-columns: 6em 1fr;
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
// keep to a single line when user status is collapsed 
.user-status:not(.expanded) * .log-message {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow-x: hidden;
    padding-top: 2px;
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

// highlight the timestamp of the line that is hovered over. 
.log-line:hover * {
    color:white;
}

.default-log-message {
    color: #bbb;
    font-size: 11pt;
    font-family:'Courier New', Courier, monospace;
    margin: 0 12px;
}


/**
 * Style rules for the bottom status bar
 */

.status-bar-2 {
    display: grid;
    grid-template-columns: 1fr 60px;
    background-color: #222;
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
//#status-2-primary > div:nth-child(n+5) {
    //display: none;
//}
@media screen and (min-width: 768px ) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(3, $status-col-width);
    }
    #status-2-primary > div {
        display: block;
    }
    #status-2-primary > div:nth-child(n+6) {
        display: none;
    }
}
@media screen and (min-width: 1024px) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(4, $status-col-width);
    }
    #status-2-primary > div {
        display: normal;
    }
    #status-2-primary > div:nth-child(n+7) {
        display: none;
    }
}
@media screen and (min-width: 1216px) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(5, $status-col-width);
    }
    #status-2-primary > div {
        display: block;
    }
    #status-2-primary > div:nth-child(n+8) {
        display: none;
    }
}
@media screen and (min-width: 1408px) {
    #status-2-primary {
        grid-template-columns: 90px 50px repeat(6, $status-col-width);
    }
    #status-2-primary > div {
        display: block;
    }
    #status-2-primary > div:nth-child(n+9) {
        display: none;
    }
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


/**
 * This styles the individual key/value status items.
 */
//.status-grid {
//    font-size: 14px;
//    display:grid;
//    grid-auto-flow: column;
//    grid-template-columns: max-content max-content;
//    grid-row-gap: 3px;
//    width: 100%;
//    overflow: hidden;
//}
//.key {
//  color:silver;
//  padding: 0 8px;
//  white-space: nowrap;
//  text-align: right;
//  grid-column-start: 1;
//}
//.val{
//  color: greenyellow;
//  background-color: black;
//  padding: 0 8px;
//  white-space: nowrap;
//  grid-column-start:2;
//}
//.spacer {
//    display: inline-block;
//    height: 1em; 
//    visibility: hidden;
//}


/** 
 * Toggle expand/collaps button style
 */

.toggle {
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: whitesmoke;
    background-color: #111;
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
