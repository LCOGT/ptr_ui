<template>
  <div class="images">
    <div 
      class="recent-image" 
      v-for="(item, index) in images" 
      v-bind:key="index" >
      <img 
        v-bind:src="item.jpg_url"
        onerror="this.onerror=null;this.src='https://via.placeholder.com/60/FF0000/FFFFFF?text=jpg'"
        v-bind:title="item.base_filename"
        v-bind:class="{'selected_thumbnail' : item.image_id == selected_image}"
        @click="setActiveImage(item)" >
    </div>
  </div>
</template>

<script>
export default {
  name: 'ThumbnailRow',
  props: {
    images: {
      type: Array,
      default: () => {[]}
    },
    selected_image: {
      type: Number,
      required: false,
    }
  },

  methods: {
    setActiveImage(item) {
      this.$emit('thumbnailClicked', item)
    },
  },
}
</script>

<style lang="scss" scoped>

.images {
  height: 85px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  flex-direction: row;
}
.recent-image {
  height: 60px;
  margin: 5px;
  margin-left: 0;
  cursor: pointer;
  flex: 0 0 auto;
  img {
    width: 60px;
    height: 60px;
  }
}
.selected_thumbnail {
  border: 3px solid rgb(241, 183, 36);
}

</style>
