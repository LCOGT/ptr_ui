
<template>
    <div class="rotator-panel">
        <div class="panel-header" v-on:click="isOpen =! isOpen"> Position Angle Controls </div>
        <div class="panel-content" v-if="isOpen">
            <div class="heading">position angle: {{ positionAngle }}&deg;</div>
            <div class="panel-buttons">
                <div class="buttons has-addons">
                    <command-button :data="commandButtons.rotateIn" class="is-dark"/>
                    <command-button :data="commandButtons.rotateOut" class="is-dark"/>
                </div>
            </div>
            <div class="panel-inputs">
                <label class="label">Specify Angle: </label>
                <div class="field has-addons">
                    <p class="control">
                        <input v-model="commandButtons.rotateAngle.form.required_params.angle" class="input angle-input" type="text">
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
    props: ['sitecode'],
    data () {
        return {
            isOpen: true,
            commandButtons: {
                rotateIn: {
                    name: 'in',
                    url: `/${this.sitecode}/mount1/command/`,
                    http_method: 'POST',
                    form: {
                        device: 'rotator_1',
                        type: 'rotator',
                        action: 'move_relative',
                        required_params: {
                            position: -10,
                        },
                        optional_params: {},
                    }
                },
                rotateOut: {
                    name: 'out',
                    url: `/${this.sitecode}/mount1/command/`,
                    http_method: 'POST',
                    form: {
                        device: 'rotator_1',
                        type: 'rotator',
                        action: 'move_relative',
                        required_params: {
                            position: 10,
                        },
                        optional_params: {},
                    }
                },
                rotateAngle: {
                    name: 'rotate',
                    url: `/${this.sitecode}/mount1/command/`,
                    form: {
                        device: 'rotator_1',
                        type: 'rotator',
                        action: 'move_absolute',
                        required_params: {
                            position: 0,
                        },
                        optional_params: {},
                    }
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
.heading {
  margin-top: 10px;
  background-color: #181818;
  text-align: center;
  color: #ff9900;
  font: 1em 'Share Tech Mono', monospace;
  padding: 10px 0;
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
