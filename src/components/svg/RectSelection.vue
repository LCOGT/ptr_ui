/* 
NOTE: This is an experimental component that could be substituded in place
of the d3 shape drawing js modules (in src/utils/shapes/).

This component is not currently being used. 
*/

<template>
  <g class="custom-rect selectable-shape" 
      :id="rect_id"
      :style="{'cursorgrabbing': mouseIsDown}"
      v-on:keyup="handleKeyup"
    >

    <rect class="main-rect" 
      :width="rectWidth" :height="rectHeight" 
      :x="_x1" :y="_y1" 
      fill="transparent" 
      :stroke="color" 
      :stroke-width="3"
      @mousedown="handleMousedown"
      @mousemove="handleMousemove"
      @mouseup="handleMouseup"
      @mouseover="handleMouseover"
      @mouseleave="handleMouseleave"
      @contextmenu="handleContextmenu"
      
    /> 

    <circle class="corner" :stroke="color" fill="transparent" :cx="_x1" :cy="_y1" :r="cornerCircleRadius"/>
    <circle class="corner" :stroke="color" fill="transparent" :cx="_x2" :cy="_y1" :r="cornerCircleRadius"/>
    <circle class="corner" :stroke="color" fill="transparent" :cx="_x1" :cy="_y2" :r="cornerCircleRadius"/>
    <circle class="corner" :stroke="color" fill="transparent" :cx="_x2" :cy="_y2" :r="cornerCircleRadius"/>

    <circle class="drag-handle" :stroke="color" fill="transparent" :cx="_x1" :cy="_y1" :r="dragHandleRadius"/>
    <circle class="drag-handle" :stroke="color" fill="transparent" :cx="_x2" :cy="_y1" :r="dragHandleRadius"/>
    <circle class="drag-handle" :stroke="color" fill="transparent" :cx="_x1" :cy="_y2" :r="dragHandleRadius"/>
    <circle class="drag-handle" :stroke="color" fill="transparent" :cx="_x2" :cy="_y2" :r="dragHandleRadius"/>

    <line :stroke="color" stroke-width="1" :x1="centerX-5" :y1="centerY" :x2="centerX+5" :y2="centerY"/>
    <line :stroke="color" stroke-width="1" :x1="centerX" :y1="centerY-5" :x2="centerX" :y2="centerY+5"/>
  </g>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name: "RectSelection",

  props: {
    index: {
      type: Number,
      required: true,
    },
    rect_id: {
      type: String,
    },
    x1: {
      type: Number,
      default: 0,
    },
    y1: {
      type: Number,
      default: 0,
    },
    x2: {
      type: Number,
      default: 0,
    },
    y2: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "gold"
    },
    show: {
      type: Boolean,
      default: true,
    },
    svgWidth: {
      type: Number,
      default: 200,
    },
    svgHeight: {
      type: Number,
      default: 200,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      cornerCircleRadius: 5,
      dragHandleRadius: 12,

      mouseIsDown: false,

    }
  },

  mounted() {

  },

  methods: {

    handleKeyup(e) {
      if (e.key == "delete") {
        this.$store.dispatch('drawshapes/deleteShape', this.rect_id)
      }
    },

    handleMousedown(e) {
      this.mouseIsDown = true
    },

    handleMousemove(event) {
      if (this.mouseIsDown) {
        const dx = event.movementX / this.svgWidth
        const dy = event.movementY / this.svgHeight
        this.rects[this.index].x1 += dx;
        this.rects[this.index].x2 += dx;
        this.rects[this.index].y1 += dy;
        this.rects[this.index].y2 += dy;
      }
    },

    handleMouseup() {
      this.mouseIsDown = false
    },

    handleMouseover() {
    },

    handleMouseleave() {
    },

    handleContextmenu() {
    },



  },


  computed: {

    ...mapState('drawshapes', [
      'rects'
    ]),

    rectWidth() {
      return Math.abs(this.x2 - this.x1) * this.svgWidth
    },
    rectHeight() {
      return Math.abs(this.y2 - this.y1) * this.svgHeight
    },
    _x1() {
      return Math.min(this.x1, this.x2) * this.svgWidth
    },
    _x2() {
      return Math.max(this.x1, this.x2) * this.svgWidth
    },
    _y1() {
      return (this.x1 <  this.x2 ? this.y1 : this.y2) * this.svgHeight
    },
    _y2() {
      return (this.x1 >= this.x2 ? this.y1 : this.y2) * this.svgHeight
    },
    centerX() {
      return this._x1 + (this.rectWidth / 2)
    },
    centerY() {
      return this._y1 + (this.rectHeight / 2)
    },

    dragHandleOpacity() {
      return this.isSelected ? 1 : 0
    }

    
  }

}
</script>

<style lang="scss" scoped>
.custom-rect:hover {
  cursor: grab;
}

.cursorgrab {
  cursor: grab;
}
.cursorgrabbing {
  cursor: grabbing;
}
.corner {
  fill: transparent;
}

</style>
