
/**
 *  This is a page used for testing image display and manipulation. 
 *
 */
<template>
  <div class="container">
  <div class="columns">
    <div class="img-view column is-three-fifths">

      <!-- The actual image view component -->
      <image-view v-bind:site="active_site"/>
      <!--j-s9 /-->

    </div>

    <div class="nav-panel column is-two-fifths">  
      <side-info-panel>
        <p slot="title">Image Info</p>
        <div style="margin: 1em;">
          <table class="info-panel-table">
              <tr> <td class="info-panel-val" align="right">capture date: </td>
                  <td>{{captureDate}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">capture time: </td>
                  <td>{{captureTime + " GMT"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">site: </td>
                  <td>{{current_image.site || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">exposure time: </td>
                  <td>{{current_image.exposure_time || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">filter_used: </td>
                  <td>{{current_image.filter_used || "---"}}</td> </tr>
              <div class="blank-row" />

              <tr> <td class="info-panel-val" align="right">right ascension: </td>
                  <td>{{rightAscension}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">declination: </td>
                  <td>{{declination}}</td> </tr>

              <tr> <td class="info-panel-val" align="right">altitude: </td>
                  <td>{{current_image.altitude || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">azimuth: </td>
                  <td>{{current_image.azimuth || "---"}}</td> </tr>
              <tr> <td class="info-panel-val" align="right">airmass: </td>
                  <td>{{current_image.airmass || "---"}}</td> </tr>
          </table>
        </div>
      </side-info-panel>
      <js9-devtools/>
      <image-filter/>
      <image-navigation-panel/>
    </div>

  </div>
  </div>

</template>

<script>
import ImageView from "@/components/ImageView";
import { mapGetters } from "vuex";
import Js9Devtools from "@/components/Js9Devtools";
import ImageNavigationPanel from "@/components/ImageNavigationPanel";
import ImageFilter from "@/components/ImageFilter";
import SideInfoPanel from "@/components/SideInfoPanel";
import moment from 'moment'

export default {
  name: "imgs",
  components: {
    ImageView,
    ImageNavigationPanel,
    ImageFilter,
    Js9Devtools,
    SideInfoPanel
  },
  methods: {
    imagesByUser() {
        this.$store.dispatch('images/get_user_images')
    }

  },
  beforeCreate() {
    // Set the default site for convenience
    this.$store.commit("observatory_configuration/setActiveSite", "wmd");
    this.$store.dispatch("observatory_configuration/update_config");
  },
  computed: {
    captureDate() {
        return moment.utc(new Date(this.current_image.capture_date)).format('MMMM DD, YYYY')
    },
    captureTime() {
        return moment.utc(new Date(this.current_image.capture_date)).format('HH:mm:ss')
    },
    rightAscension() {
        if (this.current_image.right_ascension){
            return this.current_image.right_ascension.toFixed(2)
        }
        return "---"
    },
    declination() {
        if (this.current_image.declination) {
            return this.current_image.declination.toFixed(2)
        }
        return "---"
    },
    ...mapGetters("observatory_configuration", ["available_sites"]),

    ...mapGetters("images", {
      recent_images: "recent_images",
      current_image: "current_image"
    }),

    active_site: {
      get() { return this.$store.getters["observatory_configuration/site"]; },
      set(value) { this.$store.commit("observatory_configuration/setActiveSite", value); }
    }
  }
};
</script>

<style scoped>
.columns {
  padding-left: 1em;
  padding-right: 1em;
}
.container {
  margin-top: 3em;
}

.select-device {
  border-bottom: 1px solid silver;
  padding-bottom: 2em;
}
.nav-panel > * {
  padding-bottom: 1em;
}


table.info-panel-table { color: #dbdee0; }
.blank-row { height: 1.5em; }
.info-panel-val {
    font-weight: bold;
    padding-right: 1em;
    padding-bottom: 5px;
}
</style>
