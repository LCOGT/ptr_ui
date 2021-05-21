<template>
    <img
      :src="info_image.jpg_url"
      onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
      @click="setActiveImage()" 
      class="info-image-thumbnail"
      v-bind:class="{'is_selected': info_image.base_filename == current_image.base_filename}"
    />
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: "InfoImageThumb",
  methods: {
    setActiveImage() {
      this.$store.dispatch('images/set_info_image_as_current_image')
    },
  },
  computed: {
    ...mapState('images', [
      'current_image',
      'info_image',
    ])
  }
};
</script>

<style lang="scss" scoped>
.info-image-thumbnail {
  height: 60px;
  width: 60px;
  margin: 5px 0;
  cursor: pointer;
}
.is_selected {
  border: 3px solid rgb(241, 183, 36);
}
</style>