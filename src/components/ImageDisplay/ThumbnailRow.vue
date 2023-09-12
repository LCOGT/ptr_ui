<template>
  <div class="images">
    <div
      v-for="(item, SMARTSTK) in grouped_images"
      :key="SMARTSTK"
    >
      <p>SMARTSTK: {{ SMARTSTK }}</p>
      <img
        :src="thumbnailWithFallback(item)"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
        :title="grouped_images.baseFilename"
        :class="{'selected_thumbnail' : grouped_images.image_id == selected_image}"
        loading="lazy"
        class="recent-image"
        alt="heck"
        @click="setActiveImage(item)"
      >
      <group-images-button
        :grouped_images="grouped_images"
      />
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
      console.log('this is item at setactiveimage yes,', item)
      this.$emit('thumbnailClicked', item)
    },

    thumbnailWithFallback (item) {
      const last = item[item.length - 1].jpg_thumbnail_url
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
