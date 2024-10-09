<template>
  <div>
    <!-- enable these buttons for easier manual testing>
    <button @click="send_fake_log_ws" class="button ">send ws log</button>
    <button @click="send_fake_log_http" class="button ">send http log</button>
    <button @click="get_recent_logs" class="button">get recent logs</button>
    <button @click="scrollToBottom" class="button">scroll bottom</button>
    <div style="height: 200px;"/>
    -->

    <div class="logstream-wrapper">
      <div
        v-if="!is_collapsed"
        ref="loglist"
        class="log-list"
      >
        <div style="text-align: center; padding: 1em 4em;">
          observatory logs will appear below
        </div>

        <div
          v-for="(log, idx) in logs"
          :key="idx"
          class="log-line"
        >
          <div class="log-timestamp">
            <b-tooltip
              position="is-right"
              type="is-dark"
              :label="timestamp_to_date(log.timestamp)"
            >
              {{ timestamp_to_logdate(log.timestamp) }}
            </b-tooltip>
          </div>
          <pre
            class="log-message"
            :class="get_log_level_classes(log)"
          >
                    {{ format_log_message_text(log) }}
                </pre>
        </div>
      </div>

      <b-tooltip
        label="observatory logs"
        position="is-left"
        :active="is_collapsed"
        square
      >
        <div
          class="collapse-button"
          @click="toggle_open"
        >
          <b-icon
            v-if="is_collapsed"
            icon="chevron-left"
          />
          <b-icon
            v-if="!is_collapsed"
            icon="chevron-right"
          />
        </div>
      </b-tooltip>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket'
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'LogStream',
  props: ['site'],
  data () {
    return {
      logs: [],
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

  created () {
    this.get_recent_logs()

    // Connect to websocket
    let logs_url = this.logs_ws_endpoint
    logs_url += `?site=${encodeURIComponent(this.site)}`
    this.logs_ws = new ReconnectingWebSocket(logs_url)

    // Define websocket incoming message behavior
    this.logs_ws.onmessage = this.handle_new_log
  },

  beforeDestroy () {
    this.logs_ws.close()
  },

  methods: {
    getRandomInt (max) {
      return Math.floor(Math.random() * Math.floor(max))
    },
    get_timestamp_seconds () {
      return Math.floor(Date.now() / 1000)
    },

    // Open or collapse the logs window
    toggle_open () {
      if (this.is_collapsed) {
        this.is_collapsed = false
        this.$nextTick(this.scrollToBottom)
      } else {
        this.is_collapsed = true
      }
    },

    // Used to test sending a message.
    send_fake_log_ws () {
      const body = {
        action: 'newlog',
        log_message: 'This is a log message for testing. It is sent from the frontend.',
        site: this.site,
        log_level: this.supported_log_levels[this.getRandomInt(5)],
        timestamp: this.get_timestamp_seconds()
      }
      this.logs_ws.send(JSON.stringify(body))
    },

    // Used to test sending a message.
    send_fake_log_http () {
      const url = this.logs_endpoint + '/newlog'
      const body = {
        log_message: 'multiline\nlog\nmessage',
        site: this.site,
        timestamp: this.get_timestamp_seconds()
      }
      axios.post(url, body)
    },

    // Returns true if the element is scrolled to the bottom
    isScrolledToBottom (el) {
      const $el = $(el)
      return el.scrollHeight - $el.scrollTop() - $el.outerHeight() < 1
    },

    // This method will scroll the log window to the bottom (to the latest
    // message)
    scrollToBottom () {
      const div = this.$refs.loglist
      div.scrollTop = div.scrollHeight - div.clientHeight
    },

    // This function is run whenever the websocket gets a new message.
    handle_new_log (message) {
      const new_log = JSON.parse(message.data)
      if (this.isScrolledToBottom(this.$refs.loglist)) {
        this.logs.push(new_log)
        this.$nextTick(this.scrollToBottom)
      } else {
        this.logs.push(new_log)
      }
    },

    // Fetch logs from the last day and display them in the log window
    // in chronological order (newest at bottom)
    get_recent_logs () {
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
        this.logs = [...this.logs, ...logs.data].sort((a, b) => a.timestamp - b.timestamp)
        this.$nextTick(this.scrollToBottom)
      })
    },

    // Returns class names used to style a log message based on the
    // supplied log level.
    get_log_level_classes (log) {
      // Default level of info if none supplied
      if (!('log_level' in log)) {
        return 'info'
      }

      const log_level = log.log_level
      if (this.supported_log_levels.includes(log_level.toLowerCase())) {
        return log_level.toLowerCase()
      } else {
        console.warn('Unrecognized log level in log: ', log_level)
        return 'info'
      }
    },

    // Add the log level in front of the message if it is a warning, error,
    // or critical level.
    format_log_message_text (log) {
      // Handle case of no message
      if (!('message' in log)) {
        return ''
      }

      const message = log.message
      const log_level = log.log_level || 'info'

      if (['debug', 'info'].includes(log_level.toLowerCase())) {
        return message
      } else {
        return `[${log_level.toUpperCase()}]  ${message}`
      }
    },

    // Method for converting timestamp(seconds) to a date that reads easily
    // in the log UI
    timestamp_to_logdate (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).format('HH:mm:ss')
    },

    // Used to format the time for the timestmap tooltip.
    // (reveals the yyyy/mm/dd, not included in the default view)
    timestamp_to_date (timestamp) {
      const timestamp_ms = timestamp * 1000
      return moment(timestamp_ms).format('YYYY/MM/DD')
    }
  },

  computed: {
    ...mapState('api_endpoints', [
      'logs_ws_endpoint',
      'logs_endpoint'
    ])
  }
}

</script>

<style lang="scss" scoped>

@import "@/style/buefy-styles.scss";

$log-debug: #aaa;
$log-info: #bbb;
$log-warning: $warning;
$log-error: $danger;
$log-critical: $danger;

.logstream-wrapper {
    display: flex;
    flex-direction: row;
    background-color:black;
    position: fixed;
    right: 0%;
    top: 200px;
    height: 150px;
    max-width: 100%;
    margin-bottom: 1em;
}
@media (max-width: 1216px) {
    .logstream-wrapper {
        height: 130px;
        bottom: 132px;
    }
}

.collapse-button {
    background-color: #1b1e1f;
    border: solid 1.5px #2a2f30;
    height: 100%;
    display:flex;
    flex-direction: column;
    justify-content: center;
    padding: 1em;
}
.collapse-button:hover {
    cursor: pointer;
}

.log-header {
    padding: 1em;
}

.log-list {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    width: 100%;
    overscroll-behavior: contain;
    padding-top: 1em;
    padding-left: 1em;
    padding-bottom: 20px;
}

.log-line {
    display: grid;
    grid-template-columns: 6em 1fr;
    padding-bottom: 0.5em;
}

.log-timestamp {
    color: #bbb;
    animation: blinkonce 1s;
    grid-column-start: 1;
    padding-top: 2pt;
    font-size: 9pt;
    font-family:'Courier New', Courier, monospace;
    align-items: center;
    margin-left: 1em;
}
pre.log-message {
    color: #bbb;
    font-size: 11pt;
    font-family:'Courier New', Courier, monospace;
    width: 100%;
    max-width: 80ch;
    background-color:black;
    animation: blinkonce 1s;
    grid-column-start: 2;
    text-align: left;
    white-space: pre-line;
    hyphens: auto;
    padding: 0;
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

// highlight the timestamp of the line that is hovered over.
.log-line:hover * {
    color:white;
}

</style>
