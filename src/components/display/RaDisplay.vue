<template>
  <div
    v-if="ra_hours_decimal"
    class="wrapper"
  >
    <div
      title="click to change format"
      class="ra-display"
      @click="handleClick"
    >
      {{ rightAscension }}
    </div>
    <b-icon
      v-if="can_copy"
      title="copy"
      class="copy-icon"
      icon="content-copy"
      custom-size="mdi-30px"
      @click.native="copy"
    />
  </div>
</template>

<script>
import helpers from '@/utils/helpers'

export default {
  name: 'RaDisplay',

  props: {
    ra_hours_decimal: {
      type: Number
    },
    can_copy: {
      type: Boolean,
      default: false
    },
    decimal_hours_precision: {
      type: Number,
      default: 5
    },
    decimal_degrees_precision: {
      type: Number,
      default: 6
    }
  },

  data () {
    return {

      showCopyIcon: false,

      displayFormatOptions: ['decimalDegrees', 'decimalHours', 'sexagesimalWithUnits', 'sexagesimalPlain'],
      displayFormatSelected: window.localStorage.getItem('ra_display_format') // index of the list above

    }
  },

  methods: {
    handleClick () {
      this.displayFormatSelected = (this.displayFormatSelected + 1) % this.displayFormatOptions.length
      window.localStorage.setItem('ra_display_format', this.displayFormatSelected)
    },

    copy () {
      navigator.clipboard.writeText(this.rightAscension)
      this.$buefy.toast.open({
        message: 'Coppied ' + this.rightAscension + ' to clipboard',
        type: 'is-success'
      })
    },

    toSexagesimal (decimal_hours, includeUnits) {
      let hours = parseInt(decimal_hours)
      let remainder = decimal_hours - hours
      const decimal_minutes = remainder * 60
      let minutes = parseInt(decimal_minutes)
      remainder = decimal_minutes - minutes
      const decimal_seconds = remainder * 60
      let seconds = parseInt(decimal_seconds)

      // Zero padding if single digit
      if (hours < 10) {
        hours = '0' + hours
      }
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      if (seconds < 10) {
        seconds = '0' + seconds
      }

      if (includeUnits) {
        return `${hours}h ${minutes}' ${seconds}"`
      } else {
        return hours + ' ' + minutes + ' ' + seconds
      }
    },

    toDecimalDegrees (decimal_hours) {
      const tempRA = helpers.hour2degree(decimal_hours)
      return tempRA < 0 ? tempRA + 360 : tempRA
    }

  },

  computed: {
    displayFormat () {
      if (this.displayFormatSelected != null) {
        return this.displayFormatOptions[this.displayFormatSelected]
      } else {
        return this.displayFormatOptions[0]
      }
    },
    rightAscension () {
      if (this.displayFormat == 'decimalHours') {
        return this.ra_hours_decimal.toFixed(this.decimal_hours_precision) + 'h'
      }
      if (this.displayFormat == 'decimalDegrees') {
        return this.toDecimalDegrees(this.ra_hours_decimal).toFixed(this.decimal_degrees_precision) + '°'
      }
      if (this.displayFormat == 'sexagesimalPlain') {
        return this.toSexagesimal(this.ra_hours_decimal, false)
      }
      if (this.displayFormat == 'sexagesimalWithUnits') {
        return this.toSexagesimal(this.ra_hours_decimal, true)
      }

      // fallback with error msg
      console.error('RaDisplay component failed to display because the displayFormat was unrecognized')
      return 'unrecognized units'
    }
  }
}
</script>

<style scoped>

.wrapper {
  display:flex;
  flex-direction: row;
}

.ra-display {
  min-width: 70px;
}
.ra-display:hover {
  cursor: pointer;
}

.copy-icon {
  margin-left: 5px;
}
.copy-icon:hover {
  cursor: pointer;
}
</style>
