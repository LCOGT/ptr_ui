<template>
  <div style="overflow-x: scroll;">
    <SingleImage :image-id="imageId" />
  </div>
</template>

<script>
import SingleImage from '@/components/SingleImage.vue'

export default {
  name: 'ImageView',
  components: {
    SingleImage
  },
  props: {
    imageId: {
      type: String,
      required: true
    }
  }
}
</script>
