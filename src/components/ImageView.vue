<template>
    <div id="component" >
      <div id="image-window" v-if="!this.analyze">

    <div class="controls level is-mobile">
      <div class="level-left left-controls">
        <button class="button" @click="toggleAnalysis">
          <b-icon icon="tune"></b-icon>
        </button>
        <button class="button" @click="setLatestImage">latest</button>
        

        <button class="button" @click="setPreviousImage"><b-icon icon="arrow-left-bold" /></button>
        <button class="button" @click="setNextImage"><b-icon icon="arrow-right-bold" /></button>

        <b-tooltip label="download fits file" position="is-right" type="is-black">
          <button class="button" :href="current_image.fits13_url"><b-icon icon="cloud-download" /></button>
        </b-tooltip>
        <!--div @click="setPreviousImage" class="arrow left"></div-->
        <!--div @click="setNextImage" class="arrow right"></div-->
      </div>

      <div class="level-right right-controls">
        <div class="level-item">
        <b-field horizontal label="crosshairs">
            <b-switch type="is-info" v-model="show_crosshairs" v-on:input="toggleCrosshairs"></b-switch>
        </b-field>
        </div>
      </div>

    </div>

    <div class="image-div">

        <svg id='image_svg' ref="svgElement">
            <!-- NOTE: image width and heigh must be set explicitly to work in firefox -->
            <!-- These values are changed programatically to work with dynamic window sizes. -->
            <image height="1px" width="1px" ref="image" :href="current_image.jpg13_url"></image>
        </svg>

        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <p>mouseX: {{parseInt(mouseX)}}, mouseY: {{parseInt(mouseY)}}</p>
            <p> {{current_image.base_filename}} </p>
        </div>
    </div>


    <!--div class="column is-narrow recent_images"-->
    <div class="recent_images">
       
        <div 
            class="recent_image" 
            style="display: flex;"
            v-for="(item, index) in recent_images" 
            v-bind:key="index"
        >
            <img 
                style="width: 60px; height: 60px;"
                v-bind:src="item.jpg13_url"
                v-bind:title="item.base_filename"
                v-bind:class="{'selected_thumbnail' : item.image_id == current_image.image_id}"
                @click="setActiveImage(item)"

            >
            <!--p style="padding-left: 5px;">{{item.filename.slice(-13)}}</p-->
        </div>
          
        </div>
      </div>

      <div id="js9-window" v-if="this.analyze">

        <div class="controls">
            <button class="button" @click="toggleAnalysis">EXIT</button>
            <div @click="setPreviousImage" class="arrow left"></div>
            <div @click="setNextImage" class="arrow right"></div>
        </div>

        <div class="image-div">

            <div id="svg_container"></div>
            <JS9/>
            <div style="display: flex; justify-content: space-between;">
                <p>mouseX: {{parseInt(mouseX)}}, mouseY: {{parseInt(mouseY)}}</p>
                <p> {{current_image.base_filename}} </p>
            </div>
        </div>


        <!--div class="column is-narrow recent_images"-->
        <div class="recent_images">
          
            <div 
                class="recent_image" 
                style="display: flex;"
                v-for="(item, index) in recent_images" 
                v-bind:key="index"
            >
                <img 
                    style="width: 60px; height: 60px;"
                    v-bind:src="item.jpg13_url"
                    v-bind:title="item.base_filename"
                    v-bind:class="{'selected_thumbnail' : item.image_id == current_image.image_id}"
                    @click="setActiveImage(item)"

                >
                <!--p style="padding-left: 5px;">{{item.filename.slice(-13)}}</p-->
            </div>
              
        </div>
    </div>
    </div>
    
</template>

<script>
import { API, Auth } from "aws-amplify";
import wcs from "@/utils/pix2wcs";
import { mapGetters } from "vuex";
import * as d3 from "d3";
import { commands_mixin } from "../mixins/commands_mixin";
import { SnackbarProgrammatic as Snackbar } from "buefy";
import JS9 from "@/components/JS9";

