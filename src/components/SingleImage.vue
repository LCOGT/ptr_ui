<template>
  <div
    class="single-image-container"
    :class="{'overflow-container': shouldScroll}"
  >
    <div
      v-if="loading"
      class="loading-container"
    >
      <b-loading
        :is-full-page="false"
        :active="loading"
      />
    </div>
    <div
      v-else-if="error"
      class="error-container"
    >
      <div class="notification is-danger">
        <p>Sorry, the requested image could not be found.</p>
        <p>{{ error }}</p>
      </div>
    </div>
    <div
      v-else
      class="single-image-content"
      :class="{'side-by-side': isWideScreen}"
    >
      <div class="image-section">
        <div
          ref="imageHeader"
          class="image-header"
        >
          <h1 class="title">
            {{ image.base_filename }}
          </h1>
          <!-- <span class="subtitle">Captured at {{ image.site }} observatory</span> -->
        </div>

        <div class="image-display">
          <img
            ref="mainImage"
            :src="image.jpg_url"
            :alt="image.base_filename"
            class="main-image"
            @load="handleImageLoad"
          >
        </div>
      </div>

      <div
        class="metadata-section"
        :style="metadataSectionStyle"
      >
        <div class="image-metadata">
          <div class="metadata-container">
            <!-- First column -->
            <div class="metadata-column">
              <div class="metadata-group">
                <h2 class="subtitle">
                  Image Details
                </h2>
                <div class="metadata-compact-grid">
                  <div class="metadata-item">
                    <span class="label">Site</span>
                    <span class="value">{{ image.site }}</span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Date/Time</span>
                    <span class="value">{{ formatDateTime(image.capture_date) }}</span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Exposure</span>
                    <span class="value">{{ image.exposure_time }}s</span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Filter</span>
                    <span class="value">{{ image.filter_used }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Second column -->
            <div class="metadata-column">
              <div class="metadata-group">
                <h2 class="subtitle">
                  Coordinates
                </h2>
                <div class="metadata-compact-grid">
                  <div class="metadata-item">
                    <span class="label">RA</span>
                    <span class="value">
                      <ra-display
                        :ra_hours_decimal="raHours"
                        :decimal_precision="3"
                        can-copy
                      />
                    </span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Dec</span>
                    <span class="value">
                      <dec-display
                        :dec_deg_decimal="image.declination"
                        :decimal_precision="3"
                        can-copy
                      />
                    </span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Airmass</span>
                    <span class="value">{{ image.airmass }}</span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Altitude</span>
                    <span class="value">{{ truncateDecimalString(image.altitude, 4) }}°</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="metadata-actions">
            <div
              v-if="image.fits_01_exists || image.fits_10_exists"
              class="metadata-group fits-download"
            >
              <h2 class="subtitle">
                Download FITS
              </h2>
              <div class="buttons is-flex is-justify-content-flex-start">
                <button
                  v-if="image.fits_01_exists"
                  class="button is-primary is-small"
                  @click="downloadFits('large')"
                >
                  <b-icon
                    icon="download"
                    size="is-small"
                  />
                  <span>Full Resolution</span>
                </button>
                <button
                  v-if="image.fits_10_exists"
                  class="button is-link is-small"
                  @click="downloadFits('small')"
                >
                  <b-icon
                    icon="download"
                    size="is-small"
                  />
                  <span>Small FITS</span>
                </button>
              </div>
            </div>

            <div class="metadata-group permalink">
              <h2 class="subtitle">
                Permanent Link
              </h2>
              <div class="field has-addons">
                <div class="control is-expanded">
                  <input
                    class="input is-small"
                    type="text"
                    :value="currentUrl"
                    readonly
                  >
                </div>
                <div class="control">
                  <button
                    class="button is-info is-small"
                    @click="copyToClipboard"
                  >
                    <b-icon
                      icon="clipboard"
                      size="is-small"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="return-link">
          <a
            :href="returnLink"
            class="button is-text is-small"
          >
            <b-icon
              icon="arrow-left"
              size="is-small"
            />
            <span>Return to observatory</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import RaDisplay from '@/components/display/RaDisplay'
import DecDisplay from '@/components/display/DecDisplay'

export default {
  name: 'SingleImage',
  components: {
    RaDisplay,
    DecDisplay
  },
  props: {
    imageId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      image: {},
      loading: true,
      error: null,
      imageWidth: 0,
      imageHeight: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      shouldScroll: false,
      isWideScreen: false
    }
  },
  computed: {
    returnLink () {
      return this.image.site ? `/site/${this.image.site}/observe` : '/'
    },
    currentUrl () {
      return window.location.href
    },
    raHours () {
      // Same raHours calculation as in ImageInfoBar.vue
      if (!this.image.right_ascension) return 0

      const unixCaptureDate = this.dateToUnix(this.image.capture_date)
      const whenWeSwitchedHoursToDegrees = 1678267200 // unix
      if (unixCaptureDate < whenWeSwitchedHoursToDegrees) {
        return this.image.right_ascension
      }

      // default is degrees, so convert to hours
      return this.image.right_ascension / 15
    },
    headerHeight () {
      // Calculate total height including margins
      if (!this.$refs.imageHeader) return 0

      const element = this.$refs.imageHeader
      const styles = window.getComputedStyle(element)
      const marginTop = parseFloat(styles.marginTop)
      const marginBottom = parseFloat(styles.marginBottom)

      // Return element height plus its margins
      return element.clientHeight + marginTop + marginBottom
    },
    metadataSectionStyle () {
      if (this.isWideScreen) {
        // When side by side, match height and restrict width
        // Add padding equal to image header height
        return {
          width: '320px',
          maxHeight: `${this.imageHeight}px`,
          paddingTop: `${this.headerHeight}px`
        }
      } else {
        // When stacked, match width
        return {
          width: `${this.imageWidth}px`,
          maxWidth: '100%',
          paddingTop: '0'
        }
      }
    }
  },
  mounted () {
    this.fetchImageData()
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    fetchImageData () {
      this.loading = true
      this.error = null

      const apiEndpoint = this.$store.state.api_endpoints.active_api
      axios.get(`${apiEndpoint}/image/${this.imageId}`)
        .then(response => {
          this.image = response.data
          this.loading = false
          document.title = `${this.image.base_filename} - Astronomical Image`
        })
        .catch(error => {
          console.error('Error fetching image:', error)
          this.error = 'The requested image could not be found.'
          this.loading = false
        })
    },
    formatDateTime (dateString) {
      return moment.utc(dateString).format('YYYY-MM-DD HH:mm UTC')
    },
    dateToUnix (date) {
      return (new Date(date).getTime() / 1000).toFixed(0)
    },
    truncateDecimalString (decimalString, n) {
      const number = parseFloat(decimalString)
      const factor = Math.pow(10, n)
      const truncatedNumber = Math.floor(number * factor) / factor
      return truncatedNumber.toString()
    },
    copyToClipboard () {
      navigator.clipboard.writeText(this.currentUrl)
        .then(() => {
          this.$buefy.toast.open({
            message: 'Link copied to clipboard!',
            type: 'is-success',
            duration: 2000
          })
        })
        .catch(err => {
          console.error('Failed to copy: ', err)
          this.$buefy.toast.open({
            message: 'Failed to copy link.',
            type: 'is-danger',
            duration: 2000
          })
        })
    },
    async downloadFits (size) {
      try {
        this.$buefy.toast.open({
          message: 'Preparing download...',
          type: 'is-info',
          duration: 3000
        })

        const params = {
          base_filename: this.image.base_filename,
          data_type: this.image.data_type,
          reduction_level: size === 'large'
            ? this.$store.state.images.large_fits_reduction_level
            : this.$store.state.images.small_fits_reduction_level
        }

        const fits_url = await this.$store.dispatch('images/get_fits_url', params)
        window.location.assign(fits_url)
      } catch (error) {
        console.error('Download error:', error)
        this.$buefy.toast.open({
          message: 'Download failed. Please try again.',
          type: 'is-danger',
          duration: 3000
        })
      }
    },
    handleImageLoad () {
      if (this.$refs.mainImage) {
        this.imageWidth = this.$refs.mainImage.naturalWidth
        this.imageHeight = this.$refs.mainImage.naturalHeight
        this.updateLayout()

        // After image loads, ensure header height is calculated
        this.$nextTick(() => {
          if (this.$refs.imageHeader) {
            // Force component to update with new header height
            this.$forceUpdate()
          }
        })
      }
    },
    handleResize () {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
      this.updateLayout()
      this.checkContentOverflow()

      // Recalculate header height after resize
      this.$nextTick(() => {
        if (this.$refs.imageHeader) {
          // Force component to update with new header height
          this.$forceUpdate()
        }
      })
    },
    updateLayout () {
      // If window width is at least 350px wider than the image, show side-by-side layout
      // This gives enough space for the metadata section (320px) plus some margin
      this.isWideScreen = this.windowWidth > (this.imageWidth + 350) && this.imageWidth > 0
    },
    checkContentOverflow () {
      // Add a small delay to ensure the DOM is updated
      this.$nextTick(() => {
        const containerHeight = this.$el.clientHeight
        const windowHeight = window.innerHeight
        this.shouldScroll = containerHeight > windowHeight

        // Update layout again if needed after content is fully rendered
        this.updateLayout()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../style/_variables.scss";

.single-image-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem;
  height: 100vh;
  color: $white;
}

.overflow-container {
  overflow-y: auto;
  max-height: 100vh;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: $grey-light;
}

.error-container {
  max-width: 600px;
  margin: 2rem auto;
}

.single-image-content {
  display: flex;
  flex-direction: column;
  height: 100%;

  &.side-by-side {
    flex-direction: row;
    align-items: flex-start;
    gap: 1rem;
  }
}

.image-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-header {
  margin-bottom: 0.75rem;
  text-align: center;

  .title {
    color: $white;
    font-weight: $title-weight;
    margin-bottom: 0.25rem;
    font-size: 1.3rem;
  }

  .subtitle {
    color: $grey-light;
    font-weight: $subtitle-weight;
    font-size: 0.95rem;
  }
}

.image-display {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;

  .main-image {
    max-width: 100%;
    max-height: 700px;
    object-fit: contain;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    border-radius: $radius;
  }
}

.metadata-section {
  flex: 0 0 auto;
  align-self: center;

  .side-by-side & {
    align-self: flex-start;
  }
}

.image-metadata {
  background-color: $grey-darker;
  padding: 1rem;
  border-radius: $radius;
  margin-bottom: 0.75rem;
  border: $border-width solid lighten($grey-darker, 5);
}

.metadata-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.metadata-column {
  flex: 1;
  min-width: 140px;
}

.metadata-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  .metadata-group {
    flex: 1;
    min-width: 140px;
  }
}

.metadata-group {
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  .subtitle {
    color: $grey-lighter;
    font-size: 0.9rem;
    font-weight: $weight-bold;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid $grey-dark;
    padding-bottom: 0.2rem;
  }
}

.metadata-compact-grid {
  display: grid;
  gap: 0.5rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;

  .label {
    font-weight: bold;
    color: $grey-light;
    font-size: 0.8rem;
    margin-bottom: 0;
  }

  .value {
    font-size: 0.95rem;
    color: $white;
  }
}

.fits-download {
  .buttons {
    margin-top: 0.25rem;

    .button {
      margin-bottom: 0.5rem;
      margin-right: 0.5rem;
    }
  }
}

.permalink {
  .field.has-addons {
    margin-top: 0.25rem;
  }
}

.return-link {
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;

  .button.is-text {
    color: $primary;
    padding: 0.25em 0.5em;

    &:hover {
      color: $link-hover;
    }
  }
}

.field.has-addons {
  .control {
    .input {
      background-color: $input-background-color;
      color: $input-color;
      border-color: $input-border-color;
      height: 2em;
    }

    .button {
      border-color: $primary;
      height: 2em;
    }
  }
}

@media (max-width: 768px) {
  .single-image-container {
    padding: 0.5rem;
  }

  .image-header {
    margin-bottom: 0.5rem;

    .title {
      font-size: 1.2rem;
    }

    .subtitle {
      font-size: 0.9rem;
    }
  }

  .metadata-container {
    gap: 0.75rem;
  }

  .metadata-actions {
    gap: 0.75rem;
  }
}
</style> -->
