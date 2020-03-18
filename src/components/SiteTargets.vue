<template>


<section>


    <!-- Only show when modal is not open because can't have 2 charts open at once. -->
    <div class="skychart-container">
        <!-- Note: only render once the config is populated (needs lat/long to load) -->
        <the-sky-chart :siteConfig="config" v-if="Object.keys(config).length>0"/>
    </div>

    <button class="button is-dark is-small"
        style="display:none;"
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
import ModalSkyChart from '@/components/ModalSkyChart'
export default {
    name: "SiteTargets",
    props: ["config", "sitecode"],
    components: {
        TheSkyChart,
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