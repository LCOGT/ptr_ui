
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
      <image-info-panel :current_image="current_image"/>
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
import ImageInfoPanel from "@/components/ImageInfoPanel";

export default {
  name: "imgs",
  components: {
    ImageInfoPanel,
    ImageView,
    ImageNavigationPanel,
    ImageFilter,
    Js9Devtools,
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
</style>
