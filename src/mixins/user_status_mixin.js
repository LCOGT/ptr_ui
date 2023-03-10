
import { mapState } from 'vuex'
import axios from 'axios'
import moment from 'moment'

export const user_status_mixin = {

  data () {
    return {

      // reconnecting websocket object
      user_status_websocket: '',

      // Getting messages from this site
      user_status_active_site: '',

      is_collapsed: false,
      supported_log_levels: [
        'debug',
        'info',
        'warning',
        'error',
        'critical'
      ]
    }
  },

  beforeDestroy () {
    this.close_logs_websocket()
  },

  methods: {

    set_user_status_active_site (site) {
      // Do nothing if already set
      if (this.user_status_active_site == site) {
        return
      }
      if (site == '') {
        return
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
      // this.get_recent_logs()
    },

    /** Utilities **/
    getRandomInt (max) {
      return Math.floor(Math.random() * Math.floor(max))
    },

    get_timestamp_seconds () {
      return Math.floor(Date.now() / 1000)
    },

    // Method for converting timestamp(seconds) to a date that reads easily
    // in the log UI
    timestamp_to_logdate (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).format('HH:mm:ss UTC')
    },

    // Used to format the time for the timestmap tooltip.
    // (reveals the yyyy/mm/dd, not included in the default view)
    timestamp_to_date (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).format('YYYY/MM/DD')
    },

    readable_time_ago (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).fromNow()
    },

    log_is_stale (timestamp_s) {
      const stale_age_s = 60 * 30 // Stale logs are older than 30 minutes
      return (Date.now() / 1000) - parseInt(timestamp_s) > stale_age_s
    },

    // Returns class names used to style a log message based on the
    // supplied log level.
    get_log_level_classes (log) {
      let classes = ''
      // Default level of info if none supplied
      if (!('log_level' in log)) {
        classes += ' info'
      }

      const log_level = log.log_level
      if (this.supported_log_levels.includes(log_level.toLowerCase())) {
        classes += ` ${log_level.toLowerCase()}`
      }
      else {
        console.warn('Unrecognized log level in log: ', log_level)
        classes += ' info'
      }

      // Check if log is stale (old).
      if (this.log_is_stale(log.timestamp)) {
        classes += ' log-is-stale'
      }

      return classes
    },

    // Add the log level in front of the message if it is a warning, error,
    // or critical level.
    format_log_message_text (log) {
      // Handle case of no message
      if (!('message' in log)) {
        return ''
      }
      let message = log.message

      // Mark stale messages by prefixing (stale) in front of the message
      if (this.log_is_stale(log.timestamp)) {
        message = `(stale) ${message}`
      }
      return message
    },

    /** Websocket Connections **/
    connect_to_logs_ws (site) {

    },
    close_logs_websocket () {

    },

    // This function is run whenever the websocket gets a new message.
    handle_new_log (message) {
      const new_log = JSON.parse(message.data)
      this.$store.commit('userstatus/add_log', new_log)
    },

    // Fetch logs from the last day and display them in the log window
    // in chronological order (newest at bottom)
    get_recent_logs () {
      this.$store.dispatch('userstatus/fetch_recent_logs')
    },

    // Used to test sending a message.
    send_fake_log_ws () {
      const body = {
        action: 'newlog',
        log_message: 'This is a log message for testing. It is sent from the frontend.',
        site: this.user_status_active_site,
        log_level: this.supported_log_levels[this.getRandomInt(5)],
        timestamp: this.get_timestamp_seconds()
      }
      this.user_status_websocket.send(JSON.stringify(body))
    },
    // Used to test sending a message.
    send_fake_log_http () {
      const url = this.logs_endpoint + '/newlog'
      const body = {
        log_message: 'multiline\nlog\nmessage',
        site: this.user_status_active_site,
        timestamp: this.get_timestamp_seconds()
      }
      axios.post(url, body)
    }
  },

  computed: {
    ...mapState('api_endpoints', [
      'logs_ws_endpoint',
      'logs_endpoint'
    ]),
    ...mapState('userstatus', ['user_status_logs']),

    // The latest user status log to display in collapsed view.
    last_log () {
      // return this.user_status_logs.slice(-1)[0]
      return this.$store.getters['userstatus/last_log']
    }
  }

}
