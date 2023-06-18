<template>
  <div class="site-switch-buttons">
    <b-button
      v-for="site in available_sites"
      :key="site"
      size="is-small"
      :class="[{ 'active-site': site == currentSite }, site_online_class(site)]"
      @click="goToDifferentSite(site)"
    >
      {{ site }}
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'QuickSiteSwitchButtons',
  props: {
    currentSite: String
  },
  computed: {
    all_sites_status_color () {
      return this.$store.getters['sitestatus/all_sites_status_color']
    },
    available_sites () {
      return [
        ...this.$store.getters['site_config/all_sites_real'].map(s => s.site),
        ...this.$store.getters['site_config/all_sites_simulated'].map(s => s.site)
      ]
    }
  },
  methods: {
    site_online_class (site) {
      if (site in this.all_sites_status_color) {
        return this.all_sites_status_color[site]
      }
    },
    goToDifferentSite (destinationSite) {
      // Do nothing if navigating to the current page
      if (destinationSite == this.currentSite) {
        return
      }
      // Create a copy of the current route params
      const newParams = { ...this.$route.params }

      // Update the desired parameter value
      newParams.sitecode = destinationSite

      // Navigate to the new route using the updated route params
      this.$router.push({ name: this.$route.name, params: newParams })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/style/_variables.scss";
.site-switch-buttons {
  padding-top: 15px;
  display:flex;
  flex-direction:column;
}
.site-switch-buttons > .button {
  border-radius: 0px !important;
}
.active-site {
  font-weight: bold;
  //margin-right: -10px;
  background-color: $grey;
  //border-right-color: #eee;
  //border-right-width: 5px;
}
.status-green {
  border-left: 4px solid $ptr-green;
}
.status-yellow {
  border-left: 4px solid $ptr-yellow;
}
.status-grey {
  border-left: 4px solid grey;
}
.status-blue {
  border-left: 4px solid $ptr_blue;
}
</style>
