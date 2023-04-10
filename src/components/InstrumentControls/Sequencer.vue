
<template>
  <div class="instrument-control-wrapper">
    <div
      v-if="sequencer_message.val != '-'"
      class="val"
    >
      {{ sequencer_message.val }}
    </div>

    <b-field
      label="Script"
      horizontal
    >
      <b-field>
        <b-select
          v-model="selected_script"
          value="none"
          size="is-small"
        >
          <option value="none">
            none
          </option>
          <option value="stopScript">
            Stop Script
          </option>
          <option value="focusAuto">
            Focus Auto
          </option>
          <option value="focusExtensive">
            Focus Extensive
          </option>
          <option value="focusFine">
            Focus Fine
          </option>
          <option value="takeLRGBStack">
            Take LRGB Stack
          </option>
          <option value="takeO3HaS2N2Stack">
            Take O3HaS2N2 Stack
          </option>
          <option value="takeUGRIZSStack">
            Take ugrizs Stack
          </option>
          <option value="takePlanetStack">
            Take Planet Stack
          </option>
          <option value="takeLunarStack">
            Take Lunar Stack
          </option>
          <option value="collectBiasesAndDarks">
            Collect Biases and Darks
          </option>
          <option value="collectScreenFlats">
            Collect Screen Flats
          </option>
          <option value="collectSkyFlats">
            Collect Sky Flats
          </option>
          <option value="pointingRun">
            Pointing Run
          </option>
        </b-select>
        <p class="control">
          <button
            class="button is-small"
            :disabled="!scriptHasSettings"
            @click="isScriptSettingsActive = !isScriptSettingsActive"
          >
            <span
              class="iconify"
              data-icon="carbon:settings-adjust"
              data-inline="false"
            />
          </button>
        </p>
      </b-field>
    </b-field>

    <div v-if="isScriptSettingsActive">
      <script-settings
        :show="scriptHasSettings"
        :script="selected_script"
      />
    </div>

    <div
      class="buttons has-addons"
      style="margin-bottom: 10px;"
    >
      <b-button
        class="button is-small is-success"
        outlined
        style="width: 65%;"
        @click="script_run_command"
      >
        run script
      </b-button>
      <b-button
        class="button is-small"
        style="width: 35%; border-left: 1px solid #48c775;"
        @click="script_stop_command"
      >
        stop script
      </b-button>
    </div>

    <div
      class="status-toggle-bar"
      @click="isExpandedStatusVisible= !isExpandedStatusVisible"
    >
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status
        :device_name="active_sequencer"
        device_type="Sequencer"
        :device_status="sequencer_state"
/>
    </pre>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'
import ScriptSettings from '@/components/ScriptSettings/ScriptSettings'
export default {
  name: 'Sequencer',
  mixins: [commands_mixin, user_mixin],
  components: {
    SimpleDeviceStatus,
    ScriptSettings
  },
  data () {
    return {
      isExpandedStatusVisible: false,

      // Toggles the script settings visiblity
      isScriptSettingsActive: true,

      // Auto-hide settings for these scripts:
      hideSettingsOnLoad: [
        'focusAuto',
        'focusExtensive',
        'focusFine'
      ]
    }
  },

  computed: {
    ...mapGetters('sitestatus', [
      'sequencer_message',
      'sequencer_state'
    ]),
    ...mapGetters([
      'scriptHasSettings'
    ]),
    sitecode () {
      return this.$route.params.sitecode
    },
    selected_script: {
      get () { return this.$store.getters.selectedScript },
      set (val) {
        this.$store.commit('selectedScript', val)
        if (this.hideSettingsOnLoad.includes(val)) {
          this.isScriptSettingsActive = false
        } else {
          this.isScriptSettingsActive = true
        }
      }
    }
  }

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
