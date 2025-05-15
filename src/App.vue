<template>
  <div id="app">
    <google-account-warning
      :show-warning="showGoogleWarning"
      @dismiss="dismissGoogleWarning"
    />
    <router-view class="router-view" />
  </div>
</template>

<script>
import GoogleAccountWarning from '@/components/GoogleAccountWarning.vue'
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'App',
  components: {
    GoogleAccountWarning
  },
  computed: {
    ...mapState('user_data', [
      'isGoogleFederatedAccount',
      'googleWarningDismissed'
    ]),
    showGoogleWarning () {
      return this.isGoogleFederatedAccount && !this.googleWarningDismissed
    }
  },
  methods: {
    ...mapMutations('user_data', {
      setGoogleWarningDismissed: 'googleWarningDismissed'
    }),
    dismissGoogleWarning () {
      this.setGoogleWarningDismissed(true)
    }
  }
}
</script>

<style scoped lang="scss">
.router-view {
  overflow-x: hidden;
}
</style>
