<template>
    <div class="the-settings card">
        <p class="">settings: </p> 
        <span class="heading is-light is-size-4 is-family-monospace">{{script}}</span>
        <hr style="border-bottom: silver 4px solid; margin-bottom: 2em;">

        <gen-screen-flat-masters v-if="script=='gen_screen_flat_masters'"/>
        <take-filter-series v-if="script=='take_ugrizs_stack'"/>
        <gen-bias-dark-master v-if="script=='gen_bias_dark_master'"/>
    </div>
</template>

<script>
import GenScreenFlatMasters from '@/components/ScriptSettings/GenScreenFlatMasters'
import GenBiasDarkMaster from '@/components/ScriptSettings/GenBiasDarkMaster'
import TakeFilterSeries from '@/components/ScriptSettings/TakeFilterSeries'
export default {
    name: 'ScriptSettings',
    components: {
        GenScreenFlatMasters,
        GenBiasDarkMaster,
        TakeFilterSeries,
    },
    props: {
        'script': String,
    },
    data() {
        return {
        }
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