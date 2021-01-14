<template>
  <div id="component" v-on:keyup.right="setNextImage" v-on:keyup.left="setPreviousImage" >
    <div id="image-window" ref="imagewindow">

      <!-- The main image view -->
      <div class="image-div" ref="image_div">

        <svg 
          id='image_svg' 
          ref="svgElement" 
          :class="{'crosshair-cursor': activeDrawShape!='none'}" 
          v-show="!js9IsVisible"
          viewbox="50 0 100 100"
          v-on:keyup.delete="foo"
          >
          </svg>
      <svg-context-menu />


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
            v-bind:key="index"
        >
          <img 
              style="width: 60px; height: 60px;"
              v-bind:src="item.jpg_url"
              onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
              v-bind:title="item.base_filename"
              v-bind:class="{'selected_thumbnail' : item.image_id == current_image.image_id}"
              @click="setActiveImage(item)"
          >
          <!--p style="padding-left: 5px;">{{item.filename.slice(-13)}}</p-->
        </div>
          
      </div>

      <!-- Controls in the top row above the main view --> 
      <div class="controls">

        <b-field grouped>
          <b-field>
            <button class="button" @click="toggleAnalysis">JS9</button>
          </b-field>
          <b-field>
            <p class="control">
              <b-tooltip label="latest image" position="is-right" type="is-black">
              <button class="button level-item" @click="setLatestImage">
              <b-icon icon="chevron-double-left"/></button>
              </b-tooltip>
            </p>
            <p class="control">
              <b-tooltip label="previous image" position="is-right" type="is-black">
                <button class="button level-item" 
                  @click="$store.dispatch('images/set_previous_image')">
                  <b-icon icon="chevron-left" />
                </button>
              </b-tooltip>
            </p>
            <p class="control">
              <b-tooltip label="next image" position="is-right" type="is-black">
                <button class="button level-item" 
                  @click="$store.dispatch('images/set_next_image')">
                  <b-icon icon="chevron-right" />
                </button>
              </b-tooltip>
            </p>
          </b-field>

        </b-field>


        <div> <b-field label="subframe">
              <b-switch type="is-info" v-model="subframeIsActive"></b-switch>
          </b-field> </div>
        <!---div> <b-field label="subframe visible">
              <b-switch type="is-info" v-model="subframeIsVisible"></b-switch>
          </b-field> </div-->
        <div> <b-field label="crosshairs">
              <b-switch type="is-info" v-model="show_crosshairs" v-on:input="drawCrosshairs"></b-switch>
          </b-field> </div>

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
import JS9 from "@/components/JS9";
import * as d3 from "d3";

import { Point, Line, Rect, Circle, Starmarker }from "@/utils/drawshapes"


import SvgCircle from "@/components/ImageView/SvgCircle"
import SvgContextMenu from "@/components/SvgContextMenu"

