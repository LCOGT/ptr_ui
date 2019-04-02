
<template>
    <div class="page-content">
        <div class="columns is-gapless">
            <div class="column">
                <p>{{ site }}</p>
                <the-information-tabs />
            </div>
            <the-control-panel class="column is-one-third" />
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
      }
  },
  methods: {
      initialize() {
          for (var i=0; i<sites.length; i++) {
              if (sites[i].code == this.sitecode) {
                  this.site = sites[i]
                  break
                  console.table(this.site)
              }
          }
      },
  },
  watch: {
      '$route'() {
          this.initialize()
      }
  },
  created() {
      this.initialize()
  }
}
</script>

<style scoped>
</style>
