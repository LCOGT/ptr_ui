<template>
  <div class="download-interface">
      <div class="subtitle" style="margin-bottom: 0;">Download images within date range</div>
    <DatetimeWithTimezonePicker
      label="Start"
      :site="site"
      :date="date_one_day_ago"
      @input="(t) => (starttime = t)"
    />

    <DatetimeWithTimezonePicker
      label="End"
      :site="site"
      :date="new Date()"
      @input="(t) => (endtime = t)"
    />

    <b-field>
      <b-radio-button v-model="fits_size" native-value="small" >small</b-radio-button >
      <b-radio-button v-model="fits_size" native-value="large" >large</b-radio-button >
      <b-radio-button v-model="fits_size" native-value="best" >best available</b-radio-button >
    </b-field>

    <b-button
      :loading="zip_download_waiting"
      class="button has-text-white"
      @click="download_fits_batch"
    >
      <b-icon icon="download" size="is-small" />
      <span>download</span>
    </b-button>
  </div>
</template>

<script>
import DatetimeWithTimezonePicker from "@/components/FormElements/DatetimeWithTimezonePicker";
import axios from 'axios'
export default {
  name: "DownloadInterface",
  components: {
    DatetimeWithTimezonePicker,
  },
  props: {
    site: String
  },
  data() {
    return {
      starttime: "",
      endtime: "",
      fits_size: "small",
      zip_download_waiting: false,
    };
  },
  computed: {
    date_one_day_ago() {
      const ms_per_day = 24 * 60 * 60 * 1000;
      return new Date(new Date().getTime() - ms_per_day);
    },
  },
  methods: {
    download_fits_batch() {
      const request_body = {
        start_timestamp_s: this.starttime.getTime() / 1000,
        end_timestamp_s: this.endtime.getTime() / 1000,
        fits_size: this.fits_size,
        site: this.site,
      };
      const url = `${this.$store.state.api_endpoints.active_api}/downloadzip`
      this.zip_download_waiting = true;
      axios.post(url, request_body).then((response) => {
          let download_url = response.data.message;
          // quickly verify download url
          if ( !download_url.includes("https://photonranch-001.s3.amazonaws.com")) {
            console.warn("Bad url: ", download_url);
            throw new Error("Bad url: ", download_url);
          } else {
            window.location.assign(download_url);
          }
        }).catch((error) => {
          console.error("Zip download failed; ", error);

          // Handle 404: no files are available
          if (error.response.status == 404) {
            this.$buefy.toast.open({
              message:
                "No images are available from the last 24 hours at this site.",
              type: "is-warning",
              duration: 6000,
            });
          } else if (error.response.status == 504) {
            this.$buefy.toast.open({
              message: "Too many files to zip, request timed out. Try a smaller request.",
              type: "is-warning",
              duration: 6000,
            });
          }
        }).finally((r) => {
          this.zip_download_waiting = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.download-interface {
    margin-top: 2em;
    border: 1px solid grey;
    border-radius: 5px;
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
</style>
