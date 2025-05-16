<template>
  <div class="page">
    <div class="total-site-menu">
      <SiteNavbar />

      <div class="mobile-site-menu">
        <button class="menu-padding" />
        <router-link :to="'/site/' + sitecode + '/home'">
          <button
            class="button"
            :class="{'selected': subpage == 'home'}"
          >
            Home
          </button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/targets'">
          <button
            class="button"
            :class="{'selected': subpage == 'targets'}"
          >
            Sky Map
          </button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/observe'">
          <button
            class="button"
            :class="{'selected': subpage == 'observe'}"
          >
            Observe
          </button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/calendar'">
          <button
            class="button"
            :class="{'selected': subpage == 'calendar'}"
          >
            Calendar
          </button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/projects'">
          <button
            class="button"
            :class="{'selected': subpage == 'projects'}"
          >
            Projects
          </button>
        </router-link>
        <button
          class="menu-padding"
          button
        />
      </div>
    </div>

    <div class="page-view">
      <QuickSiteSwitchButtons
        :current-site="sitecode"
        class="quick-site-switch-buttons"
      />
      <div class="quick-site-switch-buttons-spacer" />
      <component
        :is="`site-${subpage}`"
        :sitecode="sitecode"
      />
    </div>

    <site-status-footer
      class="is-hidden-mobile status-footer"
      :site="sitecode"
    />

    <site-status-footer-mobile
      class="is-hidden-tablet status-footer"
      :site="sitecode"
    />
  </div>
</template>

<script>
import CommandButton from '@/components/FormElements/CommandButton'
import ChatModule from '@/components/ChatModule'
import StatusPanelCollapsible from '@/components/status/StatusPanelCollapsible'
import SiteStatusFooter from '@/components/status/SiteStatusFooter'
import SiteStatusFooterMobile from '@/components/status/SiteStatusFooterMobile'
import SiteNavbar from '@/components/SiteNavbar.vue'
import QuickSiteSwitchButtons from '@/components/QuickSiteSwitchButtons.vue'

import SiteHome from '@/components/sitepages/SiteHome'
import SiteObserve from '@/components/sitepages/SiteObserve'
import SiteTargets from '@/components/sitepages/SiteTargets'
import SiteCalendar from '@/components/sitepages/SiteCalendar'
import SiteProjects from '@/components/sitepages/SiteProjects'
import SiteData from '@/components/sitepages/SiteData'

import { commands_mixin } from '../mixins/commands_mixin'
import Datastreamer from '@/datastreamer'

