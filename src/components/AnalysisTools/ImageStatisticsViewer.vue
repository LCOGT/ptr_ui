<template>
  <div>
    <b-field>
      <p class="control">
        <button
          title="Only inspect the selected rectangle region."
          class="button"
          :class="{'is-loading':region_stats_loading}"
          :disabled="!this.current_image.fits_filename"
          @click="getRegionStats(true)"
        >
          inspect region
        </button>
      </p>
      <p class="control">
        <button
          class="button"
          :class="{'is-loading':image_stats_loading}"
          :disabled="!this.current_image.fits_filename"
          @click="getRegionStats(false)"
        >
          inspect image
        </button>
      </p>
    </b-field>

    <table class="info-panel-table">
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          min:
        </td>
        <td>{{ region_min }}</td>
      </tr>
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          max:
        </td>
        <td>{{ region_max }}</td>
      </tr>
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          median:
        </td>
        <td>{{ region_median }}</td>
      </tr>
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          mean:
        </td>
        <td>{{ region_mean }}</td>
      </tr>
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          std:
        </td>
        <td>{{ region_std }}</td>
      </tr>
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          mode:
        </td>
        <td>{{ region_mode }}</td>
      </tr>
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          MAD:
        </td>
        <td>{{ region_MAD }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
export default {
  data () {
    return {
      region_stats_loading: false,
      image_stats_loading: false,
      region_min: '--',
      region_max: '--',
      region_median: '--',
      region_mean: '--',
      region_std: '--',
      region_mode: '--',
      region_MAD: '--'
    }
  },
  watch: {
    current_image () {
      this.resetRegionStats()
    }
  },
  methods: {

    getRegionStats (useSubregion = true) {
      const url = this.$store.state.api_endpoints.quickanalysis_endpoint + '/statistics'

      const body = {
        site: this.sitecode,
        full_filename: this.current_image.fits_filename,
        s3_directory: this.current_image.fits_path
      }
      if (useSubregion) {
        if (this.selectedShapeType != 'rects') {
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Region must be a rectangle.'
          })
          return
        }
        this.region_stats_loading = true
        body.subregion = {
          shape: 'rect',
          x0: helpers.clamp(this.selectedShape.x1, 0, 1),
          y0: helpers.clamp(this.selectedShape.y1, 0, 1),
          x1: helpers.clamp(this.selectedShape.x2, 0, 1),
          y1: helpers.clamp(this.selectedShape.y2, 0, 1)
        }
      } else { this.image_stats_loading = true }

      axios.post(url, body)
        .then(response => { this.displayRegionStats(response) })
        .catch(response => { this.resetRegionStats() })
    },
    resetRegionStats () {
      this.image_stats_loading = false
      this.region_stats_loading = false

      this.region_min = '--'
      this.region_max = '--'
      this.region_median = '--'
      this.region_mean = '--'
      this.region_std = '--'
      this.region_mode = '--'
      this.region_MAD = '--'
    },
    displayRegionStats (http_response) {
      this.image_stats_loading = false
      this.region_stats_loading = false

      const data = http_response.data.stats
      this.region_min = parseFloat(data.min)
      this.region_max = parseFloat(data.max)
      this.region_median = parseFloat(data.median)
      this.region_mean = parseFloat(data.mean).toFixed(3)
      this.region_std = parseFloat(data.std).toFixed(3)
      this.region_mode = parseFloat(data.mode)
      this.region_MAD = parseFloat(data.median_abs_deviation)
    }
  },
  computed: {

    ...mapState('images', [
      'recent_images',
      'current_image'
    ]),

    ...mapGetters('drawshapes', [
      'selectedId',
      'selectionExists',
      'selectedShapeType'
    ]),

    markedStars () {
      return this.$store.getters['starprofile/marked_stars']
    },

    activeDrawShape: {
      get () { return this.$store.getters['drawshapes/activeDrawShape'] },
      set (val) { this.$store.dispatch('drawshapes/activeDrawShape', val) }
    },

    selectedShape: {
      get () { return this.$store.getters['drawshapes/selectedShape'] },
      set (val) { this.$store.dispatch('drawshapes/selectedShape', val) }
    },

    subframe_x0: {
      get () { return this.$store.getters['command_params/subframe_x0'] },
      set (val) { this.$store.commit('command_params/subframe_x0', val) }
    },

    subframe_y0: {
      get () { return this.$store.getters['command_params/subframe_y0'] },
      set (val) { this.$store.commit('command_params/subframe_y0', val) }
    },

    subframe_x1: {
      get () { return this.$store.getters['command_params/subframe_x1'] },
      set (val) { this.$store.commit('command_params/subframe_x1', val) }
    },

    subframe_y1: {
      get () { return this.$store.getters['command_params/subframe_y1'] },
      set (val) { this.$store.commit('command_params/subframe_y1', val) }
    }
  }

}
</script>

<style lang="scss" scoped>

table.info-panel-table { color: #dbdee0; }
.blank-row { height: 1.5em; }
.info-panel-val {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}
</style>
