
<template>
    <div class="rotator-panel">
        <div class="panel-header"> Position Angle Controls </div>

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
                    <command-button :data="commandButtons.rotateAngle" />
                </p>
            </div>

        </div>

        <br>

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
                    name: 'go',
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
    background-color: #282828;
}
.panel-header {
    padding: 1em;
    height: 50px;
    background-color: #383838;
    display: flex;
    justify-content: flex-start;
}
.pa-state {
    margin-top: 10px;
    text-align: center;
    color: #ff9900;
    background-color: #222;
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
    margin-left: 15px;
}
</style>
