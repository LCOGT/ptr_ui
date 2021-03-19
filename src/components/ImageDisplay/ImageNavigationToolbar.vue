<template>
  <div class="image-toolbar-wrapper">
    <b-field grouped>
      <b-field> 
        <button title="open the JS9 analysis tools"
          class="button is-small" @click="toggleJS9">JS9</button> </b-field>
      <b-field>
        <p class="control">
          <button 
            class="button level-item is-small" title="go to the latest image" 
            @click="$store.dispatch('images/set_latest_image')">
            <b-icon icon="chevron-double-left"/>
          </button>
        </p>
        <p class="control">
          <button class="button level-item is-small" title="previous image"
            @click="$store.dispatch('images/set_previous_image')">
            <b-icon icon="chevron-left" />
          </button>
        </p>
        <p class="control">
          <button class="button level-item is-small" title="next image"
            @click="$store.dispatch('images/set_next_image')">
            <b-icon icon="chevron-right" />
          </button>
        </p>
      </b-field>
    </b-field>
    <b-field class="is-hidden-mobile">
      <p class="control">
        <a class="button has-text-white is-small" 
          :disabled="!small_fits_exists"
          @click="download_fits_file(current_image.base_filename, current_image.data_type, '10')">
          <b-icon icon="download" size="is-small" />
          <span>small fits</span>
        </a>
      </p>
      <p class="control">
        <a class="button has-text-white is-small" 
          :disabled="!large_fits_exists"
          @click="download_fits_file(current_image.base_filename, current_image.data_type, '01')">
          <b-icon icon="download" size="is-small" />
          <span>large fits</span>
        </a>
      </p>
    </b-field>
  </div>
</template>

<script>
import {mapState, mapGetters} from 'vuex';
export default {
  name: "ImageToolbar",
  data() {
    return {
    }
  },

  methods: {
    async download_fits_file(base_filename, data_type, reduction_level) {
      const params = {
        base_filename: base_filename, 
        data_type: data_type,
        reduction_level: reduction_level,
      }
      const fits_url = await this.$store.dispatch('images/get_fits_url', params)
      window.location.assign(fits_url)
    },
    toggleJS9() {
      if (this.js9IsVisible) {
        this.js9IsVisible = false;
        //this.init()
      } else {
        this.js9LoadImage(this.current_image)
        this.js9IsVisible = true;
      }
    },

    js9LoadImage(image) {
      let the_load_options = {
        site: image.site,
        base_filename: image.base_filename,
      }
      this.$store.dispatch('js9/loadImage', the_load_options)
    },
  },
  computed: {

    ...mapGetters("images", [
      "recent_images",
      "current_image",
      "small_fits_exists",
      "large_fits_exists",
    ]),

    js9IsVisible: {
      get() { return this.$store.getters['js9/instanceIsVisible']},
      set(val) { this.$store.commit('js9/instanceIsVisible', val)},
    },

  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";

.image-toolbar-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

</style>