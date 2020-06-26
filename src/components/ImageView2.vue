<template>
  <div id="component" v-on:keyup.right="setNextImage" v-on:keyup.left="setPreviousImage" >
    <div id="image-window" ref="imagewindow">

      <!-- The main image view -->
      <div class="image-div" ref="image_div">

        <svg 
          id='image_svg' 
          ref="svgElement" 
          :class="{'image-div-pointer-cross':subframeIsVisible}" 
          v-show="!js9IsVisible"/>

        <img
          id="main-image"
          ref="image" 
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
              v-bind:title="item.base_filename"
              v-bind:class="{'selected_thumbnail' : item.image_id == current_image.image_id}"
              @click="setActiveImage(item)"
          >
          <!--p style="padding-left: 5px;">{{item.filename.slice(-13)}}</p-->
        </div>
          
      </div>

      <!-- Controls in the top row above the main view --> 
      <div class="controls">

          <button class="button" @click="toggleAnalysis">JS9</button>
          <b-field>
            <p class="control">
              <b-tooltip label="latest image" position="is-bottom" type="is-black">
              <button class="button level-item" @click="setLatestImage">
              <b-icon icon="chevron-double-left"/></button>
              </b-tooltip>
            </p>
            <p class="control">
              <b-tooltip label="previous image" position="is-bottom" type="is-black">
              <button class="button level-item" @click="setPreviousImage">
              <b-icon icon="chevron-left" /></button>
              </b-tooltip>
            </p>
            <p class="control">
              <b-tooltip label="next image" position="is-bottom" type="is-black">
              <button class="button level-item" @click="setNextImage">
              <b-icon icon="chevron-right" /></button>
              </b-tooltip>
            </p>
          </b-field>
          <b-tooltip label="download fits file" position="is-right" type="is-black">
            <a class="button has-text-white" @click="downloadFits13Url(current_image)">
              <b-icon icon="cloud-download" /></a>
          </b-tooltip>


          <div> <b-field label="subframe active">
                <b-switch type="is-info" v-model="subframeIsActive"></b-switch>
            </b-field> </div>
          <!---div> <b-field label="subframe visible">
                <b-switch type="is-info" v-model="subframeIsVisible"></b-switch>
            </b-field> </div-->
          <div> <b-field label="crosshairs">
                <b-switch type="is-info" v-model="show_crosshairs" v-on:input="toggleCrosshairs"></b-switch>
            </b-field> </div>

      </div>

    </div>
  </div>
</template>

<script>
//import { API, Auth } from "aws-amplify";
import axios from 'axios';
import wcs from "@/utils/pix2wcs";
import { mapGetters } from "vuex";
import { commands_mixin } from "../mixins/commands_mixin";
import { SnackbarProgrammatic as Snackbar } from "buefy";
import JS9 from "@/components/JS9";
import * as d3 from "d3";

