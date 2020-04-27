<template>


<section>

    <!--pre>{{deviceStatus.mount}}</pre-->
    <b-modal :active.sync="telescopeModal"
            trap-focus
            :can-cancel="['escape']"
            scroll="clip"
            full-screen
            style="z-index:100;"
            >
        <skychart-modal
            style="background-color:#151718; overflow-y:auto; height: 100%;"
            :sitecode="sitecode"
            :deviceStatus="deviceStatus"
        />
    </b-modal>

    <!-- Only show when modal is not open because can't have 2 charts open at once. -->
    <div class="skychart-container">
        <!-- Note: only render once the config is populated (needs lat/long to load) -->
        <the-sky-chart :deviceStatus="deviceStatus"/>
        
    </div>




</section>
</template>


<script>

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import SkychartModal from '@/components/SkychartModal'
import { mapGetters } from 'vuex'
export default {
    name: "SiteTargets",
    props: ["deviceStatus", "sitecode"],
    components: {
        TheSkyChart,
        SkychartModal,
    },
    data() {
        return {
            telescopeModal: false,
        }
    },
    computed: {
        ...mapGetters('site_config', ['site_config'])
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