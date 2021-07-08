<template>
  <div class="page">
    <b-navbar
      wrapper-class="container site-menu"
      :mobile-burger="false"
      class="is-hidden-touch"
    >
      <template slot="start">
        <b-navbar-item
          tag="router-link"
          :to="{ path: '/site/' + sitecode + '/home' }"
        >
          Home
        </b-navbar-item>
        <b-navbar-item
          tag="router-link"
          :to="{ path: '/site/' + sitecode + '/targets' }"
        >
          Targets
        </b-navbar-item>
        <b-navbar-item
          tag="router-link"
          :to="{ path: '/site/' + sitecode + '/observe' }"
        >
          Observe
        </b-navbar-item>
        <b-navbar-item
          tag="router-link"
          :to="{ path: '/site/' + sitecode + '/calendar' }"
        >
          Calendar
        </b-navbar-item>
        <b-navbar-item
          tag="router-link"
          :to="{ path: '/site/' + sitecode + '/projects' }"
        >
          Projects
        </b-navbar-item>
      </template>
    </b-navbar>

    <div class="page-view">
      <div class="mobile-site-menu is-hidden-desktop">
        <router-link :to="'/site/' + sitecode + '/home'">
          <button class="button">Home</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/targets'">
          <button class="button">Targets</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/observe'">
          <button class="button">Observe</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/calendar'">
          <button class="button">Calendar</button>
        </router-link>
        <router-link :to="'/site/' + sitecode + '/projects'">
          <button class="button">Projects</button>
        </router-link>
      </div>

      <div class="columns main-page-content">
        <!-- Primary content of the page. Selects from the various site subpages. -->
        <!-- Note: wait for parent (this component) to mount before loading child components. 
      Otherwise, props may initially load as null. -->
        <div class="column">
          <component
            v-bind:is="`site-${subpage}`"
            :sitecode="sitecode"
            :deviceStatus="deviceStatus"
          />
        </div>
      </div>
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
import { mapGetters, mapState } from "vuex";
import CommandButton from "@/components/CommandButton";
import ChatModule from "@/components/ChatModule";
import SideInfoPanel from "@/components/SideInfoPanel";
import StatusPanelCollapsible from "@/components/status/StatusPanelCollapsible";
import StatusRow from "@/components/status/StatusRow";
import SiteStatusFooter from "@/components/status/SiteStatusFooter";
import SiteStatusFooterMobile from "@/components/status/SiteStatusFooterMobile";

import SiteHome from "@/components/sitepages/SiteHome";
import SiteObserve from "@/components/sitepages/SiteObserve";
import SiteTargets from "@/components/sitepages/SiteTargets";
import SiteCalendar from "@/components/sitepages/SiteCalendar";
import SiteProjects from "@/components/sitepages/SiteProjects";
import SiteData from "@/components/sitepages/SiteData";

import axios from "axios";
import moment from "moment";
import ReconnectingWebSocket from "reconnecting-websocket";

import { commands_mixin } from "../mixins/commands_mixin";
import { status_mixin } from "../mixins/status_mixin";

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
    SideInfoPanel,
    StatusPanelCollapsible,
    StatusRow,
    SiteStatusFooter,
    SiteStatusFooterMobile,
  },
  props: ["sitecode", "subpage"],
  mixins: [commands_mixin, status_mixin],

  beforeRouteEnter(to, from, next) {
    const sitecode = to.params.sitecode.toLowerCase();
    next((vm) => {
      vm.$store.dispatch("site_config/set_default_active_devices", sitecode);

      // Set status subscriptions to the new site
      vm.$store.dispatch("sitestatus/openStatusConnection");
      vm.$store.dispatch("sitestatus/updateSite", sitecode);

      vm.$store.dispatch("images/load_latest_images");
      vm.$store.dispatch("images/load_latest_info_images");

      // Refresh the active reservations list for the new site.
      vm.$store.dispatch("calendar/fetchActiveReservations", sitecode);
    });
  },

  beforeRouteUpdate(to, from, next) {
    const sitecode = to.params.sitecode.toLowerCase();
    // Update the active devices
    this.$store.dispatch("site_config/set_default_active_devices", sitecode);
    // Update to the new status
    this.$store.dispatch("sitestatus/updateSite", sitecode);
    // Refresh the images
    this.$store.dispatch("images/display_placeholder_image");
    this.$store.dispatch("images/load_latest_images");
    this.$store.dispatch("images/load_latest_info_images");
    // Refresh the active reservations list
    this.$store.dispatch("calendar/fetchActiveReservations", sitecode);
    next();
  },

  beforeDestroy() {
    this.$store.commit("site_config/removeActiveSite");
    this.$store.dispatch("images/display_placeholder_image");
  },

  mounted() {
    this.setupImagesWebsocket();

    // Update timestamp every second (sent with command)
    setInterval(() => {
      this.timestamp = parseInt(Date.now() / 1000);
    }, 1000);
  },

  computed: {
    ...mapGetters("site_config", [
      "enclosure",
      "mount",
      "telescope",
      "camera",
      "filter_wheel",
      "focuser",
      "rotator",
      "screen",
      "weather",
    ]),
  },

  methods: {
    // TODO: move this to the vuex images module, like status
    setupImagesWebsocket() {

      // Listen for new images on websocket, and refresh the list when a new image arrives.
      // Note: this happens for a new image on any site, not just the one being viewed.
      this.$store.dispatch("images/load_latest_images");
      const images_ws_url = this.$store.state.dev.images_websocket;
      this.imageSubscriber = new ReconnectingWebSocket(images_ws_url);

      const message_handler = (response) => {
        const data = JSON.parse(response.data);
        data["messages"].forEach((message) => {
          const content = message.content.messages[0];
          const base_filename = content.base_filename;
          //console.log('new image: ', base_filename)
          const image_type = content.s3_directory;
          if (image_type == "data") {
            this.$store.dispatch("images/update_new_image", base_filename);
          } else if (image_type == "info-images") {
            this.$store.dispatch("images/load_latest_info_images");
          }
        });
      };
      this.imageSubscriber.onmessage = message_handler;
    },
  },
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=IBM+Plex+Sans:700&display=swap");
@import "@/style/_variables.scss";
@import "@/style/_responsive.scss";

.navbar {
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
  width: 100vw;
  margin-bottom: 150px;
  height: 100%;
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
}
.mobile-site-menu button {
  border-radius: 0;
  width: 20%;
  font-size: 12px;
  background-color: $dark;
  border: 1px solid $grey-dark;
}

.status-footer {
  position: sticky;
  bottom: 0;
  width: 100vw;
}
</style>
