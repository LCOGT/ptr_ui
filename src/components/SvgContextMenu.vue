<template>
  <div id="chart-component">
    <div id="context-menu" v-if="showContextMenu">
      <div><button class="menu-item" @click="method1('arg')">Option 1</button></div>
      <div><button class="menu-item" @click="method2('arg')">Option 2</button></div>
      <div><button class="menu-item" @click="method3('arg')">Option 3</button></div>
    </div>
    <div id="chart-container"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  data() {
    return {
      showContextMenu: false,
    }
  },

  mounted() {
      console.log('mounted context')
      this.createChart()
  },

  beforeDestroy() {
    const chartComponent = document.getElementById("chart-component");
    chartComponent.removeEventListener("contextmenu", this.setContextMenuCoords);
  },

  methods: {
    createChart() {
        const vm = this;
      console.log('createchart context')
      const chartComponent = document.getElementById("chart-component");
      chartComponent.addEventListener("contextmenu", this.setContextMenuCoords);
      //d3.select('#image_svg').selectAll('.circle-selection')
        //.on('mouseover', function() {
            //console.log('context mouseover')
            //d3.select(this).selectAll('.main-circle').attr('stroke', 'red')
        //})


      d3.select('#image_svg')
      .on('mouseover', function() {
          console.log('in svg mouseover')
          d3.select(this).style('border-color', 'green')
      })

      .on('contextmenu', function(d) {
          d3.event.preventDefault()
          console.log('right click')
          vm.contextMenu(d, this)
      })

        
        .attr('border-color', 'gold')
        //.on("contextmenu", function(d) {
          //// Prevent the default context menu from appearing.
          //d3.event.preventDefault();
          //// Pass the data object (d) and the DOM element (this) to vm.contextMenu.
          //vm.contextMenu(d, this);
        //});

      // Hide the context menu when a user left-clicks anywhere outside of the context menu.
      // This will also reset and hide the context menus after a user clicks any option within the context menus.
      d3.select("body")
        .on("click", function() {
          vm.showContextMenu = false;
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
        const mousePosX = event.clientX;
        const mousePosY = event.clientY;

        // If the right-click coordinates are too close to the right edge of the chart, then shift the context menu to the left so it does not overflow to the right of the chart area.
        if ((mousePosX + menuWidth) < chartRightEdge) {
          ctxMenu.style.left = mousePosX + "px";
        }
        else {
          ctxMenu.style.left = mousePosX - menuWidth + "px";
        }
        // If the right-click coordinates are too close to the bottom edge of the chart, then shift the context menu up so it does not overflow below the chart area.
        if ((mousePosY + menuHeight) < chartBottomEdge) {
          ctxMenu.style.top = mousePosY + "px";
        }
        else {
          ctxMenu.style.top = mousePosY - menuHeight + "px";
        }
      }
    },
  }
};
</script>

<style lang="scss" scoped>
#context-menu {
    position: absolute;
    width: 200px;
    background-color: white;
    z-index: 100;
    border: 1px solid rgba(0, 0, 0, 0.3);;
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
}

#context-menu > .menu-item {
    width: 100%;
    padding: 10px;
    text-align: left;
    background-color: inherit;
    &:hover {
        background-color: lighten(steelblue, 50%);
    }
}
</style>