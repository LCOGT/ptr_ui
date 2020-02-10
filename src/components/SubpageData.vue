<template><section>
    <!--image-view :site="sitecode"/-->
  <div class="columns">
    <div class="img-view column is-three-fifths">

      <!-- The actual image view component -->
      <image-view v-bind:site="active_site"/>
      <!--j-s9 /-->

    </div>

    <div class="nav-panel column is-two-fifths">  
      <image-info-panel :current_image="current_image"/>
      <js9-devtools/>
      <image-filter/>
      <image-navigation-panel/>
    </div>

  </div>
    <images-table style="margin-top: 3em;"/>


</section></template>


<script>

import ImageView from '@/components/ImageView'
import ImagesTable from '@/components/ImagesTable'
import Js9Devtools from "@/components/Js9Devtools";
import ImageNavigationPanel from "@/components/ImageNavigationPanel";
import ImageFilter from "@/components/ImageFilter";
import ImageInfoPanel from "@/components/ImageInfoPanel";
import { mapGetters } from "vuex";

export default {
    name: "SubpageData",
    props: ["sitecode"],
    components: {
        ImageView,
        ImagesTable,
        ImageInfoPanel,
        ImageNavigationPanel,
        ImageFilter,
        Js9Devtools,
    },
    methods: {
        imagesByUser() {
            this.$store.dispatch('images/get_user_images')
        }
    },
    computed: {
        ...mapGetters("observatory_configuration", ["available_sites"]),

        ...mapGetters("images", {
            recent_images: "recent_images",
            current_image: "current_image"
        }),

        active_site: {
            get() { return this.$store.getters["observatory_configuration/site"]; },
            set(value) { this.$store.commit("observatory_configuration/setActiveSite", value); }
        }
    },
    beforeMount() {
        // TODO: create a cleaner system of tracking the active site and devices.
        /*
        this.active_site = 'WMD'
        this.active_mount = 'mnt1'
        this.$store.dispatch('images/refresh_latest_images')
        */
    },
    
}

</script>


<style scoped>

</style>