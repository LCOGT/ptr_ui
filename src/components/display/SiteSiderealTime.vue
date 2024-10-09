<template>
  <div>{{ lmst | decimal2hhmm }}</div>
</template>

<script>
export default {
  name: 'SiteSiderealTime',
  props: {
    longitude: Number
  },
  data () {
    return {
      timer: '',
      lmst: '--'
    }
  },
  created () {
    this.siderealTime()
    this.timer = setInterval(this.siderealTime, 5000)
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

    siderealTime () {
      /* Local Sidereal Time with reference to J2000
            *
            * Equations courtesy of www.stargazing.net/kepler/altaz.html
            * and www.aberdeenastro.org.uk/sidereal_time.htm

            *  LST = 100.46 + 0.985647 * d + lon + 15*UT
            *
            *       d    is the days from J2000, including the fraction of a day
            *       UT   is the universal time in decimal hours
            *       lon is your longitude in decimal degrees, East positive.
            */

      // Calculate days since J2000
      const today_date = new Date()
      const epoch_date = new Date(2000, 0, 1, 12, 0, 0)

      const today_time = today_date.getTime()
      const epoch_time = epoch_date.getTime()

      const milli_since_epoch = today_time - epoch_time
      const d = milli_since_epoch / 86400000

      // Calculate UT: universal time in decimal hours
      const h = today_date.getUTCHours()
      const m = today_date.getUTCMinutes()
      const s = today_date.getUTCSeconds()
      const UT = h + m / 60 + s / 3600

      // Local Sidereal Time:
      const lmst = ((100.46 + 0.985647 * d + this.longitude + 15 * UT) % 360) / 15

      this.lmst = lmst
    }
  },

  filters: {
    decimal2hhmm (hours) {
      if (isNaN(hours)) { return '--:--' }

      let h = Math.floor(hours)
      let m = Math.floor(60 * (hours - h))

      if (h < 10) {
        h = '0' + h
      }

      if (m < 10) {
        m = '0' + m
      }

      return h + ':' + m
    }
  }
}
</script>
