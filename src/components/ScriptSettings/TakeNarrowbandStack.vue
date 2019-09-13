<template><section>
    <div class="level">
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
                <b-checkbox v-model="skipO3">Skip O3</b-checkbox>
            </b-field>
            <b-field>
                <b-checkbox v-model="skipHa">Skip Ha</b-checkbox>
            </b-field>
            <b-field>
                <b-checkbox v-model="skipS2">Skip S2</b-checkbox>
            </b-field>
            <b-field>
                <b-checkbox v-model="skipN2">Skip N2</b-checkbox>
            </b-field>
        </div>
    </div>
</section></template>

<script>
export default {
    name: 'TakeNarrowbandStack',
    computed: {

        numFrames: {
            get() { return this.$store.getters['takeO3HaS2N2Stack_numFrames'] },
            set(val) { this.$store.commit('takeO3HaS2N2Stack_numFrames', val) }
        },
        skipO3: {
            get() { return this.$store.getters['takeO3HaS2N2Stack_skipO3'] },
            set(val) { this.$store.commit('takeO3HaS2N2Stack_skipO3', val) }
        },
        skipHa: {
            get() { return this.$store.getters['takeO3HaS2N2Stack_skipHa'] },
            set(val) { this.$store.commit('takeO3HaS2N2Stack_skipHa', val) }
        },
        skipS2: {
            get() { return this.$store.getters['takeO3HaS2N2Stack_skipS2'] },
            set(val) { this.$store.commit('takeO3HaS2N2Stack_skipS2', val) }
        },
        skipN2: {
            get() { return this.$store.getters['takeO3HaS2N2Stack_skipN2'] },
            set(val) { this.$store.commit('takeO3HaS2N2Stack_skipN2', val) }
        },
    }
}
</script>

<style lang="scss" scoped>
.field-group {
    padding-right: 2em;
    padding-bottom: 1em;
}
</style>