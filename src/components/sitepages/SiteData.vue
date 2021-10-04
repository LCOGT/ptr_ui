<template>
  <div style="display:flex; justify-content: center;">
  <div class="site-data-wrapper">

    <div class="image-display-area">
      <image-info-bar 
        class="image-info-bar"
        v-if="Object.keys(current_image).length > 0"
        :current_image="current_image"
        :fits_header="fitsHeader"
        />
      <image-view 
        class="image-view"
        :site="sitecode" 
        :markedStars="markedStars" />
        
      <div class="thumbnail-row">
        <info-image-thumb class="info-thumbs" v-if="info_images_exist"/>
        <div class="thumb-divider" v-if="info_images_exist" />
        <thumbnail-row 
          class="data-thumbs"
          :images="recent_images" 
          :selected_image="current_image.image_id" 
          @thumbnailClicked="setActiveImage"/>
      </div>

      <image-navigation-toolbar class="mt-3"/>
    </div>


    <!-- Collapsible panels on the right of the image --> 
    <div class="image-tools-area" >  

      <b-tabs v-model="activeImageToolsTab">

        <b-tab-item label="controls">
          <command-tabs-accordion class="command-tab-accordion is-hidden-desktop"/>
          <command-tabs-wide class="command-tabs-wide is-hidden-touch" />
        </b-tab-item>

        <b-tab-item label="analysis" class="analysis-tab-item">

          <div class="shapes-toolbar" > <div>Draw a region: </div> <shapes-toolbar /> </div>

          <!--div style="border-bottom: 1px solid #555; margin-bottom: 1em;" /-->
          <!--div style="height: 20px" /-->

          <div class="analysis-tools">
            <div class="analysis-tools-tab-buttons">
              <div 
                :class="{'active': activeAnalysisTab=='star inspector'}" 
                @click="activeAnalysisTab='star inspector'"
                class="analysis-tool-button">star inspector</div>
              <div 
                :class="{'active': activeAnalysisTab=='statistics'}" 
                @click="activeAnalysisTab='statistics'"
                class="analysis-tool-button">statistics</div>
              <div 
                :class="{'active': activeAnalysisTab=='histogram'}" 
                @click="activeAnalysisTab='histogram'"
                class="analysis-tool-button">histogram</div>
              <div 
                :class="{'active': activeAnalysisTab=='line profile'}" 
                @click="activeAnalysisTab='line profile'" 
                class="analysis-tool-button">line profile</div>
              <div 
                :class="{'active': activeAnalysisTab=='image info'}" 
                @click="activeAnalysisTab='image info'"
                class="analysis-tool-button">image info</div>
              <div 
                :class="{'active': activeAnalysisTab=='misc'}" 
                @click="activeAnalysisTab='misc'"
                class="analysis-tool-button">misc</div>
            </div>
            <div class="analysis-tools-content">

              <star-profile v-if="activeAnalysisTab=='star inspector'" />

              <div v-if="activeAnalysisTab=='statistics'" >

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
              </div>

              <div v-if="activeAnalysisTab=='histogram'" >
                <b-field>
                  <p class="control">
                    <button 
                      title="Get histogram from the selected rectangle region." 
                      class="button" 
                      :class="{'is-loading':region_histogram_loading}"
                      :disabled="!large_fits_exists && !small_fits_exists" 
                      @click="getHistogram(true)">
                      inspect region
                    </button>
                  </p>
                  <p class="control">
                    <button 
                      class="button" 
                      :class="{'is-loading':image_histogram_loading}"
                      :disabled="!large_fits_exists && !small_fits_exists" 
                      @click="getHistogram(false)">
                      inspect image
                    </button>
                  </p>
                </b-field>
                <p class="is-size-7 pl-1 mb-3">Double click to reset the zoom</p>
                <histogram-viewer :counts="hist_counts" :edges="hist_edges"/>
              </div>

              <div v-if="activeAnalysisTab=='line profile'" >
                <line-profile-inspection :disabled="!large_fits_exists && !small_fits_exists" />
              </div>

              <div v-if="activeAnalysisTab=='image info'" >
                <b-button class="button ml-1 mt-3" outlined  @click="showFitsHeader">show fits header</b-button>

                <div style="margin: 1em; display:flex; flex-direction: column;">
                  <table class="info-panel-table">
                      <tr> <td class="info-panel-val" align="right">filename: </td>
                          <td>{{current_image.base_filename || "---"}}</td> </tr>
                      <tr> <td class="info-panel-val" align="right">date: </td>
                          <td>{{captureDate}}</td></tr>
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
                </div>
              </div>

              <div v-if="activeAnalysisTab=='misc'" >
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
                <image-filter :sitecode="sitecode"/>
              </div>

            </div>

          </div>
        </b-tab-item>

        <b-tab-item label="data" class="data-tab">
          
          <!-- TODO: 'disable' the other image filter tools if this is turned on. -->
          <div class="live-data-toggle-pane">
            <b-field label="live data" horizontal>
              <b-switch v-model="liveData" label="show recent images" />
              <p class="is-italic has-text-weight-light">(stream the latest images as they arrive)</p>
            </b-field>
          </div>

          <div class="data-query-filters mb-4">
            <image-filter />
          </div>

          <div class="data-query-quick-buttons mb-4">
            <b-button class="is-small" @click="$store.dispatch('images/get_last_24hrs')"> all sites - last 24hrs </b-button>
          </div>

          <images-table :image_array="recent_images" class="mb-4"/>

        </b-tab-item>

      </b-tabs>
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

