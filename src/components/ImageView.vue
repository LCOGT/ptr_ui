<template>
  <div id="component" v-on:keyup.right="setNextImage" v-on:keyup.left="setPreviousImage" >
    <div id="image-window" ref="imagewindow">

      <div class="image-info-bar">
        <div class="image-info-bar-item site" v-if="fitsHeaderLoaded && fitsHeader.OBJECT != 'Unspecified' ">obj:&nbsp;{{fitsHeader.OBJECT}}</div>
        <div class="image-info-bar-item site" v-if="!fitsHeaderLoaded || fitsHeader.OBJECT == 'Unspecified'">site:&nbsp;{{current_image.site}}</div>
        <div class="image-info-bar-item exptime">exptime:&nbsp;{{current_image.exposure_time}}s</div>
        <div class="image-info-bar-item filter-used">filter:&nbsp;{{current_image.filter_used}}</div>
        <div/>
        <div class="image-info-bar-item ra" style="display:flex">
          ra:&nbsp;<ra-display :ra_hours_decimal="current_image.right_ascension" :decimal_precision="3"/>
        </div>
        <div class="image-info-bar-item dec" style="display:flex">
          dec:&nbsp;<dec-display :dec_deg_decimal="current_image.declination" :decimal_precision="3"/>
        </div>
        <div class="image-info-bar-item airmass">airmass:&nbsp;{{current_image.airmass}}</div>
        <div class="image-info-bar-item altitude">altitude:&nbsp;{{current_image.altitude}}°</div>
        <div class="image-info-bar-item obstime">obstime:&nbsp;{{current_image.capture_date | dateToUnix }}</div>
      </div>

      <!-- The main image view -->
      <div class="image-div" ref="image_div">

        <svg 
          id='image_svg' 
          ref="svgElement" 
          :class="{'cursor-is-crosshair': activeDrawShape!='none'}" 
          v-show="!js9IsVisible"
          >
          <image-crosshairs 
            :width="imageWidth"
            :height="imageHeight"
            :isVisible="show_crosshairs"
            color="yellow"/>
          <background-element id="svg-background" :width="imageWidth" :height="imageHeight" />

        </svg>
        <svg-context-menu svgId="image_svg" />

        <img
          id="main-image"
          ref="image" 
          rel="preload"
          alt="no jpg available"
          onerror="this.onerror=null;this.src='https://via.placeholder.com/768?text=no+jpg+preview+available'"
          v-show="!js9IsVisible"
          :src="current_image.jpg_url" />

        <div id="js9-window" v-if="js9IsVisible" >
          <JS9 ref="js9" :include-menu="true" :initial-width="js9width" :initial-height="js9height" />
        </div>

      </div>

      <!-- Row of selectable image thumbnails under the main view. -->
      <div class="recent_images">
        <div 
            class="recent_image" 
            style="display: flex;"
            v-for="(item, index) in recent_images" 
            v-bind:key="index" >
          <img 
              style="width: 60px; height: 60px;"
              v-bind:src="item.jpg_url"
              onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
              v-bind:title="item.base_filename"
              v-bind:class="{'selected_thumbnail' : item.image_id == current_image.image_id}"
              @click="setActiveImage(item)" >
        </div>
      </div>

      <!-- Controls in the top row above the main view --> 
      <div class="controls">
        <b-field grouped>
          <b-field> 
            <button title="open the JS9 analysis tools"
              class="button" @click="toggleAnalysis">JS9</button> </b-field>
          <b-field>
            <p class="control">
              <button 
                class="button level-item" title="go to the latest image" 
                @click="setLatestImage">
                <b-icon icon="chevron-double-left"/>
              </button>
            </p>
            <p class="control">
              <button class="button level-item" title="previous image"
                @click="$store.dispatch('images/set_previous_image')">
                <b-icon icon="chevron-left" />
              </button>
            </p>
            <p class="control">
              <button class="button level-item" title="next image"
                @click="$store.dispatch('images/set_next_image')">
                <b-icon icon="chevron-right" />
              </button>
            </p>
          </b-field>
        </b-field>

        <b-field>
          <b-field label="crosshairs" style="margin-right: 10px;" >
            <b-switch type="is-info" v-model="show_crosshairs"></b-switch>
          </b-field>
          <b-field>
            <b-radio-button v-model="activeDrawShape" native-value="none"> none </b-radio-button>
            <b-radio-button v-model="activeDrawShape" native-value="point">
                <span class="iconify" data-icon="radix-icons:dot" data-inline="false"></span>
            </b-radio-button>
            <b-radio-button v-model="activeDrawShape" native-value="line">
                <span class="iconify" data-icon="mdi:vector-line" data-inline="false"></span>
            </b-radio-button>
            <b-radio-button v-model="activeDrawShape" native-value="circle">
                <span class="iconify" data-icon="mdi:vector-circle-variant" data-inline="false"></span>
            </b-radio-button>
            <b-radio-button v-model="activeDrawShape" native-value="rect">
                <span class="iconify" data-icon="mdi:vector-rectangle" data-inline="false"></span>
            </b-radio-button>
          </b-field>

          <b-button 
            class="button"
            title="Remove selected shape"
            style="margin-left: 10px;"
            type="is-danger"
            :disabled="selectedId == 'none'"
            icon-right="delete"
            @click='$store.dispatch("drawshapes/deleteSelectedShape")'>
          </b-button>
        </b-field>

      </div>

    </div>
  </div>
