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
      <b-dropdown-item value="download" aria-role="listitem">
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
        field="download" 
        label="download" 
        :visible="is_visible('download')"
        v-slot="props">
        <b-field>
        <p class="control">
          <b-button 
            size="is-small"
            @click="download_fits(props.row)" 
            :loading="check_download_in_progress(props.row.base_filename + 'fits')">
            fits
          </b-button>
        </p>
        <p class="control">
          <b-button 
            size="is-small"
            @click="download_tif(props.row, 'arcsinh')" 
            :loading="check_download_in_progress(props.row.base_filename + 'tif_arcsinh')">
            tif
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

      download_in_progress: [],
    };
  },
  methods: {

    add_download_progress(id) {
      if (!this.download_in_progress.includes(id)) {
        this.download_in_progress.push(id)
      }
    },
    remove_download_in_progress(id) {
      if (this.download_in_progress.includes(id)) {
        this.download_in_progress = this.download_in_progress.filter(x => x != id)
      }
    },
    check_download_in_progress(id) {
      return this.download_in_progress.includes(id)
    },

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

    async download_fits(image) {
      let current_download_id = image.base_filename + `fits`
      this.add_download_progress(current_download_id)
      //this.download_in_progress.push(current_download_id)

      let large_fits_reduction_level = this.$store.state.images.large_fits_reduction_level
      let object_name = `${image.base_filename}-${image.data_type}${large_fits_reduction_level}.fits.bz2`

      const url = `${this.$store.state.dev.active_api}/download`
      let body = {
        s3_directory: image.s3_directory,
        object_name: object_name,
        image_type: 'fits',
      }

      let fits_url = await axios.post(url, body);
      console.log(fits_url.data)
      window.location.assign(fits_url.data)
      //this.download_in_progress.delete(current_download_id)
      this.remove_download_in_progress(current_download_id)
    },
    async download_tif(image, stretch) {
      let current_download_id = image.base_filename + `tif_${stretch}`
      //this.download_in_progress.add(current_download_id)
      this.add_download_progress(current_download_id)

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
      window.location.assign(tif_url.data)
      //this.download_in_progress.delete(current_download_id)
      this.remove_download_in_progress(current_download_id)
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