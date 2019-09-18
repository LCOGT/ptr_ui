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
                <b-checkbox v-model="skipU">Skip &#956</b-checkbox>
            </b-field>
            <b-field>
                <b-checkbox v-model="skipZS">Skip zs</b-checkbox>
            </b-field>
        </div>
    </div>
</section></template>

<script>
export default {
    name: 'TakeUGRIZSStack',
    computed: {

        numFrames: {
            get() { return this.$store.getters['takeUGRIZSStack_numFrames'] },
            set(val) { this.$store.commit('takeUGRIZSStack_numFrames', val) }
        },
        skipU: {
            get() { return this.$store.getters['takeUGRIZSStack_skipU'] },
            set(val) { this.$store.commit('takeUGRIZSStack_skipU', val) }
        },
        skipZS: {
            get() { return this.$store.getters['takeUGRIZSStack_skipZS'] },
            set(val) { this.$store.commit('takeUGRIZSStack_skipZS', val) }
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