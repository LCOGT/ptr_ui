<template><section>
    <!--image-view :site="sitecode"/-->
  <div class="columns">
    <div class="img-view column is-two-thirds">

      <!-- The actual image view component -->
      <image-view-2 
        :site="active_site" 
        :median_star_pos_x="median_relative_pos_x"
        :median_star_pos_y="median_relative_pos_y"
        :median_plot_color="median_plot_color"
        :brightest_star_pos_x="brightest_relative_pos_x"
        :brightest_star_pos_y="brightest_relative_pos_y"
        :brightest_plot_color="brightest_plot_color"
        />
      <!--j-s9 /-->

    </div>

    <div class="nav-panel column ">  

      <side-info-panel>
        <p slot="title">selected region</p>
        <p>{{current_image.ex13_fits_exists ? "" : "missing small fits"}}</p>
        <p>{{current_image.ex01_fits_exists ? "" : "missing full fits"}}</p>

        <div style="display: flex; justify-items: space-between;">
        <b-tooltip 
          label="The full raw .fits file is large and may take over 10 seconds." 
          position="is-top" 
          multilined
          type="is-black">
          <button 
            class="button" 
            :class="{'is-loading':region_info_loading}"
            :disabled="!current_image.ex01_fits_exists || !current_image.ex13_fits_exists" 
            @click="getRegionStats('01', true)">
            inspect region
          </button>
        </b-tooltip>
        <div style="width: 10px;" />
        <button 
          class="button" 
          :class="{'is-loading':image_info_loading}"
          :disabled="!current_image.ex01_fits_exists || !current_image.ex13_fits_exists" 
          @click="getRegionStats('01', false)">
          inspect image
        </button>
        <!--button 
          class="button" 
          :class="{'is-loading': ex13_isLoading}"
          :disabled="!current_image.ex01_fits_exists || !current_image.ex13_fits_exists" 
          :loading="ex13_isLoading"
          @click="getRegionStats('13')">
          get region stats (EX13)
        </button-->
        </div>
      <!-- 
        <p>{{subframe_x0}}</p>
        <p>{{subframe_x1}}</p>
        <p>{{subframe_y0}}</p>
        <p>{{subframe_y1}}</p>
        -->
       

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
        </table>
      </side-info-panel>

      <side-info-panel>
        <p slot="title">star inspector</p>

        <div style="display:flex; justify-items: space-between;">
        <button 
          class="button" 
          :class="{'is-loading': inspect_region_loading}"
          :disabled="!current_image.ex01_fits_exists || !current_image.ex13_fits_exists" 
          @click="getStarProfiles">
          inspect region
        </button>
        <div style="width: 10px;"/>
        <button 
          class="button" 
          :class="{'is-loading': inspect_image_loading}"
          :disabled="!current_image.ex01_fits_exists || !current_image.ex13_fits_exists" 
          @click="getStarProfiles(false)">
          inspect image
        </button>
        </div>

        <div id="brightest_star_profile" />
        <div id="median_star_profile" />
        <table class="info-panel-table">
            <tr> <td class="info-panel-val" align="right">brightest fwhm: </td>
                <td>{{brightest_fwhm}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">median fwhm: </td>
                <td>{{median_fwhm}}</td> </tr>
            <tr> <td class="info-panel-val" align="right">number of stars detected: </td>
                <td>{{num_good_stars}}</td> </tr>
        </table>
      </side-info-panel>

      <!-- Basic image info and a button to reveal the full fits header -->
      <side-info-panel>
        <p slot="title">Image Info</p>
        <div style="margin: 1em;">
          <table class="info-panel-table">
              <tr> <td class="info-panel-val" align="right">filename: </td>
                  <td>{{current_image.base_filename}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">capture date: </td>
                  <td>{{captureDate}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">capture time: </td>
                  <td>{{captureTime + " GMT"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">site: </td>
                  <td>{{current_image.site || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">exposure [s]: </td>
                  <td>{{current_image.exposure_time || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">filter_used: </td>
                  <td>{{current_image.filter_used || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">right ascension: </td>
                  <td>{{rightAscension}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">declination: </td>
                  <td>{{declination}}</td> </tr>

              <tr> <td class="info-panel-val" align="right">altitude: </td>
                  <td>{{current_image.altitude || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">azimuth: </td>
                  <td>{{current_image.azimuth || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">airmass: </td>
                  <td>{{current_image.airmass || "---"}}</td> </tr>
          </table>
          <div style="height: 1em;"/>
          <button class="button" @click="getFitsHeader">show full fits header</button>
        </div>
      </side-info-panel>

      <js9-devtools/>
      <image-filter/>
      <image-navigation-panel/>
    </div>

  </div>
  <images-table style="margin-top: 3em;"/>

  <!-- Modal popup window showing the full fits header. -->
  <b-modal :active.sync="showFitsHeaderModal" >
    <div class="card" style="height: 80vh; overflow-y: auto;">
      <div class="card-content">
        <table class="info-panel-table">
          <tr v-for="(v,k) in fitsHeader"> 
            <td class="info-panel-val" align="right">{{k}}: </td>
            <td>{{v}}</td> 
          </tr>
        </table>
      </div>
    </div>
  </b-modal>


</section></template>


<script>

import ImageView2 from '@/components/ImageView2'
import ImagesTable from '@/components/ImagesTable'
import Js9Devtools from "@/components/Js9Devtools";
import ImageNavigationPanel from "@/components/ImageNavigationPanel";
import ImageFilter from "@/components/ImageFilter";
import ImageInfoPanel from "@/components/ImageInfoPanel";
import SideInfoPanel from "@/components/SideInfoPanel";
import moment from 'moment'
import { mapGetters } from "vuex";
import axios from 'axios'
import * as d3 from 'd3'

export default {
    name: "SubpageData",
    props: ["sitecode"],
    components: {
        ImageView2,
        ImagesTable,
        ImageInfoPanel,
        ImageNavigationPanel,
        ImageFilter,
        Js9Devtools,
        SideInfoPanel,
    },
    data() {
      return {
        fitsHeader: {},
        showFitsHeaderModal: false,

        region_info_loading: false,
        image_info_loading: false,

        ex13_isLoading: false,

        region_min: '--',
        region_max: '--',
        region_median: '--',
        region_mean: '--',
        region_std: '--',

        num_good_stars: '--',
        pixscale: 1,

        median_plot_color: '#209cee',
        median_fwhm: '--',
        median_profile: [0],
        median_relative_pos_x: 0,
        median_relative_pos_y: 0,

        brightest_plot_color: '#efea5a',
        brightest_fwhm: '--',
        brightest_profile: [0],
        brightest_relative_pos_x: 0,
        brightest_relative_pos_y: 0,

        starProfileToolActive: false,
        inspect_region_loading: false,
        inspect_image_loading: false,


      }
    },
    mounted(){
      this.plotMedianStarProfile()
      this.plotBrightestStarProfile()
    },
    methods: {
        getStarProfiles(useSubregion=true) {
          let url = "https://41uhbm23rf.execute-api.us-east-1.amazonaws.com/dev/starprofiles"
          let body = {
            "site": this.sitecode,
            "base_filename": this.current_image.base_filename,
            //"region_x0": this.subframe_x0, 
            //"region_x1": this.subframe_x1,
            //"region_y0": this.subframe_y0,
            //"region_y1": this.subframe_y1,
            "fitstype": "01",
          }

          if (useSubregion) {
            this.inspect_region_loading = true;
            body.region_x0 = this.subframe_x0
            body.region_x1 = this.subframe_x1
            body.region_y0 = this.subframe_y0
            body.region_y1 = this.subframe_y1
          }
          else { this.inspect_image_loading = true; }

          axios.post(url, body)
            .then(response => {this.displayStarProfiles(response)})
            .catch(response => {this.starProfilesReset(response)})
        },
        starProfilesReset(response) {
          this.inspect_region_loading = false;
          this.inspect_image_loading = false;
          this.median_fwhm = '--'
          this.brightest_fwhm = '--'
          console.warn("problem getting star profiles")
        },
        displayStarProfiles(response) {
          this.inspect_region_loading = false;
          this.inspect_image_loading = false;
          console.log('the response:')
          console.log(response)

          if (response.data.num_good_stars == 0) {
            console.log('no good stars')
            this.median_fwhm = '--'
            this.brightest_fwhm = '--'
            this.num_good_stars = 0
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
          }
          else {
            let med_star = response.data.median_star
            let bright_star = response.data.brightest_star
            let region_coords = response.data.region_coords

            // TODO: plot the gaussian curve over the data instead of connecting the dots.

            // Get the star profile data to plot
            this.median_profile = med_star.radial_profile.map(i => i*med_star.peak)
            this.brightest_profile = bright_star.radial_profile.map(i => i*bright_star.peak)

            // Get the fwhm from the gaussian fit
            this.median_fwhm = (med_star.gaussian_fwhm * med_star.pixscale).toFixed(2) + '"' 
            this.brightest_fwhm = (bright_star.gaussian_fwhm *bright_star.pixscale).toFixed(2) + '"' 

            // Get the positions of the stars to show in the image display.
            this.median_relative_pos_x = (med_star.x / med_star.naxis1) + region_coords.x0,
            this.median_relative_pos_y = (med_star.y / med_star.naxis2) + region_coords.y0,

            this.brightest_relative_pos_x = (bright_star.x / bright_star.naxis1) + region_coords.x0,
            this.brightest_relative_pos_y = (bright_star.y / bright_star.naxis2) + region_coords.y0,

            this.num_good_stars = response.data.num_good_stars
            this.pixscale = med_star.pixscale

            d3.select("#brightest_star_profile").select("svg").remove()
            d3.select("#median_star_profile").select("svg").remove()
            this.plotMedianStarProfile()
            this.plotBrightestStarProfile()
          }
        },
        plotMedianStarProfile() {
          // 2. Use the margin convention practice 
          var margin = {top: 50, right: 25, bottom: 50, left: 25}
            , width = 200 // Use the window's width 
            , height = 100; // Use the window's height

          // The number of datapoints
          var n = this.median_profile.length;

          // 5. X scale will use the index of our data
          var xScale = d3.scaleLinear()
              .domain([0, n-1]) // input
              .range([0, width]); // output

          // 6. Y scale will use the randomly generate number 
          var yScale = d3.scaleLinear()
              .domain([0,Math.max(...this.median_profile)]) // input 
              .range([height, 0]); // output 

          // 7. d3's line generator
          var line = d3.line()
              .x(function(d, i) { return xScale(i); }) // set the x values for the line generator
              .y(function(d) { return yScale(d); }) // set the y values for the line generator 
              .curve(d3.curveMonotoneX) // apply smoothing to the line

          // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
          //var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })
          //console.log(dataset)
          var dataset = this.median_profile

          // 1. Add the SVG to the page and employ #2
          this.svg = d3.select("#median_star_profile").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // 3. Call the x axis in a group tag
          this.svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

          // 4. Call the y axis in a group tag
          this.svg.append("g")
              .attr("class", "y axis")
              .call(d3.axisLeft(yScale).ticks(4)); // Create an axis component with d3.axisLeft

          // text label for the x axis
          this.svg.append("text")             
              .attr("x", width/2)
              .attr("y",-15)
              .style("text-anchor", "middle")
              .style("fill", "#fff")
              .text("Median Star Profile");
          // x-axis units: arcseconds
          this.svg.append("text")             
              .attr("x", width)
              .attr("y", height + 30)
              .style("text-anchor", "middle")
              .style("font-size", "10px")
              .style("fill", "#fff")
              .text("arcseconds");

          // 9. Append the path, bind the data, and call the line generator 
          this.svg.append("path")
              .datum(dataset) // 10. Binds data to the line 
              .style("fill", "none")
              .style("stroke", this.median_plot_color)
              .style("stroke-width","2px")
              .attr("class", "line") // Assign a class for styling 
              .attr("d", line); // 11. Calls the line generator 

          // 12. Appends a circle for each datapoint 
          this.svg.selectAll(".dot")
              .data(dataset)
            .enter().append("circle") // Uses the enter().append() method
              .style("stroke", this.median_plot_color)
              .attr("class", "dot") // Assign a class for styling
              .attr("cx", function(d, i) { return xScale(i) }) 
              .attr("cy", function(d) { return yScale(d) })
              .attr("r", 2);
        },
        plotBrightestStarProfile() {
          // 2. Use the margin convention practice 
          var margin = {top: 50, right: 25, bottom: 50, left: 25}
            , width = 200 // Use the window's width 
            , height = 100; // Use the window's height

          // The number of datapoints
          var n = this.brightest_profile.length;

          // 5. X scale will use the index of our data
          var xScale = d3.scaleLinear()
              .domain([0, (n-1)*this.pixscale]) // input
              .range([0, width]); // output

          // 6. Y scale will use the randomly generate number 
          var yScale = d3.scaleLinear()
              .domain([0,Math.max(...this.brightest_profile)]) // input 
              .range([height, 0]); // output 

          // 7. d3's line generator
          let that = this;
          var line = d3.line()
              .x(function(d, i) { return xScale(i * 0.85); }) // covnert to arcseconds
              .y(function(d) { return yScale(d); }) // set the y values for the line generator 
              .curve(d3.curveMonotoneX) // apply smoothing to the line

          // 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
          //var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })
          //console.log(dataset)
          var dataset = this.brightest_profile

          // 1. Add the SVG to the page and employ #2
          this.svg = d3.select("#brightest_star_profile").append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          // 3. Call the x axis in a group tag
          this.svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

          // 4. Call the y axis in a group tag
          this.svg.append("g")
              .attr("class", "y axis")
              .call(d3.axisLeft(yScale).ticks(4)); // Create an axis component with d3.axisLeft
              
          // text label for the x axis
          this.svg.append("text")             
              .attr("x", width/2)
              .attr("y",-15)
              .style("text-anchor", "middle")
              .style("fill", "#fff")
              .text("Brightest Star Profile");

          // x-axis units: arcseconds
          this.svg.append("text")             
              .attr("x", width)
              .attr("y", height + 30)
              .style("text-anchor", "middle")
              .style("font-size", "10px")
              .style("fill", "#fff")
              .text("arcseconds");

          // 9. Append the path, bind the data, and call the line generator 
          this.svg.append("path")
              .datum(dataset) // 10. Binds data to the line 
              .style("fill", "none")
              .style("stroke", this.brightest_plot_color)
              .style("stroke-width","2px")
              .attr("class", "line") // Assign a class for styling 
              .attr("d", line); // 11. Calls the line generator 

          // 12. Appends a circle for each datapoint 
          this.svg.selectAll(".dot")
              .data(dataset)
            .enter().append("circle") // Uses the enter().append() method
              .style("stroke", this.brightest_plot_color)
              .attr("class", "dot") // Assign a class for styling
              .attr("cx", function(d, i) { return xScale(i * 0.85) }) // convert array index (pixels) to arcsec
              .attr("cy", function(d) { return yScale(d) })
              .attr("r", 2);
        },
        getRegionStats(fitstype, useSubregion=true) {
          let url = "https://41uhbm23rf.execute-api.us-east-1.amazonaws.com/dev/regionstats"
          //let url = "http://127.0.0.1:5000/lambdacomparison/"
          //let url = "https://api.photonranch.org/lambdacomparison/"
          let body = {
            "site": this.sitecode,
            "base_filename": this.current_image.base_filename,
            //"region_x0": this.subframe_x0, 
            //"region_x1": this.subframe_x1,
            //"region_y0": this.subframe_y0,
            //"region_y1": this.subframe_y1,
            "fitstype": fitstype,
          }
          if (useSubregion) {
            this.region_info_loading = true;
            body.region_x0 = this.subframe_x0,
            body.region_x1 = this.subframe_x1,
            body.region_y0 = this.subframe_y0,
            body.region_y1 = this.subframe_y1
          }
          else { this.image_info_loading = true;}
          //if (fitstype == "01") { this.ex01_isLoading = true;} // replaced by region_info_loading and image_info_loading
          if (fitstype == "13") { this.ex13_isLoading = true;}
          axios.post(url, body)
            .then(response => {this.displayRegionStats(response, fitstype)})
            .catch(response => {this.regionStatsReset(fitstype)})
        },
        regionStatsReset(fitstype) {
          //if (fitstype == "01") { this.ex01_isLoading = false;}
          this.image_info_loading = false;
          this.region_info_loading = false;
          if (fitstype == "13") { this.ex13_isLoading = false;}
          this.region_min = "--"
          this.region_max = "--"
          this.region_median = "--"
          this.region_mean = "--"
          this.region_std = "--"

        },
        displayRegionStats(http_response, fitstype) {
          console.log(http_response)
          this.image_info_loading = false;
          this.region_info_loading = false;
          //if (fitstype == "01") { this.ex01_isLoading = false;}
          if (fitstype == "13") { this.ex13_isLoading = false;}
          let data = http_response.data
          this.region_min = parseFloat(data.min).toFixed(3)
          this.region_max = parseFloat(data.max).toFixed(3)
          this.region_median = parseFloat(data.median).toFixed(3)
          this.region_mean = parseFloat(data.mean).toFixed(3)
          this.region_std = parseFloat(data.std).toFixed(3)
        },
        imagesByUser() {
            this.$store.dispatch('images/get_user_images')
        },
        getFitsHeader() {
          let url = `https://api.photonranch.org/fitsheader/${this.sitecode}/${this.current_image.base_filename}/`
          let response = axios.get(url).then(response => {
              this.fitsHeader = response.data
          })
          this.showFitsHeaderModal = true
        }
    },
    computed: {
        //fitsHeader() {
          //let url = `https://api.photonranch.org/fitsheader/${this.sitecode}/${this.current_image.base_filename}/`
          //let response = axios.get(url).then(response => {
              //this.fitsHeader = response.data
          //})
        //}
        captureDate() {
            return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY')
        },
        captureTime() {
            return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
        },
        rightAscension() {
            if (this.current_image.right_ascension){
                return this.current_image.right_ascension.toFixed(2)
            }
            return "---"
        },
        declination() {
            if (this.current_image.declination) {
                return this.current_image.declination.toFixed(2)
            }
            return "---"
        },
        ...mapGetters("observatory_configuration", ["available_sites"]),

        ...mapGetters("images", {
            recent_images: "recent_images",
            current_image: "current_image"
        }),

        active_site: {
            get() { return this.$store.getters["observatory_configuration/site"]; },
            set(value) { this.$store.commit("observatory_configuration/setActiveSite", value); }
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


<style scoped>

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

.line {
    fill: none;
    stroke: #ffab00;
    stroke-width: 3;
}
.dot {
    fill: #ffab00;
    stroke: #fff;
}

</style>