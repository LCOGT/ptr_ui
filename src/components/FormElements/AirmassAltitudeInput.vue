
<template>
  <div>
    <b-field
      :type="hasError ? 'is-danger' : 'is-dark'"
      :message="errorMessage"
      :size="size"
    >
      <b-input
        v-model="localInputVal"
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
      localInputVal: this.value, // the text input should match the altitude fed in from the parent component
      airmassToAltitudeLookup: {},
      units: 'airmass',
      hasError: false,
      errorMessage: ''
    }
  },
  mounted () {
    // initialize displayed value with the correct units
    this.localInputVal = this.convertToSelectedUnits(this.value)
  },
  watch: {
    value (newVal) {
      // If the parent component updates the prop that is sent in to this component,
      // update the local value in terms of the selected units
      if (newVal == null || newVal === '') {
        this.localInputVal = newVal
      } else {
        this.localInputVal = this.convertToSelectedUnits(newVal)
      }
    },
    localInputVal (newVal) {
      // When the value in the input field changes, validate it and emit it back to the parent component
      if (newVal != null && newVal !== '') {
        this.validateAndEmit(newVal)
      }
    },
    units (newVal) {
      // When the user switches between altitude and airmass units, recompute the equivalent value to display locally
      if (this.value == null || this.value === '') return
      this.localInputVal = this.convertToSelectedUnits(this.value)
    }
  },
  methods: {
    roundToPrecision (float, decimals) {
      const decimalMover = 10 ** decimals
      return Math.round(decimalMover * float) / decimalMover
    },
    altitudeToAirmass (alt) {
      // Use the equation airmass = 1 / cos(zenithAngle), where zenith angle is 90 - altitude.
      // note that this is not very precise at extremes.

      // input altitude should be decimal degrees
      const precision = 3 // how many decimal places to use for result

      const zenithAngle = 90 - alt
      const altRad = zenithAngle * Math.PI / 180
      const airmass = this.roundToPrecision(1 / Math.cos(altRad), precision)
      // Cache results for reverse calculation (avoid floating point equality errors)
      this.airmassToAltitudeLookup[airmass] = alt
      return airmass
    },
    airmassToAltitude (airmass) {
      // Use the equation zenithAngle = arccos(1 / airmass), where zenith angle is 90 - altitude.
      // note that this is not very precise at extremes.

      // Try to use a cached result first
      if (airmass in this.airmassToAltitudeLookup) {
        return this.airmassToAltitudeLookup[airmass]
      }

      // otherwise, do the computation
      const zenithAngleRad = Math.acos(1 / airmass)
      const zenithAngleDeg = zenithAngleRad * 180 / Math.PI
      const altitudeDeg = 90 - zenithAngleDeg
      return altitudeDeg
    },
    convertToSelectedUnits (val) {
      if (this.units == 'airmass') {
        return this.altitudeToAirmass(val)
      } else {
        return val
      }
    },
    validateAndEmit (val) {
      this.hasError = false
      this.errorMessage = ''
      try {
        // Validate altitude input
        if (this.units === 'alt') {
          if (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 90) {
            throw new RangeError('Must be between 0 and 90 degrees')
          }
          this.$emit('input', Number(val))
        // Validate airmass input
        } else if (this.units === 'airmass') {
          if (isNaN(Number(val)) || Number(val) < 1) {
            throw new RangeError('Airmass is a positive number >= 1')
          }
          // Since the component "speaks" only in altitude (degrees), convert the airmass before emitting
          this.$emit('input', this.airmassToAltitude(val))
        }
      } catch (e) {
        this.hasError = true
        this.errorMessage = e.message
      }
    }
  }
}
</script>
