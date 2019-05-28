
<template>
    <div class="page-content">
        <div class="columns is-gapless">
            <div class="column">
                <p>{{ site }}</p>
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
import { sites } from '../sites'

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
      initialize() {
          for (var i=0; i<sites.length; i++) {
              if (sites[i].code == this.sitecode) {
                  this.site = sites[i]
                  break
                  //console.table(this.site)
              }
          }
      },
      updateStatus() {
          this.$store.dispatch('observatory/updateStatus')
      }
  },
  watch: {
      '$route'() {
          this.initialize()
      }
  },
  created() {
      this.initialize()
      this.update_status = setInterval(this.updateStatus, 2000)
  },
  beforeDestroy() {
      clearInterval(this.update_status)
  }
}
</script>

<style scoped>
</style>
