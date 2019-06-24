<template><div class="all">


    <b-field label="Expose" horizontal class="has-text-danger">
        <b-field>
            <b-input name="subject" v-model="exposure_field" class="exposure-field"></b-input>
            <p class="control"> <span class="button is-static">seconds</span> </p>
        </b-field>
    </b-field>

    <b-field label="Repeat" horizontal>
        <b-field>
            <b-input name="subject" v-model="repeat_field" class="repeat-field"></b-input>
            <p class="control"> <span class="button is-static">exposures</span> </p>
        </b-field>
    </b-field>


    <b-field label="Filter" horizontal>
        <b-select placeholder="Select filter" v-model="filter_field" style="width: 100%">
            <option value="LUMINANCE">luminance</option>
            <option value="RED">red</option>
            <option value="GREEN">green</option>
            <option value="BLUE">blue</option>
        </b-select>
        <!--div class="buttons has-addons"-->
          <!--command-button :data="filter_command" style="width: 60%" /-->
          <!--command-button :data="filter_home_command" style="width: 40%" /-->
        <!--/div-->
    </b-field>

    <b-field label="Bin" horizontal>
        <b-field>
        <b-radio-button v-model="bin_field"
            native-value="1"
            type="is-dark is-outlined">
            1x
        </b-radio-button>
        <b-radio-button v-model="bin_field"
            native-value="2"
            type="is-dark is-outlined">
            2x
        </b-radio-button>
        <b-radio-button v-model="bin_field"
            native-value="4"
            type="is-dark is-outlined">
            4x
        </b-radio-button>
        </b-field>
    </b-field>

    <b-field label="Size" horizontal>
        <b-select placeholder="chip area..." v-model="size_field" style="width: 100%">
            <option value="1">100%</option>
            <option value="0.707">70.7%</option>
            <option value="0.5">50%</option>
            <option value="0.35">35%</option>
            <option value="0.25">25%</option>
            <option value="0.125">12.5%</option>
        </b-select>
        <!--div class="buttons has-addons"-->
          <!--command-button :data="filter_command" style="width: 60%" /-->
          <!--command-button :data="filter_home_command" style="width: 40%" /-->
        <!--/div-->
    </b-field>


    <br>
    <b-field label="" horizontal>
        <div class="buttons has-addons">
            <command-button :data="camera_expose_command" style="width: 40%" />
            <command-button :data="camera_cancel_command" style="width: 40%" />
        </div>
    </b-field>

</div></template>

<script>
import { mapGetters } from 'vuex'
import CommandButton from '@/components/CommandButton'
import { commands_mixin } from '../mixins/commands_mixin'

export default {
    name: 'TheCameraControls',
    components: {
        CommandButton,
    },
    mixins: [commands_mixin],
    beforeCreate() {
        this.active_camera = 'cam1';
    },

    data () {
        return {
            exposure_field: '',
            repeat_field: '1',
            filter_field: 'LUMINANCE',
            size_field: '1',
            bin_field: '1', 
        }
    },

    computed: {

        ...mapGetters('device_selection', [
            'available_cameras',
        ]),
        active_camera: {
            get() { return this.$store.getters['device_selection/camera'] },
            set(value) { this.$store.commit('device_selection/setActiveCamera', value) }
        },
    }

}
</script>

<style scoped>
.all {
    padding-top: 2em;
    padding-bottom: 2em;
    padding-left: 1em;
}
.exposure-field {
    width: 4em;
}
.repeat-field {
    width: 4em;
}
</style>