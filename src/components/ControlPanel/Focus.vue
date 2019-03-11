<template>
    <div class="focus-panel">
        <div class="panel-header"> Focus Controls </div>
        <div class="focus-state"> focus: {{ focus }}</div>
        <div class="panel-buttons">
            <div class="buttons has-addons">
                <command-button :data="commandButtons.focusIn" />
                <command-button :data="commandButtons.focusOut" />
            </div>
            <command-button :data="commandButtons.focusHome" />
            <command-button :data="commandButtons.focusAuto" />
        </div>
        <div class="specific focus"
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
    background-color: #282828;
}
.panel-header {
    padding: 1em;
    height: 50px;
    background-color: #383838;
    display: flex;
    justify-content: flex-start;
}
.focus-state {
    margin-top: 10px;
    text-align: center;
    color: #ff9900;
    background-color: #222;
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
</style>
