<template>
  <div class="site-switch-buttons">
    <b-button
      v-for="site in available_sites"
      :key="site"
      size="is-small"
      :class="{ 'active-site': site == currentSite}"
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
    available_sites () {
      return [
        ...this.$store.getters['site_config/all_sites_real'].map(s => s.site),
        ...this.$store.getters['site_config/all_sites_simulated'].map(s => s.site)
      ]
    }
  },
  methods: {
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
.site-switch-buttons {
  padding-top: 15px;
  display:flex;
  flex-direction:column;
}
.active-site {
  font-weight: bold;
  border-right-color: #eee;
  border-right-width: 5px;
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}
</style>
