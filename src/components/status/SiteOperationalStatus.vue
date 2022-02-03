<template>
    <div class="online-status-wrapper" :title="`status age: 3`" >
        <div class="status-dot" :class="operational_status_color_class" ></div>
        <p class="status-text" :class="operational_status_color_class">{{site_operational_status}}</p>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
    name: "SiteOperationalStatus", 
    props: {
        site: {
            type: String,
            required: true,
        }
    },

    computed: {
        ...mapGetters('sitestatus', [
            'site_operational_status',
        ]),

        /**
         * operational: green
         * technical difficulty: yellow
         * offline: grey
         */
        operational_status_color_class() {
            const status = this.site_operational_status
            if (status == "operational") {
                return "is-green"
            }
            else if (status == "technical difficulty") {
                return "is-yellow"
            }
            else if (status == "offline") {
                return "is-grey"
            }
            else {
                return "is-grey"
            }
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