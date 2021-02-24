<template>
  <section>

  <div class="columns is-touch">

    <div class="img-view column" style="padding: 0; margin: 1em;">
      <!-- The actual image view component -->
      <image-view 
        :site="sitecode" 
        :markedStars="markedStars" />

      <hr>
      <b-collapse class="card" position="is-top" :open="false" style="padding:0">
        <div
          slot="trigger" 
          slot-scope="props"
          class="card-header"
          >
          <p class="card-header-title">
              Table of images
          </p>
          <a class="card-header-icon">
              <b-icon
                  :icon="props.open ? 'menu-down' : 'menu-up'">
              </b-icon>
          </a>
        </div>
        <div class="card-content" style="padding:0">
          <images-table/>
        </div>
      </b-collapse>

    </div>

    <!-- Collapsible panels on the right of the image --> 
    <div class="nav-panel column" style="max-width: 300px;">  


      <!-- Toggle display of all site images or just the user's images. -->
      <b-field>
        <b-radio-button expanded 
          v-model="show_user_data_only"
          :native-value="true"
          :disabled="!$auth.isAuthenticated"
          >
          <span>My Data</span>
        </b-radio-button>

        <b-radio-button expanded 
          v-model="show_user_data_only"
          :native-value="false">
          <span>All Data</span>
        </b-radio-button>
      </b-field>

      <!-- star inspector -->
      <side-info-panel :startOpen="false">
        <p slot="title">star inspector</p>

        <b-switch 
          class="is-small" 
          type="is-info" 
          style="margin-bottom: 1em;"
          :disabled="!large_fits_exists || !small_fits_exists" 
          v-model="starInspectorLargeFile">
          Use full resolution file (slower!)
        </b-switch>

        <p class="warning-text" v-if="!small_fits_exists">{{"missing small fits"}}</p>
        <p class="warning-text" v-if="!large_fits_exists">{{"missing full fits"}}</p>

        <b-field>
          <p class="control">
            <button 
              class="button" 
              :class="{'is-loading': inspect_region_loading}"
              :disabled="!large_fits_exists && !small_fits_exists" 
              @click="getStarProfiles">
              inspect region
            </button>
          </p>
          <p class="control">
            <button 
              class="button" 
              :class="{'is-loading': inspect_image_loading}"
              :disabled="!large_fits_exists && !small_fits_exists" 
              @click="getStarProfiles(false)">
              inspect image
            </button>
          </p>
        </b-field>

        <hr>
        <div id="brightest_star_profile" />
        <table class="info-panel-table">
            <tr> <td class="info-panel-val" align="right">Half-Flux Diameter: </td>
                <td>{{brightest_hfd}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">Gaussian FWHM: </td>
                <td>{{brightest_fwhm}}</td> </tr>
        </table>
        <hr>
        <div id="u_brightest_star_profile" />
        <table class="info-panel-table">
            <tr> <td class="info-panel-val" align="right">Half-Flux Diameter: </td>
                <td>{{u_brightest_hfd}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">Gaussian FWHM: </td>
                <td>{{u_brightest_fwhm}}</td> </tr>
        </table>
        <hr>
        <div id="median_star_profile" />
        <table class="info-panel-table">
            <tr> <td class="info-panel-val" align="right">number of stars detected: </td>
                <td>{{num_good_stars}}</td> </tr>
        </table>
      </side-info-panel>

      <!-- image statistics -->
      <side-info-panel :startOpen="false">
        <p slot="title">region statistics</p>

        <b-switch 
          class="is-small" 
          type="is-info" 
          style="margin-bottom: 1em;"
          :disabled="!large_fits_exists || !small_fits_exists" 
          v-model="imageStatsLargeFile">
          Use full resolution file (slower!)
        </b-switch>

        <p class="warning-text" v-if="!current_image.fits_10_exists">{{"missing small fits"}}</p>
        <p class="warning-text" v-if="!current_image.fits_01_exists">{{"missing full fits"}}</p>

        <b-field>
          <p class="control">
            <button 
              title="Only inspect the selected rectangle region." 
              class="button" 
              :class="{'is-loading':region_stats_loading}"
              :disabled="!large_fits_exists && !small_fits_exists" 
              @click="getRegionStats(true)">
              inspect region
            </button>
          </p>
          <p class="control">
            <button 
              class="button" 
              :class="{'is-loading':image_stats_loading}"
              :disabled="!large_fits_exists && !small_fits_exists" 
              @click="getRegionStats(false)">
              inspect image
            </button>
          </p>
        </b-field>

        <table class="info-panel-table">
            <tr> <td class="info-panel-val" align="right">min: </td>
                <td>{{region_min}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">max: </td>
                <td>{{region_max}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">median: </td>
                <td>{{region_median}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">mean: </td>
                <td>{{region_mean}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">std: </td>
                <td>{{region_std}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">mode: </td>
                <td>{{region_mode}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">MAD: </td>
                <td>{{region_MAD}}</td> </tr>
        </table>
      </side-info-panel>

      <!-- Histogram panel -->
      <side-info-panel :startOpen="false">
        <p slot="title">histogram</p>

        <b-field>
          <p class="control">
            <button 
              title="Get histogram from the selected rectangle region." 
              class="button" 
              :class="{'is-loading':region_histogram_loading}"
              :disabled="!large_fits_exists && !small_fits_exists" 
              @click="getHistogram(true)">
              from region
            </button>
          </p>
          <p class="control">
            <button 
              class="button" 
              :class="{'is-loading':image_histogram_loading}"
              :disabled="!large_fits_exists && !small_fits_exists" 
              @click="getHistogram(false)">
              from image
            </button>
          </p>
        </b-field>
        <p class="is-size-7 pl-1 mb-3">Double click to reset the zoom</p>
        <histogram-viewer :counts="hist_counts" :edges="hist_edges"/>

      </side-info-panel>

      <line-profile-inspection />

      <!-- Basic image info and a button to reveal the full fits header -->
      <side-info-panel :startOpen="false">

        <p class="level" slot="title">
          Image Info 
        </p>
          <b-button class="button " outlined style="margin-left: 1em;" @click="showFitsHeader">show fits header</b-button>

        <div style="margin: 1em;">
          <table class="info-panel-table">
              <tr> <td class="info-panel-val" align="right">filename: </td>
                  <td>{{current_image.base_filename || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">date: </td>
                  <td>{{captureDate || "---" }}</td></tr>
              <tr> <td class="info-panel-val" align="right">time: </td>
                  <td>{{captureTime + " GMT"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">site: </td>
                  <td>{{current_image.site || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">exposure: </td>
                  <td>{{current_image.exposure_time || "---"}} s</td> </tr>
              <tr> <td class="info-panel-val" align="right">filter: </td>
                  <td>{{current_image.filter_used || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">RA: </td>
                  <td><ra-display  :ra_hours_decimal="current_image.right_ascension" :can_copy="true" /> </td> </tr>
              <tr> <td class="info-panel-val" align="right">Dec: </td>
                  <td><dec-display  :dec_deg_decimal="current_image.declination" :can_copy="true" /> </td> </tr>

              <tr> <td class="info-panel-val" align="right">azimuth: </td>
                  <td>{{current_image.azimuth || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">altitude: </td>
                  <td>{{current_image.altitude || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">airmass: </td>
                  <td>{{current_image.airmass || "---"}}</td> </tr>
          </table>
          <div style="height: 2em;"/>
          <b-field label="downloads:" style="width: 100%">
            <p class="control">
              <a class="button has-text-white" 
                :disabled="!small_fits_exists"
                @click="download_fits_file(current_image.base_filename, current_image.data_type, '10')">
                <b-icon icon="download" size="is-small" />
                <span>small fits</span>
              </a>
            </p>
            <p class="control">
              <a class="button has-text-white" 
                :disabled="!large_fits_exists"
                @click="download_fits_file(current_image.base_filename, current_image.data_type, '01')">
                <b-icon icon="download" size="is-small" />
                <span>large fits</span>
              </a>
            </p>
          </b-field>
        </div>
      </side-info-panel>


      <image-filter :sitecode="sitecode"/>
    </div>

  </div>

  <!-- Modal popup window showing the full fits header. -->
  <b-modal :active.sync="showFitsHeaderModal" >
    <div class="card" style="min-height: 100vh;">
      <div class="card-content">
        <div class="level">
          <div class=" level-left"> 
            <figure class="level-item image is-64x64">
              <img :src="current_image.jpg_url">
            </figure>
            <p class="title" style="overflow-wrap: anywhere; margin-left: 10px;">{{current_image.base_filename}}</p>
          </div>
          <div class="level-right">
            <b-field>
              <p class="control">
                <button class="button" @click="$store.dispatch('images/set_next_image')">prev</button>
              </p>
              <p class="control">
                <button class="button" @click="$store.dispatch('images/set_previous_image')">next</button>
              </p>
            </b-field>
          </div>
          </div>

        <b-table
            :mobile-cards="false" 
            :narrowed="true"
            :data="fitsHeaderTable"
            :columns="columns"
            style="width: auto; flex:0"
            :loading="headerIsLoading"
            >
        </b-table>

      
      </div>
    </div>
  </b-modal>

  <div style="height: 400px;"></div>


</section>
</template>


<script>

import ImageView from '@/components/ImageView'
import ImagesTable from '@/components/ImagesTable'
import Js9Devtools from "@/components/Js9Devtools";
import ImageNavigationPanel from "@/components/ImageNavigationPanel";
import ImageFilter from "@/components/ImageFilter";
import ImageInfoPanel from "@/components/ImageInfoPanel";
import SideInfoPanel from "@/components/SideInfoPanel";
import LineProfileInspection from "@/components/LineProfileInspection";
import RaDisplay from "@/components/display/RaDisplay"
import DecDisplay from "@/components/display/DecDisplay"
import HistogramViewer from "@/components/HistogramViewer"
import moment from 'moment'
import { mapGetters, mapState } from "vuex";
import axios from 'axios'
import * as d3 from 'd3'
import helpers from "@/utils/helpers"

export default {
  name: "SubpageData",
  props: ["deviceStatus", "sitecode"],
  components: {
      ImageView,
      ImagesTable,
      ImageInfoPanel,
      ImageNavigationPanel,
      ImageFilter,
      Js9Devtools,
      SideInfoPanel,
      LineProfileInspection,
      RaDisplay,
      DecDisplay,
      HistogramViewer,
  },
  data() {
    return {
      accordionIsOpen: 1,

      fitsHeader: {},
      showFitsHeaderModal: false,
      headerIsLoading: false,
      columns: [
        {
            field: 'key',
            label: 'key',
            width: '100',
            searchable: true,
        },
        {
            field: 'val',
            label: 'value',
            searchable: true,
        },
      ],

      region_stats_loading: false,
      image_stats_loading: false,


      // Analysize the full sized raw file (default is 768px reduced file)
      imageStatsLargeFile: false,
      starInspectorLargeFile: false,
      analysisWithLargeFile: false,

      region_min: '--',
      region_max: '--',
      region_median: '--',
      region_mean: '--',
      region_mode: '--',
      region_std: '--',
      region_MAD: '--',

      num_good_stars: '--',
      pixscale: 1,

      median_plot_color: '#209cee',
      median_fwhm: '--',
      median_hfd: '--',
      median_profile: [0,0],
      median_relative_pos_x: -1,
      median_relative_pos_y: -1,

      brightest_plot_color: '#efea5a',
      brightest_fwhm: '--',
      brightest_hfd: '--',
      brightest_profile: [0,0],
      brightest_relative_pos_x: -1,
      brightest_relative_pos_y: -1,

      // Unsaturated brightest object
      u_brightest_plot_color: '#209cee',
      u_brightest_fwhm: '--',
      u_brightest_hfd: '--',
      u_brightest_profile: [0,0],
      u_brightest_relative_pos_x: -1,
      u_brightest_relative_pos_y: -1,

      starProfileToolActive: false,
      inspect_region_loading: false,
      inspect_image_loading: false,

      region_histogram_loading: false,
      image_histogram_loading: false,
      
      hist_counts: [0],
      hist_edges: [0,1],


    }
  },
  mounted(){
    // Draw empty plots for the star profiles
    this.drawEmptyStarProfiles()
  },
  methods: {

    reset_star_markers() {
      this.brightest_relative_pos_x = -1
      this.brightest_relative_pos_y = -1
      this.u_brightest_relative_pos_x = -1
      this.u_brightest_relative_pos_y = -1
    },

    drawEmptyStarProfiles() {
      // Draw empty plots for the star profiles
      this.plotStarProfile([0], {}, 1, "#brightest_star_profile", 
        {plot_color: "#efea5a"},
        {title: "Brightest Star Profile", x_axis_label: "arcseconds"})

      this.plotStarProfile([0], {}, 1, "#u_brightest_star_profile", 
        {plot_color: "#209cee"},
        {title: "Brightest Unsaturated Star Profile", x_axis_label: "arcseconds"})
    },
    getStarProfiles(useSubregion=true) {
      let url = "https://41uhbm23rf.execute-api.us-east-1.amazonaws.com/dev/starprofiles"
      let body = {
        "site": this.sitecode,
        "base_filename": this.current_image.base_filename,
        "data_type": this.current_image.data_type,
        "reduction_level": this.starInspectorLargeFile ? "01" : "10",
      }

      if (useSubregion) {

        if (this.selectedShapeType != "rects") {
          console.log(this.selectedShapeType)
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Region must be a rectangle.'
          })
          return;
        } 
        this.inspect_region_loading = true;
        body.region_x0 = helpers.clamp(this.selectedShape.x1, 0, 1)
        body.region_x1 = helpers.clamp(this.selectedShape.x2, 0, 1)
        body.region_y0 = helpers.clamp(this.selectedShape.y1, 0, 1)
        body.region_y1 = helpers.clamp(this.selectedShape.y2, 0, 1)
      }
      else { this.inspect_image_loading = true; }

      // Request the computed data from our backend
      axios.post(url, body)
        .then(response => {this.displayStarProfiles(response)})
        .catch(response => {this.starProfilesReset(response)})
    },
    starProfilesReset(response) {
      this.inspect_region_loading = false;
      this.inspect_image_loading = false;
      this.median_fwhm = '--'
      this.brightest_fwhm = '--'
      this.u_brightest_fwhm = '--'
    },
    displayStarProfiles(response) {
      this.inspect_region_loading = false;
      this.inspect_image_loading = false;
      console.log(response)

      // Handle the case where no stars are found.
      if (response.data.num_good_stars == 0) {
        console.log('no good stars')
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
              )}
        })
      }

      // Otherwise, do this if good stars were found
      else {
        console.log('good stars were found')
        let med_star = response.data.median_star
        let region_coords = response.data.region_coords

        // Brightest unsaturated star profile.
        if (response.data.brightest_unsaturated) {
          let u_bright_star = response.data.brightest_unsaturated
          this.u_brightest_fwhm = (u_bright_star.gaussian_fwhm *u_bright_star.pixscale).toFixed(2) + '"' 
          this.u_brightest_hfd = (u_bright_star.hfd*u_bright_star.pixscale).toFixed(2) + '"' 
          this.u_brightest_relative_pos_x = (u_bright_star.x / u_bright_star.naxis1) + region_coords.x0
          this.u_brightest_relative_pos_y = (u_bright_star.y / u_bright_star.naxis2) + region_coords.y0
          // Plot the brightest unsaturated star profile
          console.log('plotting brightest unsaturated star profile')
          let ub_profile = u_bright_star.radial_profile 
          let ub_gauss = {
            mean: u_bright_star.gaussian_mean,
            stddev: u_bright_star.gaussian_stddev,
            amplitude: u_bright_star.gaussian_amplitude,
          }
          let ub_pixscale = u_bright_star.pixscale 
          let ub_element_id = "#u_brightest_star_profile" 
          let ub_formatting = {
            margin_top: 50,
            margin_right: 25,
            margin_bottom: 50,
            margin_left: 45,
            plot_color: "#209cee",
            x_axis_ticks: 8,
            y_axis_ticks: 5,
          }
          let ub_labels = {
            title: "Brightest Unsaturated Star Profile",
            x_axis_label: "arcseconds",
          }
          this.plotStarProfile(ub_profile, ub_gauss, ub_pixscale, ub_element_id, ub_formatting, ub_labels)
        }

        // Brightest star profile
        if (response.data.brightest_star) {
          console.log('plotting brightest star')
          let bright_star = response.data.brightest_star
          this.brightest_fwhm = (bright_star.gaussian_fwhm *bright_star.pixscale).toFixed(2) + '"' 
          this.brightest_hfd = (bright_star.hfd*bright_star.pixscale).toFixed(2) + '"' 
          this.brightest_relative_pos_x = (bright_star.x / bright_star.naxis1) + region_coords.x0
          this.brightest_relative_pos_y = (bright_star.y / bright_star.naxis2) + region_coords.y0
          // Plot the brightest star profile
          let b_profile = bright_star.radial_profile 
          let b_gauss = {
            mean: bright_star.gaussian_mean,
            stddev: bright_star.gaussian_stddev,
            amplitude: bright_star.gaussian_amplitude,
          }
          let b_pixscale = bright_star.pixscale 
          let b_element_id = "#brightest_star_profile" 
          let b_formatting = {
            margin_top: 50,
            margin_right: 25,
            margin_bottom: 50,
            margin_left: 45,
            plot_color: "#efea5a",
            x_axis_ticks: 8,
            y_axis_ticks: 5,
          }
          let b_labels = {
            title: "Brightest Star Profile",
            x_axis_label: "arcseconds",
          }
          this.plotStarProfile(b_profile, b_gauss, b_pixscale, b_element_id, b_formatting, b_labels)
        }

        

        // Get the fwhm from the gaussian fit
        this.median_fwhm = (med_star.gaussian_fwhm * med_star.pixscale).toFixed(2) + '"' 
        this.median_hfd = (med_star.hfd* med_star.pixscale).toFixed(2) + '"' 

        // Get the positions of the stars to show in the image display.
        this.median_relative_pos_x = (med_star.x / med_star.naxis1) + region_coords.x0
        this.median_relative_pos_y = (med_star.y / med_star.naxis2) + region_coords.y0
        this.num_good_stars = response.data.num_good_stars

        // Plot the median star profile
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



        console.log('finished plotting star profiles')
      }
    },
    plotStarProfile( profile, gaussian, pixscale=1, el_id, formatting_opts, label_options ) {

      // Parse the input arguments, and define defaults.
      const margin = {
        top: formatting_opts.margin_top || 50,
        right: formatting_opts.margin_right || 25,
        bottom: formatting_opts.margin_bottom || 50,
        left: formatting_opts.margin_left || 45,
      }
      const width = formatting_opts.width || 180
      const height = formatting_opts.height || 100
      let x_axis_ticks = formatting_opts.x_axis_ticks || 8
      let y_axis_ticks = formatting_opts.y_axis_ticks || 5
      let plot_color = formatting_opts.plot_color || "#ff0000"

      let title = label_options.title
      let x_axis_label = label_options.x_axis_label

      let n = profile.length // The number of datapoints.
      let x_domain = (n-1) * pixscale // from above, scaled to use units of arcseconds

      // Calculate gaussian fit from the backend-provided parameters
      let g_mean = gaussian.mean || 0
      let g_stddev = gaussian.stddev || 0
      let g_amplitude = gaussian.amplitude || 0
      let gaussian_dist = x => {
        return g_amplitude * Math.exp(-0.5 * Math.pow((x - g_mean) / g_stddev, 2))
      }
      let gaussian_array = Array(n).fill().map((_,i) => gaussian_dist(i))


      // Remove previous plot data
      d3.select(el_id).select("svg").remove()

      // X scale will use the index of our data, scaled from pix to arcseconds
      let xScale = d3.scaleLinear()
        .domain([0, x_domain]) // input
        .range([0, width]); // output

      // Y scale will use the max in the star profile
      let yScale = d3.scaleLinear()
        .domain([0,Math.max(...profile)]) // input 
        .range([height, 0]); // output 

      // d3's line generator
      // TODO: replace with the gaussian fit instead of connecting the dots.
      let line = d3.line()
        .x(function(d, i) { return xScale(i * pixscale); }) // covnert to arcseconds
        .y(function(d) { return yScale(d); }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line


      // Add the SVG to the page
      let svg = d3.select(el_id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Call the x axis in a group tag
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).ticks(x_axis_ticks)); // Create an axis component with d3.axisBottom

      // Call the y axis in a group tag
      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale).ticks(y_axis_ticks)); // Create an axis component with d3.axisLeft
          
      // Draw the plot title
      svg.append("text")             
        .attr("x", width/2)
        .attr("y",-15)
        .style("text-anchor", "middle")
        .style("fill", "#fff")
        .text(title);

      // Draw the x-axis label
      svg.append("text")             
        .attr("x", width)
        .attr("y", height + 30)
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "#fff")
        .text(x_axis_label);

      // Plot the line fit only if the gaussian array is valid, and roughly 
      // centered over 0.
      if (gaussian_array[0] && Math.abs(g_mean) < 1) { 
        // Append the path, bind the data, and call the line generator 
        svg.append("path")
          .datum(gaussian_array) // 10. Binds data to the line 
          .style("fill", "none")
          .style("stroke", plot_color)
          .style("stroke-width","2px")
          .attr("class", "line") // Assign a class for styling 
          .attr("d", line); // 11. Calls the line generator 
      }

      // Appends a circle for each datapoint 
      svg.selectAll(".dot")
        .data(profile)
      .enter().append("circle") // Uses the enter().append() method
        .style("stroke", plot_color)
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d, i) { return xScale(i * pixscale) }) // convert array index (pixels) to arcsec
        .attr("cy", function(d) { return yScale(d) })
        .attr("r", 2);

    },
    getRegionStats(useSubregion=true) {

      const image_size = this.imageStatsLargeFile ? "01" : "10" // Determine the size of the image to analyze.
      const full_filename = this.imageStatsLargeFile ? this.large_fits_filename : this.small_fits_filename
      //const url = "https://41uhbm23rf.execute-api.us-east-1.amazonaws.com/dev/regionstats"
      const url = this.$store.state.dev.quickanalysis_endpoint + '/statistics'
      let body = {
        "site": this.sitecode,
        "base_filename": this.current_image.base_filename,
        "data_type": this.current_image.data_type,
        "reduction_level": image_size,
        "full_filename": full_filename,
      }
      console.log(body)
      if (useSubregion) {

        if (this.selectedShapeType != "rects") {
          console.log(this.selectedShapeType)
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Region must be a rectangle.'
          })
          return;
        } 
        this.region_stats_loading= true;
        body.subregion = {
          shape: 'rect',
          x0: helpers.clamp(this.selectedShape.x1, 0, 1),
          y0: helpers.clamp(this.selectedShape.y1, 0, 1),
          x1: helpers.clamp(this.selectedShape.x2, 0, 1),
          y1: helpers.clamp(this.selectedShape.y2, 0, 1),
        }
      }
      else { this.image_stats_loading = true;}

      axios.post(url, body)
        .then(response => {this.displayRegionStats(response)})
        .catch(response => {this.resetRegionStats()})
    },
    resetRegionStats() {
      this.image_stats_loading = false;
      this.region_stats_loading= false;

      this.region_min = "--"
      this.region_max = "--"
      this.region_median = "--"
      this.region_mean = "--"
      this.region_std = "--"
      this.region_mode = "--"
      this.region_MAD = "--"
    },
    displayRegionStats(http_response) {
      console.log(http_response)
      this.image_stats_loading = false;
      this.region_stats_loading= false;


      let data = http_response.data.stats
      this.region_min = parseFloat(data.min)
      this.region_max = parseFloat(data.max)
      this.region_median = parseFloat(data.median)
      this.region_mean = parseFloat(data.mean).toFixed(3)
      this.region_std = parseFloat(data.std).toFixed(3)
      this.region_mode = parseFloat(data.mode)
      this.region_MAD = parseFloat(data.median_abs_deviation)
    },

    getHistogram(useSubregion=true) {
      const url = this.$store.state.dev.quickanalysis_endpoint + '/histogram-clipped'
      let body = {
        "full_filename": this.best_available_full_filename,
        "clip_percent": 0.001,
      }
      if (useSubregion) {

        if (this.selectedShapeType != "rects") {
          console.log(this.selectedShapeType)
          this.$buefy.toast.open({
            type: 'is-warning',
            message: 'Region must be a rectangle.'
          })
          return;
        } 
        this.region_histogram_loading = true;
        body.subregion = {
          shape: 'rect',
          x0: helpers.clamp(this.selectedShape.x1, 0, 1),
          y0: helpers.clamp(this.selectedShape.y1, 0, 1),
          x1: helpers.clamp(this.selectedShape.x2, 0, 1),
          y1: helpers.clamp(this.selectedShape.y2, 0, 1),
        }
      }
      else { this.image_histogram_loading = true;}

      axios.post(url, body)
        .then(response => {
          this.image_histogram_loading = false;
          this.region_histogram_loading = false;
          this.hist_counts = response.data.histogram.counts 
          this.hist_edges = response.data.histogram.edges
        }) .catch(err => {
          console.warn('Error getting histogram: ',err )
          this.image_histogram_loading = false;
          this.region_histogram_loading = false;
          this.hist_counts = [0,0]
          this.hist_edges = [0,0.5,1]
        })
    },

    resetHistogram() {
      this.hist_counts = [0]
      this.hist_edges = [0,1]
    },

    refreshFitsHeader() {
      // First check if image is placeholder. If so, nothing to show.
      if (this.current_image.base_filename == "placeholder image") {
        this.fitsHeader = {}
        return
      }
      this.headerIsLoading = true 
      let url = `https://api.photonranch.org/api/fitsheader/${this.current_image.base_filename}/`
      let response = axios.get(url).then(response => {
        this.fitsHeader = response.data
      }).finally(() => {
        this.headerIsLoading = false
      })
    },
    showFitsHeader() {
      this.refreshFitsHeader()
      this.showFitsHeaderModal = true
    },
    async download_fits_file(base_filename, data_type, reduction_level) {
      const params = {
        base_filename: base_filename, 
        data_type: data_type,
        reduction_level: reduction_level,
      }
      const fits_url = await this.$store.dispatch('images/get_fits_url', params)
      window.location.assign(fits_url)
    },
  },
  watch: {
    current_image() {
      if (this.showFitsHeaderModal) this.refreshFitsHeader(); 

      // Reset the star profile graph and remove the star markers
      // TODO: cache the results of full image analysis and reload when 
      // switching back to the image.
      this.resetRegionStats()
      this.resetHistogram()
      this.drawEmptyStarProfiles()
      this.reset_star_markers()
    },
    show_user_data_only() {
      this.$store.dispatch('images/load_latest_images')
    }
  },
  computed: {

    ...mapState("images", [
      'recent_images',
      'current_image', 
    ]),
    ...mapGetters("images", [
      'small_fits_exists',
      'large_fits_exists',
      'small_fits_filename', 
      'large_fits_filename',
    ]),
    best_available_full_filename() {
      return this.large_fits_exists 
        ? this.large_fits_filename 
        : this.small_fits_filename
    },

    ...mapGetters("site_config", [
      "site_config", 
      "available_sites"
    ]),
    
    ...mapGetters("drawshapes", [
      'selectedId',
      'selectionExists',
      'selectedShapeType',
    ]),
    activeDrawShape: {
      get() { return this.$store.getters['drawshapes/activeDrawShape']},
      set(val) { this.$store.dispatch('drawshapes/activeDrawShape', val )}
    },
    selectedShape: {
      get() { return this.$store.getters['drawshapes/selectedShape']},
      set(val) { this.$store.dispatch('drawshapes/selectedShape', val )}
    },

    brightest_star_display() {
      return {
        x: this.brightest_relative_pos_x,
        y: this.brightest_relative_pos_y,
        color: this.u_brightest_plot_color,
      }
    },

    markedStars() {
      const brightest_star = {
        x: this.brightest_relative_pos_x,
        y: this.brightest_relative_pos_y,
        color: this.brightest_plot_color,
      }
      const brightest_unsaturated = {
        x: this.u_brightest_relative_pos_x,
        y: this.u_brightest_relative_pos_y,
        color: this.u_brightest_plot_color,
      }
      return [ brightest_star,brightest_unsaturated ]
    },

    activeDrawShape: {
      get() { return this.$store.getters['drawshapes/activeDrawShape']},
      set(val) { this.$store.commit('drawshapes/activeDrawShape', val)}
    },

    // Vuex mapping for the value that toggles whether to show all the site
    // images or just the user's images.
    show_user_data_only: {
      get() { return this.$store.getters['images/show_user_data_only']},
      set(val) { this.$store.commit('images/show_user_data_only', val)} 
    },

    fitsHeaderTable() {
      let tableData = []
      for (const property in this.fitsHeader) {
        tableData.push({
          key: property.toLowerCase(),
          val: this.fitsHeader[property]
        })
      }
      return tableData
    },

    captureDate() {
      // Error handling
      if (!this.current_image.capture_date) {
        return "---"
      }
      return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY') 
    },
    captureTime() {
      // Error handling
      if (!this.current_image.capture_date) {
        return "---"
      }
      return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
    },
    rightAscension() {
      if (this.current_image.right_ascension){
        return this.current_image.right_ascension
      }
      return "---"
    },
    declination() {
      if (this.current_image.declination) {
        return this.current_image.declination.toFixed(2)
      }
      return "---"
    },

    subframe_x0: {
      get() { return this.$store.getters['command_params/subframe_x0']},
      set(val) { this.$store.commit('command_params/subframe_x0', val)},
    },
    subframe_y0: {
      get() { return this.$store.getters['command_params/subframe_y0']},
      set(val) { this.$store.commit('command_params/subframe_y0', val)},
    },
    subframe_x1: {
      get() { return this.$store.getters['command_params/subframe_x1']},
      set(val) { this.$store.commit('command_params/subframe_x1', val)},
    },
    subframe_y1: {
      get() { return this.$store.getters['command_params/subframe_y1']},
      set(val) { this.$store.commit('command_params/subframe_y1', val)},
    },
  },
    
}

</script>


<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";




table.info-panel-table { color: #dbdee0; }
.blank-row { height: 1.5em; }
.info-panel-val {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}

.nav-panel > * {
  padding-bottom: 1em;
}

.warning-text {
  color: #f1b70e;
  padding: 2px;
  margin: 5px 0;
  background-color: black;
}

</style>