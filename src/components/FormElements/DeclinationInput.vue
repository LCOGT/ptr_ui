<template>
  <div>
    <b-field
      :type="hasError ? 'is-danger' : 'is-dark'"
      :message="errorMessage"
      :size="size"
    >
      <b-input
        v-model="localDec"
        :size="size"
        lazy
      />
      <b-select
        v-model="units"
        :size="size"
      >
        <option value="deg">
          deg
        </option>
        <option value="sexagesimal">
          sexagesimal
        </option>
      </b-select>
    </b-field>
  </div>
</template>

<script>
export default {
  props: ['value', 'size'],
  data () {
    return {
      localDec: null,
      units: 'deg',
      hasError: false,
      errorMessage: ''
    }
  },
  watch: {
    value (newVal) {
      if (newVal == null || newVal === '') {
        this.localDec = newVal
      } else {
        this.localDec = this.convertToSelectedUnits(newVal)
      }
    },
    localDec (newVal) {
      if (newVal != null && newVal !== '') {
        this.validateValue(newVal)
      }
    },
    units (newVal) {
      if (this.value == null || this.value === '') return
      this.localDec = this.convertToSelectedUnits(this.value)
    }
  },
  methods: {
    convertToSelectedUnits (value) {
      if (this.units === 'deg') {
        return value
      } else if (this.units === 'sexagesimal') {
        return this.decimalToSexagesimal(value)
      }
    },
    validateValue (value) {
      this.hasError = false
      this.errorMessage = ''
      let decimalDegrees
      try {
        // Validate decimal degrees
        if (this.units === 'deg') {
          if (isNaN(Number(value)) || Number(value) < -90 || Number(value) > 90) {
            throw new RangeError('Must be between -90 and +90 degrees')
          }
          decimalDegrees = Number(value)
        // Validate sexigesimal
        } else if (this.units === 'sexagesimal') {
          console.log('parts: ', value.trim().replaceAll(':', ' ').split(' '))
          const parts = value.trim().replaceAll(':', ' ').split(' ').map((part, index) => {
            console.log(part, index)
            if (isNaN(Number(part))) {
              throw new Error('Sexigesimal must be formatted in degrees:minutes:seconds')
            }
            if (index != 0 && (Number(part) >= 60 || Number(part) < 0)) {
              throw new Error('Sexagesimal minutes and seconds must be numbers between 0, 60')
            }
            return Number(part)
          })
          if (parts.length !== 3) throw new Error('Sexigesimal must be formatted in degrees:minutes:seconds')
          decimalDegrees = Math.abs(parts[0]) + parts[1] / 60 + parts[2] / 3600
          if (parts[0] < 0) {
            decimalDegrees *= -1
          }
          if (decimalDegrees < -90 || decimalDegrees > 90) throw new RangeError('Must be between -90 and +90 degrees')
        }
        this.updateValue(decimalDegrees)
      } catch (e) {
        this.hasError = true
        this.errorMessage = e.message
      }
    },
    updateValue (value) {
      this.$emit('input', value)
    },
    padZeros (value) {
      const num = typeof value === 'string' ? parseInt(value, 10) : value
      if (Math.abs(num) < 10) {
        return '0' + num
      } else {
        return '' + num
      }
    },
    decimalToSexagesimal (decimalDegrees) {
      const isNegative = decimalDegrees < 0
      decimalDegrees = Math.abs(decimalDegrees)
      let degrees = Math.floor(decimalDegrees)
      let remaining = decimalDegrees - degrees
      let minutes = Math.floor(remaining * 60)
      remaining = remaining - minutes / 60
      let seconds = (remaining * 3600).toFixed(2)

      // Pad with 0 if single digit
      if (degrees < 10) {
        degrees = '0' + degrees
      }

      if (minutes < 10) {
        minutes = '0' + minutes
      }

      if (seconds < 10) {
        seconds = '0' + parseFloat(seconds).toFixed(2)
      }

      // Add the negative sign back if original number was negative
      if (isNegative) {
        degrees = '-' + degrees
      }

      return `${degrees}:${minutes}:${seconds}`
    }
  }
}
</script>
