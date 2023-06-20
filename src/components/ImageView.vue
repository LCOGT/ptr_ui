<template>
  <div class="image-view-wrapper">
    <!-- The main image view -->
    <div
      ref="image_div"
      class="image-div"
    >
      <svg
        id="image_svg"
        ref="svgElement"
        :class="{'cursor-is-crosshair': activeDrawShape!='none'}"
      >
        <image-crosshairs
          :width="imageWidth"
          :height="imageHeight"
          :is-visible="crosshairsVisible"
          color="yellow"
        />
        <background-element
          id="svg-background"
          :width="imageWidth"
          :height="imageHeight"
        />
      </svg>

      <svg-context-menu svg-id="image_svg" />

      <img
        id="main-image"
        ref="image"
        rel="preload"
        alt="no jpg available"
        onerror1="this.onerror=null;this.src='https://via.placeholder.com/768?text=no+jpg+preview+available'"
        onerror="this.onerror=null;this.src='@/assets/README_screenshot.png'"
        :src="current_image.jpg_url"
      >

    </div>
  </div>
</template>

<script>
// import { API, Auth } from "aws-amplify";
import { mapGetters, mapState } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
import * as d3 from 'd3'

import ImageCrosshairs from '@/components/svg/ImageCrosshairs'
import BackgroundElement from '@/components/svg/BackgroundElement'
import SvgContextMenu from '@/components/svg/SvgContextMenu'

import { Point, Line, Rect, Circle, Starmarker } from '@/utils/drawshapes'

