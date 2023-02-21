<template>
    <div>
    <b-dropdown aria-role="list" position="is-top-left" >
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
          @click="download_jpg"
          :disabled="!jpg_url_exists"
        >
          JPG
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          @click="download_raw_fits"
          :disabled="!raw_fits_url_exists"
        >
          Raw Fits
        </b-dropdown-item>
        <b-dropdown-item
          aria-role="listitem"
          @click="download_reduced_fits"
          :disabled="!reduced_fits_url_exists"
        >
          Reduced Fits
        </b-dropdown-item>
      </b-dropdown>
    </div>
</template>

<script>
export default {
  name: 'ImageDownloadsButton',
  props: {
    image_package: {
        type: Object,
        default: () => {},
    }
  },
  data () {
    return {
      isDownloadModalActive: false,
      download_waiting: false
    }
  },
  computed: {
    jpg_url_exists() {
        return "jpg_url" in this.image_package
    },
    raw_fits_url_exists() {
        return "fits_0_url" in this.image_package
    },
    reduced_fits_url_exists() {
        return "fits_91_url" in this.image_package
    }
  },

  methods: {

    download_jpg () {
      window.location.assign(this.image_package.jpg_url)
    },
    download_raw_fits () {
      window.location.assign(this.image_package.fits_0_url)
    },
    download_reduced_fits () {
      window.location.assign(this.image_package.fits_91_url)
    },

  },

}
</script>

<style lang="scss" scoped>
@import "@/style/_responsive.scss";

</style>