export default {
  name: "ImageView2",
  components: {
    JS9
  },
  mixins: [commands_mixin],
  props: {
    site: String,

    // median brightness star display
    median_star_pos_x: Number,
    median_star_pos_y: Number,
    median_plot_color: String,

    // brightest saturated star display
    brightest_star_pos_x: Number,
    brightest_star_pos_y: Number,
    brightest_plot_color: String,

    // brightest unsaturated star display
    u_brightest_star_pos_x: Number,
    u_brightest_star_pos_y: Number,
    u_brightest_plot_color: String,
  },
  data() {
    return {
      // The image that is selected and visible in the main viewer.
      active_image: "",

      image_element: "#image_svg",
      d3_image_element: '', // the d3 selection of this.image_element

      // Width of image in UI
      imageWidth: 1,
      imageHeight: 1,

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
      right_click_ttl: 5000,

      //Image ID of the currently highlighted image (focused)
      highlighted_image: 0,

      // Runs a function at a regular interval to update the size of the image component.
      syncImageSize: '',
      syncImageInterval: 1000,

      js9width: 200,
      js9height: 500
    };
  },
  created() {
    this.$store.commit("site_config/setActiveSite", this.site);
    this.$store.dispatch("images/refresh_latest_images");

    // Keep the displayed image element width and height in sync.
    // This is important for relative measurements on the image (crosshairs, clicks, etc)
    this.syncImageSize = setInterval(
      this.get_image_element_dimensions,
      this.syncImageInterval
    );
  },

  beforeDestroy() {
    // We don't need to keep the image dimensions in sync if it's not displayed.
    clearInterval(this.syncImageSize);
  },

  watch: {
    site: function(newVal, oldVal) {
      this.$store.commit("site_config/setActiveSite", newVal);
      this.$store.dispatch("images/refresh_latest_images");
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
      this.remove_star_markers()
    },

    median_star_pos_x: function() {
      this.draw_star_markers()
    },
    median_star_pos_y: function() {
      this.draw_star_markers()
    },

  },

  mounted() {
    this.init()

    this.init()
  },

  methods: {


    init() {

      this.d3_image_element = d3.select(this.image_element)


      let that = this;

      // Initialize subframe rectangle
      const rect1 = [{"x":0, "y":0}]
      d3.select(this.image_element)
        .selectAll("subframeBox")
        .data(rect1)
        .join("rect")
          .attr("id", "subframeSVG")
          .attr("x", d => d.x)
          .attr("y", d => d.y)
          .attr("width", 0)
          .attr("height", 0)
          .style("display","none")
          .style("stroke", "red")
          .style("stroke-width", 1)
          .style("fill", "none")
          .style("cursor", "crosshair")

      this.subframeSVG = d3.select("#subframeSVG")

      // Event actions to perform on the image window element
      this.d3_image_element
        .on("mousedown", this.handleMouseDown) 
        .on("mousemove", this.handleMouseMove)
        .on("mouseup", this.handleMouseUp)
        .on("contextmenu", this.handleContextMenu)
    }, 

    handleContextMenu(data, index) {
      let position = d3.mouse(this.d3_image_element.node());
      this.draw_marker(position[0], position[1]);
      Snackbar.open({
        duration: this.right_click_ttl,
        message:
          "Center telescope here? <br>Note: <em>telescope will move and take another exposure.</em>.",
        type: "is-warning",
        position: "is-bottom-left",
        actionText: "Slew",
        queue: false,
        onAction: () => {
          console.log("slew to " + position[0]/ this.imageWidth + ", " + position[1]/ this.imageHeight);
          this.send_pixels_center_command(
            position,
            this.current_image.base_filename
          );
        }
      });
      // Don't open the usual right-click menu
      d3.event.preventDefault();
    },

    handleMouseDown() {
      d3.event.preventDefault();

      let mClick = d3.mouse(this.d3_image_element.node())

      // Calculate image dimensions
      let bounds = this.d3_image_element.node().getBoundingClientRect()
      let imageWidth = bounds.width
      let imageHeight = bounds.height


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
      let mDrag = d3.mouse(this.d3_image_element.node())

      // Calculate image dimensions
      let bounds = this.d3_image_element.node().getBoundingClientRect()
      let imageWidth = bounds.width
      let imageHeight = bounds.height

      // log the current mouse coordinates
      this.mouseX = mDrag[0]
      this.mouseY = mDrag[1]

      // if subframe mode is active, and the mouse is dragging, 
      // save the current coordinates and draw them as a rectangle.
      if (this.subframeIsVisible && this.mouseIsDown) {
        this.subframe_x1 = mDrag[0] /imageWidth
        this.subframe_y1 = mDrag[1] /imageWidth


        this.drawSubframe()
      }
    },

    handleMouseUp(context) {
      this.mouseIsDown = false;
      let mouse = d3.mouse(this.d3_image_element.node())
      if(this.subframeIsVisible) {
        //that.subframeIsActive = true;
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

    // Resize the image element to fit the browser window
    get_image_element_dimensions() {


      let imageWindow = this.$refs.imagewindow.getBoundingClientRect();

      if (this.js9IsVisible) {
        let resize_opts = {
          id: "myJS9",
          width: imageWindow.width-30, // adjust for 15px padding
          height: imageWindow.width-30,
        }
        this.$store.dispatch('js9/resizeDisplay', resize_opts)
      } else {
        // Resize the image displayed
        let svgRect = this.$refs.svgElement.getBoundingClientRect();
        let imageEl = this.$refs.image

        // If nothing changed, we're done.
        if (this.js9width==svgRect.width && this.js9height==svgRect.height) {
          return;
        }
        // This is fed to js9 just before displaying to set the matching size. 
        this.js9width=svgRect.width
        this.js9height=svgRect.width

        imageEl.setAttribute("width", svgRect.width)
        imageEl.setAttribute("height", svgRect.height)
        // Resize the svg
        // WARNING: this may have bugs if image is not a square.
        let imageRect = this.$refs.image.getBoundingClientRect();
        this.imageWidth = imageRect.width
        this.imageHeight = imageRect.height
      }
      
      this.draw_star_markers()
      this.drawSubframe()
    },

    send_pixels_center_command(pixels, filename) {
      let req_params = {
        //x_from_left: pixels[0],
        //y_from_top: pixels[1],
        rel_x_pos: pixels[0] / this.imageWidth,
        rel_y_pos: pixels[1] / this.imageHeight,
        filename: filename
      };
      let opt_params = {};
      let theCommand = {
        url: `/${this.active_site}/${this.active_mount}/command/`,
        http_method: "POST",
        form: {
          device: "mount",
          instance: this.active_mount,
          timestamp: parseInt(Date.now() / 1000),
          action: "center_on_pixels",
          required_params: req_params,
          optional_params: opt_params
        }
      };
      let apiName = this.$store.getters["dev/api"];
      let url = theCommand.url;
      let body = { body: theCommand.form };
      axios.post(apiName+url, body)
        .then(response => {
          console.log("sent pixel center command");
          console.log(response.data);
          console.log(theCommand.form);
        })
        .catch(error => {
          console.log("error with pixel centercommand");
          console.log(error);
        });
    },

    drawCircle(pixelX, pixelY) {
      // Remove any other right click markers on the screen.
      this.removeCircle();

      // Draw a small cross where user clicks.
      d3
        .select(this.image_element)
        .append("circle")
        .attr("class", "circle-cursor")
        .attr("cx", pixelX)
        .attr("cy", pixelY)
        .attr("r", "8px")
        .attr("stroke", "red")
        .attr("stroke-width", 1)
        .style("fill", "none");
    },
    removeCircle() {
      d3
        .select(this.image_element)
        .selectAll(".circle-cursor")
        .remove();
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

    // The star inspector (see SiteData component) will calculate and plot
    // radial profiles for the max and median brightest stars detected in the
    // user-selected region. 
    //
    // This function also draws a marker on the actual image to indicate which 
    // stars are shown in the radial profile plots.
    draw_star_markers() {
      this.remove_star_markers()

      let med_x = this.median_star_pos_x * this.imageWidth
      let med_y = this.median_star_pos_y * this.imageWidth
      let ubri_x = this.u_brightest_star_pos_x * this.imageWidth
      let ubri_y = this.u_brightest_star_pos_y * this.imageWidth
      let bri_x = this.brightest_star_pos_x * this.imageWidth
      let bri_y = this.brightest_star_pos_y * this.imageWidth

      // Draw the crosshairs around the brightest unsaturated star
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", ubri_x - 15)
        .attr("y1", ubri_y)
        .attr("x2", ubri_x - 5)
        .attr("y2", ubri_y)
        .attr("stroke", this.median_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", ubri_x + 5)
        .attr("y1", ubri_y)
        .attr("x2", ubri_x + 15)
        .attr("y2", ubri_y)
        .attr("stroke", this.median_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", ubri_x)
        .attr("y1", ubri_y - 15)
        .attr("x2", ubri_x)
        .attr("y2", ubri_y - 5)
        .attr("stroke", this.median_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", ubri_x)
        .attr("y1", ubri_y + 5)
        .attr("x2", ubri_x)
        .attr("y2", ubri_y + 15)
        .attr("stroke", this.median_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
        
      // Draw crosshairs around the brightest selected star
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", bri_x - 15)
        .attr("y1", bri_y)
        .attr("x2", bri_x - 5)
        .attr("y2", bri_y)
        .attr("stroke", this.brightest_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", bri_x + 5)
        .attr("y1", bri_y)
        .attr("x2", bri_x + 15)
        .attr("y2", bri_y)
        .attr("stroke", this.brightest_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", bri_x)
        .attr("y1", bri_y - 15)
        .attr("x2", bri_x)
        .attr("y2", bri_y - 5)
        .attr("stroke", this.brightest_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3
        .select(this.image_element)
        .append("line")
        .attr("class", "star-marker")
        .attr("x1", bri_x)
        .attr("y1", bri_y + 5)
        .attr("x2", bri_x)
        .attr("y2", bri_y + 15)
        .attr("stroke", this.brightest_plot_color)
        .attr("stroke-width", 2)
        .style("fill", "none");
    },
    remove_star_markers() {
      d3
        .select(this.image_element)
        .selectAll(".star-marker")
        .remove();
    },

    toggleCrosshairs() {
      console.log("toggle crosshairs");

      let elem = this.image_element;

      if (this.show_crosshairs) {
        d3
          .select(elem)
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
      } else {
        d3
          .select(elem)
          .selectAll(".crosshairs")
          .remove();
      }
    },

    // Activated by clicking on an image thumbnail. Displays that image
    // in the main view.
    setActiveImage(image) {
      this.$store.dispatch("images/set_current_image", image);
    },

    // Display the latest image in the view.
    setLatestImage() {
      this.$store.dispatch("images/refresh_latest_images");
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

    setNextImage() {
      this.$store.dispatch("images/set_next_image");
    },

    setPreviousImage() {
      this.$store.dispatch("images/set_previous_image");
    },

    async getFits13Url(image) {
      console.log('Image download requested.')

      // Get image information for path construction
      let site = image.site
      let base_filename = image.base_filename

      // Get the global configuration for all sites from an api call.
      let apiName = this.$store.getters['dev/api'];
      let path = `/fits10_url/${base_filename}/`;

      const fits13Url = await axios.get(apiName+path);
      console.log(fits13Url)
      return fits13Url.data;
    },

    async downloadFits13Url(image) {
      let fits13url = await this.getFits13Url(image)
      window.location.assign(fits13url)
    },
    
  },
  computed: {
    active_site: {
      get() {
        return this.$store.getters["site_config/site"];
      },
      set(value) {
        this.$store.commit("site_config/setActiveSite", value);
      }
    },

    ...mapGetters("images", {
      recent_images: "recent_images",
      current_image: "current_image"
    }),

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
  overflow-y: visible;
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

.image-div-pointer-cross:hover {
  cursor:crosshair;
}
.image-div-no-cursor:hover {
  cursor:none;
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