<template>
  <div
    v-if="Object.keys(grouped_images).length > 0"
    class="images"
  >
    <div
      v-for="(item, SMARTSTK) in grouped_images"
      :key="SMARTSTK"
      class="image-container"
    >
      <img
        v-if="SMARTSTK !== 'site'"
        :src="thumbnailWithFallback(item)"
        onerror="this.onerror=null;console.log('this is error', this.onerror);this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
        :title="item[0].baseFilename"
        :class="{'selected_thumbnail' : item[0].image_id == selected_image}"
        loading="lazy"
        class="recent-image"
        alt="heck"
        @click="setActiveImage(item[0])"
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
      default: () => {},
      required: true
    }
  },
  methods: {
    setActiveImage (item) {
      this.$emit('thumbnailClicked', item)
    },

    thumbnailWithFallback (item) {
      const last = item && item[0] && item[0].jpg_thumbnail_url
      return last || 'https://via.placeholder.com/768?text=no+jpg+preview+available'
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

.image-container {
  flex: none;
  width: auto;
}

.recent-image {
  cursor: pointer;
  margin: 0;
  margin-bottom: 5px;
  width: 120px;
  height: 90px;
  object-fit: cover;
}

.recent-image:not(:first-child) {
  margin-left: 5px;
}

.selected_thumbnail {
  border: 3px solid rgb(241, 183, 36);
}
</style>
