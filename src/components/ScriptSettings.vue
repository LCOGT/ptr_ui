<template>
    <div class="the-settings card">
        <p class="">settings: </p> 
        <span class="heading is-light is-size-4 is-family-monospace">{{getReadableName(script)}}</span>
        <hr style="border-bottom: silver 4px solid; margin-bottom: 2em;">

        <gen-screen-flat-masters v-if="script=='genScreenFlatMasters'"/>
        <take-filter-series v-if="script=='takeUGRIZSStack'"/>
        <gen-bias-dark-master v-if="script=='genBiasDarkMaster'"/>
        <take-l-r-g-b-stack v-if="script=='takeLRGBStack'"/>
        <take-narrowband-stack v-if="script=='takeO3HaS2N2Stack'"/>
        <hr style="border-bottom: silver 4px solid; margin-bottom: 2em;">
        <div class="level">
            <button class="button is-light" @click="revertDefaultSettings">Revert To Default</button>
            <button class="button" @click="script_run_command">Run Script</button>
        </div>
    </div>
</template>

<script>
import GenScreenFlatMasters from '@/components/ScriptSettings/GenScreenFlatMasters'
import GenBiasDarkMaster from '@/components/ScriptSettings/GenBiasDarkMaster'
import TakeFilterSeries from '@/components/ScriptSettings/TakeFilterSeries'
import TakeLRGBStack from '@/components/ScriptSettings/TakeLRGBStack'
import TakeNarrowbandStack from '@/components/ScriptSettings/TakeNarrowbandStack'
export default {
    name: 'ScriptSettings',
    components: {
        GenScreenFlatMasters,
        GenBiasDarkMaster,
        TakeFilterSeries,
        TakeLRGBStack,
        TakeNarrowbandStack,
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
.modal-container {
    display:flex;
}
.the-settings {
    width: fit-content;
    background-color: $dark-box;
    padding: 2em;
}
</style>