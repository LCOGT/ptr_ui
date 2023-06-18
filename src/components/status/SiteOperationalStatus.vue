<template>
  <div class="online-status-wrapper">
    <div
      class="status-dot"
      :class="operational_status_color_class"
    />
    <p
      class="status-text"
      :class="operational_status_color_class"
    >
      {{ operational_status }}
    </p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'SiteOperationalStatus',
  props: {
    site: {
      type: String,
      default: null
    },
    // Optional: manually insert the operational status value instead of finding in vuex.
    manual_status: {
      type: String,
      default: null
    }
  },

  computed: {
    ...mapGetters('sitestatus', [
      'site_operational_status'
    ]),

    operational_status () {
      let status
      // Prefer manual status if it is included
      if (this.manual_status !== null) {
        status = this.manual_status
        // Otherwise retrieve from the active site in vuex
      } else {
        status = this.site_operational_status.text
      }
      return status
    },

    /**
         * operational: green
         * technical difficulty: yellow
         * offline: grey
         */
    operational_status_color_class () {
      return this.site_operational_status.colorClass
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";

// Important (and perhaps questionable design): keep these color
// classes on top so they can be overridden if needed.
.is-green {
    background-color: $ptr-green;
    color: $ptr-green;
}
.is-yellow {
    background-color: $ptr-yellow;
    color: $ptr-yellow;
}
.is-red {
    background-color: $ptr-red;
    color: $ptr-red;
}
.is-grey {
    background-color: $ptr-grey;
    color: $ptr-grey;
}
.is-blue {
  background-color: $ptr-blue;
  color: $ptr-blue;
}

.online-status-wrapper {
  display: flex;
  align-items: center;
}
.status-text {
    font-weight: bold;
    background-color: unset;
}
.status-dot {
  /* Center the content */
  align-items: center;
  display: flex;
  justify-content: center;
  margin-right: 10px;

  /* Rounded border */
  border-radius: 9999px;
  height: 12px;
  width: 12px;
}
</style>