</div>
</div>
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
import CommandTabsAccordion from "@/components/CommandTabsAccordion"
import CommandTabsWide from "@/components/CommandTabsWide"
import ImageInfoBar from "@/components/ImageDisplay/ImageInfoBar"
import InfoImageThumb from "@/components/ImageDisplay/InfoImageThumb"
import ThumbnailRow from "@/components/ImageDisplay/ThumbnailRow"
import ImageNavigationToolbar from "@/components/ImageDisplay/ImageNavigationToolbar"
import ShapesToolbar from "@/components/ImageDisplay/ShapesToolbar"

import StarProfile from '@/components/AnalysisTools/StarProfile'

import moment from 'moment'
import { mapGetters, mapState } from "vuex";
import axios from 'axios'
import * as d3 from 'd3'
import helpers from "@/utils/helpers"

export default {
  name: "SubpageData",
  props: ["deviceStatus"],
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
    CommandTabsAccordion,
    CommandTabsWide,
    ImageInfoBar,
    InfoImageThumb,
    ThumbnailRow,
    ImageNavigationToolbar,
    ShapesToolbar,
    StarProfile,
  },
  data() {
    return {
      accordionIsOpen: 1,

      activeAnalysisTab: 'star inspector',
      activeImageToolsTab: 0,

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

      region_histogram_loading: false,
      image_histogram_loading: false,
      
      hist_counts: [0],
      hist_edges: [0,1],


    }
  },
  methods: {

    getRegionStats(useSubregion=true) {

      const url = this.$store.state.dev.quickanalysis_endpoint + '/statistics'

      // Extract parts of the filename required by the analysis api
      let filename = this.best_available_full_filename.split('.')[0]
      let data_type = filename.slice(filename.length-4, filename.length-2)
      let reduction_level = filename.slice(filename.length-2, filename.length)

      let body = {
        "site": this.sitecode,
        "base_filename": this.current_image.base_filename,
        "data_type": data_type,
        "reduction_level": reduction_level,
        "full_filename": this.best_available_full_filename,
        "s3_directory": this.current_image.s3_directory || "data",
      }
      if (useSubregion) {

        if (this.selectedShapeType != "rects") {
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
        "s3_directory": this.current_image.s3_directory || "data",
        "clip_percent": 0.001,
      }
      if (useSubregion) {

        if (this.selectedShapeType != "rects") {
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
      this.fitsHeader = {}

      // First check if image is placeholder. If so, nothing to show.
      if (this.current_image.base_filename == "placeholder image") {
        this.fitsHeader = {}
        return
      }
      this.headerIsLoading = true 
      //let url = `https://api.photonranch.org/api/fitsheader/${this.current_image.base_filename}/`
      let url = this.$store.state.dev.active_api + `/fitsheader/${this.current_image.base_filename}/`
      let response = axios.get(url).then(response => {
        this.fitsHeader = response.data
      }).finally(() => {
        this.headerIsLoading = false
      })
    },

    // Activated by clicking on an image thumbnail. Displays that image
    // in the main view.
    setActiveImage(image) {
      this.$store.dispatch("images/set_current_image", image);
    },

    showFitsHeader() {
      this.refreshFitsHeader()
      this.showFitsHeaderModal = true
    },
  },
  watch: {
    current_image() {
      if (this.showFitsHeaderModal) this.refreshFitsHeader(); 
      this.resetRegionStats()
      this.resetHistogram()
    },
    show_user_data_only() {
      this.$store.dispatch('images/load_latest_images')
    }
  },
  computed: {

    sitecode() {
      return this.$route.params.site
    },

    ...mapState("images", [
      'recent_images',
      'current_image', 
    ]),

    ...mapGetters("images", [
      'small_fits_exists',
      'large_fits_exists',
      'small_fits_filename', 
      'large_fits_filename',
      'info_images_exist',
    ]),

    best_available_full_filename() {
      return this.large_fits_exists 
        ? this.large_fits_filename 
        : this.small_fits_filename
    },

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
    
    crosshairsVisible: {
      get() { return this.$store.getters['drawshapes/crosshairsVisible']},
      set(val) { this.$store.dispatch('drawshapes/crosshairsVisible')}
    },

    markedStars() {
      return this.$store.getters['starprofile/marked_stars']
    },

    liveData: {
      get() { return this.$store.state.images.live_data },
      set(val) { this.$store.dispatch('images/toggle_live_data', val)}
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
$tabs-toggle-link-border-width: 10px;
@import "@/style/buefy-styles.scss";
@import "@/style/_responsive.scss";

$site-data-wrapper-padding: 1em;
$infobar-height: 50px;
$thumbnails-height: 100px;
$controls-height: 55px;

// Available height for the image after subracting the top navbars, bottom status display, and
// the ui elements around the image. 
$square-image-height: calc(
  100vh - #{
    $top-bottom-height 
    + $infobar-height 
    + $thumbnails-height 
    } 
  - #{(2 * $site-data-wrapper-padding)});
$max-div-width: $square-image-height;

$visible-content-height: calc(100vh - #{$top-bottom-height + #{(2 * $site-data-wrapper-padding)}});

// Row of image thumbnails
.thumbnail-row {
  display:flex;
}
.info-thumbs {
  flex-shrink: 0;
}
.thumb-divider {
  border-left: dashed #999; 
  margin: 0 8px;
  height: 60px;
}
.data-thumbs {
  flex-grow: 1;
}

.analysis-tools {
  background-color: $grey-darker;

}
.analysis-tools-tab-buttons {
  background-color: $body-background-color;
  display: flex;
  flex-wrap: wrap;
  color: $grey-lighter;
  margin-bottom: 1em;
}
.analysis-tool-button {
  padding: 5px 8px;
  border-right: 1px solid lighten($grey-dark, 4); 
  background-color: $body-background-color;

  &:hover {
    cursor: pointer;
  }

  &.active {
    background-color: $grey-darker;
    font-weight: bold;
  }
}
.analysis-tools-content {
  padding: 1em;
  height: max-content;
}



.site-data-wrapper {
  margin: 1em auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;

  @include desktop {
    margin-top: 0;
    display: grid;
    padding: $site-data-wrapper-padding;
    grid-gap: 2em;
    grid-template-columns:  auto 1fr;
    grid-template-rows: 1fr;//$visible-content-height;
    grid-template-areas: 'image tools';
  }
}

.image-display-area {
  padding: 0 2em;
  grid-area: image;
  width: 100%;
  display: grid;
  grid-template-rows: $infobar-height auto auto 80px 1fr;
  grid-template-columns: auto;
  overflow: hidden;

  @include fullhd {
    max-width: 800px;//calc(#{$visible-content-height} * 0.80);
  }

  .image-info-bar {
    max-width: 100%;
  }
}

.image-tools-area {
  grid-area: tools;
  padding-left: 1em;
  width: 100%;

  @include desktop {
    width: 500px;
  }

  @include widescreen {
    width: 600px;
  }

  @include fullhd {
    width: 720px;
  }

}


.command-tab-accordion {
  width: 100%;
  @include desktop {
    max-width: 380px;
  }
}

.live-data-toggle-pane{
    margin-bottom: 1em;
}

.analysis-tabs {
  margin-bottom: 3em;
}

.analysis-tab-item {
  display:flex;
  flex-direction: column;
  justify-content: space-between;
}

.shapes-toolbar {
  width: 100%;
  padding: 1em 2em;
  margin: 0 0 1em;
  background-color: $grey-darker;
}

table.info-panel-table { color: #dbdee0; }
.blank-row { height: 1.5em; }
.info-panel-val {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}

.warning-text {
  color: #f1b70e;
  padding: 2px;
  margin: 5px 0;
  background-color: black;
}

</style>