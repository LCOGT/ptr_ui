<template>
    <div class="online-status-wrapper" >
        <div class="status-dot" :class="operational_status_color_class" ></div>
        <p class="status-text" :class="operational_status_color_class"> {{operational_status}}</p>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
    name: "SiteOperationalStatus", 
    props: {
        site: {
            type: String,
            default: null,
        },
        // Optional: manually insert the operational status value instead of finding in vuex.
        manual_status: {
            type: String,
            default: null,
        }
    },

    computed: {
        ...mapGetters('sitestatus', [
            'site_operational_status',
        ]),

        operational_status() {
            let status;
            // Prefer manual status if it is included
            if (this.manual_status!== null) { 
                status = this.manual_status
            // Otherwise retrieve from the active site in vuex
            } else {
                status = this.site_operational_status
            }
            return status
        },

        /**
         * operational: green
         * technical difficulty: yellow
         * offline: grey
         */
        operational_status_color_class() {

            const color_dict = {
                'operational': 'is-green',
                'technical difficulty': 'is-yellow',
                'offline': 'is-grey'
            }
            return color_dict?.[this.operational_status] ?? 'is-grey'
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