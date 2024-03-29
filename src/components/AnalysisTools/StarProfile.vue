<template>
  <div>
    <b-field>
      <p class="control">
        <button
          class="button"
          :class="{ 'is-loading': inspect_region_loading }"
          :disabled="!large_fits_exists && !small_fits_exists"
          @click="get_star_profiles"
        >
          inspect region
        </button>
      </p>
      <p class="control">
        <button
          class="button"
          :class="{ 'is-loading': inspect_image_loading }"
          :disabled="!large_fits_exists && !small_fits_exists"
          @click="get_star_profiles(false)"
        >
          inspect image
        </button>
      </p>
    </b-field>
    <p style="color: gold;">
      Note: this component doesn't work yet
    </p>

    <div style="display: flex; flex-wrap: wrap">
      <div>
        <div id="brightest_star_profile" />
        <table class="info-panel-table">
          <tr>
            <td
              class="info-panel-val"
              align="right"
            >
              Half-Flux Diameter:
            </td>
            <td>{{ brightest_hfd }}</td>
          </tr>
          <tr>
            <td
              class="info-panel-val"
              align="right"
            >
              Gaussian FWHM:
            </td>
            <td>{{ brightest_fwhm }}</td>
          </tr>
        </table>
      </div>
      <div>
        <div id="u_brightest_star_profile" />
        <table class="info-panel-table">
          <tr>
            <td
              class="info-panel-val"
              align="right"
            >
              Half-Flux Diameter:
            </td>
            <td>{{ u_brightest_hfd }}</td>
          </tr>
          <tr>
            <td
              class="info-panel-val"
              align="right"
            >
              Gaussian FWHM:
            </td>
            <td>{{ u_brightest_fwhm }}</td>
          </tr>
        </table>
      </div>
    </div>
    <hr>
    <div id="median_star_profile" />
    <table class="info-panel-table">
      <tr>
        <td
          class="info-panel-val"
          align="right"
        >
          number of stars detected:
        </td>
        <td>{{ num_good_stars }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as d3 from 'd3'
import axios from 'axios'
import helpers from '@/utils/helpers'
export default {
  name: 'StarProfile',
  props: {

  },
  data () {
    return {
      num_good_stars: '--',
      pixscale: 1,

      median_plot_color: '#209cee',
      median_fwhm: '--',
      median_hfd: '--',
      median_profile: [0, 0],

      brightest_plot_color: '#efea5a',
      brightest_fwhm: '--',
      brightest_hfd: '--',
      brightest_profile: [0, 0],

      // Unsaturated brightest object
      u_brightest_plot_color: '#209cee',
      u_brightest_fwhm: '--',
      u_brightest_hfd: '--',
      u_brightest_profile: [0, 0],

      starProfileToolActive: false,
      inspect_region_loading: false,
      inspect_image_loading: false
    }
  },
  mounted () {
    // Draw empty plots for the star profiles
    this.draw_empty_star_profiles()
  },
  watch: {
    current_image () {
      this.draw_empty_star_profiles()
      this.star_profiles_reset()
      this.$store.dispatch('starprofile/reset_star_markers')
    }
  },
  methods: {

    reset_star_markers () {
      this.brightest_relative_pos_x = -1
      this.brightest_relative_pos_y = -1
      this.u_brightest_relative_pos_x = -1
      this.u_brightest_relative_pos_y = -1
    },

    draw_empty_star_profiles () {
      // Draw empty plots for the star profiles
      this.plotStarProfile([0], {}, 1, '#brightest_star_profile',
        { plot_color: '#efea5a' },
        { title: 'Brightest Star Profile', x_axis_label: 'arcseconds' })

      this.plotStarProfile([0], {}, 1, '#u_brightest_star_profile',
        { plot_color: '#209cee' },
        { title: 'Brightest Unsaturated Star Profile', x_axis_label: 'arcseconds' })
    },
    get_star_profiles (useSubregion = true) {
      const url = 'https://41uhbm23rf.execute-api.us-east-1.amazonaws.com/dev/starprofiles'

      // Extract parts of the filename required by the analysis api
      const filename = this.best_available_full_filename.split('.')[0]
      const data_type = filename.slice(filename.length - 4, filename.length - 2)
      const reduction_level = filename.slice(filename.length - 2, filename.length)

      const body = {
        site: this.sitecode,
        base_filename: this.current_image.base_filename,
        data_type,
        reduction_level
      }

      if (useSubregion) {
        if (this.selectedShapeType != 'rects') {
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Region must be a rectangle.'
          })
          return
        }
        this.inspect_region_loading = true
        body.region_x0 = helpers.clamp(this.selectedShape.x1, 0, 1)
        body.region_x1 = helpers.clamp(this.selectedShape.x2, 0, 1)
        body.region_y0 = helpers.clamp(this.selectedShape.y1, 0, 1)
        body.region_y1 = helpers.clamp(this.selectedShape.y2, 0, 1)
      } else { this.inspect_image_loading = true }

      // Request the computed data from our backend
      axios.post(url, body)
        .then(response => { this.display_star_profiles(response) })
        .catch(response => { this.star_profiles_reset(response) })
    },
    star_profiles_reset (response) {
      this.inspect_region_loading = false
      this.inspect_image_loading = false
      this.median_fwhm = '--'
      this.brightest_fwhm = '--'
      this.u_brightest_fwhm = '--'
      this.num_good_stars = '---'
    },
    display_star_profiles (response) {
      this.inspect_region_loading = false
      this.inspect_image_loading = false

      // Handle the case where no stars are found.
      if (response.data.num_good_stars == 0) {
        console.warn('no good stars')
        this.median_fwhm = '--'
        this.brightest_fwhm = '--'
        this.u_brightest_fwhm = '--'
        this.num_good_stars = 0

        // Small popup notification
        // TODO: include a 'tell me more' button with possible reasons for failure.
        this.$buefy.toast.open({
          message: 'No good stars were found in the selected region.',
          type: 'is-warning',
          position: 'is-top',
          actionText: 'Tell me more...',
          duration: 6000,
          onAction: () => {
            this.$beufy.toast.open(
                `<p class="image is-4by3">
                    <img src="https://buefy.org/static/img/placeholder-1280x960.png">
                </p>`
            )
          }
        })

      // Otherwise, do this if good stars were found
      } else {
        const med_star = response.data.median_star
        const region_coords = response.data.region_coords

        // Brightest unsaturated star profile.
        if (response.data.brightest_unsaturated) {
          const u_bright_star = response.data.brightest_unsaturated
          this.u_brightest_fwhm = (u_bright_star.gaussian_fwhm * u_bright_star.pixscale).toFixed(2) + '"'
          this.u_brightest_hfd = (u_bright_star.hfd * u_bright_star.pixscale).toFixed(2) + '"'
          this.u_brightest_relative_pos_x = (u_bright_star.x / u_bright_star.naxis1) + region_coords.x0
          this.u_brightest_relative_pos_y = (u_bright_star.y / u_bright_star.naxis2) + region_coords.y0
          // Plot the brightest unsaturated star profile
          const ub_profile = u_bright_star.radial_profile
          const ub_gauss = {
            mean: u_bright_star.gaussian_mean,
            stddev: u_bright_star.gaussian_stddev,
            amplitude: u_bright_star.gaussian_amplitude
          }
          const ub_pixscale = u_bright_star.pixscale
          const ub_element_id = '#u_brightest_star_profile'
          const ub_formatting = {
            margin_top: 50,
            margin_right: 25,
            margin_bottom: 50,
            margin_left: 45,
            plot_color: '#209cee',
            x_axis_ticks: 8,
            y_axis_ticks: 5
          }
          const ub_labels = {
            title: 'Brightest Unsaturated Star Profile',
            x_axis_label: 'arcseconds'
          }
          this.plotStarProfile(ub_profile, ub_gauss, ub_pixscale, ub_element_id, ub_formatting, ub_labels)
        }

        // Brightest star profile
        if (response.data.brightest_star) {
          const bright_star = response.data.brightest_star
          this.brightest_fwhm = (bright_star.gaussian_fwhm * bright_star.pixscale).toFixed(2) + '"'
          this.brightest_hfd = (bright_star.hfd * bright_star.pixscale).toFixed(2) + '"'
          this.brightest_relative_pos_x = (bright_star.x / bright_star.naxis1) + region_coords.x0
          this.brightest_relative_pos_y = (bright_star.y / bright_star.naxis2) + region_coords.y0
          // Plot the brightest star profile
          const b_profile = bright_star.radial_profile
          const b_gauss = {
            mean: bright_star.gaussian_mean,
            stddev: bright_star.gaussian_stddev,
            amplitude: bright_star.gaussian_amplitude
          }
          const b_pixscale = bright_star.pixscale
          const b_element_id = '#brightest_star_profile'
          const b_formatting = {
            margin_top: 50,
            margin_right: 25,
            margin_bottom: 50,
            margin_left: 45,
            plot_color: '#efea5a',
            x_axis_ticks: 8,
            y_axis_ticks: 5
          }
          const b_labels = {
            title: 'Brightest Star Profile',
            x_axis_label: 'arcseconds'
          }
          this.plotStarProfile(b_profile, b_gauss, b_pixscale, b_element_id, b_formatting, b_labels)
        }

        // Get the fwhm from the gaussian fit
        this.median_fwhm = (med_star.gaussian_fwhm * med_star.pixscale).toFixed(2) + '"'
        this.median_hfd = (med_star.hfd * med_star.pixscale).toFixed(2) + '"'

        // Get the positions of the stars to show in the image display.
        this.median_relative_pos_x = (med_star.x / med_star.naxis1) + region_coords.x0
        this.median_relative_pos_y = (med_star.y / med_star.naxis2) + region_coords.y0
        this.num_good_stars = response.data.num_good_stars

        // Plot the median star profile
        // Unused but keep for reference
        /* eslint-disable */
        let m_profile = med_star.radial_profile
        let m_gauss = {
          mean: med_star.gaussian_mean,
          stddev: med_star.gaussian_stddev,
          amplitude: med_star.gaussian_amplitude,
        }
        let m_pixscale = med_star.pixscale
        let m_element_id = "#median_star_profile"
        let m_formatting = {
          margin_top: 50,
          margin_right: 25,
          margin_bottom: 50,
          margin_left: 45,
          plot_color: "#209cee",
          x_axis_ticks: 8,
          y_axis_ticks: 5,
        }
        let m_labels = {
          title: "Median Star Profile",
          x_axis_label: "arcseconds",
        }
        //this.plotStarProfile(m_profile, m_gauss, m_pixscale, m_element_id, m_formatting, m_labels)
        /* eslint-enable */
      }
    },
    plotStarProfile (profile, gaussian, pixscale = 1, el_id, formatting_opts, label_options) {
      // Parse the input arguments, and define defaults.
      const margin = {
        top: formatting_opts.margin_top || 50,
        right: formatting_opts.margin_right || 25,
        bottom: formatting_opts.margin_bottom || 50,
        left: formatting_opts.margin_left || 45
      }
      const width = formatting_opts.width || 180
      const height = formatting_opts.height || 100
      const x_axis_ticks = formatting_opts.x_axis_ticks || 8
      const y_axis_ticks = formatting_opts.y_axis_ticks || 5
      const plot_color = formatting_opts.plot_color || '#ff0000'

      const title = label_options.title
      const x_axis_label = label_options.x_axis_label

      const n = profile.length // The number of datapoints.
      const x_domain = (n - 1) * pixscale // from above, scaled to use units of arcseconds

      // Calculate gaussian fit from the backend-provided parameters
      const g_mean = gaussian.mean || 0
      const g_stddev = gaussian.stddev || 0
      const g_amplitude = gaussian.amplitude || 0
      const gaussian_dist = x => {
        return g_amplitude * Math.exp(-0.5 * Math.pow((x - g_mean) / g_stddev, 2))
      }
      const gaussian_array = Array(n).fill().map((_, i) => gaussian_dist(i))

      // Remove previous plot data
      d3.select(el_id).select('svg').remove()

      // X scale will use the index of our data, scaled from pix to arcseconds
      const xScale = d3.scaleLinear()
        .domain([0, x_domain]) // input
        .range([0, width]) // output

      // Y scale will use the max in the star profile
      const yScale = d3.scaleLinear()
        .domain([0, Math.max(...profile)]) // input
        .range([height, 0]) // output

      // d3's line generator
      // TODO: replace with the gaussian fit instead of connecting the dots.
      const line = d3.line()
        .x(function (d, i) { return xScale(i * pixscale) }) // covnert to arcseconds
        .y(function (d) { return yScale(d) }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

      // Add the SVG to the page
      const svg = d3.select(el_id).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      // Call the x axis in a group tag
      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale).ticks(x_axis_ticks)) // Create an axis component with d3.axisBottom

      // Call the y axis in a group tag
      svg.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(yScale).ticks(y_axis_ticks)) // Create an axis component with d3.axisLeft

      // Draw the plot title
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', -15)
        .style('text-anchor', 'middle')
        .style('fill', '#fff')
        .text(title)

      // Draw the x-axis label
      svg.append('text')
        .attr('x', width)
        .attr('y', height + 30)
        .style('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', '#fff')
        .text(x_axis_label)

      // Plot the line fit only if the gaussian array is valid, and roughly
      // centered over 0.
      if (gaussian_array[0] && Math.abs(g_mean) < 1) {
        // Append the path, bind the data, and call the line generator
        svg.append('path')
          .datum(gaussian_array) // 10. Binds data to the line
          .style('fill', 'none')
          .style('stroke', plot_color)
          .style('stroke-width', '2px')
          .attr('class', 'line') // Assign a class for styling
          .attr('d', line) // 11. Calls the line generator
      }

      // Appends a circle for each datapoint
      svg.selectAll('.dot')
        .data(profile)
        .enter().append('circle') // Uses the enter().append() method
        .style('stroke', plot_color)
        .attr('class', 'dot') // Assign a class for styling
        .attr('cx', function (d, i) { return xScale(i * pixscale) }) // convert array index (pixels) to arcsec
        .attr('cy', function (d) { return yScale(d) })
        .attr('r', 2)
    }
  },
  computed: {
    ...mapState('images', [
      'recent_images',
      'current_image'
    ]),
    ...mapGetters('images', [
      'small_fits_exists',
      'large_fits_exists',
      'small_fits_filename',
      'large_fits_filename'
    ]),
    best_available_full_filename () {
      return this.large_fits_exists
        ? this.large_fits_filename
        : this.small_fits_filename
    },
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

    brightest_relative_pos_x: {
      get () { return this.$store.state.starprofile.brightest_relative_pos_x },
      set (val) { this.$store.commit('starprofile/brightest_relative_pos_x', val) }
    },
    brightest_relative_pos_y: {
      get () { return this.$store.state.starprofile.brightest_relative_pos_y },
      set (val) { this.$store.commit('starprofile/brightest_relative_pos_y', val) }
    },
    u_brightest_relative_pos_x: {
      get () { return this.$store.state.starprofile.u_brightest_relative_pos_x },
      set (val) { this.$store.commit('starprofile/u_brightest_relative_pos_x', val) }
    },
    u_brightest_relative_pos_y: {
      get () { return this.$store.state.starprofile.u_brightest_relative_pos_y },
      set (val) { this.$store.commit('starprofile/u_brightest_relative_pos_y', val) }
    },
    median_relative_pos_x: {
      get () { return this.$store.state.starprofile.median_relative_pos_x },
      set (val) { this.$store.commit('starprofile/median_relative_pos_x', val) }
    },
    median_relative_pos_y: {
      get () { return this.$store.state.starprofile.median_relative_pos_y },
      set (val) { this.$store.commit('starprofile/median_relative_pos_y', val) }
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
