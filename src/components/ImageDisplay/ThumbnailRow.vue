<template>
  <div class="images">
    <img
      v-for="(item, index) in images"
      :key="index"
      :src="thumbnailWithFallback(item)"
      onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
      :title="item.base_filename"
      :class="{'selected_thumbnail' : item.image_id == selected_image}"
      loading="lazy"
      class="recent-image"
      @click="setActiveImage(item)"
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
    }
  },
  methods: {
    setActiveImage (item) {
      this.$emit('thumbnailClicked', item)
    },
    thumbnailWithFallback (item) {
      return item.jpg_thumbnail_url || item.jpg_url
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
