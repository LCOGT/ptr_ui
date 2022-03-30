<template>
  <div class="page">

    <div class="total-site-menu">
      <SiteNavbar />

      <div class="mobile-site-menu">
        <button class="menu-padding"></button>
        <router-link :to="'/site/' + sitecode + '/home'">
          <button class="button" :class="{'selected': active_subpage == 'home'}">Home</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/targets'">
          <button class="button" :class="{'selected': active_subpage == 'targets'}">Targets</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/observe'">
          <button class="button" :class="{'selected': active_subpage == 'observe'}">Observe</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/calendar'">
          <button class="button" :class="{'selected': active_subpage == 'calendar'}">Calendar</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/projects'">
          <button class="button" :class="{'selected': active_subpage == 'projects'}">Projects</button>
        </router-link>
        <button class="menu-padding" button></button>
      </div>

    </div>

    <div class="page-view">
        <component v-bind:is="`site-${subpage}`" :sitecode="sitecode" />
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
import CommandButton from "@/components/FormElements/CommandButton";
import ChatModule from "@/components/ChatModule";
import StatusPanelCollapsible from "@/components/status/StatusPanelCollapsible";
import SiteStatusFooter from "@/components/status/SiteStatusFooter";
import SiteStatusFooterMobile from "@/components/status/SiteStatusFooterMobile";
import SiteNavbar from '@/components/SiteNavbar.vue'

import SiteHome from "@/components/sitepages/SiteHome";
import SiteObserve from "@/components/sitepages/SiteObserve";
import SiteTargets from "@/components/sitepages/SiteTargets";
import SiteCalendar from "@/components/sitepages/SiteCalendar";
import SiteProjects from "@/components/sitepages/SiteProjects";
import SiteData from "@/components/sitepages/SiteData";

import { commands_mixin } from "../mixins/commands_mixin";
import datastreamer from "@/datastreamer";

export default {
  name: "Site",
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
  },
  props: ["sitecode", "subpage"],
  mixins: [commands_mixin],

  // When the site page component loads for the first time, set the current site in vuex. 
  created() {
    this.site_changed_routine(this.$route.params.sitecode)
  },

  // If the site changes while the component is still loaded, make sure to update the current site in vuex. 
  beforeRouteUpdate(to, from, next) {
    const new_site = to.params.sitecode.toLowerCase();
    //console.log('in BEFORE ROUTE UPDATE, site: ', new_site)

    if (new_site != this.sitecode) {  // only if site changes
      this.site_changed_routine(new_site)
    }
    next();
  },

  beforeRouteLeave(to, from, next) {
    //console.log('in BEFORE ROUTE LEAVE')
    datastreamer.close()
    next()
  },

  beforeDestroy() {
    this.$store.commit("site_config/removeActiveSite");
    this.$store.dispatch("images/display_placeholder_image");
    datastreamer.close()
  },

  mounted() {
    // Update timestamp every second (sent with command)
    setInterval(() => {
      this.timestamp = parseInt(Date.now() / 1000);
    }, 1000);
  },

  computed: {
    active_subpage() { return this.$route.params.subpage }
  },

  methods: {

    // Do this whenever the selected site changes
    // 'sitecode' argument is the new site being navigated to, not the old one.
    site_changed_routine(sitecode) {

      // Update the active devices
      this.$store.dispatch("site_config/set_default_active_devices", sitecode);

      // Subscribe to datastream for the new site
      datastreamer.update_site(sitecode)

      // get initial data/valuse for images, status, calendar
      this.$store.dispatch("images/display_placeholder_image");
      this.$store.dispatch("images/load_latest_images");
      this.$store.dispatch("images/load_latest_info_images");
      this.$store.dispatch("sitestatus/clearStatus")
      this.$store.dispatch("sitestatus/getLatestStatus")
      this.$store.dispatch("userstatus/fetch_recent_logs")
      this.$store.dispatch("calendar/fetchActiveReservations", sitecode);
    },

  },
};
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

.main-page-content {
  width: 100%;
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
  z-index: 0;
  display:flex;
  margin-bottom: 1em;
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
  background-color: rgba(3, 8, 14, 0.2);
  font-weight: bolder;
  font-size: 14px;
  border: 1px solid grey;
  border-top: none;
}

</style>
