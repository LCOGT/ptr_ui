
<template>


<section class="component" style="border: solid white 2px;">

    <div class="slider" v-bind:class="{ 'slider-open': slider_open }" >{{slider_open}}
        <button @click="slide">hide or show slider</button>
    </div>
    <the-sky-chart />

</section>


</template>


<script>

import TheSkyChart from '@/components/celestialmap/TheSkyChart'
export default {
    name: "ModalSkyChart",
    props: ["sitecode"],
    components: {
        TheSkyChart,
    },
    data() {
        return {
            slider_open: false,
        }
    },
    methods: {
        slide() {
            this.slider_open = !this.slider_open;
        }
    },
    
}

</script>


<style scoped>
.component {
    max-height: 100vh;
    max-width: 100vw;
}
.slider {
    height: 50px;
    border: 1px solid green;
}
.slider-open {
    height: 500px;
}

</style>