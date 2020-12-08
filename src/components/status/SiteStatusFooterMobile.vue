
<template>
    <div class="site-status-footer-mobile-wrapper">

        <div class="status-tabs">

            <div class="button main-status-button" @click="toggle_main_status">
                status
            </div>

            <div class="button user-status-button" @click="toggle_user_status">
                logs
            </div>
        </div>

        <div class="overlay" v-if="status_visible">

            <!-- Backdrop -->
            <div class="backdrop" @click="hide_status"/>

            <!-- Content -->
            <div class="status-content">

                <!-- Main Status Display -->
                <div class="main-status-mobile" v-if="main_status_visible">

                    <div class="main-status-header">
                        <div class="online-status">
                            <div style="display:flex; align-items:center;">
                                <div :class="{'status-on':isOnline, 'status-off':!isOnline}" ></div>
                                <p v-if="isOnline" style="font-weight: bold; color: greenyellow;">online</p>
                                <p v-if="!isOnline" style="font-weight: bold; color: orangered;">offline</p>
                            </div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <div class="sidereal-time" :class="{'offline': !isOnline}">
                                <site-sidereal-time :longitude="site_longitude"/> 
                            </div>
                            <div class="sidereal-label">
                                sidereal time
                            </div>
                        </div>
                    </div>
                    <div class="main-status-items">

                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildGeneralStatus"/>

                        <status-column 
                            style="padding: 0;"
                            :isOffline="!isOnline"
                            :statusList="buildWeatherStatus"/>
                    </div>

                </div>

                <!-- User Status Display -->
                <div class="user-status-mobile" v-if="user_status_visible">
                    <div class="user-status expanded" ref="loglist">

                        <div class="default-log-message">
                            observatory logs will appear below
                        </div>

                        <div 
                            v-for="(log, idx) in user_status_logs"
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
                </div>

            </div>
        </div>

    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios';
import moment from 'moment';
import { status_mixin } from '@/mixins/status_mixin'
import { user_status_mixin } from '@/mixins/user_status_mixin'
import StatusColumn from '@/components/status/StatusColumn'
import SiteSiderealTime from '@/components/SiteSiderealTime'
export default {
    name: 'SiteStatusFooterMobile',
    mixins: [status_mixin, user_status_mixin],
    components: {
        StatusColumn,
        SiteSiderealTime
    },
    props: {
        site: String,
    },

    data() {
        return {
            status_visible: false,
            main_status_visible: false,
            user_status_visible: false,
        }
    },

    created() {
        this.set_user_status_active_site(this.site)
    },

    watch: {

        site() {
            this.set_user_status_active_site(this.site)
        },

        user_status_logs() {
            const div = this.$refs.loglist;
            if (this.user_status_visible && this.isScrolledToBottom(div)) {
                this.$nextTick(this.scrollToBottom)
            }
        },
    },

    methods: {

        hide_status() {
            this.status_visible = false;
            this.main_status_visible = false;
            this.user_status_visible = false;
        },
        toggle_main_status() {
            if (this.main_status_visible) {
                this.hide_status()
                return
            } else {
                this.main_status_visible = true;
                this.user_status_visible = false;
                this.status_visible = true;
            }
        },
        toggle_user_status() {
            if (this.user_status_visible) {
                this.hide_status()
            } else {
                this.user_status_visible = true;
                this.main_status_visible = false;
                this.status_visible = true;
                this.$nextTick(this.scrollToBottom)
            }
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
        // in the log UI
        timestamp_to_logdate(timestamp) {
            const timestamp_ms = timestamp * 1000
            return moment(timestamp_ms).format('HH:mm:ss UTC')
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

        // Control the status indicator dot in the title bar.
        isOnline() {
            // online is defined by status age under 5 minutes
            if (this.status_age < 300) {
                return true
            }
            else return false;
        },
        
    },


}
</script>


<style lang="scss" scoped>
@import "@/style/_variables.scss";
@import "@/style/buefy-styles.scss";


$main-status-background: #0f1313;
$user-status-background: darken($main-status-background, 3);
$toggle-button-color: darken($main-status-background, 5);

$status-tab-height: 37.5px; //button height
$status-tab-color: darken($main-status-background, 3);


.site-status-footer-mobile-wrapper {
    z-index: 1;
}

.status-tabs {
    display: flex;
    height: $status-tab-height;
    margin: 0;
    z-index: 2;
}
.status-tabs > div {
    width: 50%;
    //background-color: $status-tab-color;
    //color: white;
    //border: solid 3px black;
    border-radius: 0;
    background-color: $status-tab-color;


    display: flex;
    align-items: center;
    justify-content:space-around;
}
.status-tabs > div:hover{
    cursor: pointer;
}


.overlay {
    height: 100%;
    bottom: $status-tab-height;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 9999;
    overscroll-behavior:contain;
}
.overlay > .backdrop {
    height: 100%;
    bottom: $status-tab-height;
    position: fixed;
    top: 0;
    width: 100%;
    background-color: rgba(0,0,0,0.7);
    z-index: -1;
}
.status-content {
    width: 100%;
    bottom: $status-tab-height;
    position: fixed;
    overscroll-behavior:contain;
    border: 1px solid lighten($main-status-background, 6);
}


.main-status-mobile {
    width: 100%;
    height: 100%;
    background-color: $main-status-background;
}
.main-status-header {
    width: 100%;
    display: flex;
    border-bottom: 1px dashed #111;
    border-bottom: 1px dashed lighten($main-status-background, 10);
    padding-bottom: 1em;
}
.main-status-header > div {
    width: 50%;
    display: flex;
    justify-content: space-around;
}
.main-status-items {
    display:flex;
    padding:1em;

}


.user-status-mobile {
    background-color: $user-status-background;
    height: 100%;
    width: 100%;
}

/**
 *  User status (log) styles 
 */

$log-debug: #aaa;
$log-info: #bbb;
$log-warning: $warning;
$log-error: $danger;
$log-critical: $danger;


.user-status.expanded {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 400px;

    line-height: 2em;
    line-height: 1.3em;
    overflow-y: scroll;
    overscroll-behavior:contain;
    padding-top: 2pt;
}
.default-log-message {
    width: 100%;
    color: #bbb;
    font-size: 11pt;
    font-family:'Courier New', Courier, monospace;
    padding: 1em;
    border-bottom: 1px dashed #333;
}

.log-line {
    display:flex;
    flex-direction: column;
    padding: 5px 1em;
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

// highlight the timestamp of the line that is hovered over. 
.log-line:hover * {
    color:white;
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
    background-color: rgba(219, 8, 8, 0.884);
    color: #FFF;

    /* Rounded border */
    border-radius: 9999px;
    height: 12px;
    width: 12px;
}

</style>