export default {
  name: 'Site',
  components: {
    CommandButton,
    SiteHome,
    SiteObserve,
    SiteTargets,
    SiteCalendar,
    SiteProjects,
    SiteData,
    ChatModule,
    StatusPanelCollapsible,
    SiteStatusFooter,
    SiteStatusFooterMobile,
    SiteNavbar,
    QuickSiteSwitchButtons
  },
  props: {
    sitecode: {
      type: String,
      required: true
    },
    subpage: {
      type: String,
      required: true
    }
  },
  mixins: [commands_mixin],

  data () {
    return {
      datastreamer: ''
    }
  },

  // When the site page component loads for the first time, set the current site in vuex.
  created () {
    this.datastreamer = new Datastreamer(this.sitecode)

    this.site_changed_routine(this.$route.params.sitecode)

    const ten_minutes = 10 * 60 * 1000 // ms
    this.refreshForecastInterval = setInterval(this.refreshForecast, ten_minutes)
  },

  // If the site changes while the component is still loaded, make sure to update the current site in vuex.
  beforeRouteUpdate (to, from, next) {
    const new_site = to.params.sitecode.toLowerCase()
    // console.log('in BEFORE ROUTE UPDATE, site: ', new_site)

    if (new_site != this.sitecode) { // only if site changes
      this.site_changed_routine(new_site)
    }
    next()
  },

  beforeRouteLeave (to, from, next) {
    // console.log('in BEFORE ROUTE LEAVE')
    this.datastreamer.close()
    next()
  },

  beforeDestroy () {
    // Stop UI sync if the user is leader or follower
    // this.$store.commit('uiSync/ui_sync_role', 'none')

    this.$store.commit('site_config/remove_selected_site')
    this.$store.dispatch('images/display_placeholder_image')
    this.datastreamer.close()
    clearInterval(this.refreshForecastInterval)
  },

  mounted () {
    // Update timestamp every second (sent with command)
    setInterval(() => {
      this.timestamp = parseInt(Date.now() / 1000)
    }, 1000)
  },

  computed: {
    active_subpage: {
      get () { return this.$store.state.user_interface.selected_subpage },
      set (value) { this.$store.commit('user_interface/selected_subpage', value) }
      // subpage set to home by default in user_interface
    }
  },

  watch: {
    subpage () {
      this.active_subpage = this.subpage
    }

  },

  methods: {

    // Do this whenever the selected site changes
    // 'sitecode' argument is the new site being navigated to, not the old one.
    site_changed_routine (sitecode) {
      // Stop UI sync if the user is leader or follower
      // this.$store.commit('uiSync/ui_sync_role', 'none')

      // Update the active devices
      this.$store.dispatch('site_config/set_default_active_devices', sitecode)

      // Subscribe to datastream for the new site
      this.datastreamer.update_site(sitecode)

      // get initial data/values for images, status, calendar
      this.$store.dispatch('images/display_placeholder_image')
      this.$store.dispatch('images/load_latest_images')
      this.$store.dispatch('images/load_latest_info_images')
      this.$store.dispatch('sitestatus/clearStatus')
      this.$store.dispatch('sitestatus/getLatestStatus')
      this.$store.dispatch('userstatus/fetch_recent_logs')
      this.$store.dispatch('calendar/fetchActiveReservations', sitecode)
      this.active_subpage = this.subpage

      // If switching to a wema site
      if (this.$store.getters['site_config/site_is_wema']) {
        this.$store.commit('user_interface/selected_controls_tab', 0)
      }
    },

    refreshForecast () {
      this.$store.dispatch('sitestatus/getLatestForecast')
    }
  }
}
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap");
@import "@/style/_variables.scss";
@import "@/style/_responsive.scss";

.page {
  display: grid;
  grid-template-rows: max-content 1fr max-content;
  height: 100%;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.total-site-menu {
  grid-row: 1;
}
.page-view {
  grid-row: 2;
  overflow-y: auto;
  display:flex;
  justify-content: center;
  padding-top: 1em;
  width: 100%;
}
.status-footer {
  grid-row: 3;
}

.site-navbar {
  min-height: unset;
  height: 40px;
  .container.site-menu {
    min-height: unset;
    height: 0;
  }
  .navbar-item {
    height: 40px;
    margin-top: 0;
    margin-bottom: 0;
    align-items: unset;
  }
}

.quick-site-switch-buttons-spacer {
  width: 0px;
  @include desktop {
    width: 50px;
  }
}

.quick-site-switch-buttons {
  display:none;
  position: fixed;
  left: 0px;
  @include desktop {
    display:flex;
  }
}

.menu-column {
  height: auto;
  padding: 0 auto;
}

.subpage-menu {
  margin-bottom: 3em;
}

.mobile-site-menu {
  width: 100%;
  top: 0;
  bottom: 300px;
  display:flex;
  height: 30px;
  position:relative;
  z-index:5;
  //background-color: rgba(255,0,0,0);
  //margin-bottom: -6px;
  //margin-bottom: 1em;
}
.mobile-site-menu a {
  width: 100%;
}
.mobile-site-menu button {
  border-radius: 0;
  font-size: 12px;
  background-color: $dark;
  border: 1px solid $grey-dark;
  border-top: 1px solid grey;
  height: 30px;
  width: 100%;
  margin: 0;

  @include tablet {
    padding: 0 3em;
  }
}
.mobile-site-menu button.menu-padding {
  display: none;
  height: 30px;

  @include tablet {
    display:unset;
    flex-grow: 1;
    flex-shrink: 1;
  }
}
.mobile-site-menu .selected {
  //background-color: rgba(3, 8, 14, 1);
  background-color: #0f1313;
  font-weight: bolder;
  font-size: 14px;
  border: 1px solid grey;
  border-top: none;
  height: 35px;
}

</style>
