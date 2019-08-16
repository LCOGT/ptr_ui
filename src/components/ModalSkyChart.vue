
<template>


<section class="component">

    <the-sky-chart />
    <div class="slider" v-bind:class="{ 'slider-open': slider_open }" >
        <div class="button is-dark is-small" @click="slide">filter objects</div>
    </div>

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
    background-color:rgba(0, 0, 0, 0.76);
}
.slider-open {
    height: 200px;
}

</style>