
/**
 *  This is a page used for testing image display and manipulation. 
 *
 */
<template>
  <div class="container">
  <div class="columns">
    <div class="img-view column is-three-fifths" style="padding: 2em;">

      <!-- The actual image view component -->
      <image-view v-bind:site="active_site"/>
      <!--j-s9 /-->

    </div>

    <div class="nav-panel column is-two-fifths" style="padding: 2em;">  
      <!--button class="button" @click="imagesByUser">imageByUser</button-->
      <!--ImageNavigationPanel/-->
    </div>

  </div>
  </div>

</template>

<script>
import { API, Auth } from 'aws-amplify'
import ImageView from '@/components/ImageView'
import ImageNavigationPanel from '@/components/ImageNavigationPanel'
import { mapGetters } from 'vuex'
import JS9 from "@/components/JS9";

export default {
  name: 'imgs',
  components: {
    ImageView,
    ImageNavigationPanel,
    JS9,
  },
  data() {
    return {
      toggleSiteIndex: 0,
    }
  },
  mounted() {
  },
  methods: {
    toggleSites() {
      let the_sites = ['wmd', 'WMD']
      let chosen_site = the_sites[this.toggleSiteIndex]
      this.$store.commit('observatory_configuration/setActiveSite', chosen_site)
      this.toggleSiteIndex = (this.toggleSiteIndex + 1) % 2;
    },
    imagesByUser() {
        this.$store.dispatch('images/get_user_images')
    }

  },
  beforeCreate() {
    // Set the default site for convenience
    this.$store.commit('observatory_configuration/setActiveSite', 'wmd')
    this.$store.dispatch('observatory_configuration/update_config')
  },
  computed: {
    ...mapGetters('observatory_configuration', [
      'available_sites',
    ]),

    active_site: {
        get() { return this.$store.getters['observatory_configuration/site'] },
        set(value) { this.$store.commit('observatory_configuration/setActiveSite', value) }
    },

  },
}
</script>

<style scoped>
.container {
  margin-top: 3em;
}

.columns{
  padding-top: 50px;
}

.select-device {
  border-bottom: 1px solid silver;
  padding-bottom: 2em;
}

</style>
