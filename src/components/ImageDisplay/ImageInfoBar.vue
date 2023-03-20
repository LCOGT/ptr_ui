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
    <div />
    <div
      class="image-info-bar-item ra"
      style="display:flex"
    >
      ra:&nbsp;<ra-display
        :ra_hours_decimal="ra_hours"
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
      altitude:&nbsp;{{ current_image.altitude }}°
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
import axios from 'axios'
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
      sepsky: ''
    }
  },

  filters: {
    dateToUnix (date) {
      return (new Date(date).getTime() / 1000).toFixed(0)
    },
    dateToReadable (date) {
      return moment.utc(date).format('YYYY-MM-DD HH:mm UTC')
    }
  },

  watch: {
    current_image () {
      // Get header for extra infobar values
      const url = this.$store.state.api_endpoints.active_api + `/fitsheader/${this.current_image.base_filename}/`
      axios.get(url).then(response => {
        // Round appropriately
        this.fwhm = Number(response.data.FWHMASEC).toFixed(2)
        this.sepsky = parseInt(response.data.SEPSKY)
      })
    }
  },

  computed: {
    ra_hours () {
      // default is degrees, but we need hours
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
                       '. filename filename fwhm sepsky';
  grid-column-gap: 10px;
  padding: 1px 3px;
  font-size: 9pt;

  .image-info-bar-item {
    text-align: left;
  }
  .site { grid-area: site; }
  .filter-used { grid-area: filter-used; }
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
