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

    <b-field >
      <p class="control">
        <a class="button has-text-white is-small" 
          :disabled="!small_fits_exists"
          @click="download_current_fits('small')">
          <b-icon icon="download" size="is-small" />
          <span>small fits</span>
        </a>
      </p>
      <p class="control">
        <a class="button has-text-white is-small" 
          :disabled="!large_fits_exists"
          @click="download_current_fits('large')">
          <b-icon icon="download" size="is-small" />
          <span>large fits</span>
        </a>
      </p>
      <p class="control">
        <a class="button has-text-white is-small" 
          @click="download_jpg">
          <b-icon icon="download" size="is-small" />
          <span>jpg</span>
        </a>
      </p>
      <p class="control">
        <b-button :loading="zip_download_waiting" class="button has-text-white is-small" @click="download_fits_previous_24hrs">
          <b-icon icon="download" size="is-small" />
          <span>last 24hrs fits</span>
        </b-button>
      </p>
    </b-field>
  </div>
</template>

<script>
import axios from 'axios'
import {mapState, mapGetters} from 'vuex';
export default {
  name: "ImageToolbar",
  data() {
    return {
      isDownloadModalActive: false,
      zip_download_waiting: false,
    }
  },

  methods: {
    download_fits_previous_24hrs() {
      const url = `${this.$store.state.dev.active_api}/downloadzip`
      const args = {
        site: this.$route.params.sitecode,
        fits_size: 'small',
        start_timestamp_s: Math.round(new Date().getTime() / 1000) - (24 * 3600),
        end_timestamp_s: Math.round(new Date().getTime() / 1000),
      }
      this.zip_download_waiting = true
      axios.post(url, args)
        .then(response => {
          let download_url = response.data.message
          // quickly verify download url 
          if (!download_url.includes('https://photonranch-001.s3.amazonaws.com')) {
            console.warn('Bad url: ', download_url)
            throw new Error('Bad url: ', download_url)
          } else {
            window.location.assign(download_url)
          }
        })
        .catch(r => {
          console.error('Zip download failed; ', r)
          this.$buefy.toast.open({
            message: "No images are available from the last 24 hours at this site.",
            type: 'is-warning',
            duration: 6000
          })
        })
        .finally(r => {this.zip_download_waiting = false})
    },
    /**
     * Allows users to download a fits file (from the current image displayed).
     */
    async download_current_fits(size) {
      let fits_url = ""

      // First we need to get the url that points to the file we want to download
      // If the file is from an info image...
      if (this.current_image.s3_directory == "info-images" && size == "small") {
        fits_url = this.current_image.fits_10_url
      }
      else if (this.current_image.s3_directory == "info-images" && size == "large") {
        fits_url = this.current_image.fits_01_url
      }
      // If the file is from a regular image...
      else if ( this.current_image.s3_directory == "data" && size == "small") {
        let params = {
          base_filename: this.current_image.base_filename, 
          data_type: this.current_image.data_type,
          reduction_level: '10',
        }
        fits_url = await this.$store.dispatch('images/get_fits_url', params)
      }
      else if ( this.current_image.s3_directory == "data" && size == "large") {
        let params = {
          base_filename: this.current_image.base_filename, 
          data_type: this.current_image.data_type,
          reduction_level: '01',
        }
        fits_url = await this.$store.dispatch('images/get_fits_url', params)
      }

      // The following line downloads the file
      window.location.assign(fits_url)

    },
    async download_fits_file(base_filename, data_type, reduction_level) {
      const params = {
        base_filename: base_filename, 
        data_type: data_type,
        reduction_level: reduction_level,
      }
      const fits_url = await this.$store.dispatch('images/get_fits_url', params)
      window.location.assign(fits_url)
    },
    download_jpg() {
      window.location.assign(this.current_image.jpg_url)
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
      "small_fits_filename",
      "large_fits_filename",
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
  flex-wrap: wrap;
  justify-content: space-between;
}

</style>