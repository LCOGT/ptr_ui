<template>


<section style="border: solid white 2px;">

    <!--modal-sky-chart /-->
    <the-sky-chart />
    <the-sky-chart />


    <button class="button is-primary is-medium"
        @click="isComponentModalActive = true">
        Launch component modal
    </button>

    <b-modal :active.sync="isComponentModalActive"
         :can-cancel="true">
        <modal-sky-chart />
    </b-modal>

</section>


</template>


<script>

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
import ModalSkyChart from '@/components/ModalSkyChart'
export default {
    name: "SubpageTargets",
    props: ["sitecode"],
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


<style scoped>

</style>