</template>

<script>
//import { API, Auth } from "aws-amplify";
import axios from 'axios';
import wcs from "@/utils/pix2wcs";
import { mapGetters, mapState } from "vuex";
import { commands_mixin } from "../mixins/commands_mixin";
import { SnackbarProgrammatic as Snackbar } from "buefy";
import moment from 'moment'
import * as d3 from "d3";

import JS9 from "@/components/JS9";
import ImageCrosshairs from "@/components/svg/ImageCrosshairs"
import BackgroundElement from "@/components/svg/BackgroundElement"
import SvgContextMenu from "@/components/SvgContextMenu"
import RectSelection from "@/components/svg/RectSelection"

import RaDisplay from "@/components/display/RaDisplay"
import DecDisplay from "@/components/display/DecDisplay"

import { Point, Line, Rect, Circle, Starmarker }from "@/utils/drawshapes"

export default {
  name: "ImageView",

  components: {
    JS9,
    SvgContextMenu,
    ImageCrosshairs,
    BackgroundElement,
    RectSelection,
    RaDisplay,
    DecDisplay,
  },

  mixins: [commands_mixin],

  props: {
    site: String,
    markedStars: Array,
  },

  filters: {
    dateToUnix(date) {
      return (new Date(date).getTime() / 1000).toFixed(0)
    }
  },

  data() {
    return {
      // The image that is selected and visible in the main viewer.
      active_image: "",

      // Width of image in UI
      imageWidth: 0,
      imageHeight: 0,

      // This is modified by the crosshairs switch and controls whether the crosshairs are visible.
      show_crosshairs: false,
      crosshair_color: "#32cd32",

      //Image ID of the currently highlighted image (focused)
      highlighted_image: 0,

      js9width: 200,
      js9height: 500,

      fitsHeader: {},

    };
  },

  created() {
    this.$store.dispatch("images/load_latest_images");
  },

  mounted() {
    this.init()

    // Updates whenever the rendered image size changes
    var ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        const cr = entry.contentRect;
        this.onImageResize(cr.width, cr.height)
        this.updateAll()
        //console.log(cr)
      }
    });
    let imageEl = document.getElementById('main-image')
    // Observe one or multiple elements
    ro.observe(imageEl);
  },

  watch: {
    site: function(newVal, oldVal) {
      this.$store.dispatch("images/load_latest_images");
    },

    current_image: function(newVal, oldVal) {
      // If we're in the js9 window mode, keep the image updated with the 
      // selected thumbnail.
      if (this.js9IsVisible) {
        this.js9LoadImage(newVal)
      }

      this.getFitsHeader() 
    },

    lines: {
      handler: function() {
        this.drawLines.draw()
      },
      deep: true,
    },
    
    points: {
      handler: function() {
        this.drawPoints.draw()
      },
      deep: true,
    },
    rects: {
      handler: function() {
        this.drawRects.draw()
      },
      deep: true,
    },
    circles: {
      handler: function() {
        this.drawCircles.draw()
      },
      deep: true,
    },
    selectedId() {
      this.updateAll()
      this.subframeDefinedWithFile = this.current_image.base_filename
    },
    markedStars() {
      this.drawStarmarkers.updateData(this.markedStars)
      this.drawStarmarkers.draw()
    }
  },


  methods: {

    init() {

      this.svg = d3.select('#image_svg')

      this.drawPoints = new Point(this.svg, this.points, this.imageWidth, this.imageHeight)
      this.drawLines = new Line(this.svg, this.lines, this.imageWidth, this.imageHeight)
      this.drawRects = new Rect(this.svg, this.rects, this.imageWidth, this.imageHeight)
      this.drawCircles = new Circle(this.svg, this.circles, this.imageWidth, this.imageHeight)
      this.drawStarmarkers = new Starmarker(this.svg, this.markedStars, this.imageWidth, this.imageHeight)

      // Event actions to perform on the image window element
      this.svg
        .on("mousedown", this.handleMouseDown) 
        .on("mouseup", this.handleMouseUp)
        .on('keyup', e => console.log(e.key))

      this.updateAll()
    },

    updateAll() {
      this.drawPoints.draw()
      this.drawLines.draw()
      this.drawRects.draw()
      this.drawCircles.draw()
      this.drawStarmarkers.draw()
    },


    onImageResize(width, height) {

      // This happens when we load js9, since the jpg display goes away. 
      if (width == 0 && height == 0) return;

      this.imageWidth = parseInt(width)
      this.imageHeight = parseInt(height)

      // Update the svg drawing tools
      this.drawPoints.imageDimensions = [width, height]
      this.drawRects.imageDimensions = [width, height]
      this.drawLines.imageDimensions = [width, height]
      this.drawCircles.imageDimensions = [width, height]
      this.drawStarmarkers.imageDimensions = [width, height]

      // Update the js9 size
      if (this.js9IsVisible) {
        let resize_opts = {
          id: "myJS9",
          width: width, 
          height: height,
        }
        this.$store.dispatch('js9/resizeDisplay', resize_opts)
      }

      // This is fed to js9 just before displaying to set the matching size. 
      this.js9width=parseInt(width)
      this.js9height=parseInt(height)

    },

    handleMouseDown() {
      d3.event.preventDefault();
      let mouse = d3.mouse(this.svg.node())

      // Calculate image dimensions
      let bounds = this.svg.node().getBoundingClientRect()
      let imageWidth = bounds.width
      let imageHeight = bounds.height

      // Drawing a new line
      if (this.activeDrawShape == 'line') {
        this.$store.commit('drawshapes/addLine', {
          x1: mouse[0] / imageWidth,
          y1: mouse[1] / imageHeight,
          x2: mouse[0] / imageWidth,
          y2: mouse[1] / imageHeight,
          color: 'gold',
          show: true,
        })
        this.svg.on("mousemove", () => {
          let mouse = d3.mouse(this.svg.node())
          let newLine = this.lines[this.lines.length - 1]
          this.selectedId = newLine.id
          newLine.x2 = mouse[0] / this.imageWidth
          newLine.y2 = mouse[1] / this.imageHeight
        })
      // Drawing a new rectangle
      } else if (this.activeDrawShape == 'rect') {
        this.$store.commit('drawshapes/addRect', {
          x1: mouse[0] / imageWidth,
          y1: mouse[1] / imageHeight,
          x2: mouse[0] / imageWidth,
          y2: mouse[1] / imageHeight,
          color: 'gold',
          show: true,
        })
        this.svg.on("mousemove", () => {
          let mouse = d3.mouse(this.svg.node())
          let newRect = this.rects[this.rects.length - 1]
          this.selectedId = newRect.id
          newRect.x2 = mouse[0] / this.imageWidth
          newRect.y2 = mouse[1] / this.imageHeight
        })
      // Drawing a new point
      } else if ( this.activeDrawShape == 'point') {
        this.$store.commit('drawshapes/addPoint', {
          x: mouse[0] / imageWidth,
          y: mouse[1] / imageHeight,
          color: 'gold', 
          show: true,
        })
        this.svg.on("mousemove", () => {
          let mouse = d3.mouse(this.svg.node())
          let theNewPoint = this.points[this.points.length - 1]
          this.selectedId = theNewPoint.id
          theNewPoint.x = mouse[0] / this.imageWidth
          theNewPoint.y = mouse[1] / this.imageHeight
        })
      // Drawing a new circle
      } else if (this.activeDrawShape == 'circle') {
        this.$store.commit('drawshapes/addCircle', {
          x: mouse[0] / imageWidth,
          y: mouse[1] / imageHeight,
          rx: 0,
          ry: 0,
          color: 'gold', 
          show: true,
        })
        this.svg.on("mousemove", () => {
          let mouse = d3.mouse(this.svg.node())
          let newCircle = this.circles[this.circles.length - 1]
          this.selectedId = newCircle.id
          newCircle.rx = (mouse[0] / this.imageWidth) - newCircle.x
          newCircle.ry = (mouse[1] / this.imageHeight) - newCircle.y
        })
      }
    },

    handleMouseUp(context) {
      // We don't want every click to draw a shape. Users need to select what
      // they want drawn each time. 
      this.activeDrawShape = 'none'

      // Remove the mousemove method
      this.svg.on("mousemove", null)

      this.mouseIsDown = false;
    },


    // Activated by clicking on an image thumbnail. Displays that image
    // in the main view.
    setActiveImage(image) {
      this.$store.dispatch("images/set_current_image", image);
    },

    // Display the latest image in the view.
    setLatestImage() {
      this.$store.dispatch("images/load_latest_images");
      this.$store.dispatch("images/set_latest_image");
    },

    js9LoadImage(image) {
      let the_load_options = {
        site: image.site,
        base_filename: image.base_filename,
      }
      this.$store.dispatch('js9/loadImage', the_load_options)
    },

    toggleAnalysis() {
      if (this.js9IsVisible) {
        this.js9IsVisible = false;
        this.init()
      } else {
        this.js9LoadImage(this.current_image)
        this.js9IsVisible = true;
      }
    },
    getFitsHeader() {
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

  },
  computed: {

    ...mapGetters("images", [
      "recent_images",
      "current_image",
    ]),

    fitsHeaderLoaded() {
      return Object.keys(this.fitsHeader).length > 0
    },

    js9IsVisible: {
      get() { return this.$store.getters['js9/instanceIsVisible']},
      set(val) { this.$store.commit('js9/instanceIsVisible', val)},
    },

    subframeIsActive: {
        get() { return this.$store.getters['command_params/subframeIsActive']},
        set(val) { this.$store.commit('command_params/subframeIsActive', val)},
    },

    subframeDefinedWithFile: {
        get() { return this.$store.getters['command_params/subframeDefinedWithFile']},
        set(val) { this.$store.commit('command_params/subframeDefinedWithFile', val)},
    },

    ...mapState('drawshapes', [
      'shapes', 
      'lines', 
      'rects', 
      'circles', 
      'points', 
      'starmarkers'
    ]),

    selectedId: {
      get() { return this.$store.getters['drawshapes/selectedId']},
      set(val) { this.$store.commit('drawshapes/selectedId', val)}
    },

    // User selection for which shape they want to draw
    activeDrawShape: {
      get() { return this.$store.getters['drawshapes/activeDrawShape']},
      set(val) { this.$store.commit('drawshapes/activeDrawShape', val)}
    }

  }
};
</script>

