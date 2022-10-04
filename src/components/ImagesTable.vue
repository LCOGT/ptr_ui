<template>
  <div>
    <b-dropdown
      v-model="visibleColumns"
      size="is-small"
      position="is-bottom-left"
      multiple
      aria-role="list"
    >
      <template #trigger>
        <b-button
          class="mb-3"
          size="is-small"
          icon-right="menu-down"
        >
          Visible Columns ({{ visibleColumns.length }})
        </b-button>
      </template>

      <b-dropdown-item
        value="filename"
        aria-role="listitem"
      >
        <span>filename</span>
      </b-dropdown-item>
      <b-dropdown-item
        value="right_ascension"
        aria-role="listitem"
      >
        <span>Right Ascension</span>
      </b-dropdown-item>
      <b-dropdown-item
        value="declination"
        aria-role="listitem"
      >
        <span>Declination</span>
      </b-dropdown-item>
      <b-dropdown-item
        value="filter"
        aria-role="listitem"
      >
        <span>filter</span>
      </b-dropdown-item>
      <b-dropdown-item
        value="exposure_time"
        aria-role="listitem"
      >
        <span>Exposure Time</span>
      </b-dropdown-item>
      <b-dropdown-item
        value="observation"
        aria-role="listitem"
      >
        <span>UTC Date</span>
      </b-dropdown-item>
      <b-dropdown-item
        value="download"
        aria-role="listitem"
      >
        <span>Download</span>
      </b-dropdown-item>
    </b-dropdown>

    <b-table
      :data="image_array"
      :narrowed="isNarrowed"
      :loading="isLoading"
      :focusable="isFocusable"
      :selected.sync="current_image"
      :paginated="true"
      :per-page="10"
      class="no-margin"
    >
      <b-table-column
        v-slot="props"
        field="filename"
        label="Filename"
        :visible="is_visible('filename')"
      >
        {{ get_filename(props.row) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="right_ascension"
        label="RA"
        :visible="is_visible('right_ascension')"
      >
        <ra-display :ra_hours_decimal="props.row.right_ascension" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="declination"
        label="Dec"
        :visible="is_visible('declination')"
      >
        <dec-display :dec_deg_decimal="props.row.declination" />
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="filter"
        label="filter"
        :visible="is_visible('filter')"
      >
        {{ props.row.filter_used }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="exposure_time"
        label="Seconds"
        :visible="is_visible('exposure_time')"
      >
        {{ get_exposure_time(props.row) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="observation"
        label="UTC Date"
        centered
        :visible="is_visible('observation')"
      >
        {{ get_observation_time(props.row) }}
      </b-table-column>

      <b-table-column
        v-slot="props"
        field="download"
        label="download"
        :visible="is_visible('download')"
      >
        <b-field>
          <p class="control">
            <b-button
              size="is-small"
              :loading="check_download_in_progress(props.row.base_filename + 'fits')"
              @click="download_fits(props.row)"
            >
              fits
            </b-button>
          </p>
          <p class="control">
            <b-button
              size="is-small"
              :loading="check_download_in_progress(props.row.base_filename + 'tif_arcsinh')"
              @click="download_tif(props.row, 'arcsinh')"
            >
              tif
            </b-button>
          </p>
        </b-field>
      </b-table-column>

      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon
                icon="emoticon-sad"
                size="is-large"
              />
            </p>
            <p>No images for the given search parameters</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
import RaDisplay from '@/components/display/RaDisplay'
import DecDisplay from '@/components/display/DecDisplay'
import { mapGetters } from 'vuex'
import moment from 'moment'
import axios from 'axios'
export default {
  components: {
    RaDisplay,
    DecDisplay
  },
  props: {
    image_array: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      visibleColumns: [
        'filename',
        // 'right_ascension',
        // 'declination',
        'filter',
        'exposure_time',
        'observation'
      ],

      isEmpty: false,
      isNarrowed: true,
      isFocusable: true,
      isLoading: false,
      isSelectable: true,

      file_downloading: '',

      download_in_progress: []
    }
  },
  methods: {

    add_download_progress (id) {
      if (!this.download_in_progress.includes(id)) {
        this.download_in_progress.push(id)
      }
    },
    remove_download_in_progress (id) {
      if (this.download_in_progress.includes(id)) {
        this.download_in_progress = this.download_in_progress.filter(x => x != id)
      }
    },
    check_download_in_progress (id) {
      return this.download_in_progress.includes(id)
    },

    is_visible (column) {
      return this.visibleColumns.includes(column)
    },
    get_filename (image) {
      if (image.base_filename) {
        return image.base_filename
      }
      return 'placeholder'
    },
    get_right_ascension (image) {
      if (image.right_ascension) {
        return image.right_ascension.toFixed(3)
      }
      return '---'
    },
    get_declination (image) {
      if (image.declination) {
        return image.declination.toFixed(3)
      }
      return '---'
    },
    get_exposure_time (image) {
      if (image.exposure_time) {
        return image.exposure_time.toFixed(3)
      }
      return '---'
    },
    get_observation_time (image) {
      if (image.capture_date) {
        return moment.utc(image.capture_date).format('YY-MM-DD HH:mm')
        // return new Date(image.capture_date).toISOString();
      }
      return '---'
    },

    async download_fits (image) {
      const current_download_id = image.base_filename + 'fits'
      this.add_download_progress(current_download_id)
      // this.download_in_progress.push(current_download_id)

      const large_fits_reduction_level = this.$store.state.images.large_fits_reduction_level
      const object_name = `${image.base_filename}-${image.data_type}${large_fits_reduction_level}.fits.fz`

      const url = `${this.$store.state.api_endpoints.active_api}/download`
      const body = {
        s3_directory: image.s3_directory,
        object_name,
        image_type: 'fits'
      }

      const fits_url = await axios.post(url, body)
      console.log(fits_url.data)
      window.location.assign(fits_url.data)
      // this.download_in_progress.delete(current_download_id)
      this.remove_download_in_progress(current_download_id)
    },
    async download_tif (image, stretch) {
      const current_download_id = image.base_filename + `tif_${stretch}`
      // this.download_in_progress.add(current_download_id)
      this.add_download_progress(current_download_id)

      const large_fits_reduction_level = this.$store.state.images.large_fits_reduction_level
      const object_name = `${image.base_filename}-${image.data_type}${large_fits_reduction_level}.fits.fz`

      const url = `${this.$store.state.api_endpoints.active_api}/download`
      const body = {
        s3_directory: image.s3_directory,
        object_name,
        stretch,
        image_type: 'tif'
      }

      const tif_url = await axios.post(url, body)
      window.location.assign(tif_url.data)
      // this.download_in_progress.delete(current_download_id)
      this.remove_download_in_progress(current_download_id)
    }

  },

  computed: {
    ...mapGetters('images', ['recent_images']),

    current_image: {
      get () {
        return this.$store.getters['images/current_image']
      },
      set (value) {
        this.$store.dispatch('images/set_current_image', value)
      }
    }

  }
}
</script>

<style lang="scss" scoped>
</style>
