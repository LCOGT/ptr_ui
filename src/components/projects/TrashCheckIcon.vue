<template>
  <svg
    version="1.0"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 300.000000 327.000000"
    preserveAspectRatio="xMidYMid meet"
    :style="`width: ${pixSize || 23}px; height: ${pixSize || 23}px;`"
  >
    <metadata>
      Created by potrace 1.10, written by Peter Selinger 2001-2011
    </metadata>
    <g
      transform="translate(0.000000,327.000000) scale(0.100000,-0.100000)"
      fill="#000000"
      stroke="none"
    >
      <path
        :style="`fill: ${fillColor};`"
        d="M1165 3002 c-79 -7 -122 -37 -161 -113 l-24 -49 -258 0 c-143 0 -273
-5 -294 -10 -49 -14 -96 -64 -106 -114 -17 -83 13 -155 79 -188 32 -17 104
-18 1078 -18 l1043 0 39 22 c53 30 83 92 77 159 -5 53 -26 89 -72 123 -26 20
-43 21 -310 24 l-283 3 -24 51 c-26 55 -69 95 -115 104 -29 5 -614 11 -669 6z"
      />
      <path
        :style="`fill: ${fillColor};`"
        d="M485 2273 c3 -38 28 -435 55 -883 28 -448 53 -828 56 -845 10 -52 56
-125 97 -155 22 -16 63 -34 92 -40 34 -7 273 -10 726 -8 672 3 674 3 715 25
79 42 129 121 139 217 8 71 105 1666 105 1716 l0 40 -996 0 -995 0 6 -67z
m1555 -368 c54 -28 76 -106 46 -163 -18 -33 -692 -705 -723 -721 -30 -15 -79
-14 -111 3 -15 8 -109 97 -209 198 -149 151 -182 190 -188 220 -14 74 49 148
126 148 47 0 86 -29 224 -169 l110 -111 305 305 c305 304 306 305 348 305 24
0 56 -7 72 -15z"
      />
    </g>
  </svg>
</template>
<script>
export default {
  props: ['pixSize', 'fillColor'],
  computed: {
    pathFillColor () {
      if (this.fillColor) {
        return this.fillColor
      } else {
        return '#48c78e'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/buefy-styles.scss";
svg {
  & path {
    //fill: $ptr-green;
    fill: #48c78e;
  }
}
</style>