export default {
  name: 'ImageView',

  components: {
    SvgContextMenu,
    ImageCrosshairs,
    BackgroundElement
  },

  mixins: [commands_mixin],

  props: {
    site: String,
    markedStars: Array
  },

  data () {
    return {
      // The image that is selected and visible in the main viewer.
      active_image: '',

      // Width of image in UI
      imageWidth: 0,
      imageHeight: 0,

      // This is modified by the crosshairs switch and controls whether the crosshairs are visible.
      show_crosshairs: false,
      crosshair_color: '#32cd32',

      // Image ID of the currently highlighted image (focused)
      highlighted_image: 0,

    }
  },

  mounted () {
    this.init()

    // Updates whenever the rendered image size changes
    this.ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect
        this.onImageResize(cr.width, cr.height)
        this.updateAll()
      }
    })
    const imageEl = document.getElementById('main-image')
    // Observe one or multiple elements
    this.ro.observe(imageEl)
  },

  watch: {
    site: function (newVal, oldVal) {
      this.$store.dispatch('images/load_latest_images')
    },

    lines: {
      handler: function () {
        this.drawLines.draw()
      },
      deep: true
    },

    points: {
      handler: function () {
        this.drawPoints.draw()
      },
      deep: true
    },
    rects: {
      handler: function () {
        this.drawRects.draw()
      },
      deep: true
    },
    circles: {
      handler: function () {
        this.drawCircles.draw()
      },
      deep: true
    },
    selectedId () {
      this.updateAll()
      this.subframeDefinedWithFile = this.current_image.base_filename
    },
    markedStars () {
      this.drawStarmarkers.updateData(this.markedStars)
      this.drawStarmarkers.draw()
    }
  },

  methods: {

    init () {
      this.svg = d3.select('#image_svg')

      this.drawPoints = new Point(this.svg, this.points, this.imageWidth, this.imageHeight)
      this.drawLines = new Line(this.svg, this.lines, this.imageWidth, this.imageHeight)
      this.drawRects = new Rect(this.svg, this.rects, this.imageWidth, this.imageHeight)
      this.drawCircles = new Circle(this.svg, this.circles, this.imageWidth, this.imageHeight)
      this.drawStarmarkers = new Starmarker(this.svg, this.markedStars, this.imageWidth, this.imageHeight)

      // Event actions to perform on the image window element
      this.svg
        .on('mousedown', this.handleMouseDown)
        .on('mouseup', this.handleMouseUp)
        // .on('keyup', e => console.log(e.key))

      this.updateAll()
    },

    updateAll () {
      this.drawPoints.draw()
      this.drawLines.draw()
      this.drawRects.draw()
      this.drawCircles.draw()
      this.drawStarmarkers.draw()
    },

    onImageResize (width, height) {
      // This happens when we load js9, since the jpg display goes away.
      if (width == 0 && height == 0) return

      this.imageWidth = parseInt(width)
      this.imageHeight = parseInt(height)

      // Keep the svg in sync with image width (height is 100% for both).
      this.svg.attr('width', width)
      this.svg.attr('height', height)

      // Update the svg drawing tools
      this.drawPoints.imageDimensions = [width, height]
      this.drawRects.imageDimensions = [width, height]
      this.drawLines.imageDimensions = [width, height]
      this.drawCircles.imageDimensions = [width, height]
      this.drawStarmarkers.imageDimensions = [width, height]
    },

    handleMouseDown () {
      d3.event.preventDefault()
      const mouse = d3.mouse(this.svg.node())

      // Calculate image dimensions
      const bounds = this.svg.node().getBoundingClientRect()
      const imageWidth = bounds.width
      const imageHeight = bounds.height

      // Drawing a new line
      if (this.activeDrawShape == 'line') {
        this.$store.commit('drawshapes/addLine', {
          x1: mouse[0] / imageWidth,
          y1: mouse[1] / imageHeight,
          x2: mouse[0] / imageWidth,
          y2: mouse[1] / imageHeight,
          color: 'gold',
          show: true
        })
        this.svg.on('mousemove', () => {
          const mouse = d3.mouse(this.svg.node())
          const newLine = this.lines[this.lines.length - 1]
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
          show: true
        })
        this.svg.on('mousemove', () => {
          const mouse = d3.mouse(this.svg.node())
          const newRect = this.rects[this.rects.length - 1]
          this.selectedId = newRect.id
          newRect.x2 = mouse[0] / this.imageWidth
          newRect.y2 = mouse[1] / this.imageHeight
        })
      // Drawing a new point
      } else if (this.activeDrawShape == 'point') {
        this.$store.commit('drawshapes/addPoint', {
          x: mouse[0] / imageWidth,
          y: mouse[1] / imageHeight,
          color: 'gold',
          show: true
        })
        this.svg.on('mousemove', () => {
          const mouse = d3.mouse(this.svg.node())
          const theNewPoint = this.points[this.points.length - 1]
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
          show: true
        })
        this.svg.on('mousemove', () => {
          const mouse = d3.mouse(this.svg.node())
          const newCircle = this.circles[this.circles.length - 1]
          this.selectedId = newCircle.id
          newCircle.rx = (mouse[0] / this.imageWidth) - newCircle.x
          newCircle.ry = (mouse[1] / this.imageHeight) - newCircle.y
        })
      }
    },

    handleMouseUp (context) {
      // We don't want every click to draw a shape. Users need to select what
      // they want drawn each time.
      this.activeDrawShape = 'none'

      // Remove the mousemove method
      this.svg.on('mousemove', null)

      this.mouseIsDown = false
    }
  },

  computed: {

    ...mapGetters('images', [
      'recent_images',
      'current_image'
    ]),

    subframeIsActive: {
      get () { return this.$store.getters['command_params/subframeIsActive'] },
      set (val) { this.$store.commit('command_params/subframeIsActive', val) }
    },

    subframeDefinedWithFile: {
      get () { return this.$store.getters['command_params/subframeDefinedWithFile'] },
      set (val) { this.$store.commit('command_params/subframeDefinedWithFile', val) }
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
      get () { return this.$store.getters['drawshapes/selectedId'] },
      set (val) { this.$store.commit('drawshapes/selectedId', val) }
    },

    // User selection for which shape they want to draw
    activeDrawShape: {
      get () { return this.$store.getters['drawshapes/activeDrawShape'] },
      set (val) { this.$store.commit('drawshapes/activeDrawShape', val) }
    },

    crosshairsVisible: {
      get () { return this.$store.getters['drawshapes/crosshairsVisible'] },
      set (val) { this.$store.commit('drawshapes/crosshairsVisible', val) }
    }

  }
}
</script>

<style scoped lang="scss">
@import "@/style/_responsive.scss";

$infobar-height: 50px;
$thumbnails-height: 65px;
$controls-height: 55px;

$square-image-height: calc(
  100vh - #{
    $top-bottom-height
    + $infobar-height
    + $thumbnails-height
    + $controls-height}
  - 4em);
$max-div-width: $square-image-height;

//.image-view-wrapper::before{ content: "#{$max-div-width}"}

.image-view-wrapper {
  display: flex;
  flex-direction: column;
}

.image-div {
  position: relative;
  width:100%;
}

#main-image {
  top: 0;
  left: 0;
  //height: 100%;
  width: 100%;
}
#image_svg {
  position:absolute;
  top: 0;
  left: 0;
  width: 100%;
}

.cursor-is-crosshair:hover {
  cursor: crosshair;
}
.controls {
  //height: $controls-height;
  max-width: $max-div-width;
  margin-top: 1em;
  display: flex;
  justify-content: space-between;
  overflow-x:auto;
  overflow-y:visible;
}
</style>
