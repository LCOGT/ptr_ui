<template>
  <div
    v-if="grouped_images.imageGroups && Object.keys(grouped_images.imageGroups).length > 0"
    class="images"
  >
    <img
      v-for="(item, SMARTSTK) in grouped_images.imageGroups"
      :key="SMARTSTK"
      :src="thumbnailWithFallback(item)"
      onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
      :title="item[0].baseFilename"
      :class="{'selected_thumbnail' : item[0].image_id == selected_image}"
      loading="lazy"
      class="recent-image"
      @click="setActiveImage(item[0])"
    >
  </div>
  <div
    v-else
    class="placeholder"
  >
    <img
      :src="'https://via.placeholder.com/768?text=no+jpg+preview+available'"
      class="recent-image"
    >
  </div>
</template>

<script>

export default {
  name: 'ThumbnailRow',
  props: {
    images: {
      type: Array,
      default: () => []
    },
    selected_image: {
      type: Number,
      required: false
    },
    grouped_images: {
      type: Object,
      default: () => {},
      required: true
    }
  },

  methods: {
    setActiveImage (item) {
      this.$emit('thumbnailClicked', item)
    },

    thumbnailWithFallback (item) {
      let thumbnailCover = item && item[0] && item[0].jpg_thumbnail_url
      if (!thumbnailCover) {
        thumbnailCover = item && item[0] && item[0].jpg_url
      }
      return thumbnailCover || 'https://via.placeholder.com/768?text=no+jpg+preview+available'
    }
  }
}
</script>

<style lang="scss" scoped>

.images {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
}
.recent-image {
  cursor: pointer;
  margin: 0;
  margin-bottom: 5px;
  flex: 0 0 auto;
  height: 60px;
}
.recent-image:not(:first-child) {
  margin-left: 5px;
}
.selected_thumbnail {
  border: 3px solid rgb(241, 183, 36);
}

</style>
