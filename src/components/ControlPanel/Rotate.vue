
<template>
    <div class="rotator-panel">
        <div class="panel-header" v-on:click="isOpen =! isOpen"> Position Angle Controls </div>
        <div class="panel-content" v-if="isOpen">
            <div class="pa-state">position angle: {{ positionAngle }}&deg;</div>
            <div class="panel-buttons">
                <div class="buttons has-addons">
                    <command-button :data="commandButtons.rotateIn" />
                    <command-button :data="commandButtons.rotateOut" />
                </div>
            </div>
            <div class="panel-inputs">
                <label class="label">Specify Angle: </label>
                <div class="field has-addons">
                    <p class="control">
                        <input v-model="commandButtons.rotateAngle.form.angle" class="input angle-input" type="text">
                    </p>
                    <p class="control">
                        <command-button :data="commandButtons.rotateAngle" class="button is-danger"/>
                    </p>
                </div>
            </div>
            <br>
        </div>
    </div>
</template>

<script>
import CommandButton from '@/components/CommandButton'
import { mapGetters } from 'vuex'
export default {
    name: 'Focus',
    components: {
        CommandButton
    },
    data () {
        return {
            isOpen: true,
            commandButtons: {
                rotateIn: {
                    'name': 'in',
                    'url': '/commands/rotate',
                    'form': {'command': 'in'}
                },
                rotateOut: {
                    'name': 'out',
                    'url': '/commands/rotate',
                    'form': {'command': 'out'}
                },
                rotateAngle: {
                    name: 'rotate',
                    url: '/commands/rotate',
                    form: {command: 'angle', angle: 0}
                },
            },
            angleTextField: '',

        }
    },
    methods: {
    },
    computed: {
        ...mapGetters('observatory', {
            positionAngle: 'positionAngle'
        })
    }
}
</script>

<style scoped>
.rotator-panel {
}
.panel-header {
    padding: 1em;
    background-color: #383838;
    display: flex;
    justify-content: flex-start;
    border-top: 4px #222 solid;
    cursor: pointer;
}
.pa-state {
    margin-top: 10px;
    text-align: center;
    color: #ff9900;
    background-color: #181818;
    font: 20px/35px "Courier New", monospace;
}
.panel-buttons {
    display: flex;
    align-content:space-around;
    margin: 2em;
    background-color: transparent;
}
.panel-inputs {
    margin: 2em;
    display: flex;
}
.label {
    height: 30px;
    line-height: 30px;
    padding: 0;
}
.angle-input {
    width: 70px;
    margin-left: 2em;
}
</style>
