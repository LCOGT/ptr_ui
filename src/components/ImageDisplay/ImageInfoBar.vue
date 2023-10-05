<template>
  <div>
    <div class="image-info-bar-item site">
      site:&nbsp;{{ site }}
    </div>
    <div class="image-info-bar-item exptime">
      exposure:&nbsp;{{ exposure }}s
    </div>
    <div class="image-info-bar-item filter-used">
      filter:&nbsp;{{ filter }}
    </div>
    <div class="image-info-bar-item smartstack">
      stack:&nbsp;{{ smartstackProgress }}
    </div>
    <div class="image-info-bar-item ra">
      ra:&nbsp;
      <RaDisplay
        :ra_hours_decimal="raHours"
        :decimal_precision="3"
      />
    </div>
    <div class="image-info-bar-item dec">
      dec:&nbsp;
      <DecDisplay
        :dec_deg_decimal="current_image.declination"
        :decimal_precision="3"
      />
    </div>
    <div class="image-info-bar-item airmass">
      airmass:&nbsp;{{ airmass }}
    </div>
    <div class="image-info-bar-item altitude">
      altitude:&nbsp;{{ altitude }}°
    </div>
    <div class="image-info-bar-item obstime">
      {{ obstime }}
    </div>
    <div class="image-info-bar-item fwhm">
      fwhm: {{ fwhm }}"
    </div>
    <div class="image-info-bar-item sepsky">
      sky: {{ sepsky }} adu
    </div>
    <div class="image-info-bar-item filename">
      {{ filename }}
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import RaDisplay from '@/components/display/RaDisplay'
import DecDisplay from '@/components/display/DecDisplay'
export default {
  name: 'ImageInfoBar',
  components: {
    RaDisplay,
    DecDisplay
  },
  props: {
    current_image: {
      type: Object,
      required: true
    }
  },

  methods: {
    dateToReadable (date) {
      return moment.utc(date).format('YYYY-MM-DD HH:mm UTC')
    },
    dateToUnix (date) {
      return (new Date(date).getTime() / 1000).toFixed(0)
    },
    truncateDecimalString (decimalString, n) {
      const number = parseFloat(decimalString)
      const factor = Math.pow(10, n)
      const truncatedNumber = Math.floor(number * factor) / factor
      return truncatedNumber.toString()
    }
  },

  computed: {
    site () {
      return this.current_image.site
    },
    exposure () {
      // Account for the cumulative exposure time represented in a smartstack by multiplying the
      // single frame exposure time by the number of frames being represented.
      //
      // If the image is not part of a smartstack, it is treated like a smartstack with size 1, so the math still works.
      const frameExposureTime = Number(this.current_image.exposure_time)
      const framesInSmartstack = this.smartstackNumber
      const cumulativeExposure = (framesInSmartstack + 1) * frameExposureTime
      return cumulativeExposure
    },
    filter () {
      return this.current_image.filter_used
    },
    airmass () {
      return this.current_image.airmass
    },
    altitude () {
      return this.truncateDecimalString(this.current_image.altitude, 4)
    },
    obstime () {
      return this.dateToReadable(this.current_image.capture_date)
    },
    filename () {
      return this.current_image.base_filename
    },
    fwhm () {
      if (this.current_image.header && 'FWHMASEC' in this.current_image.header) {
        return Number(this.current_image.header.FWHMASEC).toFixed(2)
      } else {
        return 'n/a'
      }
    },
    sepsky () {
      if (this.current_image.header && 'SEPSKY' in this.current_image.header) {
        return parseInt(this.current_image.header.SEPSKY)
      } else {
        return 'n/a'
      }
    },
    // Total number of images for this smartstack
    smartstackLength () {
      if (this.current_image.header && 'SSTKLEN' in this.current_image.header) {
        return parseInt(this.current_image.header.SSTKLEN)
      } else {
        return 1
      }
    },
    // Value of n for "this image is the nth smartstack image", 0-indexed
    smartstackNumber () {
      if (this.current_image.header && 'SSTKNUM' in this.current_image.header) {
        return parseInt(this.current_image.header.SSTKNUM)
      } else {
        return 0
      }
    },
    smartstackProgress () {
      if (this.smartstackLength == 1) {
        return 'n/a'
      }
      return `${this.smartstackNumber + 1} of ${this.smartstackLength}`
    },
    raHours () {
      // current_image.right_ascension used hours until march 8, 2023, 9:20 UTC.
      // this block checks for images taken before then, and doesn't do a decimal -> hours conversion.
      // If we ever stop using images this old, this block can be removed.
      const unixCaptureDate = this.dateToUnix(this.current_image.capture_date)
      const whenWeSwitchedHoursToDegrees = 1678267200 // unix
      if (unixCaptureDate < whenWeSwitchedHoursToDegrees) {
        return this.current_image.right_ascension
      }

      // default is degrees, so convert to hours
      return this.current_image.right_ascension / 15
    }
  }

}
</script>

<style scoped lang="scss">

.image-info-bar {
  width: 100%;
  color: #aaa;
  background-color: #1e2223;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr 1fr;
  grid-template-columns:  1fr 1.5fr 1fr 1fr;
  grid-template-areas: 'site exptime ra dec'
                       'filter-used obstime airmass altitude'
                       'smartstack fwhm sepsky .'
                       'filename filename filename filename';
  grid-column-gap: 10px;
  padding: 1px 3px;
  font-size: 9pt;

  .image-info-bar-item {
    text-align: left;
  }
  .site { grid-area: site; }
  .filter-used { grid-area: filter-used; }
  .smartstack { grid-area: smartstack; }
  .exptime { grid-area: exptime; }
  .ra { grid-area: ra; display: flex; }
  .dec { grid-area: dec; display: flex }
  .airmass { grid-area: airmass; }
  .altitude { grid-area: altitude; }
  .obstime { grid-area: obstime; }
  .filename { grid-area: filename; color: white;}
  .fwhm {grid-area: fwhm;}
  .sepsky {grid-area: sepsky;}
}

</style>
