<template>
  <div>
    <div
      v-for="(imageList, SMARTSTK) in grouped_images"
      :key="SMARTSTK"
    >
      <!-- Show the last image by default -->
      <!-- <div v-if="!showAllImages[SMARTSTK]"> -->
      <img
        :src="imageList[imageList.length - 1]"
        alt="Thumbnail bb"
      >
      <!-- </div> -->

      <!-- Show all images if toggled -->
      <!-- <div
        v-else
      > -->
      <!-- <img
          v-for="(imageSrc, index) in imageList"
          :key="index"
          :src="imageSrc"
          alt="Thumbnail"
        >
      </div> -->

      <!-- <button @click="toggleShowAllImages(SMARTSTK)">
        {{ showAllImages[SMARTSTK] ? 'Show First Image' : 'Show All Images' }}
      </button> -->
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
  mounted () {
    console.log('this is grouped_images in gib,', this.grouped_images)
  }
}
// toggleShowAllImages (SMARTSTK) {
//   this.$set(this.showAllImages, SMARTSTK, !this.showAllImages[SMARTSTK])
// }
//   }
</script>
