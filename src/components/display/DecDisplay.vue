
<template>
  <div class="wrapper" v-if="dec_deg_decimal" >
    <div @click="handleClick" title="click to change format" class="dec-display" >
      {{declinationDisplayVal}} 
    </div>
    <b-icon 
      @click.native="copy"
      title="copy"
      class="copy-icon" 
      v-if="can_copy" 
      icon="content-copy" 
      custom-size="mdi-30px" />
  </div> 
</template>

<script>
export default {
  name: "DecDisplay",
  
  props: {

    // declination (degrees) as a decimal value
    dec_deg_decimal: {
      type: Number,
    },
    can_copy: {
      type: Boolean,
      default: false,
    }
  },

  data() {
    return {

      showCopyIcon: false,

      displayFormatOptions: ["decimalDegrees", "sexagesimalWithUnits", "sexagesimalPlain"],
      displayFormatSelected: 0, // index of the list above

      decimalPrecision: 4  // number of decimals to show
    }
  },

  methods: {
    handleClick() {
      this.displayFormatSelected = (this.displayFormatSelected + 1 ) % this.displayFormatOptions.length
    },

    copy() {
      navigator.clipboard.writeText(this.declinationDisplayVal)
      this.$buefy.toast.open({
        message: "Coppied " + this.declinationDisplayVal + " to clipboard",
        type: "is-success"
      })
    },

    toSexagesimal(decimalDegrees, includeUnits) {
      let degrees = parseInt(decimalDegrees)
      let remainder = decimalDegrees - degrees
      let decimalMinutes = remainder * 60
      let minutes = parseInt(decimalMinutes)
      remainder = decimalMinutes - minutes
      let decimalSeconds = remainder * 60 
      let seconds = parseInt(decimalSeconds)

      // Zero padding if single digit
      if (degrees < 10 && degrees > -10) {  // dec can be negative
        degrees = '0' + degrees
      } 
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      if (seconds < 10) {
        seconds = '0' + seconds
      }

      if (includeUnits) {
        return `${degrees}º ${minutes}\' ${seconds}\"`
      }
      else {
        return degrees + ' ' + minutes + ' ' + seconds 
      }
    }

  },

  computed: {
    displayFormat() {
      return this.displayFormatOptions[this.displayFormatSelected]
    },
    declinationDisplayVal() {
      if (this.displayFormat == "decimalDegrees") {
        return this.dec_deg_decimal.toFixed(this.decimalPrecision)
      }
      if (this.displayFormat == "sexagesimalPlain") {
        return this.toSexagesimal(this.dec_deg_decimal, false)
      }
      if (this.displayFormat == "sexagesimalWithUnits") {
        return this.toSexagesimal(this.dec_deg_decimal, true)
      }
    }
  }
}
</script>

<style scoped>

.wrapper {
  display:flex;
  flex-direction: row;
}

.dec-display {
  width: 80px;
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