<template>
    <div id="component" ><div id="component-1">

    <div class="controls">
        <button class="button" @click="setLatestImage">latest image</button>
        <div @click="setPreviousImage" class="arrow left"></div>
        <div @click="setNextImage" class="arrow right"></div>
        <b-field horizontal label="crosshairs">
            <b-switch type="is-info" v-model="show_crosshairs" v-on:input="toggleCrosshairs"></b-switch>
        </b-field>
    </div>

    <div class="image-div">

        <div id="svg_container"></div>
        <svg id='image_svg'>
            <image :href="current_image.jpg13_url" width="768" height="768"></image>
        </svg>

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
                v-bind:class="{'selected_thumbnail' : item.base_filename == current_image.base_filename}"
                @click="setActiveImage(item); setImageFocus(item.image_id);"

            >
            <!--p style="padding-left: 5px;">{{item.filename.slice(-13)}}</p-->
        </div>
          
    </div>
    </div></div>
</template>

<script>
import { API, Auth } from "aws-amplify";
import wcs from "@/utils/pix2wcs";
import { mapGetters } from "vuex";
import * as d3 from "d3";
import { commands_mixin } from "../mixins/commands_mixin";
import { SnackbarProgrammatic as Snackbar } from "buefy";
import { EventBus } from '../eventbus.js';

export default {
  name: "ImageView",
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

      mouseX: 0,
      mouseY: 0,

      mouseRa: 0,
      mouseDec: 0,

      // This is modified by the crosshairs switch and controls whether the crosshairs are visible.
      show_crosshairs: false,

      // Timer (setTimeout object) to clear the right click marker after a few seconds.
      context_marker_timer: "",

      // Time that right click events stay on the screen.
      right_click_ttl: 5000,

      //Image ID of the currently highlighted image (focused)
      highlighted_image: 0,
    };
  },
  created() {
    console.log("ImageView site prop: " + this.site);
    this.$store.commit("observatory_configuration/setActiveSite", this.site);
    this.$store.dispatch("images/refresh_latest_images");
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
            console.log("slew to " + position[0] + ", " + position[1]);
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
    send_pixels_center_command(pixels, filename) {
      let req_params = {
        x_from_left: pixels[0],
        y_from_top: pixels[1],
        filename: filename
      };
      let opt_params = {};
      let basecommand = this.base_command(
        "mount",
        "center_on_pixels",
        "center_on_pixels",
        req_params,
        opt_params
      );
      let apiName = this.$store.getters['dev/api'];
      let url = basecommand.url;
      let body = {
        body: basecommand.form
      };
      API.post(apiName, url, body)
        .then(response => {
          console.log("sent pixel center command");
          console.log(response);
          console.log(basecommand.form);
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
          .attr("x1", this.image_length / 2)
          .attr("y1", 0)
          .attr("x2", this.image_length / 2)
          .attr("y2", this.image_length)
          .attr("id", "crosshair_vertical")
          .attr("stroke", "red");
        d3
          .select(elem)
          .append("line")
          .attr("y1", this.image_length / 2)
          .attr("x1", 0)
          .attr("y2", this.image_length / 2)
          .attr("x2", this.image_length)
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
    },

    // Display the latest image in the view.
    setLatestImage() {
      this.$store.dispatch("images/refresh_latest_images");
      this.$store.dispatch("images/set_latest_image");
    },

    setNextImage() {
      this.$store.dispatch("images/set_next_image");
    },

    setPreviousImage() {
      this.$store.dispatch("images/set_previous_image");
    },

    setImageFocus(image_id) {
      this.highlighted_image = image_id;
      // Send the event on a channel (i-got-clicked) with a payload (the click count.)
      EventBus.$emit('i-got-clicked', this.highlighted_image);
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
.arrow {
  border: solid #4caf50;
  border-width: 0 5px 5px 0;
  display: inline-block;
  padding: 5px;
  outline: 0;
}

.arrow:hover {
  opacity: 0.5;
  cursor: pointer;
}

.right {
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
}

.left {
  transform: rotate(135deg);
  -webkit-transform: rotate(135deg);
}

#component {
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 798px;
  margin: 0 auto;
}
#component-1 {
  display: block;
  padding: 15px;
  background-color: rgba(24, 30, 30, 0.8);
}
.controls {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  vertical-align: middle;
  justify-content: space-between;
}
.controls > * {
  margin: 1em;
}
.button {
  margin-top: 5px;
  width: auto;
}

.image-div {
  padding-top: 1em;
  padding-bottom: 1em;
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

#image_svg {
  width: 768px;
  height: 768px;
}
</style>