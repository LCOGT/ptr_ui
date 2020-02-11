<template>


<section>

    <section class="section mount-control-panel">
            <the-mount-controls :sitecode="sitecode" class="mount-controls"/>

    </section>

    <!-- Only show when modal is not open because can't have 2 charts open at once. -->
    <div class="skychart-container">
    <the-sky-chart v-if="isComponentModalActive==false"/>
    </div>


    <button class="button is-dark is-small"
        @click="isComponentModalActive = true">
        fullscreen
    </button>

    <b-modal 
        :active.sync="isComponentModalActive"
        :can-cancel="true">
        <modal-sky-chart />
    </b-modal>

</section>


</template>


<script>

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import TheMountControls from '@/components/TheMountControls'
import ModalSkyChart from '@/components/ModalSkyChart'
export default {
    name: "SiteTargets",
    props: ["sitecode"],
    components: {
        TheSkyChart,
        TheMountControls,
        ModalSkyChart,
    },
    data() {
        return {
            isComponentModalActive: false,
        }
    },
    methods: {
    },
    
}

</script>


<style lang="scss" scoped>

$skychart-dim: 100%;


.skychart-container {
    width: $skychart-dim;
    height: $skychart-dim;
}

.mount-control-panel {
    display: flex;
    flex-direction: horizontal;
    width: 100%;
    background-color: rgb(44, 49, 49);
    margin-bottom: 40px;
}

.mount-controls {
    width: 250px;
}

</style>