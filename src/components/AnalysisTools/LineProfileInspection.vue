<template>
  <div>
    <b-field>
      <button
        title="first draw a line on the image to inspect"
        class="button"
        :class="{'is-loading': analysisInProgress}"
        :disabled="!current_image.fits_filename"
        @click="getLineProfile"
      >
        get line profile
      </button>
    </b-field>

    <div id="line-inspection-chart">
      <svg :viewbox="`0 0 100 ${height}`">
        <path
          :d="linePath"
          fill="none"
          stroke="steelblue"
          stroke-width="1.5"
        />
        <g id="line-y-axis" />
        <g id="line-x-axis" />
      </svg>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import axios from 'axios'
import * as d3 from 'd3'

export default {
  name: 'LineProfileInspection',
  data () {
    return {
      useLargeFits: false,
      analysisInProgress: false,
      lineProfileResults: [],

      chartMargin: {
        top: 20,
        right: 30,
        bottom: 30,
        left: 40
      },
      width: 100,
      height: 200

    }
  },

  mounted () {
    this.resizeObserver()
  },

  methods: {

    drawYAxis () {
      d3.select('#line-y-axis')
        .attr('transform', `translate(${this.chartMargin.left},0)`)
        .call(d3.axisLeft(this.yScale).ticks(6, d3.format(',.0f')))
    },
    drawXAxis () {
      d3.select('#line-x-axis')
        .attr('transform', `translate(0,${this.height - this.chartMargin.bottom})`)
        .call(d3.axisBottom(this.xScale).ticks(this.width / 80).tickSizeOuter(0))
    },

    // Responsive sizing
    resizeObserver () {
      const updateSize = (w, h) => {
        this.width = w
        this.height = h
        this.drawYAxis()
        this.drawXAxis()
      }
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const cr = entry.contentRect
          updateSize(cr.width, cr.height)
        }
      })
      const imageEl = document.getElementById('line-inspection-chart')
      // Set observers on the element(s)
      ro.observe(imageEl)
    },

    getLineProfile () {
      if (this.selectedShapeType != 'lines') {
        this.$buefy.toast.open({
          type: 'is-warning',
          message: 'Please select a line for this analysis'
        })
        return
      }

      this.analysisInProgress = true
      this.lineProfileResults = []

      const url = this.quickanalysis_endpoint + '/lineprofile'
      const lineSelection = this.subframeFromShape

      // Ensure the line falls inside the image boundaries
      for (const coord in lineSelection) {
        if (lineSelection[coord] < 0 || lineSelection[coord] > 1) {
          this.analysisInProgress = false
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Please select a line within the image boundary'
          })
          return
        }
      }

      // Choose a starting point so that the line goes from left to right.
      const x0IsLeft = lineSelection.x0 < lineSelection.x1
      const startingPoint = {
        x: x0IsLeft ? lineSelection.x0 : lineSelection.x1,
        y: x0IsLeft ? lineSelection.y0 : lineSelection.y1
      }
      const endingPoint = {
        x: x0IsLeft ? lineSelection.x1 : lineSelection.x0,
        y: x0IsLeft ? lineSelection.y1 : lineSelection.y0
      }

      const payload = {
        full_filename: this.current_image.fits_filename,
        s3_directory: this.current_image.fits_path,
        start: startingPoint,
        end: endingPoint
      }

      axios.post(url, payload).then(response => {
        this.analysisInProgress = false
        const profile = response.data.data // this is the data to plot
        this.lineProfileResults = profile
      }).catch(e => {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: 'There was a problem computing the line profile.'
        })
        this.analysisInProgress = false
        console.warn(e)
      })
    }

  },

  computed: {
    ...mapGetters('images', [
      'current_image'
    ]),

    ...mapGetters('drawshapes', [
      'selectedShapeType',
      'subframeFromShape'
    ]),

    ...mapState('api_endpoints', ['quickanalysis_endpoint']),

    xScale () {
      const margin = this.chartMargin
      return (
        d3.scaleLinear()
          .domain([0, this.lineProfileResults.length])
          .range([margin.left, this.width - margin.right])
      )
    },
    yScale () {
      const margin = this.chartMargin
      return (
        d3.scaleSymlog()
          .domain([d3.min(this.lineProfileResults), d3.max(this.lineProfileResults)])
          .range([this.height - margin.bottom, margin.top])
      )
    },

    linePath () {
      this.drawYAxis()
      this.drawXAxis()
      const line = d3
        .line()
        .x((d, i) => this.xScale(i))
        .y((d, i) => this.yScale(d))(this.lineProfileResults)
      return line
    }
  }

}
</script>

<style lang="scss" scoped>
#line-inspection-chart {
  width: 100%;
  height: 250px;
  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
