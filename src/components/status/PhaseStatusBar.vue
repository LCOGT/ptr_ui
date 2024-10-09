<template>
  <div>
    <div class="container phase-status-wrapper">
      <div class="phase-status-title">
        <span>Next Events: </span>
        <span class="timestamp">{{ phase_status_sorted[0]?.timestamp | readable_date }}</span>
      </div>
      <template v-for="(s, index) in phase_status_sorted">
        <span
          v-if="index"
          :key="index + 'spacer'"
          class="spacer"
        > | </span>
        <b-tooltip
          v-if="index > 0"
          :key="index"
          :label="s.timestamp | readable_date"
          position="is-top"
          type="is-dark"
        >
          <span
            class="phase-status-text"
            :style="text_opacity_style(s.timestamp)"
          >
            {{ s.message }}
          </span>
        </b-tooltip>
        <span
          v-else
          :key="index"
          class="phase-status-text"
          :style="text_opacity_style(s.timestamp)"
        >
          {{ s.message }}
        </span>
      </template>
    </div>
  </div>
</template>
<script>

/* TODO: handle phase status in vuex so we can use the site-wide datastreamer
    websocket connection and we don't need to open a separate one for this component. 
*/

import ReconnectingWebSocket from 'reconnecting-websocket'
import moment from 'moment'
import axios from 'axios'

const default_phase_status = {
  timestamp: (Date.now() / 1000) - 86400, // set age to a day ago so it looks like an older message
  message: 'no reported phase'
}
export default {
  name: 'PhaseStatusBar',
  data () {
    return {
      phase_status: [default_phase_status],
      now: Date.now() / 1000,
      site: this.$route.params.sitecode
    }
  },
  filters: {
    readable_date (timestamp) {
      // don't forget to convert back to ms for js date handling
      const readable = moment(timestamp * 1000).format('MM/DD HH:mm:ss')
      return readable
    }
  },
  created () {
    setInterval(() => {
      this.now = Date.now() / 1000
    }, 5000)
  },
  mounted () {
    this.get_recent_phase_status()

    const datastreamurl = 'wss://datastream.photonranch.org/dev' +
                        `?site=${encodeURIComponent(this.site)}`
    this.websocket = new ReconnectingWebSocket(datastreamurl)
    this.websocket.onmessage = msg => {
      const payload = JSON.parse(msg.data)
      if (payload.topic == 'phase_status') {
        this.phase_status.push(payload.data)
      }
    }
  },
  beforeDestroy () {
    this.websocket.close()
  },
  watch: {
    $route (to, from) {
      this.site = to.params.sitecode
      this.phase_status = [default_phase_status]
      this.websocket.send(JSON.stringify({
        action: 'updatesubscribersite',
        site: this.site
      }))
      this.get_recent_phase_status()
    }
  },
  methods: {
    async get_recent_phase_status () {
      const max_age = 3600 // one hour
      const url = this.$store.state.api_endpoints.status_endpoint +
                `/phase_status/${this.site}` +
                `?max_age_seconds=${encodeURIComponent(max_age)}`
      const latest_phase_status = await axios.get(url)
      if (latest_phase_status.data.length) {
        this.phase_status = latest_phase_status.data
      }
    },
    text_opacity_style (timestamp) {
      const hour = 60 * 60
      const opacity_percent = 100 * (1 - (Math.min((this.now - timestamp) / hour, 0.5)))
      return `opacity: ${opacity_percent}%;`
    }
  },
  computed: {
    // Newest item first, oldest item last
    phase_status_sorted () {
      const sorted = [...this.phase_status].sort((a, b) => b.timestamp - a.timestamp)
      return sorted
    }
  }

}
</script>
<style lang="scss" scoped>
.phase-status-wrapper {
    display:flex;
    flex-wrap: nowrap;
}
.timestamp {
    font-family: unset;
    font-family: monospace;
    padding-right: 15px;
    color: #bbb;
}
.phase-status-title {
    width: 220px;
    font-size: 12px;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    flex-shrink: 0;
}
.spacer {
    margin: 0 1em;
    color: #bbb;
}
.phase-status-text {
    margin: 0 1em;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #eee;
}

</style>
