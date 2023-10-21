<template>
  <div>
    <b-field>
      <p class="control">
        <button
          title="Get histogram from the selected rectangle region."
          class="button"
          :class="{ 'is-loading': region_histogram_loading }"
          :disabled="!this.current_image.fits_filename"
          @click="getHistogram(true)"
        >
          inspect region
        </button>
      </p>
      <p class="control">
        <button
          class="button"
          :class="{ 'is-loading': image_histogram_loading }"
          :disabled="!this.current_image.fits_filename"
          @click="getHistogram(false)"
        >
          inspect image
        </button>
      </p>
    </b-field>
    <p class="is-size-7 pl-1 mb-3">
      Double click to reset the zoom
    </p>
    <HistogramViewer
      :counts="hist_counts"
      :edges="hist_edges"
    />
  </div>
</template>

<script>
import axios from 'axios'
import { mapState, mapGetters } from 'vuex'
import HistogramViewer from '@/components/AnalysisTools/HistogramViewer'
import helpers from '@/utils/helpers'
export default {
  components: {
    HistogramViewer
  },
  data () {
    return {
      hist_counts: [0],
      hist_edges: [0, 1],

      region_histogram_loading: false,
      image_histogram_loading: false
    }
  },
  watch: {
    current_image () {
      this.resetHistogram()
    }
  },
  methods: {

    getHistogram (useSubregion = true) {
      const url = this.$store.state.api_endpoints.quickanalysis_endpoint + '/histogram-clipped'
      const body = {
        full_filename: this.current_image.fits_filename,
        s3_directory: this.current_image.fits_path,
        clip_percent: 0.001
      }
      if (useSubregion) {
        if (this.selectedShapeType != 'rects') {
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Region must be a rectangle.'
          })
          return
        }
        this.region_histogram_loading = true
        body.subregion = {
          shape: 'rect',
          x0: helpers.clamp(this.selectedShape.x1, 0, 1),
          y0: helpers.clamp(this.selectedShape.y1, 0, 1),
          x1: helpers.clamp(this.selectedShape.x2, 0, 1),
          y1: helpers.clamp(this.selectedShape.y2, 0, 1)
        }
      } else { this.image_histogram_loading = true }

      axios.post(url, body)
        .then(response => {
          this.image_histogram_loading = false
          this.region_histogram_loading = false
          this.hist_counts = response.data.histogram.counts
          this.hist_edges = response.data.histogram.edges
        }).catch(err => {
          console.warn('Error getting histogram: ', err)
          this.image_histogram_loading = false
          this.region_histogram_loading = false
          this.hist_counts = [0, 0]
          this.hist_edges = [0, 0.5, 1]
        })
    },

    resetHistogram () {
      this.hist_counts = [0]
      this.hist_edges = [0, 1]
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
    activeDrawShape: {
      get () { return this.$store.getters['drawshapes/activeDrawShape'] },
      set (val) { this.$store.dispatch('drawshapes/activeDrawShape', val) }
    },

    selectedShape: {
      get () { return this.$store.getters['drawshapes/selectedShape'] },
      set (val) { this.$store.dispatch('drawshapes/selectedShape', val) }
    },

    crosshairsVisible: {
      get () { return this.$store.getters['drawshapes/crosshairsVisible'] },
      set (val) { this.$store.dispatch('drawshapes/crosshairsVisible') }
    }
  }

}
</script>
