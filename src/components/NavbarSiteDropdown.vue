<template>
  <b-navbar-dropdown ref="sites_dropdown" :label="label"  @active-change="dropdown_change">
    <div class="dropdown-wrapper">
        <h1 class="site-name">{{dropdown_active_site}}</h1>
        <div class="site-list">
            <template v-for="site in real_sites">
                <div 
                    :class="[{'selected': dropdown_active_site==site}, 'site-row']" 
                    :key="site"
                    @click="dropdown_active_site = site"
                    >
                    <div :class="[site_online_class(site), 'status-dot']" />
                    <div class="site-name-short"> {{ global_config[site].site }}&nbsp; </div>
                    <div class="site-name-expanded"> {{ global_config[site].name }} </div>
                </div>
            </template>
            <hr class="navbar-divider" />
            <template v-for="site in simulated_sites">
                <div 
                    :class="[{'selected': dropdown_active_site==site}, 'site-row']" 
                    :key="site"
                    @click="dropdown_active_site = site"
                    >
                    <div :class="[site_online_class(site), 'status-dot']" />
                    <div class="site-name-short"> {{ global_config[site].site }}&nbsp; </div>
                    <div class="site-name-expanded"> {{ global_config[site].name }} </div>
                </div>
            </template>
        </div>
        <NavbarSitePreview 
            class="site-preview" 
            :site="dropdown_active_site" 
            :weather="site_weather_status(dropdown_active_site)"
            :operation="site_operational_status(dropdown_active_site)"
            :image_url="site_images[dropdown_active_site]" 
            @view-site-clicked="close_dropdown"
        />
    </div>
  </b-navbar-dropdown>
</template>

<script>
import NavbarSitePreview from '@/components/NavbarSitePreview'
import { mapState, mapGetters } from "vuex";
import axios from 'axios'

export default {
    components: {
        NavbarSitePreview,
    },
    props: {
      label: String,
      default: "Observatories"
    },
    data() {
        return {
            dropdown_active_site: 'mrc',
            site_images: {}, 
        }
    },
    mounted() {
        this.update_site_status()
        this.update_all_site_images()
    },
  computed: {
    ...mapState("site_config", ["selected_site", "global_config"]),
    ...mapGetters("site_config", ["all_sites_real", "all_sites_simulated"]),
    ...mapState("sitestatus", ["site_open_status"]),

    real_sites() {
      return this.all_sites_real.map((s) => s.site);
    },
    simulated_sites() {
      return this.all_sites_simulated.map((s) => s.site);
    },

  },
  methods: {
      dropdown_change() {
          if (this.$route.name == 'site') {
              this.dropdown_active_site = this.$route.params.sitecode
          }
          // update status
          this.update_site_status;
      },
      close_dropdown() {
          this.$refs.sites_dropdown.closeMenu()
      },
    open_control_room(site) {
      let url = `https://rooms.remotehq.com/photon-ranch/control-room-${site}`;
      window.open(url);
    },
    update_all_site_images() {
      const url = this.$store.state.api_endpoints.active_api + `/latest_image_all_sites`
      axios.get(url).then(response => {
        this.site_images = response.data
      })
    },
    update_site_status() {
        this.$store.dispatch("sitestatus/getSiteOpenStatus");
    },
    site_operational_status(site) {
        if (!Object.keys(this.site_open_status).includes(site)) {
            return 'not available'
        }
        const stale_age_s = 300 // 5 minutes
        const site_status = this.site_open_status[site]

        if (!Object.keys(site_status).includes('weather', 'enclosure', 'device')) {
            return 'not available'
        }

        const weather_not_stale = site_status.weather.status_age_s < stale_age_s
        const device_not_stale = site_status.device.status_age_s < stale_age_s
        const enclosure_not_stale = site_status.enclosure.status_age_s < stale_age_s

        if ( weather_not_stale && device_not_stale && enclosure_not_stale) {
            return 'operational'
        } else if ( weather_not_stale || device_not_stale || enclosure_not_stale) {
            return 'technical difficulty'
        } else {
            return 'offline'
        }
    },
    /*
      Strategy: 
        if weather status is recent and wx_ok is true: green dot
        if weather status is recent and wx_ok is false: red dot
        otherwise: grey dot
    */
    site_weather_status(site) {
      const status_age_online = 300; // max number of seconds to be considered online

      // Do nothing if the site doesn't have any status records
      if (!Object.keys(this.site_open_status).includes(site)) {
        return "offline";
      }

      // Extract the age of the latest status
      const weather_age = this.site_open_status[site]?.weather?.status_age_s;
      const enclosure_age =
        this.site_open_status[site]?.enclosure?.status_age_s;
      const device_age = this.site_open_status[site]?.device?.status_age_s;

      // online sites: weather is sending and ok.
      if (Object.keys(this.site_open_status[site]).includes("wx_ok")) {
        let weather_ok = this.site_open_status[site].wx_ok;
        let weather_status_age =
          this.site_open_status[site].weather.status_age_s;
        let weather_is_recent = weather_status_age < status_age_online;
        if (!weather_is_recent) {
          return "offline";
        } else {
          return weather_ok ? "ok" : "poor";
        }
      }
      return "offline";
    },
    site_online_class(site) {
        let status = this.site_weather_status(site)
        if (status == "offline")    return 'status-grey'
        if (status == "ok")         return 'status-green'
        if (status == "poor")       return 'status-red'
        return "status-grey";
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
@import "@/style/_responsive.scss";

::v-deep .navbar-dropdown {
  @include tablet {
    left: -500px;
  }
  @include widescreen {
    left: -300px;
  }
  @include fullhd {
    left: -100px;
  }
}
.dropdown-wrapper {
    display: flex;
    flex-direction: column;
    margin: 5px;
    gap: 2em;
    @include tablet {
        display: grid;
        grid-template-columns: repeat(2, minmax(max-content, 1fr));
        grid-template-rows: 30px 1fr;
        grid-template-areas: ".     name"
                             "list  preview";
        width: max-content;
        grid-gap: 1em;
        //grid-column-gap: 1em;
    }
}

.site-name{
    grid-area: name;
    font-size: 20px;
    text-transform: uppercase;
    font-weight: bold;
}
.site-preview {
    grid-area: preview;
}

.site-list {
    grid-area: list;
    display:flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0 10px;
}
.site-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    //margin: 1px;
    padding: 5px 2em 5px 1em;
    width: 100%;
}
.site-row.selected {
    background-color: darken($body-background-color, 3);
}
.site-row:hover {
    background-color: darken($body-background-color, 3);
    //border: 1px solid blue;
    margin: 0;
}

.navbar-divider {
    grid-column-start: 1;
    grid-column-end: -1;
    border-bottom: 1px solid grey;
    width: 100%;
}
.site-name-short {
    pointer-events: none; 
    font-weight: bold; 
    width: 9ex;
}
.site-name-expanded {
    pointer-events: none; 
    color: silver;

}
.control-room-button {
}
.status-dot {
  /* Center the content */
  align-items: center;
  display: flex;
  justify-content: center;
  //margin-right: 10px;

  background-color: blue;

  /* Rounded border */
  border-radius: 9999px;
  height: 8px;
  width: 8px;

  pointer-events: none;
}
.status-green {
  opacity: 0.8;
  background-color: $ptr-green;
}
.status-yellow {
  opacity: 0.8;
  background-color: $ptr-yellow;
}
.status-red {
  opacity: 0.8;
  background-color: $ptr-red;
}
.status-grey {
  opacity: 0.8;
  background-color: $ptr-grey;
}
</style>
