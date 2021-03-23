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
        <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"> </b-icon> 
      </div>

      <div class="notification">
        <div class="content">
          <form class="review-form" @submit.prevent="onSubmit">
            <b-field label="Filename">
              <b-input v-model="filename" placeholder="(Optional)"></b-input>
            </b-field>

            <b-field label="Filter">
              <b-select v-model="filter" placeholder="--">
                <option v-for="filter_option in filter_options">
                  {{ filter_option }}
                </option>
              </b-select>
            </b-field>

            <div class="columns">
              <div class="column">
            <b-field label="Start date">
              <b-datepicker
                placeholder="Type or select a date..."
                v-model="start_date"
                icon="calendar-today"
                editable
              >
              </b-datepicker>
            </b-field>
            </div>
            <div class="column">
            <b-field label="End date">
              <b-datepicker
                placeholder="Type or select a date..."
                v-model="end_date"
                icon="calendar-today"
                editable
              >
              </b-datepicker>
            </b-field>
            </div>
            </div>

            <div class="columns">
              <div class="column">
                <b-field label="Exposure time (s)">
                  <b-input
                    type="number"
                    step="any"
                    min="0"
                    v-model="exp_time_min"
                    placeholder="min"
                  >
                  </b-input>
                </b-field>
              </div>
              <div class="column">
                <b-field label="(range optional)">
                  <b-input
                    type="number"
                    step="any"
                    min="0"
                    v-model="exp_time_max"
                    placeholder="max"
                  >
                  </b-input>
                </b-field>
              </div>
            </div>

            <div style="display: flex; justify-content:space-between;">
              <button
                @click="reset_fields"
                class="button"
                style="float: left"
                aria-controls="contentIdForA11y1"
              >
                <i style="font-size: 14px" class="fa">&#xf0e2;</i>
              </button>
              <input type="submit" class="button" value="Submit" />
            </div>
          </form>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
var moment = require("moment");
moment().format();

export default {
  name: "ImageFilter",
  props: ["sitecode"],
  data() {
    return {
      filename: null,
      exp_time_min: null,
      exp_time_max: null,
      site: null,
      start_date: null,
      end_date: null,
      filter: null,
      filter_options: [
        "air",
        "dif",
        "w",
        "ContR",
        "N2",
        "u",
        "g",
        "r",
        "i",
        "zs",
        "PL",
        "PR",
        "PG",
        "PB",
        "O3",
        "HA",
        "S2",
        "dif_u",
        "dif_g",
        "dif_r",
        "dif_i",
        "dif_zs",
        "dark",
      ],
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

      //Get all images
      this.$store.dispatch("images/load_latest_images");
      this.$store.dispatch("images/set_latest_image");
    },

    onSubmit() {
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

      this.$store.dispatch("images/get_filtered_images", filterparams);
    },
  },
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
