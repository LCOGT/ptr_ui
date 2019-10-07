<template>
<div>
            <b-collapse :open="false" aria-id="contentIdForA11y1">
            <button
                class="button is-primary"
                slot="trigger"
                aria-controls="contentIdForA11y1">Filter</button>
            <div class="notification">
                <div class="content">


     <form class="review-form" @submit.prevent="onSubmit">
      <p>
        <label for="filename">filename:</label>
        <input id="filename" v-model="filename" placeholder="filename">
      </p>

    <b-field label="Start date">
        <b-datepicker
            placeholder="Type or select a date..."
            icon="calendar-today"
            editable>
        </b-datepicker>
    </b-field>

    <b-field label="End date">
        <b-datepicker
            placeholder="Type or select a date..."
            icon="calendar-today"
            editable>
        </b-datepicker>
    </b-field>

        <b-dropdown aria-role="list">
            <button class="button is-primary" slot="trigger">
                <span>Filter</span>
                <b-icon icon="menu-down"></b-icon>
        </button>
        <select id="filter" v-model="filter">
            <b-dropdown-item aria-role="listitem">w</b-dropdown-item>
            <b-dropdown-item aria-role="listitem">air</b-dropdown-item>
            <b-dropdown-item aria-role="listitem">r</b-dropdown-item>
        </select>
        </b-dropdown>

      <p>
        <label for="filter">Filter:</label>
        <select id="filter" v-model.number="filter">
          <option>w</option>
          <option>r</option>
          <option>air</option>
          <option>HA</option>
          <option>dark</option>
        </select>
      </p>
          
      <p>
        <input type="submit" value="Submit">  
      </p>    
    
    </form>

                </div>
            </div>
        </b-collapse>
        </div>
</template>

<script>
export default {
  name: "ImageFilter",
  data() {
    return {
      filename: null,
      filter: null
    };
  },

  methods: {
    onSubmit() {
      let filterParams = {
        filename: this.filename,
        filter: this.filter
      };

      this.$store.dispatch("images/get_filtered_images", FilterParams);
      this.filename = null; //Clear form fields after sumbit
      this.filter = null;
    }
  }
};
</script>

<style>
</style>
