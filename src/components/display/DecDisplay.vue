
<template>
  <div
    v-if="dec_deg_decimal"
    class="wrapper"
  >
    <div
      title="click to change format"
      class="dec-display"
      @click="handleClick"
    >
      {{ declinationDisplayVal }}
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
export default {
  name: 'DecDisplay',

  props: {

    // declination (degrees) as a decimal value
    dec_deg_decimal: {
      type: Number
    },
    can_copy: {
      type: Boolean,
      default: false
    },
    decimal_precision: {
      type: Number,
      default: 4
    }
  },

  data () {
    return {

      showCopyIcon: false,

      displayFormatOptions: ['decimalDegrees', 'sexagesimalWithUnits', 'sexagesimalPlain'],
      displayFormatSelected: window.localStorage.getItem('dec_display_format') // index of the list above

    }
  },

  methods: {
    handleClick () {
      this.displayFormatSelected = (this.displayFormatSelected + 1) % this.displayFormatOptions.length
      window.localStorage.setItem('dec_display_format', this.displayFormatSelected)
    },

    copy () {
      navigator.clipboard.writeText(this.declinationDisplayVal)
      this.$buefy.toast.open({
        message: 'Coppied ' + this.declinationDisplayVal + ' to clipboard',
        type: 'is-success'
      })
    },

    toSexagesimal (decimalDegrees, includeUnits) {
      let degrees = parseInt(decimalDegrees)
      let remainder = Math.abs(decimalDegrees - degrees)
      const decimalMinutes = remainder * 60
      let minutes = parseInt(decimalMinutes)
      remainder = decimalMinutes - minutes
      const decimalSeconds = remainder * 60
      let seconds = parseInt(decimalSeconds)

      // Zero padding if single digit
      if (degrees < 10 && degrees > -10) { // dec can be negative
        if (degrees < 0) { degrees = '-0' + Math.abs(degrees) } // add the minus sign before the zero
        else { degrees = '0' + degrees }
      }
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      if (seconds < 10) {
        seconds = '0' + seconds
      }

      if (includeUnits) {
        return `${degrees}º ${minutes}' ${seconds}"`
      } else {
        return degrees + ' ' + minutes + ' ' + seconds
      }
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
    declinationDisplayVal () {
      if (this.displayFormat == 'decimalDegrees') {
        return this.dec_deg_decimal.toFixed(this.decimal_precision) + '°'
      }
      if (this.displayFormat == 'sexagesimalPlain') {
        return this.toSexagesimal(this.dec_deg_decimal, false)
      }
      if (this.displayFormat == 'sexagesimalWithUnits') {
        return this.toSexagesimal(this.dec_deg_decimal, true)
      }

      // fallback with error msg
      console.error('DecDisplay component failed to display because the displayFormat was unrecognized')
      return 'unrecognized units'
    }
  }
}
</script>

<style scoped lang="scss">

.wrapper {
  display:flex;
  flex-direction: row;
}

.dec-display {
  min-width: 70px;
}
.dec-display:hover {
  cursor: pointer;
}

.copy-icon {
  margin-left: 5px;
}
.copy-icon:hover {
  cursor: pointer;
}
</style>
