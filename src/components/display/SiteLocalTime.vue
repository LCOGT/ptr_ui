<template>
  <div>{{ time }}</div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'SiteLocalTime',
  props: {
    timezone: {
      type: String,
      required: true
    },
    format: {
      type: String,
      default: () => 'HH:mm'
    }
  },
  data () {
    return {
      timer: '',
      time: '--'
    }
  },
  created () {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 5000)
  },
  beforeDestroy () {
    clearInterval(this.timer)
  },

  watch: {
    longitude () {
      this.siderealTime()
    }
  },

  methods: {

    updateTime () {
      this.time = moment.tz(this.timezone).format(this.format)
    }

  }

}
</script>
