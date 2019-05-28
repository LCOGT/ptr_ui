<template>
    <div class="camera-panel">
        <div class="panel-header" v-on:click="isOpen = !isOpen"> Camera Controls </div>

        <div class="panel-content" v-if="isOpen">

            <b-field horizontal label="Expose" class="field-row">
                <b-field>
                    <b-input name="subject" v-model="commandButtons.captureImage.form.required_params.time"></b-input>
                    <p class="control"> <span class="button is-static">seconds</span> </p>
                </b-field>
            </b-field>
            <b-field horizontal label="Count">
                <b-field>
                    <b-input name="subject" v-model="commandButtons.captureImage.form.optional_params.count"></b-input>
                    <p class="control"> <span class="button is-static">
                        {{ 
                            (commandButtons.captureImage.form.optional_params.count == 1) 
                            ? "image&nbsp;&nbsp;&nbsp;&nbsp;" 
                            : "images&nbsp;&nbsp;" 
                        }}
                        </span> </p>
                </b-field>
            </b-field>
            <!--b-field horizontal label="Delay" class="field-row">
                <b-field>
                    <b-input name="subject" v-model="commandButtons.captureImage.form.delay"></b-input>
                    <p class="control"> <span class="button is-static">seconds</span> </p>
                </b-field>
            </b-field-->
            <b-field horizontal label="Hint" class="field-row">
                <b-input name="subject"></b-input>
            </b-field>
            <b-field horizontal label="Filter">
                <b-select placeholder="Select filter" v-model="commandButtons.captureImage.form.optional_params.filter">
                    <option value="LUMINANCE">luminance</option>
                    <option value="RED">red</option>
                    <option value="GREEN">green</option>
                    <option value="BLUE">blue</option>
                    <option value="LUMINANCE">luminance</option>
                    <option value="O3">O3</option>
                    <option value="HA">HA</option>
                    <option value="S2">S2</option>
                    <option value="N2">N2</option>
                    <option value="CONTINUUM">continuum</option>
                    <option value="LRGB">LRGB</option>
                    <option value="w">w</option>
                    <option value="u">u</option>
                    <option value="g">g</option>
                    <option value="r">r</option>
                    <option value="i">i</option>
                    <option value="zs">zs</option>
                    <option value="wgri">wgri</option>
                    <option value="DARK">dark</option>
                    <option value="AIR">air</option>
                </b-select>
            </b-field>
            <b-field horizontal label="Bin">
                <b-field>
                <b-radio-button v-model="commandButtons.captureImage.form.optional_params.bin"
                    native-value="1"
                    type="is-white is-outlined">
                    1x
                </b-radio-button>
                <b-radio-button v-model="commandButtons.captureImage.form.optional_params.bin"
                    native-value="2"
                    type="is-white is-outlined">
                    2x
                </b-radio-button>
                <b-radio-button v-model="commandButtons.captureImage.form.optional_params.bin"
                    native-value="4"
                    type="is-white is-outlined">
                    4x
                </b-radio-button>
                </b-field>
            </b-field>
            <b-field horizontal label="Dither">
                <b-select placeholder="Select dither..." v-model="commandButtons.captureImage.form.optional_params.dither">
                    <option value="off">off</option>
                    <option value="on">on</option>
                </b-select>
            </b-field>
            <b-field horizontal label="Size">
                <b-select placeholder="Select sensor area to use" default="100%" v-model="commandButtons.captureImage.form.optional_params.size">
                    <option value="1">100%</option>
                    <option value="0.707">70.7%</option>
                    <option value="0.5">50%</option>
                    <option value="0.35">35%</option>
                    <option value="0.25">25%</option>
                    <option value="0.125">12.5%</option>
                </b-select>
            </b-field>
            <b-field horizontal><!-- Label left empty for spacing -->
                <p class="control">
                    <command-button :data="commandButtons.captureImage" class="button is-danger"/>
                </p>
            </b-field>
            <br>
        </div>
    </div>
</template>

<script>
import CommandButton from '@/components/CommandButton'
import { mapGetters } from 'vuex'
export default {
    name: 'Camera',
    components: {
        CommandButton
    },
    props: ['sitecode'],
    mounted() {
        console.log('in mounted')
        console.log(this.props)
    },
    data () {
        console.log('props: '+this.sitecode)
        return {
            isOpen: true,
            commandButtons: {
                captureImage: {
                    name: 'Capture',
                    url: '/'+this.sitecode+'/mount1/command/',
                    http_method: 'POST',
                    form: {
                        device: 'camera_1',
                        type: 'camera',
                        action: 'expose',
                        required_params: {
                            time: '5',
                        },
                        optional_params: {
                            bin: '1',
                            count: '1',
                            filter: 'RED',
                            size: '1',
                        }
                    }
                },
            }
        }
    },
    computed: {
        ...mapGetters('observatory', {
            focus: 'focus'
        }),
    }
}
</script>

<style scoped>
.panel-content {
    margin: 2em;
}
.panel-header {
    padding: 1em;
    background-color: #383838;
    display: flex;
    justify-content: flex-start;
    border-top: 4px #222 solid;
    cursor: pointer;
}
</style>
