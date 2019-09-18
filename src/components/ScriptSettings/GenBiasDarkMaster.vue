<template><section>
    <!--div class="field-group">
        <b-field label="No. of Bias" horizontal>
            <b-numberinput v-model="numOfBias" type="is-light" controls-position="compact" min="0" class="inputfield"></b-numberinput>
        </b-field>
    </div>
    <hr>
    <div class="field-group">
        <b-field label="Dark Time" horizontal position="is-right">
            <b-field class="inputfield">
                <b-input v-model="darkTime" name="subject" autocomplete="off" expanded></b-input>
                <p class="control"> <span class="button is-static">s</span> </p>
            </b-field>
        </b-field>
    </div>
    <div class="field-group">
        <b-field label="No. of Dark" horizontal>
            <b-numberinput  class="inputfield" v-model="numOfDark" type="is-light" controls-position="compact" min="0" ></b-numberinput>
        </b-field>
    </div-->

    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Number of Bias</label>
        </div>
        <div class="field">
            <div class="control">
                <b-numberinput v-model="numOfBias" type="is-light" controls-position="compact" min="0" class="inputfield"></b-numberinput>
            </div>
        </div>
    </div>

    <hr>

    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Dark Time</label>
        </div>
        <div class="field">
            <b-field class="inputfield">
                <b-input v-model="darkTime" name="subject" autocomplete="off"></b-input>
                <p class="control"> <span class="button is-static">s</span> </p>
            </b-field>
        </div>
    </div>

    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Number of Dark</label>
        </div>
        <div class="field">
            <div class="control">
                <b-numberinput  class="inputfield" v-model="numOfDark" type="is-light" controls-position="compact" min="0" ></b-numberinput>
            </div>
        </div>
    </div>

    <hr>

    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Dark 2 Time</label>
        </div>
        <div class="field">
            <b-field class="inputfield">
                <b-input v-model="dark2Time" name="subject" autocomplete="off"></b-input>
                <p class="control"> <span class="button is-static">s</span> </p>
            </b-field>
        </div>
    </div>

    <div class="field is-horizontal">
        <div class="field-label is-normal">
            <label class="label">Number of Dark 2</label>
        </div>
        <div class="field">
            <div class="control">
                <b-numberinput  class="inputfield" v-model="numOfDark2" type="is-light" controls-position="compact" min="0" ></b-numberinput>
            </div>
        </div>
    </div>

    <hr>

    <div class="field-group">
        <b-field horizontal position="is-left" >
            <b-checkbox v-model="coldMap">Cold Map</b-checkbox>
            <b-checkbox v-model="hotMap">Hot Map</b-checkbox>
        </b-field>
    </div>
</section></template>

<script>
export default {
    name: 'GenBiasDarkMaster',

    computed: {

        numOfBias: {
            get() { return this.$store.getters['genBiasDarkMaster_numOfBias'] },
            set(val) { this.$store.commit('genBiasDarkMaster_numOfBias', val) }
        },
        darkTime: {
            get() { return this.$store.getters['genBiasDarkMaster_darkTime'] },
            set(val) { this.$store.commit('genBiasDarkMaster_darkTime', val) }
        },
        numOfDark: {
            get() { return this.$store.getters['genBiasDarkMaster_numOfDark'] },
            set(val) { this.$store.commit('genBiasDarkMaster_numOfDark', val) }
        },
        dark2Time: {
            get() { return this.$store.getters['genBiasDarkMaster_dark2Time'] },
            set(val) { this.$store.commit('genBiasDarkMaster_dark2Time', val) }
        },
        numOfDark2: {
            get() { return this.$store.getters['genBiasDarkMaster_numOfDark2'] },
            set(val) { this.$store.commit('genBiasDarkMaster_numOfDark2', val) }
        },
        coldMap: {
            get() { return this.$store.getters['genBiasDarkMaster_coldMap'] },
            set(val) { this.$store.commit('genBiasDarkMaster_coldMap', val) }
        },
        hotMap: {
            get() { return this.$store.getters['genBiasDarkMaster_hotMap'] },
            set(val) { this.$store.commit('genBiasDarkMaster_hotMap', val) }
        },
    }
}
</script>

<style lang="scss" scoped>
.inputfield {
    width: 200px;
}
.field-group {
    padding-right: 2em;
    padding-bottom: 0.5em;
}
</style>