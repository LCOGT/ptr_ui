<template>
  <div>{{ time }}</div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'UtcTime',
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
      this.time = moment.utc().format(this.format)
    }

  }

}
</script>
