<template>
  <div>
    <b-dropdown
      size="is-small"
      position="is-bottom-left"
      v-model="visibleColumns"
      multiple
      aria-role="list">
      <template #trigger>
          <b-button
            class="mb-3"
            size="is-small"
            icon-right="menu-down">
            Visible Columns ({{visibleColumns.length }})
          </b-button>
      </template>

      <b-dropdown-item value="filename" aria-role="listitem">
          <span>filename</span>
      </b-dropdown-item>
      <b-dropdown-item value="right_ascension" aria-role="listitem">
          <span>Right Ascension</span>
      </b-dropdown-item>
      <b-dropdown-item value="declination" aria-role="listitem">
          <span>Declination</span>
      </b-dropdown-item>
      <b-dropdown-item value="filter" aria-role="listitem">
          <span>filter</span>
      </b-dropdown-item>
      <b-dropdown-item value="exposure_time" aria-role="listitem">
          <span>Exposure Time</span>
      </b-dropdown-item>
      <b-dropdown-item value="observation" aria-role="listitem">
          <span>UTC Date</span>
      </b-dropdown-item>
      <b-dropdown-item value="tif_download" aria-role="listitem">
          <span>TIF Downloads</span>
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
        field="filename" 
        label="Filename" 
        :visible="is_visible('filename')"
        v-slot="props">
        {{ get_filename(props.row) }}
      </b-table-column>

      <b-table-column
        field="right_ascension"
        label="RA"
        :visible="is_visible('right_ascension')"
        v-slot="props"
      >
        <ra-display :ra_hours_decimal="props.row.right_ascension" />
      </b-table-column>

      <b-table-column 
        field="declination" 
        label="Dec" 
        :visible="is_visible('declination')"
        v-slot="props">
        <dec-display :dec_deg_decimal="props.row.declination" />
      </b-table-column>

      <b-table-column
        field="filter"
        label="filter"
        :visible="is_visible('filter')"
        v-slot="props"
      >
        {{ props.row.filter_used }}
      </b-table-column>

      <b-table-column
        field="exposure_time"
        label="Seconds"
        :visible="is_visible('exposure_time')"
        v-slot="props"
      >
        {{ get_exposure_time(props.row) }}
      </b-table-column>

      <b-table-column
        field="observation"
        label="UTC Date"
        centered
        :visible="is_visible('observation')"
        v-slot="props"
      >
        {{ get_observation_time(props.row) }}
      </b-table-column>

      <b-table-column 
        field="tif_download" 
        label="tif download" 
        :visible="is_visible('tif_download')"
        v-slot="props">
        <b-field>
        <p class="control">
          <b-button 
            size="is-small"
            @click="download_tif(props.row, 'linear')" 
            :loading="file_downloading==props.row.base_filename + 'tif_linear'">
            linear
            <!--b-icon icon="download" size="is-small" /-->
          </b-button>
        </p>
        <p class="control">
          <b-button 
            size="is-small"
            @click="download_tif(props.row, 'arcsinh')" 
            :loading="file_downloading==props.row.base_filename + 'tif_arcsinh'">
            <!--b-icon icon="download" size="is-small" /-->
            arcsinh
          </b-button>
        </p>
        </b-field>
      </b-table-column>


      <template slot="empty">
        <section class="section">
          <div class="content has-text-grey has-text-centered">
            <p>
              <b-icon icon="emoticon-sad" size="is-large"> </b-icon>
            </p>
            <p>No images for the given search parameters</p>
          </div>
        </section>
      </template>
    </b-table>
  </div>
</template>

<script>
import RaDisplay from "@/components/display/RaDisplay";
import DecDisplay from "@/components/display/DecDisplay";
import { mapGetters } from "vuex";
import moment from 'moment';
import axios from 'axios'
export default {
  components: {
    RaDisplay,
    DecDisplay,
  },
  props: {
    image_array: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      visibleColumns: [
        'filename',
        //'right_ascension',
        //'declination',
        'filter',
        'exposure_time',
        'observation',
      ],

      isEmpty: false,
      isNarrowed: true,
      isFocusable: true,
      isLoading: false,
      isSelectable: true,

      file_downloading: '',
    };
  },
  methods: {
    is_visible(column) {
      return this.visibleColumns.includes(column)
    },
    get_filename(image) {
      if (image.base_filename) {
        return image.base_filename;
      }
      return "placeholder";
    },
    get_right_ascension(image) {
      if (image.right_ascension) {
        return image.right_ascension.toFixed(3);
      }
      return "---";
    },
    get_declination(image) {
      if (image.declination) {
        return image.declination.toFixed(3);
      }
      return "---";
    },
    get_exposure_time(image) {
      if (image.exposure_time) {
        return image.exposure_time.toFixed(3);
      }
      return "---";
    },
    get_observation_time(image) {
      if (image.capture_date) {
        return moment.utc(image.capture_date).format('YY-MM-DD HH:mm')
        //return new Date(image.capture_date).toISOString();
      }
      return "---";
    },
    async download_tif(image, stretch) {
      this.file_downloading = image.base_filename + `tif_${stretch}`

      let size = "large"

      let s3_directory = image.s3_directory

      let large_fits_reduction_level = this.$store.state.images.large_fits_reduction_level
      let object_name = `${image.base_filename}-${image.data_type}${large_fits_reduction_level}.fits.bz2`

      const url = `${this.$store.state.dev.active_api}/download`
      let body = {
        s3_directory: image.s3_directory,
        object_name: object_name,
        stretch: stretch,
        image_type: 'tif',
      }

      let tif_url = await axios.post(url, body)
      console.log(tif_url.data)
      window.location.assign(tif_url.data)
      this.file_downloading = ''
    },
  },

  computed: {
    ...mapGetters("images", ["recent_images"]),

    current_image: {
      get() {
        return this.$store.getters["images/current_image"];
      },
      set(value) {
        this.$store.dispatch("images/set_current_image", value);
      },
    },
  },
};
</script>

<style lang="scss" scoped>
</style>