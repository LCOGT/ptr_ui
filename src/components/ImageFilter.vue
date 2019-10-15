<template>
    <div>
        <b-collapse class="card" :open="false" aria-id="contentIdForA11y3">
            <div
                slot="trigger" 
                slot-scope="props"
                class="card-header"
                role="button"
                aria-controls="contentIdForA11y3">
                <p class="card-header-title">
                    <i class="fa fa-search fa-fw"></i>&nbsp;
                    Filter tool
                </p>
                <a class="card-header-icon">
                    <b-icon
                        :icon="props.open ? 'menu-down' : 'menu-up'">
                    </b-icon>
                </a>
            </div>
            <div class="notification">
                <div class="content">
                    <form class="review-form" @submit.prevent="onSubmit">
                        <b-field label="Filename">
                            <b-input v-model="filename" placeholder="(Optional)"></b-input>
                        </b-field>

                        <b-field  label="Site">
                            <b-select v-model="site" placeholder="--" >
                                <option>wmd
                                </option>
                            </b-select>
                        </b-field>

                        <b-field label="Filter">
                            <b-select v-model="filter" placeholder="--">
                        <option>w</option>
                        <option>r</option>
                        <option>air</option>
                        <option>HA</option>
                        <option>dark</option>
                            </b-select>
                        </b-field>

                        <b-field label="Start date">
                            <b-datepicker
                                placeholder="Type or select a date..."
                                v-model="start_date"
                                icon="calendar-today"
                                editable>
                            </b-datepicker>
                        </b-field>

                        <b-field label="End date">
                            <b-datepicker
                                placeholder="Type or select a date..."
                                v-model="end_date"
                                icon="calendar-today"
                                editable>
                            </b-datepicker>
                        </b-field>

                        <p>
                            <input type="submit" class="button" value="Submit">  
                        </p>    
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
  data() {
    return {
      filename: null,
      site: null,
      start_date: null,
      end_date: null,
      filter: null
    };
  },

  methods: {
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
        username: "wmd_admin",
        filename: this.filename,
        site: this.site,
        start_date: startDate,
        end_date: endDate,
        filter: this.filter
      };

      this.$store.dispatch("images/get_filtered_images", filterparams);

      //Clear form fields after sumbit
      this.site = null;
      this.start_date = null;
      this.end_date = null;
      this.filter = null;
      this.filename = null;
    }
  }
};
</script>

<style scoped>
</style>
