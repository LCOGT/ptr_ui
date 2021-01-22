<template>
  <div id="context-menu" v-if="showContextMenu">
    <div 
      class="menu-item"
      @click="$store.dispatch('drawshapes/deleteSelectedShape')"
    >
      remove shape
    </div>
    <div
      v-if="selectedShapeType in ['rects', 'circles']"
      class="menu-item"
      @click="setSelectedRectAsSubframe"
    >
      maximize
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      showContextMenu: false,
    };
  },

  props: ["svgId"],

  mounted() {
    //console.log('mounted context')
    this.createChart();
  },

  beforeDestroy() {
    const chartComponent = document.getElementById(this.svgId);
    chartComponent.removeEventListener(
      "contextmenu",
      this.setContextMenuCoords
    );
  },

  methods: {
    createChart() {
      const vm = this;
      //console.log('createchart context')
      const chartComponent = document.getElementById(this.svgId);
      chartComponent.addEventListener("contextmenu", this.setContextMenuCoords);

      d3.select("#image_svg")
        .selectAll(".selectable-shape")
        .on("contextmenu", function (d) {
          d3.event.preventDefault();
          console.log("right click");
          // Make this the selected shape
          vm.$store.commit("drawshapes/selectedId", d.id);
          // Pass the data object (d) and the DOM element (this) to vm.contextMenu.
          vm.contextMenu(d, this);
        });

      // Hide the context menu when a user left-clicks anywhere outside of the context menu.
      // This will also reset and hide the context menus after a user clicks any option within the context menus.
      d3.select("body").on("click", () => {
        this.showContextMenu = false;
      });
    },

    contextMenu(d, domEl) {
      // Use d and domEl, if necessary.
      this.showContextMenu = true;
    },

    /**
     * NOTE: The D3 event listeners are fired before the addEventListener functions are fired.
     * So the context-menu elements will exist in the DOM by the time this method is executed.
     */
    setContextMenuCoords(event) {
      event.preventDefault();

      const ctxMenu = document.getElementById("context-menu");
      // If the user right-clicked somewhere other than on rect element that was appended to someGroup, then the ctxMenu will not exist. The following conditional check is to prevent errors when the user right-clicks outside of the rect element.
      if (ctxMenu) {
        // Get the width and height of the current context menu with the window.getComputedStyle() method.
        const compStyles = window.getComputedStyle(ctxMenu);
        const menuWidth = parseInt(compStyles.width);
        const menuHeight = parseInt(compStyles.height);

        // Get the dimensions of the <svg> element.
        const baseSvgEl = document.getElementById("image_svg");
        const chartRightEdge = baseSvgEl.getBoundingClientRect().right;
        const chartBottomEdge = baseSvgEl.getBoundingClientRect().bottom;

        // Get the right-click coordinates. (NOTE: The right-click event is called "contextmenu".)
        const mousePosX = event.offsetX + 15;
        const mousePosY = event.offsetY + 55;

        // If the right-click coordinates are too close to the right edge of the chart, then shift the context menu to the left so it does not overflow to the right of the chart area.
        if (mousePosX + menuWidth < chartRightEdge) {
          ctxMenu.style.left = mousePosX + "px";
        } else {
          ctxMenu.style.left = mousePosX - menuWidth + "px";
        }
        // If the right-click coordinates are too close to the bottom edge of the chart, then shift the context menu up so it does not overflow below the chart area.
        if (mousePosY + menuHeight > chartBottomEdge) {
          ctxMenu.style.top = mousePosY + "px";
        } else {
          ctxMenu.style.top = mousePosY - menuHeight + "px";
        }
      }
    },

    setSelectedRectAsSubframe() {
      if (!this.shapeIsRect) return;

      // Note that subframes are 0-indexed while the selected shape is 1-indexed.
      const x0 = this.selectedShape.x1
      const y0 = this.selectedShape.y1
      const x1 = this.selectedShape.x2
      const y1 = this.selectedShape.y2
      this.$store.commit('command_params/subframe_x0', x0) 
      this.$store.commit('command_params/subframe_x1', x1) 
      this.$store.commit('command_params/subframe_y0', y0) 
      this.$store.commit('command_params/subframe_y1', y1) 
    }
  },

  watch: {
    selectedId() {
      this.createChart()
    } 
  },

  computed: {
    ...mapGetters('drawshapes', [
      'selectedShape',
      'selectedShapeType',
    ]),
    selectedId: {
      get() { return this.$store.getters['drawshapes/selectedId']},
      set(val) { this.$store.commit('drawshapes/selectedId')}
    },

    shapeIsRect() {
      return this.selectedId[0] == 'r'
    }
  }
};
</script>

<style lang="scss" scoped>
#context-menu {
  position: absolute;
  //width: 200px;
  width: auto;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 100;
  //border: 1px solid rgba(0, 0, 0, 0.3);;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

#context-menu > .menu-item {
  border-radius: 0;
  width: 100%;
  padding: 10px;
  text-align: left;
  &:hover {
    background-color: rgba(255,255,255, 0.1)
  }
}
</style>