
<template>
  <div>
    <b-table
      :data="recent_uploads"
      :loading="table_is_loading"
      :default-sort="['upload_timestamp_s', 'desc']"
      :paginated="true"
      :pagination-position="'top'"
      narrowed
    >
      <template #top-center> test </template>
      <b-table-column
        field="upload_timestamp_s"
        label="Upload Time"
        v-slot="props"
        sortable
      >
        {{ parseFloat(props.row.upload_timestamp_s) | toISO }}
      </b-table-column>
      <b-table-column
        field="filename"
        label="filename"
        v-slot="props"
        searchable
      >
        {{ props.row.filename }}
      </b-table-column>
      <b-table-column
        field="size_bytes"
        label="size (bytes)"
        v-slot="props"
        sortable
        numeric
      >
        {{ props.row.size_bytes }}
      </b-table-column>
      <template #top-left>
        <b-field>
          <SiteSelectField
            :size="size"
            v-model="selected_site"
            all_display_value="Everything"
            include_all
          />
          <p class="control">
            <b-button :size="size" class="button" @click="get_recent_uploads">
              get recent uploads
            </b-button>
          </p>
        </b-field>
      </template>
      <template #empty>
        <div class="has-text-centered">No records from the last 48 hours</div>
      </template>
    </b-table>
  </div>
</template>

<script>
import axios from "axios";
import SiteSelectField from "@/components/FormElements/SiteSelectField";

export default {
  name: "RecentS3UploadsTable",
  components: { SiteSelectField },
  props: {
    // Specify a site to load when the component loads
    init_site: {
      type: String,
      default: () => "all",
    },
    size: {
      type: String,
      default: "",
    }
  },
  data() {
    return {
      recent_uploads: [],
      table_is_loading: false,
      selected_site: this.init_site,
    };
  },
  mounted() {
    if (this.init_site) {
      this.selected_site = this.init_site;
      this.get_recent_uploads();
    }
  },
  filters: {
    toISO(timestamp_s) {
      return new Date(timestamp_s * 1000).toISOString().slice(0, -5) + " UTC";
    },
  },
  methods: {
    get_recent_uploads() {
      this.table_is_loading = true;
      let url = `${
        this.$store.state.dev.active_api
      }/recentuploads?site=${encodeURIComponent(this.selected_site)}`;
      axios
        .get(url)
        .then((response) => {
          this.recent_uploads = response.data;
        })
        .catch(console.warn)
        .finally(() => {
          this.table_is_loading = false;
        });
    },
  },
};
</script>

<style scoped>
.container {
  margin-top: 3em;
}
</style>
