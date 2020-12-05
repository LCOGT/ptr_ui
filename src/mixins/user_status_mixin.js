
import { mapState } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios'
import moment from 'moment'

export const user_status_mixin = {

    data() {
        return {

            // reconnecting websocket object
            user_status_websocket: '',

            // Getting messages from this site
            user_status_active_site: '',

            user_status_logs: [],
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

    beforeDestroy() {
        this.close_logs_websocket()
    },

    methods: {

        set_user_status_active_site(site) {

            // Do nothing if already set
            if (this.user_status_active_site == site) {
                return; 
            }
            if (site == '' ) {
                return;
            }


            // First, close old connection
            try {
                this.user_status_websocket.close()
            } catch {
            }

            // Connect using new site
            this.user_status_active_site = site
            this.connect_to_logs_ws(site)

            // Populate list of recent logs
            this.get_recent_logs()

        },

        /** Utilities **/
        getRandomInt(max) {
            return Math.floor(Math.random() * Math.floor(max));
        },
        get_timestamp_seconds() {
            return Math.floor(Date.now() / 1000)
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


        /** Websocket Connections **/
        connect_to_logs_ws(site) {
            console.log('connecting to user status websocket with site ', site)

            if (!site) return;

            // Connect to websocket
            let url = this.logs_ws_endpoint
            url += `?site=${encodeURIComponent(site)}`

            this.user_status_websocket = new ReconnectingWebSocket(url)

            // Define websocket incoming message behavior
            this.user_status_websocket.onmessage = this.handle_new_log
        },
        close_logs_websocket() {
            try {
                this.user_status_websocket.close()
            } catch {
                return;
            }
        },


        // This function is run whenever the websocket gets a new message.
        handle_new_log(message) {
            const new_log = JSON.parse(message.data)
            //console.log("new log entry: ")
            console.log(new_log)
            this.user_status_logs.push(new_log)
        },

        // Fetch logs from the last day and display them in the log window 
        // in chronological order (newest at bottom)
        get_recent_logs() {

            // Fetch any logs that are under a day old
            const seconds_per_day = 86400
            const after_time_param = this.get_timestamp_seconds() - seconds_per_day

            // Only fetch logs from the current site
            const site_param = this.user_status_active_site

            // Form the url with query params
            let url = this.logs_endpoint + '/recent-logs'
            url += '?after_time=' + encodeURIComponent(after_time_param)
            url += '&site=' + encodeURIComponent(site_param)

            axios.get(url).then(logs => {
                //console.log(logs.data)
                this.user_status_logs = [...logs.data].sort((a,b) => a.timestamp - b.timestamp)
                //if (this.user_status_visible){ 
                    //this.$nextTick(this.scrollToBottom)
                //}
            })
        },

        // Used to test sending a message.
        send_fake_log_ws() {
            let body = {
                action: "newlog",
                log_message: "This is a log message for testing. It is sent from the frontend.",
                site: this.user_status_active_site, 
                log_level: this.supported_log_levels[this.getRandomInt(5)],
                timestamp: this.get_timestamp_seconds()
            }
            console.log(body)
            console.log(this.user_status_websocket)
            this.user_status_websocket.send(JSON.stringify(body))
        },
        // Used to test sending a message.
        send_fake_log_http() {
            const url = this.logs_endpoint + '/newlog'
            let body = {
                log_message: `multiline\nlog\nmessage`,
                site: this.user_status_active_site,
                timestamp: this.get_timestamp_seconds()
            }
            //console.log(body.log_message)
            axios.post(url, body)
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
            return this.user_status_logs.slice(-1)[0]
        },
    },

}