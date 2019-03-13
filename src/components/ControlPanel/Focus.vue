<template>
    <div class="focus-panel">
        <div class="panel-header" v-on:click="isOpen = !isOpen"> Focus Controls </div>
        <div class="panel-content" v-if="isOpen">
            <div class="focus-state"> focus: {{ focus }}</div>
            <div class="panel-buttons">
                <div class="buttons has-addons">
                    <command-button :data="commandButtons.focusIn" />
                    <command-button :data="commandButtons.focusOut" />
                </div>
                <command-button :data="commandButtons.focusHome" />
                <command-button :data="commandButtons.focusAuto" />
            </div>
            <div class="panel-inputs">
                <label class="label">Specify Position: </label>
                <div class="field has-addons">
                    <p class="control">
                        <input v-model="commandButtons.focusPosition.form.position" class="input focus-input" type="text">
                    </p>
                    <p class="control">
                        <command-button :data="commandButtons.focusPosition" class="button is-danger"/>
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
                focusIn: {
                    'name': 'in',
                    'url': '/commands/focus',
                    'form': {'command': 'in'}
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
                focusPosition: {
                    'name': 'focus',
                    'url': '/commands/focus',
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
.focus-panel {
}
.panel-header {
    padding: 1em;
    background-color: #383838;
    display: flex;
    justify-content: flex-start;
    border-top: 4px #222 solid;
    cursor: pointer;
}
.focus-state {
    margin-top: 10px;
    text-align: center;
    color: #ff9900;
    background-color: #181818;
    font: 20px/35px "Courier New", monospace;
}
.panel-buttons {
    display: flex;
    align-content:space-around;
    padding: 2em;
    background-color: transparent;
}
.panel-buttons * {
    margin-right: 10px;
}
.panel-inputs {
    display: flex;
    margin: 2em;
}
.label {
    height: 30px;
    line-height: 30px;
    padding: 0;
}
.focus-input {
    width: 70px;
    margin-left: 2em;
}
</style>
