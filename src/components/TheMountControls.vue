<template>
<section>

    <div class="title">Mount</div>

    <b-field horizontal label="Right Ascension">
        <b-input type="text" name="subject" v-model="slew_ra"></b-input>
    </b-field>
    <b-field horizontal label="Declination">
        <b-input type="text" name="subject" v-model="slew_dec"></b-input>
    </b-field>

    <command-button :data="mount_slew_command"/>
    <br>

    <b-dropdown aria-role="list" style="width: 100%;">
        <button class="button" slot="trigger" style="width: 100%;">
            <span>Slew to...</span>
            <b-icon icon="menu-down"></b-icon>
        </button>
        <b-dropdown-item aria-role="listitem">
        <command-button :data="mount_slew_chart_command" class="dropdown-button-command"/>
        </b-dropdown-item>
        <b-dropdown-item>
        <command-button :data="mount_screenflat_command" class="dropdown-button-command"/>
        </b-dropdown-item>
        <b-dropdown-item>
        <command-button :data="mount_skyflat_command" class="dropdown-button-command"/>
        </b-dropdown-item>
        <b-dropdown-item>
        <command-button :data="mount_home_command" class="dropdown-button-command"/>
        </b-dropdown-item>
        <b-dropdown-item>
        <command-button :data="mount_park_command" class="dropdown-button-command"/>
        </b-dropdown-item>
        <b-dropdown-item>
        <command-button :data="mount_raSidDec0_command" class="dropdown-button-command"/>
        </b-dropdown-item>
        <b-dropdown-item>
        <command-button :data="mount_stop_command" class="dropdown-button-command"/>
        </b-dropdown-item>
    </b-dropdown>

</section>
</template>

<script>

import CommandButton from '@/components/CommandButton' 
import { commands_mixin } from '../mixins/commands_mixin'

export default {
    name: 'TheMountControls',
    components: {
        CommandButton,
    },
    mixins: [commands_mixin],
    props: {
        "sitecode": String,
    },
    data() {
        return {
        }
    },
    created() {
        console.log('in themountcontrols.')
    }
}

</script>

<style lang="scss" scoped>
</style>