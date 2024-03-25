<template>
  <b-select
    v-model="selection"
    :size="size"
    placeholder="Select a site"
  >
    <option
      v-if="include_all"
      value="all"
    >
      {{ all_display_value }}
    </option>
    <template v-for="(site, index) in all_sites">
      <option
        :key="index"
        :value="site.site"
      >
        {{ site.site }}
      </option>
    </template>
  </b-select>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'SiteSelectField',
  props: {
    value: {
      type: String,
      required: true
    },
    // Include a site called 'all', useful for some queries
    include_all: {
      type: Boolean,
      default: true
    },
    all_display_value: {
      type: String,
      default: 'All Sites'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      selection: this.value
    }
  },
  watch: {
    selection (current_val) {
      this.$emit('input', current_val)
    }
  },
  computed: {
    ...mapGetters('site_config', ['all_sites'])
  }
}
</script>
