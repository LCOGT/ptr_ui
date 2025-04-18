<template>
  <div class="image-toolbar-wrapper">
    <b-field
      grouped
      style="margin-bottom: 0;"
    >

      <!-- Image navigation buttons -->
      <b-field>
        <p class="control">
          <button
            class="button level-item is-small"
            title="go to the latest image"
            @click="$store.dispatch('images/set_latest_image')"
          >
            <b-icon icon="chevron-double-left" />
          </button>
        </p>
        <p class="control">
          <button
            class="button level-item is-small"
            title="previous image"
            @click="$store.dispatch('images/set_previous_image')"
          >
            <b-icon icon="chevron-left" />
          </button>
        </p>
        <p class="control">
          <button
            class="button level-item is-small"
            title="next image"
            @click="$store.dispatch('images/set_next_image')"
          >
            <b-icon icon="chevron-right" />
          </button>
        </p>
        <p class="control">
          <button
            class="button level-item is-small"
            title="go to tonight's first image"
            @click="$store.dispatch('images/set_first_image')"
          >
            <b-icon icon="chevron-double-right" />
          </button>
        </p>
      </b-field>

      <!-- Fits Header -->
      <FitsHeaderModal
        :image="current_image"
        button_size="is-small"
        class="mr-3"
      >
        header
      </FitsHeaderModal>

      <!-- Downloads dropdown -->
      <b-dropdown
        aria-role="list"
        position="is-top-left"
        class="mr-3"
      >
        <template #trigger="{ active }">
          <b-button
            :loading="download_waiting"
            type="is-small"
            :icon-right="active ? 'menu-up' : 'menu-down'"
          >
            <b-icon
              icon="download"
              size="is-small"
            />
            <span>download</span>
          </b-button>
        </template>

        <b-dropdown-item
          aria-role="listitem"
          disabled
          @click="download_jpg"
        >
          <p style="padding-bottom: 0.5em">
            ⚠️ these labels are placeholders ⚠️️️
          </p>
          <p>all options below will just</p>
          <p>download the screen jpg</p>
        </b-dropdown-item>
        <hr class="dropdown-divider">
        <b-dropdown-item
          aria-role="listitem"
          @click="download_jpg"
        >
          screen jpg
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          @click="download_jpg"
        >
          large jpg
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          @click="download_jpg"
        >
          fits full
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          @click="download_jpg"
        >
          fits bin 2
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          @click="download_jpg"
        >
          tiff
        </b-dropdown-item>
      </b-dropdown>

      <!-- Sharing link -->
      <b-button
        class="button is-info is-small"
        title="Get permanent link to this image"
        icon-left="link"
        outlined
        @click="copyImagePermalink"
      >
        <span>share</span>
      </b-button>
    </b-field>
    <b-field
      label="crosshairs"
      size="small"
      horizontal
    >
      <b-switch
        v-model="crosshairsVisible"
        size="is-small"
        type="is-info"
      />
    </b-field>
  </div>
</template>

