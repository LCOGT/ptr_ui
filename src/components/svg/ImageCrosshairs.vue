<template>
  <g v-if="isVisible">
    <line
      :x1="width / 2"
      :y1="0"
      :x2="width / 2"
      :y2="height"
      :stroke-width="2"
      :stroke="color"
    />
    <line
      :x1="0"
      :y1="height / 2"
      :x2="width"
      :y2="height / 2"
      :stroke-width="2"
      :stroke="color"
    />
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
  }
}
</script>
