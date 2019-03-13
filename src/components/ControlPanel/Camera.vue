<template>
    <div class="camera-panel">
        <div class="panel-header" v-on:click="isOpen = !isOpen"> Camera Controls </div>

        <div class="panel-content" v-if="isOpen">

            <b-field horizontal label="Expose" class="field-row">
                <b-field>
                    <b-input name="subject" v-model="commandButtons.captureImage.form.time"></b-input>
                    <p class="control"> <span class="button is-static">seconds</span> </p>
                </b-field>
            </b-field>
            <b-field horizontal label="Count">
                <b-field>
                    <b-input name="subject" v-model="commandButtons.captureImage.form.count"></b-input>
                    <p class="control"> <span class="button is-static">
                        {{ 
                            (commandButtons.captureImage.form.count == 1) 
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
                <b-input name="subject" v-model="commandButtons.captureImage.form.hint"></b-input>
            </b-field>
            <b-field horizontal label="Filter">
                <b-select placeholder="Select filter" v-model="commandButtons.captureImage.form.filter">
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
                <b-radio-button v-model="commandButtons.captureImage.form.bin"
                    native-value="1"
                    type="is-white is-outlined">
                    1x
                </b-radio-button>
                <b-radio-button v-model="commandButtons.captureImage.form.bin"
                    native-value="2"
                    type="is-white is-outlined">
                    2x
                </b-radio-button>
                <b-radio-button v-model="commandButtons.captureImage.form.bin"
                    native-value="4"
                    type="is-white is-outlined">
                    4x
                </b-radio-button>
                </b-field>
            </b-field>
            <b-field horizontal label="Dither">
                <b-select placeholder="Select bin" v-model="commandButtons.captureImage.form.dither">
                    <option value="off">off</option>
                    <option value="on">on</option>
                    <option value="random">random</option>
                </b-select>
            </b-field>
            <b-field horizontal label="Size">
                <b-select placeholder="Select sensor area to use" default="100%" v-model="commandButtons.captureImage.form.size">
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
    data () {
        return {
            isOpen: true,
            commandButtons: {
                captureImage: {
                    'name': 'Capture',
                    'url': '/commands/camera',
                    form: {
                        time: '5',
                        count: '1',
                        delay: '0',
                        dither: 'off',
                        hint: '',
                        filter: 'RED',
                        bin: '1',
                        size: '1',
                        autofocus: 'false',
                    }
                },
                focusOut: {
                    'name': 'out',
                    'url': '/commands/focus',
                    'form': {'command': 'out'}
                },
                focusHome: {
                    'name': 'home',
                    'url': '/commands/focus',
                    'form': {'command': 'home'}
                },
                focusAuto: {
                    'name': 'autofocus',
                    'url': '/commands/focus',
                    'form': {'command': 'auto'}
                },
                focusValue: {
                    'name': 'focus',
                    'url': 'commands/focus',
                    'form': {command: 'value', position: ''}
                }
            }
        }
    },
    computed: {
        ...mapGetters('observatory', {
            focus: 'focus'
        })
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
