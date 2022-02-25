
<template>
  <div class="instrument-control-wrapper">

    <article class="instrument-selection message">
      <div class="message-header">Device Selection</div>
      <div class="message-body">

      <template
        v-for="(instrument, idx) in [
          'mount',
          'telescope',
          'camera',
          'filter_wheel',
          'focuser', 
          'rotator',
          'sequencer',
        ]">
            
          <b-field 
            horizontal 
            v-bind:key="idx"
            class="select-device" :label="instrument">

              <b-select 
                :placeholder="`choose ${instrument}...`"
                v-model="self['active_'+instrument]" >
                <option 
                  v-for="(val, index) in available_devices(instrument, sitecode)" 
                  :value="val"
                  :key="`ota-${index}`"
                >
                  {{ val }}
                </option>
              </b-select>
            </b-field>
            </template>


          <b-field horizontal class="select-device" label="">
            <button class="button is-success" @click="setDefaultDevices" >Defaults</button>
          </b-field>
      </div>
    </article>


  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import CommandButton from '@/components/FormElements/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
export default {
  name: "Settings",
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton, 
    StatusColumn,
    SimpleDeviceStatus,
  },
  data() {
    return {
      self: this,
    }
  },
  methods: {

    /**
     * Set the default devices for this site.
     */
    async setDefaultDevices() {
      this.$store.dispatch('site_config/set_default_active_devices', this.sitecode)
    },
  },

  computed: {
    available_devices() {
      return this.$store.getters['site_config/available_devices']
    },
    sitecode() {
      return this.$route.params.sitecode
    },
  },

}
</script>

<style scoped lang="scss">
//@import "./instrument_controls_common.scss";
</style>
