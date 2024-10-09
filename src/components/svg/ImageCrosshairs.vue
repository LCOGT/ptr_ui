<!-- eslint-disable vue/valid-v-for -->
<template>
  <g v-if="isVisible">
    <line
      :x1="width / 2"
      :y1="0"
      :x2="width / 2"
      :y2="height"
      :stroke-width="strokeWidth"
      :stroke="color"
    />
    <line
      :x1="0"
      :y1="height / 2"
      :x2="width"
      :y2="height / 2"
      :stroke-width="strokeWidth"
      :stroke="color"
    />
    <circle
      :cx="width / 2"
      :cy="height / 2"
      :r="width / 5"
      :stroke-width="strokeWidth"
      :stroke="color"
      fill="transparent"
    />
    <template v-for="coord in allTickCoords">
      <line
        :x1="coord[0][0]"
        :y1="coord[0][1]"
        :x2="coord[1][0]"
        :y2="coord[1][1]"
        :stroke-width="strokeWidth"
        :stroke="color"
      />
    </template>
  </g>
</template>

<script>
export default {
  name: 'ImageCrosshairs',

  props: {
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    color: {
      type: String,
      default: 'limegreen'
    }
  },

  data () {
    return {
      numberOfXTicks: 12, // tick spacing is defined by how many fit on the x axis
      tickSize: 5, // how many pixels does each tick extend away from the crosshair line
      strokeWidth: 2
    }
  },

  computed: {
    tickSpacing () {
      let numTicks = this.numberOfXTicks
      // if numTicks is even, add 1 so we get half-tick-size padding on either edge, which is easier to read
      if (numTicks % 2 == 0) numTicks += 1
      return this.width / numTicks
    },
    // Return an array of coordinate pairs for lines that will serve as tick marks on the horizontal crosshair
    xAxisTickCoordinates () {
      const y1 = (this.height / 2) + this.tickSize
      const y2 = (this.height / 2) - this.tickSize
      const startingOffset = (this.width / 2) % this.tickSpacing // this ensures we have one tick perfectly centered

      // find all the x coordinates for our ticks
      const xCoords = []
      for (let i = 0; (i * this.tickSpacing) + startingOffset < this.width; i++) {
        xCoords.push(i * this.tickSpacing + startingOffset)
      }

      // from the list of x coords, create a list of coordinate pairs that define each tick line
      return xCoords.map(x => [[x, y1], [x, y2]])
    },
    yAxisTickCoordinates () {
      const x1 = (this.width / 2) + this.tickSize
      const x2 = (this.width / 2) - this.tickSize
      const startingOffset = (this.height / 2) % this.tickSpacing // this ensures we have one tick perfectly centered

      // find all the y coordinates for our ticks
      const yCoords = []
      for (let i = 0; (i * this.tickSpacing) + startingOffset < this.height; i++) {
        yCoords.push(i * this.tickSpacing + startingOffset)
      }

      // from the list of y coords, create a list of coordinate pairs that define each tick line
      return yCoords.map(y => [[x1, y], [x2, y]])
    },
    allTickCoords () {
      return [
        ...this.xAxisTickCoordinates,
        ...this.yAxisTickCoordinates
      ]
    }
  }
}
</script>