<style scoped lang="scss">
#component {
  display: flex;
  flex-direction: column;
  text-align: center;
  width: auto;
  margin: 0 auto;
}
#js9-window {
  display: block;
}
.controls {
  margin-top: 1em;
  display: flex;
  justify-content: space-between;
  overflow-x:auto;
  overflow-y:visible;
}

.image-div {
  position: relative;
  width: 100%;
  height: 100%;
}

#main-image {
  width: 100%;
  height: 100%;
}
#image_svg {
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.image-info-bar {
  color: #aaa;
  width: 100%;
  background-color: #1e2223;
  display: grid;
  grid-template-rows: 1fr 1fr;
  grid-template-columns: repeat(2, 90px) 1fr repeat(2, 120px);
  grid-template-areas: 'site exptime . ra dec'
                       'filter-used obstime . airmass altitude';
  grid-column-gap: 10px;
  padding: 1px 3px;
  
  .image-info-bar-item {
    text-align: left;

    span {
      width: 40px;
      color: red;
    }
  }
  

  .site { grid-area: site; }
  .filter-used { grid-area: filter-used; }
  .exptime { grid-area: exptime; }
  .ra { grid-area: ra; }
  .dec { grid-area: dec; }
  .airmass { grid-area: airmass; }
  .altitude { grid-area: altitude; }
  .obstime { grid-area: obstime; }

}

.cursor-is-crosshair:hover {
  cursor: crosshair;
}

.recent_images {
  min-height: 65px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  flex-direction: row;
}
.recent_image {
  height: 60px;
  margin: 5px;
  margin-left: 0;
  cursor: pointer;
  flex: 0 0 auto;
}
.selected_thumbnail {
  border: 3px solid rgb(241, 183, 36);
}
</style>