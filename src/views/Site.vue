
<template>
    <div class="page-content">
        <div class="columns is-gapless">
            <div class="column">
                <the-information-tabs />
            </div>
            <the-control-panel :sitecode="sitecode" class="column is-one-third" />
        </div>
        <the-status-bar />
    </div>
</template>

<script>
import TheInformationTabs from '@/components/TheInformationTabs'
import TheStatusBar from '@/components/TheStatusBar'
import TheControlPanel from '@/components/TheControlPanel'

export default {
  name: 'Site',
  components: {
    TheInformationTabs,
    TheControlPanel,
    TheStatusBar,
  },
  props: ['sitecode'],
  data () {
    return {
        site: {},
        update_status: '',
    }
  },
  methods: {
    updateStatus() {
        this.$store.dispatch('instrument_state/updateStatus')
    }
  },
  watch: {
  },
  created() {
      this.update_status = setInterval(this.updateStatus, 2000)
  },
  beforeDestroy() {
      clearInterval(this.update_status)
  }
}
</script>

<style scoped>
</style>
