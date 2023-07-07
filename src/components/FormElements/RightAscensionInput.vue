<template>
  <div>
    <b-field
      :type="hasError ? 'is-danger': 'is-dark'"
      :message="errorMessage"
      :size="size"
    >
      <b-input
        v-model="localRa"
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
        <option value="hours">
          hours
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
      localRa: null,
      units: 'hours',
      hasError: false,
      errorMessage: ''
    }
  },
  watch: {
    value (newVal) {
      if (newVal == null || newVal === '') {
        this.localRa = newVal
      } else {
        this.localRa = this.convertToSelectedUnits(newVal)
      }
    },
    localRa (newVal) {
      if (newVal != null && newVal !== '') {
        this.validateValue(newVal)
      }
    },
    units (newVal) {
      if (this.value == null || this.value === '') return
      this.localRa = this.convertToSelectedUnits(this.value)
    }
  },
  methods: {
    convertToSelectedUnits (value) {
      if (this.units === 'deg') {
        return value * 15
      } else if (this.units === 'sexagesimal') {
        const hours = this.padZeros(Math.floor(value))
        const minutes = this.padZeros(Math.floor((value - hours) * 60))
        const seconds = ((value - hours) * 60 - minutes) * 60
        return `${hours}:${minutes}:${seconds.toFixed(2)}`
      } else {
        return value
      }
    },
    validateValue (value) {
      this.hasError = false
      this.errorMessage = ''
      let decimalHours
      try {
        // Validate decimal degrees
        if (this.units === 'deg') {
          if (isNaN(Number(value))) throw new Error('Decimal degrees must be a valid number')
          if (Number(value) >= 360 || Number(value) < 0) {
            throw new RangeError('Decimal degrees must be between 0 and 360')
          }
          decimalHours = Number(value / 15)
        // Validate sexagesimal hours
        } else if (this.units === 'sexagesimal') {
          // Accept spaces or colon as valid delimiters
          const parts = value.trim().replaceAll(':', ' ').split(' ').map((part, index) => {
            if (isNaN(Number(part))) throw new Error('Sexagesimal requires a format of hours:minutes:seconds')
            if (index == 0 && (Number(part) >= 24 || Number(part) < 0)) {
              throw new Error('Value for sexagesimal hours must be between 0 and 24')
            }
            if (index != 0 && (Number(part) >= 60 || Number(part) < 0)) {
              throw new Error('Sexagesimal minutes and seconds must be numbers between 0 and 60')
            }
            return Number(part)
          })
          if (parts.length !== 3) {
            throw new Error('Sexagesimal requires a format of hours:minutes:seconds')
          }
          decimalHours = parts[0] + parts[1] / 60 + parts[2] / 3600
        // Validate decimal hours
        } else {
          if (isNaN(Number(value))) throw new Error('Value must be a valid number')
          if (Number(value) >= 24 || Number(value) < 0) {
            throw new RangeError('Decimal hours must be between 0 and 24')
          }
          decimalHours = Number(value)
        }
        this.updateValue(decimalHours)
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
      if (num < 10) {
        return '0' + num
      } else {
        return '' + num
      }
    }
  }
}
</script>
