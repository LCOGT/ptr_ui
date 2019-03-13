<template>
    <div>
        <div class="page-content columns is-gapless">
            <information-tabs class="column"></information-tabs>
            <control-panel class="column is-one-third"></control-panel>
        </div>
        <status-bar></status-bar>
    </div>
</template>

<script>
import InformationTabs from '@/components/InformationTabs'
import StatusBar from '@/components/StatusBar'
import ControlPanel from '@/components/ControlPanel'

export default {
  name: 'wmd',
  components: {
    InformationTabs,
    ControlPanel,
    StatusBar,
  },
}
</script>

<style scoped>
.page-content {
  max-height: 100%;
  overflow:hidden;
}
</style>
