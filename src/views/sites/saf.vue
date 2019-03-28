<template>
    <div class="page-content">
        <div class="columns is-gapless">
            <the-information-tabs class="column" />
            <the-control-panel class="column is-one-third" />
        </div>
        <the-status-bar />
    </div>
</template>

<script>
import TheInformationTabs from '@/components/TheInformationTabs'
import TheStatusBar from '@/components/TheStatusBar'
import TheControlPanel from '@/components/TheControlPanel'

export default {
  name: 'saf',
  components: {
    TheInformationTabs,
    TheControlPanel,
    TheStatusBar,
  },
}
</script>

<style scoped>
</style>
