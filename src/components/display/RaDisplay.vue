<template>
  <div class="wrapper" v-if="ra_hours_decimal" >
    <div @click="handleClick" title="click to change format" class="ra-display" > 
      {{rightAscension}} 
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
  name: "RaDisplay",
  
  props: {
    ra_hours_decimal: {
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

      displayFormatOptions: ["decimalHours", "sexagesimalWithUnits", "sexagesimalPlain"],
      displayFormatSelected: 0, // index of the list above

      decimalPrecision: 5,  // number of decimals to show
    }
  },

  methods: {
    handleClick() {
      this.displayFormatSelected = (this.displayFormatSelected + 1 ) % this.displayFormatOptions.length
    },

    copy() {
      navigator.clipboard.writeText(this.rightAscension)
      this.$buefy.toast.open({
        message: "Coppied " + this.rightAscension + " to clipboard",
        type: "is-success"
      })
    },

    toSexagesimal(decimal_hours, includeUnits) {
      let hours = parseInt(decimal_hours)
      let remainder = decimal_hours - hours
      let decimal_minutes = remainder * 60
      let minutes = parseInt(decimal_minutes)
      remainder = decimal_minutes - minutes
      let decimal_seconds = remainder * 60 
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
        return `${hours}h ${minutes}\' ${seconds}\"`
      }
      else {
        return hours + ' ' + minutes + ' ' + seconds 
      }
    }

  },

  computed: {
    displayFormat() {
      return this.displayFormatOptions[this.displayFormatSelected]
    },
    rightAscension() {
      if (this.displayFormat == "decimalHours") {
        return this.ra_hours_decimal.toFixed(this.decimalPrecision)  
      }
      if (this.displayFormat == "sexagesimalPlain") {
        return this.toSexagesimal(this.ra_hours_decimal, false)
      }
      if (this.displayFormat == "sexagesimalWithUnits") {
        return this.toSexagesimal(this.ra_hours_decimal, true)
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

.ra-display {
  width: 80px;
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