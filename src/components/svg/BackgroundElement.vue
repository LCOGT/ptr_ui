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

  methods: {
    deselectAll() {
      this.$store.commit('drawshapes/selectedId', 'none')
    }
  },

}
</script>