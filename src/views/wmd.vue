<template>
    <div>
        <div class="columns is-gapless">
            <information-tabs class="column"></information-tabs>
            <side-controls class="column is-one-third"></side-controls>
        </div>
        <status-bar></status-bar>
    </div>
</template>

<script>
import InformationTabs from '@/components/InformationTabs'
import StatusBar from '@/components/StatusBar'
import SideControls from '@/components/SideControls'

export default {
    name: 'wmd',
    components: {
        InformationTabs,
        StatusBar,
        SideControls
    }
}
</script>

<style scoped>
</style>
