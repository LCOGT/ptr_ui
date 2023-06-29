<template>
  <div>
    <div class="image-info-bar-item site">
      site:&nbsp;{{ current_image.site }}
    </div>
    <div class="image-info-bar-item exptime">
      exptime:&nbsp;{{ current_image.exposure_time }}s
    </div>
    <div class="image-info-bar-item filter-used">
      filter:&nbsp;{{ current_image.filter_used }}
    </div>
    <div class="image-info-bar-item smartstack">
      stack:&nbsp;{{  smartstackProgress }}
    </div>
    <div
      class="image-info-bar-item ra"
      style="display:flex"
    >
      ra:&nbsp;<ra-display
        :ra_hours_decimal="raHours"
        :decimal_precision="3"
      />
    </div>
    <div
      class="image-info-bar-item dec"
      style="display:flex"
    >
      dec:&nbsp;<dec-display
        :dec_deg_decimal="current_image.declination"
        :decimal_precision="3"
      />
    </div>
    <div class="image-info-bar-item airmass">
      airmass:&nbsp;{{ current_image.airmass }}
    </div>
    <div class="image-info-bar-item altitude">
      altitude:&nbsp;{{ truncateDecimalString(current_image.altitude, 4) }}°
    </div>
    <div class="image-info-bar-item obstime">
      {{ current_image.capture_date | dateToReadable }}
    </div>
    <div class="image-info-bar-item filename">
      {{ current_image.base_filename }}
    </div>
    <div class="image-info-bar-item fwhm">
      fwhm: {{ fwhm }}"
    </div>
    <div class="image-info-bar-item sepsky">
      sky: {{ sepsky }} adu
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
  data () {
    return {
      fwhm: '',
      sepsky: '',
      smartstackLength: 1, // Total number of images for this smartstack
      smartstackNumber: 0 // Value of n for "this image is the nth smartstack image", 0-indexed
    }
  },

  filters: {
    dateToReadable (date) {
      return moment.utc(date).format('YYYY-MM-DD HH:mm UTC')
    }
  },

  watch: {
    current_image () {
      // Get header for extra infobar values
      this.$store.dispatch('images/loadCurrentImageFitsHeader').then(header => {
        // Round appropriately
        if ('FWHMASEC' in header) {
          this.fwhm = Number(header.FWHMASEC).toFixed(2)
        } else {
          this.fwhm = 'n/a'
        }
        if ('SEPSKY' in header) {
          this.sepsky = parseInt(header.SEPSKY)
        } else {
          this.sepsky = 'n/a'
        }
        if ('SSTKLEN' in header) {
          this.smartstackLength = parseInt(header.SSTKLEN)
        } else {
          this.smartstackLength = 1
        }
        if ('SSTKNUM' in header) {
          this.smartstackNumber = parseInt(header.SSTKNUM)
        } else {
          this.smartstackNumber = 0
        }
      })
    }
  },

  methods: {
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
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns:  1fr 2fr 0.5fr 1fr 1fr;
  grid-template-areas: 'site exptime . ra dec'
                       'filter-used obstime . airmass altitude'
                       'smartstack filename filename fwhm sepsky';
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
  .ra { grid-area: ra; }
  .dec { grid-area: dec; }
  .airmass { grid-area: airmass; }
  .altitude { grid-area: altitude; }
  .obstime { grid-area: obstime; }
  .filename { grid-area: filename; color: white;}
  .fwhm {grid-area: fwhm;}
  .sepsky {grid-area: sepsky;}
}

</style>
