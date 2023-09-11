<template>
  <div class="images">
    <div
      v-for="(group, groupKey) in grouped_images"
      :key="groupKey"
    >
      <h3>{{ groupKey }}</h3>
      <img
        v-for="(item, index) in group"
        :key="index"
        :src="thumbnailWithFallback(item)"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
        :title="item.base_filename"
        :class="{'selected_thumbnail' : item.image_id == selected_image}"
        loading="lazy"
        class="recent-image"
        @click="setActiveImage(item)"
      >
      <group-images-button :grouped_images="grouped_images" />
    </div>
  </div>
</template>

<script>
import GroupImagesButton from '@/components/ImageDisplay/GroupImagesButton'

export default {
  name: 'ThumbnailRow',
  components: {
    GroupImagesButton
  },
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
      required: true
    }
  },

  methods: {
    setActiveImage (item) {
      this.$emit('thumbnailClicked', item)
    },

    thumbnailWithFallback (item) {
      return item.jpg_thumbnail_url || item.jpg_url
    }
  },
  mounted () {
    console.log('grouped_images in child 2:', this.grouped_images)
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
