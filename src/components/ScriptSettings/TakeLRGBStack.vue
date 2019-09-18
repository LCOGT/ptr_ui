<template><section>
    <div class="">
        <div class="field-group">
            <b-field label="No. of Frames">
                <b-numberinput 
                    v-model="numFrames" 
                    type="is-light" 
                    controls-position="compact" 
                    min="0">
                </b-numberinput>
            </b-field>
        </div>
        <div class="field-group">
            <b-field>
                <b-checkbox v-model="skipL">Skip Luminance</b-checkbox>
            </b-field>
        </div>
    </div>
</section></template>

<script>
export default {
    name: 'TakeLRGBStack',
    computed: {

        numFrames: {
            get() { return this.$store.getters['takeLRGBStack_numFrames'] },
            set(val) { this.$store.commit('takeLRGBStack_numFrames', val) }
        },
        skipL: {
            get() { return this.$store.getters['takeLRGBStack_skipU'] },
            set(val) { this.$store.commit('takeLRGBStack_skipU', val) }
        },
    }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
    padding-bottom: 2em;
}
</style>