export default {
  name: "ImageView",
  components: {
    JS9
  },
  mixins: [commands_mixin],
  props: {
    site: String
  },
  data() {
    return {
      // The image that is selected and visible in the main viewer.
      active_image: "",

      image_length: 768,
      image_element: "#image_svg",

      // Width of image in UI
      imageWidth: 0,
      imageHeight: 0,

      mouseX: 0,
      mouseY: 0,

      mouseRa: 0,
      mouseDec: 0,

      analyze: false,

      // This is modified by the crosshairs switch and controls whether the crosshairs are visible.
      show_crosshairs: false,

      // Timer (setTimeout object) to clear the right click marker after a few seconds.
      context_marker_timer: "",

      // Time that right click events stay on the screen.
      right_click_ttl: 5000,

      //Image ID of the currently highlighted image (focused)
      highlighted_image: 0,

      // Runs a function at a regular interval to update the size of the image component.
      syncImageSize: '',
      syncImageInterval: 1000,
    };
  },
  created() {
    console.log("ImageView site prop: " + this.site);
    this.$store.commit("observatory_configuration/setActiveSite", this.site);
    this.$store.dispatch("images/refresh_latest_images");

    // Keep the displayed image element width and height in sync.
    // This is important for relative measurements on the image (crosshairs, clicks, etc)
    this.syncImageSize = setInterval(this.get_image_element_dimensions, this.syncImageInterval);
  },

  
  beforeDestroy() {
    // We don't need to keep the image dimensions in sync if it's not displayed.
    clearInterval(this.syncImageSize)
  },

  watch: {
    site: function(newVal, oldVal) {
      this.$store.commit("observatory_configuration/setActiveSite", newVal);
      this.$store.dispatch("images/refresh_latest_images");
    }
  },

  mounted() {
    let that = this;
    d3
      .select(this.image_element)

      // Track mouse coordinates
      .on("mouseover", function(d, i) {
        d3.select(this).on("mousemove", function(d, i) {
          let coords = d3.mouse(this);
          that.mouseX = coords[0];
          that.mouseY = coords[1];
        });
      })

      // Respond to right clicks
      .on("contextmenu", function(data, index) {
        let position = d3.mouse(this);
        console.log("right click!");
        that.draw_marker(position[0], position[1]);
        Snackbar.open({
          duration: that.right_click_ttl,
          message:
            "Center telescope here? <br>Note: <em>telescope will move and take another exposure.</em>.",
          type: "is-warning",
          position: "is-bottom-left",
          actionText: "Slew",
          queue: false,
          onAction: () => {
            console.log("slew to " + position[0]/that.imageWidth + ", " + position[1]/that.imageHeight);
            that.send_pixels_center_command(
              position,
              that.current_image.base_filename
            );
          }
        });

        // Don't open the usual right-click menu
        d3.event.preventDefault();
      });
  },

  methods: {

    get_image_element_dimensions() {
      // WARNING: this may have bugs if image is not a square.
      // See the final line of this function (imageEl.setAtt...).
      let imageRect = this.$refs.image.getBoundingClientRect();
      this.imageWidth = imageRect.width
      this.imageHeight = imageRect.height

      let svgRect = this.$refs.svgElement.getBoundingClientRect();
      let imageEl = this.$refs.image
      imageEl.setAttribute("width", svgRect.width)
      imageEl.setAttribute("height", svgRect.width)
    },

    send_pixels_center_command(pixels, filename) {

      let req_params = {
        //x_from_left: pixels[0],
        //y_from_top: pixels[1],
        rel_x_pos: pixels[0]/this.imageWidth,
        rel_y_pos: pixels[1]/this.imageHeight,
        filename: filename
      };
      let opt_params = {};
      let theCommand = {
          url: `/${this.active_site}/${this.active_mount}/command/`,
          http_method: 'POST',
          form: {
              device:"mount",
              instance: this.active_mount,
              timestamp: parseInt(Date.now() / 1000),
              action: "center_on_pixels",
              required_params: req_params,
              optional_params: opt_params,
          }
      }
      // Old code
      //let basecommand = this.base_command(
        //"mount",
        //"center_on_pixels",
        //"center_on_pixels",
        //req_params,
        //opt_params
      //);
      let apiName = this.$store.getters["dev/api"];
      let url = theCommand.url;
      let body = { body: theCommand.form };
      API.post(apiName, url, body)
        .then(response => {
          console.log("sent pixel center command");
          console.log(response);
          console.log(theCommand.form);
        })
        .catch(error => {
          console.log("error with pixel centercommand");
          console.log(error);
        });
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

    toggleCrosshairs() {
      console.log("toggle crosshairs");

      let elem = this.image_element;

      if (this.show_crosshairs) {
        d3
          .select(elem)
          .append("line")
          .attr("x1", this.imageWidth / 2)
          .attr("y1", 0)
          .attr("x2", this.imageWidth / 2)
          .attr("y2", this.imageHeight)
          .attr("id", "crosshair_vertical")
          .attr("stroke", "red");
        d3
          .select(elem)
          .append("line")
          .attr("y1", this.imageHeight / 2)
          .attr("x1", 0)
          .attr("y2", this.imageHeight / 2)
          .attr("x2", this.imageWidth )
          .attr("id", "crosshair_horizontal")
          .attr("stroke", "red");
      } else {
        d3
          .select(elem)
          .selectAll("line")
          .remove();
      }
    },

    // Activated by clicking on an image thumbnail. Displays that image
    // in the main view.
    setActiveImage(image) {
      this.$store.dispatch("images/set_current_image", image);
      console.log(`This is a test ${image.image_id}`);
    },

    // Display the latest image in the view.
    setLatestImage() {
      this.$store.dispatch("images/refresh_latest_images");
      this.$store.dispatch("images/set_latest_image");
    },

    toggleAnalysis() {
      if (this.analyze) {
        this.analyze = false;
      } else {
        this.analyze = true;
      }
    },

    setNextImage() {
      this.$store.dispatch("images/set_next_image");
    },

    setPreviousImage() {
      this.$store.dispatch("images/set_previous_image");
    }
  },
  computed: {
    active_site: {
      get() {
        return this.$store.getters["observatory_configuration/site"];
      },
      set(value) {
        this.$store.commit("observatory_configuration/setActiveSite", value);
      }
    },

    ...mapGetters("images", {
      recent_images: "recent_images",
      current_image: "current_image"
    })
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
#image-window {
  border-radius: 5px;
  display: block;
  padding: 15px;
  background-color:  rgba(52, 60, 61, 0.733)
}
#js9-window {
  border-radius: 25px;
  display: block;
  padding: 10px;
  background-color: rgba(233, 95, 77, 0.582);
}
.controls {
  margin: 0 auto;
  max-width: 768px;
  margin-top: 1em;
  overflow-x:auto;
}
.left-controls > * {
  margin-right: 5px;
}
.right-controls > * {
  margin-left: 5px;
}

.image-div {
  padding-bottom: 1em;
}
#image_svg {
  width:100%;
  max-width: 768px;
  height:1px;
  margin-bottom: 100%;
  overflow:visible;
}
#image_svg image {
  width:inherit;
  height:auto;
}

.recent_images {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  flex-direction: row;
  border-top: 1px solid white;
  padding-top: 2em;
  padding-bottom: 2em;
}
.recent_image {
  height: 60px;
  margin: 5px;
  margin-left: 0;
  cursor: pointer;
  flex: 0 0 auto;
}
.selected_thumbnail {
  border: 2px solid gold;
}

</style>