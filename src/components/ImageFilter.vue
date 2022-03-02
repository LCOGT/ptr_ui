<template>
  <div>
    <b-collapse  :open="false" aria-id="contentIdForA11y3">
      <div
        slot="trigger"
        slot-scope="props"
        class="collapsable-header"
        role="button"
        aria-controls="contentIdForA11y3"
        style="display: flex"
      >
        <p> search filters </p>
        <b-icon :icon="props.open ? 'menu-down' : 'menu-left'"> </b-icon> 
      </div>

      <div class="notification">
        <div class="content">

            <b-field>
              <b-radio-button 
                v-model="show_user_data_only"
                :native-value="true"
                :disabled="!$auth.isAuthenticated"
                >
                <span>only my data</span>
              </b-radio-button>

              <b-radio-button 
                v-model="show_user_data_only"
                :native-value="false">
                <span>everyone's data</span>
              </b-radio-button>
            </b-field>

            <DatetimeWithTimezonePicker 
              label="Start"
              @input="(t) => (start_date = t)"
              :date="new Date(Date.now() - 86400000)"
              :site="sitecode" />
            <DatetimeWithTimezonePicker 
              label="End"
              @input="(t) => (end_date = t)"
              :date="new Date(Date.now() + 86400000)"
              :site="sitecode" />

            <b-field label="Exposure time (seconds)">
              <b-input
                type="number"
                step="any"
                min="0"
                v-model="exp_time_min"
                placeholder="min"
              />
              <p class="control">
                <b-input
                  type="number"
                  step="any"
                  min="0"
                  v-model="exp_time_max"
                  placeholder="max (optional)"
                />
              </p>
            </b-field>

            <b-field label="Filter">
              <b-select v-model="filter" placeholder="any">
                <option v-for="(filter_option, index) in filter_wheel_options" :key="index">
                  {{ filter_option[0] }}
                </option>
              </b-select>
            </b-field>

            <b-field label="Filename">
              <b-input v-model="filename" placeholder="(optional)"></b-input>
            </b-field>

            <div style="display: flex; justify-content:space-between;">
              <b-button
                @click="reset_fields"
                class="button"
                style="float: left"
                aria-controls="contentIdForA11y1"
              >clear form</b-button>
              <b-button 
                class="button" 
                @click="onSubmit" 
                :loading="submit_button_loading"
              >submit</b-button>
            </div>

        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
import DatetimeWithTimezonePicker from '@/components/FormElements/DatetimeWithTimezonePicker'
import { mapGetters } from 'vuex'
import axios from 'axios'
var moment = require("moment");
moment().format();

export default {
  name: "ImageFilter",
  props: ["sitecode"],
  components: { DatetimeWithTimezonePicker },
  data() {
    return {
      submit_button_loading: false,
      show_user_data_only: false,
      filename: null,
      exp_time_min: null,
      exp_time_max: null,
      site: null,
      start_date: null,
      end_date: null,
      filter: null,
    };
  },

  methods: {
    reset_fields() {
      //Clear form fields
      this.site = null;
      this.start_date = null;
      this.end_date = null;
      this.filter = null;
      this.filename = null;
      this.exp_time_min = null;
      this.exp_time_max = null;
      this.show_user_data_only = false;

      //Get all images
      this.$store.dispatch("images/load_latest_images");
      this.$store.dispatch("images/set_latest_image");
    },

    onSubmit() {
      this.submit_button_loading = true
      let startDate = null;
      let endDate = null;

      if (moment(this.start_date).isValid()) {
        startDate = moment(this.start_date).format("YYYY-MM-DD hh:mm:ss");
      }
      if (moment(this.end_date).isValid()) {
        endDate = moment(this.end_date).format("YYYY-MM-DD hh:mm:ss");
      }

      let filterparams = {
        filename: this.filename,
        exposure_time_min: this.exp_time_min,
        exposure_time_max: this.exp_time_max,
        site: this.sitecode,
        start_date: startDate,
        end_date: endDate,
        filter: this.filter,
      };
      if (this.show_user_data_only) {
        filterparams.user_id = this.$auth.user.sub
      }

      this.$store.dispatch('images/toggle_live_data', false)
      let url = this.$store.state.dev.active_api + '/filtered_images';
      let body = { 
          method: "GET",
          params: filterparams,
          //baseURL: apiName,
          url: url,
      }
      axios(body).then(response => {
        response = response.data
        console.log(response)
        // Empty response:
        if (response.length == 0) { 
            this.$store.dispatch('images/display_placeholder_image') 
            return; 
        }
        this.$store.commit('images/setRecentImages',response)
      }).catch(error => {
          console.warn(error)
      }).finally(() => {
        this.submit_button_loading = false
      });

    },
  },

  computed: {
    ...mapGetters('site_config', [
      'filter_wheel_options'
    ])
  }
};
</script>

<style scoped lang="scss">
@import "@/style/_variables";
@import "@/style/_responsive";

.collapsable-header {
  padding: 2px 1em;
  display:flex;
  justify-content: space-between;
  background-color: darken($grey-dark,4) ;

  &:hover {
    cursor: pointer;
  }
}

</style>
