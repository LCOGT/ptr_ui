<template>
    <div class="the-settings card modal-card">
        <section class="modal-card-head">
            <div>
            <p class="">settings: </p> 
            <span class="heading is-light is-size-4 is-family-monospace">{{getReadableName(script)}}</span>
            </div>
        </section>
        <!--hr style="border-bottom: silver 4px solid; margin-bottom: 2em;"-->

        <section class="modal-card-body">
            <gen-screen-flat-masters v-if="script=='genScreenFlatMasters'"/>
            <gen-bias-dark-master v-if="script=='genBiasDarkMaster'"/>
            <take-u-g-r-i-z-s-stack v-if="script=='takeUGRIZSStack'"/>
            <take-l-r-g-b-stack v-if="script=='takeLRGBStack'"/>
            <take-narrowband-stack v-if="script=='takeO3HaS2N2Stack'"/>
            <take-lunar-stack v-if="script=='takeLunarStack'" />
            <take-planet-stack v-if="script=='takePlanetStack'" />
            <take-sky-flats v-if="script=='takeSkyFlats'" />
        </section>
        <!--hr style="border-bottom: silver 4px solid; margin-bottom: 2em;"-->
        <section class="modal-card-foot">
            <div class="level" style="width: 100%;">
                <button class="button is-light" @click="revertDefaultSettings">Revert To Default</button>
                <button class="button" @click="script_run_command">Run Script</button>
            </div>
        </section>
    </div>
</template>

<script>
import GenScreenFlatMasters from '@/components/ScriptSettings/GenScreenFlatMasters'
import GenBiasDarkMaster from '@/components/ScriptSettings/GenBiasDarkMaster'
import TakeUGRIZSStack from '@/components/ScriptSettings/TakeUGRIZSStack'
import TakeLRGBStack from '@/components/ScriptSettings/TakeLRGBStack'
import TakeNarrowbandStack from '@/components/ScriptSettings/TakeNarrowbandStack'
import TakePlanetStack from '@/components/ScriptSettings/TakePlanetStack'
import TakeLunarStack from '@/components/ScriptSettings/TakeLunarStack'
import TakeSkyFlats from '@/components/ScriptSettings/TakeSkyFlats'
export default {
    name: 'ScriptSettings',
    components: {
        GenScreenFlatMasters,
        GenBiasDarkMaster,
        TakeUGRIZSStack,
        TakeLRGBStack,
        TakeNarrowbandStack,
        TakePlanetStack,
        TakeLunarStack,
        TakeSkyFlats,
    },
    props: {
        'script': String,
    },
    created() {
        console.log(this.readableNames)
    },
    methods: {
        camelToSnake(s) {
            return s.replace(/\.?([A-Z]+)/g, function (x,y){return "_" + y.toLowerCase()}).replace(/^_/, "")
        },

        revertDefaultSettings() {
            this.$store.dispatch('setScriptDefaults', this.script)
        },

        // Render the script name in a nice readable format.
        getReadableName(script_name) {
            return (script_name in this.readableNames) 
                ? this.readableNames[script_name]
                : script_name
        },

        script_run_command() {
            this.$store.dispatch('script_run_command')
        },
    },
    computed: {
        readableNames: {
            get() { return this.$store.getters['readableScriptNames'] }
        },
    }
}
</script>

<style lang="scss" scoped>
.modal-card {
    width: auto;
}
.modal-container {
    display:flex;
}
.the-settings {
    width: fit-content;
    background-color: $dark-box;
    padding: 2em;
}
</style>