<script>
import FitsHeaderModal from '@/components/ImageDisplay/FitsHeaderModal.vue'
import axios from 'axios'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'ButtonRowBelowImage',
  components: {
    FitsHeaderModal
  },
  data () {
    return {
      isDownloadModalActive: false,
      download_waiting: false
    }
  },

  methods: {
    download_fits_previous_24hrs () {
      const url = `${this.$store.state.api_endpoints.active_api}/downloadzip`
      const args = {
        site: this.$route.params.sitecode,
        fits_size: 'small',
        start_timestamp_s: Math.round(new Date().getTime() / 1000) - (24 * 3600),
        end_timestamp_s: Math.round(new Date().getTime() / 1000)
      }
      this.download_waiting = true
      axios.post(url, args)
        .then(response => {
          const download_url = response.data.message
          // quickly verify download url
          if (!download_url.includes('https://photonranch-001.s3.amazonaws.com')) {
            console.warn('Bad url: ', download_url)
            throw new Error('Bad url: ', download_url)
          } else {
            window.location.assign(download_url)
          }
        })
        .catch(error => {
          console.error('Zip download failed; ', error)

          // Handle 404: no files are available
          if (error.response.status == 404) {
            this.$buefy.toast.open({
              message: 'No images are available from the last 24 hours at this site.',
              type: 'is-warning',
              duration: 6000
            })
          }

          else if (error.response.status == 504) {
            this.$buefy.toast.open({
              message: 'Too many files to zip, request timed out.',
              type: 'is-warning',
              duration: 6000
            })
          }
        })
        .finally(r => { this.download_waiting = false })
    },
    /**
     * Allows users to download a fits file (from the current image displayed).
     */
    async download_current_fits (size) {
      let fits_url = ''
      this.download_waiting = true

      // First we need to get the url that points to the file we want to download
      // If the file is from an info image...
      if (this.current_image.s3_directory == 'info-images' && size == 'small') {
        fits_url = this.current_image.fits_10_url
      }
      else if (this.current_image.s3_directory == 'info-images' && size == 'large') {
        fits_url = this.current_image.fits_01_url
      }
      // If the file is from a regular image...
      else if (this.current_image.s3_directory == 'data' && size == 'small') {
        const params = {
          base_filename: this.current_image.base_filename,
          data_type: this.current_image.data_type,
          reduction_level: this.small_fits_reduction_level
        }
        fits_url = await this.$store.dispatch('images/get_fits_url', params)
      }
      else if (this.current_image.s3_directory == 'data' && size == 'large') {
        const params = {
          base_filename: this.current_image.base_filename,
          data_type: this.current_image.data_type,
          reduction_level: this.large_fits_reduction_level
        }
        fits_url = await this.$store.dispatch('images/get_fits_url', params)
      }

      this.download_waiting = false
      // The following line downloads the file
      window.location.assign(fits_url)
    },
    async download_fits_file (base_filename, data_type, reduction_level) {
      this.download_waiting = true
      const params = {
        base_filename,
        data_type,
        reduction_level
      }
      const fits_url = await this.$store.dispatch('images/get_fits_url', params)
      this.download_waiting = false
      window.location.assign(fits_url)
    },

    async download_tif (size, stretch) {
      this.download_waiting = true
      const url = `${this.$store.state.api_endpoints.active_api}/download`
      let body = {}

      if (size == 'large') {
        body = {
          s3_directory: this.current_image.s3_directory,
          object_name: this.large_fits_filename,
          stretch,
          image_type: 'tif'
        }
      }
      else if (size == 'small') {
        body = {
          s3_directory: this.current_image.s3_directory,
          object_name: this.small_fits_filename,
          stretch,
          image_type: 'tif'
        }
      }
      else {
        // handle error
      }
      const tif_url = await axios.post(url, body)
      console.log(tif_url.data)
      window.location.assign(tif_url.data)
      this.download_waiting = false
    },
    download_jpg () {
      window.location.assign(this.current_image.jpg_url)
    },

    copyImagePermalink () {
      const baseFilename = this.current_image.base_filename
      if (!baseFilename || baseFilename === 'placeholder image') {
        this.$buefy.toast.open({
          message: 'No permanent link available for this image',
          type: 'is-warning'
        })
        return
      }
      const imageUrl = `${window.location.origin}/image/${encodeURIComponent(baseFilename)}`
      navigator.clipboard.writeText(imageUrl)
        .then(() => {
          this.$buefy.toast.open({
            message: 'Link copied to clipboard!',
            type: 'is-success',
            duration: 3000
          })
        })
        .catch(err => {
          console.error('Failed to copy: ', err)
          this.$buefy.toast.open({
            message: 'Couldn\'t copy link to clipboard.',
            type: 'is-danger',
            duration: 3000
          })
        })
    }
  },
  computed: {

    ...mapState('images', [
      'large_fits_reduction_level',
      'small_fits_reduction_level'
    ]),
    ...mapGetters('images', [
      'recent_images',
      'current_image',
      'small_fits_exists',
      'large_fits_exists',
      'small_fits_filename',
      'large_fits_filename'
    ]),

    crosshairsVisible: {
      get () { return this.$store.getters['drawshapes/crosshairsVisible'] },
      set (val) { this.$store.commit('drawshapes/crosshairsVisible', val) }
    }

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
  gap: 1em;
}

.image-toolbar-wrapper > * {
  margin-bottom: 0;
}

</style>
