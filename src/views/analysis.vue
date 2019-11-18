
/**
 *  This is a page used for testing image display and manipulation. 
 *
 */
<template>
  <div class="container">
  <div class="analysis-status">

  </div>
  <div class="columns">
    <div class="img-view column is-two-thirds">

      <div class="js9-grid">

      <!--div id="js9analysiswrapper" style="width: 100%; /*border: solid 1px red;*/"-->
      <JS9 id="js9analysiswrapper" class="no-crosshairs" :include-menu="false" />
      <!--/div-->


      <div id="js9-x-profile" />
      <div id="js9-y-profile" />
    
      </div>


    </div>

    <div class="nav-panel column is-one-third">  
      <js9-devtools/>

      <b-collapse class="card" :open="true">
          <div
          slot="trigger" 
          slot-scope="props"
          class="card-header"
          role="button" >
              <p class="card-header-title"> Zoom & Pan </p>
              <a class="card-header-icon">
                  <b-icon :icon="props.open ? 'menu-down' : 'menu-up'"/>
              </a>
          </div>

          <div>
            <div class="JS9PluginContainer">
              <div class="JS9Plugin JS9Magnifier" id="myJS9Magnifier" />
            </div>
            <br>
            <div class="JS9PluginContainer">
              <div class="JS9Plugin JS9Panner" id="myJS9Panner" />
            </div>
          </div>


      </b-collapse>

      <!--image-filter/-->
      <!--image-navigation-panel/-->
    </div>

  </div>
  </div>

</template>

<script>
import { API, Auth } from "aws-amplify";
import ImageView from "@/components/ImageView";
import ImageNavigationPanel from "@/components/ImageNavigationPanel";
import { mapGetters, mapState } from "vuex";
import Js9Devtools from "@/components/Js9Devtools";
import ImageFilter from "@/components/ImageFilter";
import JS9 from "@/components/JS9";

export default {
  name: "analysis",
  components: {
    ImageView,
    ImageNavigationPanel,
    ImageFilter,
    Js9Devtools,
    JS9,
  },
  data() {
    return {
      JS9: JS9,
      toggleSiteIndex: 0,

      syncImageSize: '',
      syncImageInterval: 1000, //ms interval to recompute the js9 window size
    }
  },
  methods: {

    computeJs9WindowSize() {
      let withCrosshairs = document.getElementById("js9analysiswrapper").getBoundingClientRect()
      let noCrosshairs = document.getElementsByClassName("js9-grid")[0].getBoundingClientRect()
      let imageWindow = (this.crosshairActive) ? withCrosshairs : noCrosshairs;

      let resize_opts = {
        id: "myJS9",
        width: imageWindow.width, 
        height: imageWindow.width,
      }
      this.$store.dispatch('js9/resizeDisplay', resize_opts)
      document.getElementById("js9-x-profile").setAttribute("width", imageWindow.width)
    },

  },
  async beforeCreate() {

    // Set the default site for convenience
    this.active_site = "wmd";
    this.$store.dispatch("observatory_configuration/update_config");

    this.$store.commit('js9/instanceIsVisible', true)

     
  },
  async created() {
    //$(document).on("JS9:ready", async () => {
        //console.log("js9 ready");
        //console.log('first await:')
        //this.$store.dispatch("js9/waitForJs9Ready")
        //console.log('second await')
        await this.$store.dispatch("images/refresh_latest_images")

        // Load the latest image into js9
        let load_options = {
          site: this.current_image.site,
          base_filename: this.current_image.base_filename,
          zoom: "toFit"
        }
        this.computeJs9WindowSize()

        this.$store.dispatch('js9/loadImage', load_options)
        this.$store.dispatch('js9/zoom', "toFit")

        // Keep the displayed image element width and height in sync.
        // This is important for relative measurements on the image (crosshairs, clicks, etc)
        this.syncImageSize = setInterval(
          this.computeJs9WindowSize,
          this.syncImageInterval
        );
    //});
  },
  beforeDestroy() {
    // We don't need to keep the image dimensions in sync if it's not displayed.
    clearInterval(this.syncImageSize);
  },
  async mounted() {



  },
  computed: {
    ...mapGetters("observatory_configuration", ["available_sites"]),

    ...mapGetters("images", {
      recent_images: "recent_images",
      current_image: "current_image"
    }),

    ...mapState("js9", [
      'crosshairActive',
    ]),

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

.analysis-status {
  padding: 0 0.75em;
}
.nav-panel > * {
  margin-bottom: 1em;
}

.js9-grid {
  width: 100%;
  display: grid;
  grid-template-columns: calc(100% - 80px) 70px;
  grid-template-rows: calc(100% - 80px) 70px;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}

/** Note: the y-profile was originally a div in the grid layout defined above. 
However, it was easier to figure out how to rotate the plot than generate a 
sideways plot with flot. So the y-profile div is located in the same place as 
the x-profile div, but it is rotated and shifted with css to position in the
(correct) position to the right of the main js9 display.
*/

#js9-analysis-wrapper { grid-area: 1 / 1 / 2 / 2; }
#js9-analysis-wrapper.no-crosshairs { grid-area: 1/2/3/3; }
#js9-x-profile { grid-area: 2 / 1 / 3 / 2; }
#js9-x-profile.no-crosshairs { display:none; }
#js9-y-profile { grid-area: 2 / 1 / 3 / 2; 
  transform-origin: top right; 
  transform: rotate(-90deg) translate(10px, 10px) scale(-1,1);  
}
#js9-y-profile.no-crosshairs { display:none; }

</style>
