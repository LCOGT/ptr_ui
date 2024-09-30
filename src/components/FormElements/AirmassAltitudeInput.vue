
<template>
  <div>
    <b-field
      :type="hasError ? 'is-danger' : 'is-dark'"
      :message="errorMessage"
      :size="size"
    >
      <b-input
        v-model="localVal"
        :size="size"
        lazy
        :disabled="disabled"
        style="width: 100%;"
      />
      <b-select
        v-model="units"
        :size="size"
        :disabled="disabled"
      >
        <option value="alt">
          altitude [deg]
        </option>
        <option value="airmass">
          airmass
        </option>
      </b-select>
    </b-field>
  </div>
</template>

<script>
export default {
  props: [
    'value', // altitude (in degrees) fed from the parent component
    'size',
    'disabled'
  ],
  data () {
    return {
      localVal: this.value, // the text input should match the altitude fed in from the parent component
      airmassToAltitudeLookup: {},
      units: 'alt',
      hasError: false,
      errorMessage: ''
    }
  },
  watch: {
    value (newVal) {
      // If the parent component updates the prop that is sent in to this component,
      // update the local value in terms of the selected units
      if (newVal == null || newVal === '') {
        this.localVal = newVal
      } else {
        this.localVal = this.convertToSelectedUnits(newVal)
      }
    },
    localVal (newVal) {
      // When the value in the input field changes, validate it and emit it back to the parent component
      if (newVal != null && newVal !== '') {
        this.validateAndEmit(newVal)
      }
    },
    units (newVal) {
      // When the user switches between altitude and airmass units, recompute the equivalent value to display locally
      if (this.value == null || this.value === '') return
      this.localVal = this.convertToSelectedUnits(this.value)
    }
  },
  methods: {
    roundToPrecision (float, decimals) {
      const decimalMover = 10 ** decimals
      return Math.round(decimalMover * float) / decimalMover
    },
    altitudeToAirmass (alt) {
      // input altitude should be decimal degrees from horizon
      const precision = 2 // how many decimal places to use for result

      const altFromZenith = 90 - alt
      const altRad = altFromZenith * Math.PI / 180
      const airmass = this.roundToPrecision(1 / Math.cos(altRad), precision)
      // Cache results for reverse calculation (avoid floating point equality errors)
      this.airmassToAltitudeLookup[airmass] = alt
      return airmass
    },
    airmassToAltitude (airmass) {
      // return altitude in decimal degrees from horizon
      const precision = 1 // how many decimal places to use for result

      // Try to use a cached result first
      if (airmass in this.airmassToAltitudeLookup) {
        console.log('returning altitude from lookup: ', this.airmassToAltitudeLookup[airmass])
        return this.airmassToAltitudeLookup[airmass]
      }

      // otherwise, do the computation
      const altFromZenithRad = Math.acos(1 / airmass)
      const altFromZenithDeg = altFromZenithRad * 180 / Math.PI
      const altFromHorizonDeg = this.roundToPrecision(90 - altFromZenithDeg, precision)
      return altFromHorizonDeg
    },
    convertToSelectedUnits (val) {
      if (this.units == 'airmass') {
        return this.altitudeToAirmass(val)
      } else {
        return val
      }
    },
    validateAndEmit (value) {
      this.hasError = false
      this.errorMessage = ''
      try {
        // Validate altitude input
        if (this.units === 'alt') {
          if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 90) {
            throw new RangeError('Must be between 0 and 90 degrees')
          }
          this.$emit('input', Number(value))
        // Validate airmass input
        } else if (this.units === 'airmass') {
          console.log('airmass: ', value)
          if (isNaN(Number(value)) || Number(value) < 0) {
            throw new RangeError('Must be a positive number')
          }
          // Since the component "speaks" only in altitude (degrees), convert the airmass before emitting
          this.$emit('input', this.airmassToAltitude(value))
        }
      } catch (e) {
        this.hasError = true
        this.errorMessage = e.message
      }
    }
  }
}
</script>
