<template><div class="wrapper">

    <!-- Mount Selection -->
    <b-field class="select-device" label="Mount">
        <b-select 
          placeholder="choose mount..." 
          default="" 
          v-model="active_mount"
        >
          <option 
            v-for="(mount, index) in available_mounts" 
            v-bind:value="mount"
            v-bind:key="`mount-${index}`"
          >
            {{ mount }}
          </option>
          <option> dummy_mount </option>
        </b-select>
    </b-field>
</div></template>

<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../mixins/commands_mixin'
export default {
    name: 'TheDeviceSelectors',
    mixins: [commands_mixin],
    beforeCreate() {
        // make sure we're using the latest site configuration.
        this.$store.dispatch('observatory_configuration/update_config')
    },
}

</script>

<style scoped>
</style>