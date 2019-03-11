<template>
    <div class="camera-panel">
        <div class="panel-header" v-on:click="isOpen = !isOpen"> Camera Controls </div>

        <div class="panel-content" v-if="isOpen">
            <b-field horizontal label="Time" class="field-row">
                <b-input name="subject" v-model="commandButtons.captureImage.form.time"></b-input>
            </b-field>
            <b-field horizontal label="Count" class="field-row">
                <b-input name="subject" v-model="commandButtons.captureImage.form.count"></b-input>
            </b-field>
            <b-field horizontal label="Delay" class="field-row">
                <b-input name="subject" v-model="commandButtons.captureImage.form.delay"></b-input>
            </b-field>
            <b-field horizontal label="Hint" class="field-row">
                <b-input name="subject" v-model="commandButtons.captureImage.form.hint"></b-input>
            </b-field>
            <b-field horizontal label="Filter">
                <b-select placeholder="Select filter" v-model="commandButtons.captureImage.form.filter">
                    <option value="RED">red</option>
                    <option value="GREEN">green</option>
                    <option value="BLUE">blue</option>
                </b-select>
            </b-field>
            <b-field horizontal label="Bin">
                <b-select placeholder="Select bin" v-model="commandButtons.captureImage.form.bin">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                </b-select>
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
            isOpen:true,
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
    height: 50px;
    background-color: #383838;
    display: flex;
    justify-content: flex-start;
    border-top: 4px #222 solid;
    cursor: pointer;
}
</style>
