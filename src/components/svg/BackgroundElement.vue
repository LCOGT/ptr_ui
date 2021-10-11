<template>
  <rect
    :x="0"
    :y="0"
    :width="width"
    :height="height"
    fill="transparent"
    @click="deselectAll"
  />
</template>

<script>
import * as d3 from 'd3'
import { SnackbarProgrammatic as Snackbar } from "buefy";
import { commands_mixin } from '@/mixins/commands_mixin'
import { mapGetters } from 'vuex'

export default {
  name: "BackgroundElement",
  props: {
    width: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    }
  },

  mixins: [commands_mixin],

  data() {
    return {
      // Timer (setTimeout object) to clear the right click marker after a few seconds.
      context_marker_timer: "",

      // Time that right click events stay on the screen.
      right_click_ttl: 9000,

    }
  },

  mounted() {
    d3.select('#svg-background')
      .on('contextmenu', this.handleContextMenu)
  },

  methods: {
    deselectAll() {
      this.$store.commit('drawshapes/selectedId', 'none')
    },

    handleContextMenu(data, index) {
      let position = d3.mouse(d3.select('#svg-background').node());
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

    send_pixels_center_command(x, y, filename) {
      let command_form = [
        String(x / this.width), // x coordinate
        String((this.height - y ) / this.height), // y coord, starts at bottom.
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
      d3.select('#image_svg')
        .append("line")
        .attr("class", "context-marker")
        .attr("x1", pixelX - 7)
        .attr("y1", pixelY)
        .attr("x2", pixelX + 7)
        .attr("y2", pixelY)
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .style("fill", "none");
      d3.select('#image_svg')
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
        .select('#image_svg')
        .selectAll(".context-marker")
        .remove();
    },
  },

  computed: {

    ...mapGetters("images", [
      "recent_images",
      "current_image",
    ]),

  },

}
</script>