export default {
  name: "ImageView",
  components: {
    JS9,
    SvgCircle,
    SvgContextMenu,
  },
  mixins: [commands_mixin],
  props: {
    site: String,

    marked_stars: Array,
  },

  data() {
    return {
      placeholder_image: require('@/assets/logo.png'),
      // The image that is selected and visible in the main viewer.
      active_image: "",

      image_element: "#image_svg",

      // Width of image in UI
      imageWidth: 0,
      imageHeight: 0,

      // Mouse position, in px, on the image window
      mouseX: 0,
      mouseY: 0,


      // The subframe rectangle svg element
      subframeSVG: '',
      // Toggles whether the subframe is visible or not
      subframeIsVisible:true,
      // Defines when the user is dragging the mouse (for drawing the rectangle)
      mouseIsDown: false,

      // This is modified by the crosshairs switch and controls whether the crosshairs are visible.
      show_crosshairs: false,
      crosshair_color: "#32cd32",

      // Timer (setTimeout object) to clear the right click marker after a few seconds.
      context_marker_timer: "",

      // Time that right click events stay on the screen.
      right_click_ttl: 9000,

      //Image ID of the currently highlighted image (focused)
      highlighted_image: 0,

      js9width: 200,
      js9height: 500,



      /*** experimenting ***/
      svg: '',
      drawPoints: '',
      drawLines: '',
      drawCircles: '',
      drawRects: '',



      /*** end experimenting ***/

    };
  },

  created() {
    this.$store.commit("site_config/setActiveSite", this.site);
    this.$store.dispatch("images/load_latest_images");
  },

  mounted() {
    this.newInit()

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
      this.$store.commit("site_config/setActiveSite", newVal);
      this.$store.dispatch("images/load_latest_images");
    },

    // Toggle whether the subframe box is displayed or not
    subframeIsVisible: function(newVal, oldVal) {
      if (newVal) {
        this.subframeSVG
          .style("display","block")
          .attr("class","image-div-pointer-cross")
      }
      else {
        this.subframeSVG
          .style("display", "none")
      }
    },

    current_image: function(newVal, oldVal) {
      // If we're in the js9 window mode, keep the image updated with the 
      // selected thumbnail.
      if (this.js9IsVisible) {
        this.js9LoadImage(newVal)
      }
    },

    shapes: {
      handler: function(a) {
        console.log('lines changed: ', a)
        this.updateAll()
      },
      deep: true,
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
    },
    marked_stars() {
      this.drawStarmarkers.updateData(this.marked_stars)
      this.drawStarmarkers.draw()
    }

  },


  methods: {

    updateAll() {
      this.drawBackground()
      this.drawPoints.draw()
      this.drawLines.draw()
      this.drawRects.draw()
      this.drawCircles.draw()
      this.drawStarmarkers.draw()

      //this.draw_star_markers()
      this.drawSubframe()

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
          width: width, // adjust for 15px padding
          height: width,
        }
        this.$store.dispatch('js9/resizeDisplay', resize_opts)
      }

      // This is fed to js9 just before displaying to set the matching size. 
      this.js9width=parseInt(width)
      this.js9height=parseInt(height)

      this.drawCrosshairs()

    },

    newInit() {
      this.svg = d3.select('#image_svg')

      this.svg.append('rect')
        .attr('width', this.imageWidth)
        .attr('height', this.imageHeight)
        .attr('fill', 'blue')

      this.drawPoints = new Point(this.svg, this.points, this.imageWidth, this.imageHeight)
      this.drawLines = new Line(this.svg, this.lines, this.imageWidth, this.imageHeight)
      this.drawRects = new Rect(this.svg, this.rects, this.imageWidth, this.imageHeight)
      this.drawCircles = new Circle(this.svg, this.circles, this.imageWidth, this.imageHeight)
      this.drawStarmarkers = new Starmarker(this.svg, this.marked_stars, this.imageWidth, this.imageHeight)

      this.init()
      this.updateAll()

    },

    drawBackground() {

      this.svg.selectAll('.svg-background')
        .data([this.imageWidth, this.imageHeight])
        .join('rect')
          .attr('class', 'svg-background')
          .attr('width', this.imageWidth)
          .attr('height', this.imageHeight)
          .attr('fill', 'transparent')
          .on('click', () => {
            console.log('clicked the blue background')
            this.$store.commit('drawshapes/selectedId', 'none')
          })
    },

    init() {




      // Initialize subframe rectangle
      const rect1 = [{"x":0, "y":0}]
      //d3.select(this.image_element)
        //.selectAll("subframeBox")
        //.data(rect1)
        //.join("rect")
          //.attr("id", "subframeSVG")
          //.attr("x", d => d.x)
          //.attr("y", d => d.y)
          //.attr("width", 0)
          //.attr("height", 0)
          //.style("display","none")
          //.style("stroke", "red")
          //.style("stroke-width", 1)
          //.style("fill", "none")
          //.style("cursor", "crosshair")

      this.subframeSVG = d3.select("#subframeSVG")

      // Event actions to perform on the image window element
      this.svg
        .on("mousedown", this.handleMouseDown) 
        .on("mouseup", this.handleMouseUp)
        //.on("contextmenu", this.handleContextMenu)
    }, 

    handleContextMenu(data, index) {
      let position = d3.mouse(this.svg.node());
      this.draw_marker(position[0], position[1]);
      Snackbar.open({
        duration: this.right_click_ttl,
        message:
          //"Center telescope here? <br>Note: <em>telescope will move to the location you clicked.</em>.",
          "Click to center the telescope here.",
        type: "is-warning",
        position: "is-top",
        actionText: "Center on pixels",
        queue: false,
        onAction: () => {
          console.log("slew to " + position[0]/ this.imageWidth + ", " + position[1]/ this.imageHeight);
          this.send_pixels_center_command(
            position[0],
            position[1],
            this.current_image.base_filename
          );
        }
      });
      // Don't open the usual right-click menu
      d3.event.preventDefault();
    },

    newPointMouseMove() {
      let mouse = d3.mouse(this.svg.node())
      let newPoint = this.points[this.points.length - 1]
      this.selectedId = newPoint.id
      newPoint.x = mouse[0] / this.imageWidth
      newPoint.y = mouse[1] / this.imageHeight
    },
    newLineMouseMove() {
      let mouse = d3.mouse(this.svg.node())
      let newLine = this.lines[this.lines.length - 1]
      this.selectedId = newLine.id
      newLine.x2 = mouse[0] / this.imageWidth
      newLine.y2 = mouse[1] / this.imageHeight
    },
    newRectMouseMove() {
      let mouse = d3.mouse(this.svg.node())
      let newRect = this.rects[this.rects.length - 1]
      this.selectedId = newRect.id
      newRect.x2 = mouse[0] / this.imageWidth
      newRect.y2 = mouse[1] / this.imageHeight
    },
    newCircleMouseMove() {
      let mouse = d3.mouse(this.svg.node())
      let newCircle = this.circles[this.circles.length - 1]
      this.selectedId = newCircle.id
      newCircle.rx = (mouse[0] / this.imageWidth) - newCircle.x
      newCircle.ry = (mouse[1] / this.imageHeight) - newCircle.y
    },

    handleMouseDown() {
      d3.event.preventDefault();

      //this.svg
        //.on("mousemove", this.handleMouseMove)

      let mClick = d3.mouse(this.svg.node())
      let mouse = d3.mouse(this.svg.node())

      // Calculate image dimensions
      let bounds = this.svg.node().getBoundingClientRect()
      let imageWidth = bounds.width
      let imageHeight = bounds.height


      if (this.activeDrawShape == 'line') {
        this.$store.commit('drawshapes/addLine', {
          x1: mouse[0] / imageWidth,
          y1: mouse[1] / imageHeight,
          x2: mouse[0] / imageWidth,
          y2: mouse[1] / imageHeight,
          color: 'gold',
          show: true,
        })
        this.svg.on("mousemove", this.newLineMouseMove)
      }

      else if (this.activeDrawShape == 'rect') {
        this.$store.commit('drawshapes/addRect', {
          x1: mouse[0] / imageWidth,
          y1: mouse[1] / imageHeight,
          x2: mouse[0] / imageWidth,
          y2: mouse[1] / imageHeight,
          color: 'gold',
          show: true,
        })
        this.svg.on("mousemove", this.newRectMouseMove)
      }

      else if ( this.activeDrawShape == 'point') {
        this.$store.commit('drawshapes/addPoint', {
          x: mouse[0] / imageWidth,
          y: mouse[1] / imageHeight,
          color: 'gold', 
          show: true,
        })
        this.svg.on("mousemove", this.newPointMouseMove)
      }

      else if (this.activeDrawShape == 'circle') {
        this.$store.commit('drawshapes/addCircle', {
          x: mouse[0] / imageWidth,
          y: mouse[1] / imageHeight,
          rx: 0,
          ry: 0,
          color: 'gold', 
          show: true,
        })
        this.svg.on("mousemove", this.newCircleMouseMove)

      }




      // start drawing a subframe box if subframe mode is active.
      if (this.subframeIsVisible) {

        // Make it visible
        this.subframeSVG
          .style("display","block")
          .attr("class","image-div-pointer-cross")

        this.mouseIsDown = true;
        this.subframe_x0 = mClick[0] / imageWidth
        this.subframe_y0 = mClick[1] / imageHeight
        this.subframe_x1 = mClick[0] / imageWidth
        this.subframe_y1 = mClick[1] / imageHeight
        this.drawSubframe()
      }
    },

    handleMouseMove() {
      // coordinates of current mouse position
      let mDrag = d3.mouse(this.svg.node())

      // Calculate image dimensions
      let bounds = this.svg.node().getBoundingClientRect()
      let imageWidth = bounds.width
      let imageHeight = bounds.height

      // log the current mouse coordinates
      this.mouseX = mDrag[0]
      this.mouseY = mDrag[1]

      if (this.drawActiveShape == 'line') {
        let currentLine = this.lines[this.lines.length - 1]
        currentLine.x2 = this.mouseX / imageWidth
        currentLine.y2 = this.mouseY / imageHeight
      }

      // if subframe mode is active, and the mouse is dragging, 
      // save the current coordinates and draw them as a rectangle.
      if (this.subframeIsVisible && this.mouseIsDown) {
        this.subframe_x1 = mDrag[0] /imageWidth
        this.subframe_y1 = mDrag[1] /imageHeight


        this.drawSubframe()
      }
    },

    handleMouseUp(context) {

      // We don't want every click to draw a shape. Users need to select what
      // they want drawn each time. 
      this.activeDrawShape = 'none'

      this.svg
        .on("mousemove", null)

      this.mouseIsDown = false;
      let mouse = d3.mouse(this.svg.node())
      if(this.subframeIsVisible) {
        this.subframeDefinedWithFile = this.current_image.base_filename
      }
      this.drawSubframe()
    },

    // Subframe stuff
    drawSubframe() {
      let minX = this.imageWidth * Math.min(this.subframe_x0, this.subframe_x1) 
      let minY = this.imageHeight * Math.min(this.subframe_y0, this.subframe_y1) 
      let width = this.imageWidth * Math.abs(this.subframe_x0 - this.subframe_x1)
      let height = this.imageHeight * Math.abs(this.subframe_y0 - this.subframe_y1) 
      d3.select("#subframeSVG")
        .attr("x", minX)
        .attr("y", minY)
        .attr("width",width)
        .attr("height", height)

    },

    send_pixels_center_command(x, y, filename) {

      let command_form = [
        String(x / this.imageWidth),

        // Change the y coordinate to start at the bottom. 
        String((this.imageHeight - y ) / this.imageHeight),
        filename
      ]

      this.postCommand(this.mount_slew_clickposition_command, command_form)

    },


    draw_marker(pixelX, pixelY) {
      // Make sure a previous timer doesn't wipe our current right-click marker
      clearTimeout(this.context_marker_timer);

      // Remove any other right click markers on the screen.
      this.remove_context_marker();

      // Draw a small cross where user clicks.
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "context-marker")
        .attr("x1", pixelX - 7)
        .attr("y1", pixelY)
        .attr("x2", pixelX + 7)
        .attr("y2", pixelY)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "context-marker")
        .attr("x1", pixelX)
        .attr("y1", pixelY - 7)
        .attr("x2", pixelX)
        .attr("y2", pixelY + 7)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .style("fill", "none");

      // Set a timer to clear the marker in a few seconds.
      this.context_marker_timer = setTimeout(
        this.remove_context_marker,
        this.right_click_ttl
      );
    },
    remove_context_marker() {
      d3
        .select(this.image_element)
        .selectAll(".context-marker")
        .remove();
    },

    drawCrosshairs() {
      console.log("toggle crosshairs");

      let elem = this.image_element;

      d3.select(elem)
        .selectAll(".crosshairs")
        .remove();

      if (this.show_crosshairs) {
        d3.select(elem)
          .append("line")
            .attr("class", "crosshairs")
            .attr("x1", this.imageWidth / 2)
            .attr("y1", 0)
            .attr("x2", this.imageWidth / 2)
            .attr("y2", this.imageHeight)
            .attr("id", "crosshair_vertical")
            .attr("stroke-width", 2)
            .attr("stroke", this.crosshair_color);
        d3
          .select(elem)
          .append("line")
            .attr("class", "crosshairs")
            .attr("y1", this.imageHeight / 2)
            .attr("x1", 0)
            .attr("y2", this.imageHeight / 2)
            .attr("x2", this.imageWidth)
            .attr("id", "crosshair_horizontal")
            .attr("stroke-width", 2)
            .attr("stroke", this.crosshair_color);
      }
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

  },
  computed: {

    sitecode() {
      return this.site;
    },

    active_site: {
      get() {
        return this.$store.getters["site_config/site"];
      },
      set(value) {
        this.$store.commit("site_config/setActiveSite", value);
      }
    },


    ...mapGetters("images", [
      "recent_images",
      "current_image",
    ]),


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


    ...mapState('drawshapes', ['shapes', 'lines', 'rects', 'circles', 'points', 'starmarkers']),
    selectedId: {
      get() { return this.$store.getters['drawshapes/selectedId']},
      set(val) { this.$store.commit('drawshapes/selectedId', val)}
    },
    activeDrawShape: {
      get() { return this.$store.getters['drawshapes/activeDrawShape']},
      set(val) { this.$store.commit('drawshapes/activeDrawShape', val)}

    }

  }
};
</script>

<style scoped>
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

.crosshair-cursor:hover {
  cursor:crosshair;
}

.recent_images {
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