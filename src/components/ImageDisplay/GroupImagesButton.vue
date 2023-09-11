<template>
  <div>
    <div
      v-for="(imageList, SMARTSTK) in grouped_images"
      :key="SMARTSTK"
    >
      <ul>
        <li v-if="!showAllImages[SMARTSTK]">
          {{ imageList[imageList.length - 1] }}
        </li>
        <li
          v-for="(baseFilename, index) in imageList"
          v-else
          :key="index"
        >
          {{ baseFilename }}
        </li>
      </ul>
      <button @click="toggleShowAllImages(SMARTSTK)">
        {{ showAllImages[SMARTSTK] ? 'Show First Image' : 'Show All Images' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GroupImagesButton',
  props: {
    grouped_images: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      showAllImages: {}
    }
  },
  methods: {
    toggleShowAllImages (SMARTSTK) {
      this.$set(this.showAllImages, SMARTSTK, !this.showAllImages[SMARTSTK])
    }
  },

  mounted () {
    console.log('grouped_images in child:', this.grouped_images)
  }
}
</script>
