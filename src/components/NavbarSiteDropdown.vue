<template>
  <b-navbar-dropdown
    ref="sites_dropdown"
    :label="label"
    expanded
    custom
    @active-change="dropdown_change"
  >
    <b-navbar-item
      custom
      paddingless
    >
      <ul
        style="width: 100%;"
        class="navbar-dropdown-wrapper"
      >
        <li
          v-for="wema in dropdownSitesData"
          :key="wema.id"
          :class="[site_online_class(wema.id), 'wema-and-obs']"
        >
          <div class="site-row wema">
            <div class="wema-name-expanded">
              {{ wema.id.toUpperCase() }} - {{ wema.name }}
            </div>
          </div>
          <ul class="obs-all">
            <li
              v-for="(obs, obs_index) in wema.observatories"
              :key="obs_index"
            >
              <router-link
                tag="div"
                :class="[{'selected': dropdown_active_site==obs.id}, 'site-row', 'obs' ]"
                :to="{ path: '/site/' + obs.id + '/' + active_subpage }"
                @click="dropdown_active_site = obs.id"
                @click.native="close_dropdown"
              >
                <div class="obs-name-short-container">
                  <div class="tab-spacer" />
                  <div :class="[site_online_class(obs.id), 'status-dot']" />
                  <div class="obs-name-short">
                    {{ obs.id }}&nbsp;
                  </div>
                </div>
                <div class="obs-name-expanded">
                  {{ obs.telescope_description }}
                </div>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </b-navbar-item>
  </b-navbar-dropdown>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    label: String,
    default: () => 'Observatories'
  },
  data () {
    return {
      dropdown_active_site: 'mrc1',
      site_images: {}
    }
  },
  mounted () {
    this.update_site_status()
  },
  computed: {
    ...mapState('site_config', ['selected_site', 'global_config']),
    ...mapGetters('site_config', ['all_sites_real', 'all_sites_simulated']),
    ...mapState('sitestatus', ['site_open_status', 'stale_age_ms']),
    ...mapGetters('sitestatus', ['all_sites_status_color']),

    dropdownSitesData () {
      const state = this.$store.state.site_config
      const sitesData = {}

      // Add all wemas as empty objects
      Object.keys(state.global_config)
        .filter(site => { return state.global_config[site].instance_type === 'wema' })
        .forEach(site => {
          sitesData[site] = {
            id: site,
            name: state.global_config[site].name,
            observatories: []
          }
        })

      // Add obs sites to their respective wema array
      Object.keys(state.global_config)
        .filter(site => { return state.global_config[site].instance_type === 'obs' })
        .forEach(site => {
          const wema_parent = state.global_config[site].wema_name
          sitesData[wema_parent].observatories.push({
            id: site,
            name: state.global_config[site].name,
            telescope_description: state.global_config[site].telescope_description
          })
        })

      // Add all other sites that don't adhere to the wema/obs structure yet.
      // In this case, treat the config as both wema and obs, to get a nice menu layout
      Object.keys(state.global_config)
        .filter(site => { return !(['obs', 'wema'].includes(state.global_config[site].instance_type)) })
        .forEach(site => {
          sitesData[site] = {
            id: site,
            name: state.global_config[site].name,
            observatories: [{
              id: site,
              name: state.global_config[site].name,
              telescope_description: state.global_config[site].telescope_description || 'under construction'
            }]
          }
        })
      return sitesData
    },

    real_sites () {
      return this.all_sites_real.map((s) => s.site)
    },
    simulated_sites () {
      return this.all_sites_simulated.map((s) => s.site)
    },
    active_subpage: {
      get () { return this.$store.state.user_interface.selected_subpage },
      set (value) { this.$store.commit('user_interface/selected_subpage', value) }
    }

  },
  methods: {
    dropdown_change () {
      if (this.$route.name == 'site') {
        this.dropdown_active_site = this.$route.params.sitecode
      }
      // update status
      this.update_site_status()
    },
    close_dropdown () {
      this.$refs.sites_dropdown.closeMenu()
    },
    update_site_status () {
      this.$store.dispatch('sitestatus/getSiteOpenStatus')
    },
    site_online_class (site) {
      return this.all_sites_status_color[site]
    }
  }
}
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

.navbar-dropdown-wrapper {
  max-height: 50vh;
  overflow-y: scroll;
}
.wema-and-obs {
  background-color: rgba(66, 66, 66, 0.044);
  border-left: 3px solid $ptr-grey;
  margin-bottom: 2em;
  margin: 1em;

  &.status-green {
    border-left: 3px solid $ptr-green;
  }
  &.status-yellow {
    border-left: 3px solid $ptr-yellow;
  }
  &.status-red {
    border-left: 3px solid $ptr-red;
  }
  @include tablet {
    min-width: 550px;
  }
}
.wema {
  display:flex;
  align-items: center;
}
.wema-name-short-container {
  display:flex;
  align-items: center;
  gap: 5px;
  width: 120px;
}
.wema-name-short {
    pointer-events: none;
}
.wema-name-expanded {
    pointer-events: none;
    font-size: 20px;
    color: rgb(166, 166, 166);
}
.obs-all {
  margin-bottom: 2em;
  width: 100%;
}
.obs-name-short-container {
  display:flex;
  align-items: center;
  gap: 5px;
  width: 120px;
  font-weight: bold;
}
.obs-name-short {
    pointer-events: none;
}
.obs-name-expanded {
    pointer-events: none;
    color: silver;
}
.tab-spacer {
  width: 10px;
}

.dropdown-wrapper {
    display: flex;
    flex-direction: column;
    width: 300px;
    // margin: 5px;
    gap: 2em;
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
    // grid-area: list;
    // display:flex;
    // flex-direction: column;
    // align-items: flex-start;
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
  &.wema {
    background-color: darken($body-background-color, 3);
  }
}
.site-row:hover {
    //border: 1px solid blue;
    margin: 0;

    &.obs {
      cursor: pointer;
      background-color: darken($body-background-color, 3);
    }
    &.placeholder {
      cursor:disabled;
    }
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
.status-dot.status-green {
  opacity: 0.8;
  background-color: $ptr-green;
}
.status-dot.status-yellow {
  opacity: 0.8;
  background-color: $ptr-yellow;
}
.status-dot.status-red {
  opacity: 0.8;
  background-color: $ptr-red;
}
.status-dot.status-grey {
  opacity: 0.8;
  background-color: $ptr-grey;
}
</style>
