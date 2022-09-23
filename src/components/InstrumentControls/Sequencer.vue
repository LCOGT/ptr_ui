
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
          <option value="findFieldCenter">
            Find Field Center
          </option>
          <option value="calibrateAtFieldCenter">
            Calibrate at Field Center
          </option>
          <option value="focusAuto">
            Focus Auto
          </option>
          <option value="focusFine">
            Focus Fine
          </option>
          <option value="focusVcurve">
            Focus V-Curve
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
          <option value="genBiasDarkMaster">
            Gen Bias/Dark Master
          </option>
          <option value="genScreenFlatMasters">
            Gen Screen Flat Masters
          </option>
          <option value="genSkyFlatMasters">
            Gen Sky Flat Masters
          </option>
          <option value="genCalibrations">
            Gen Calibrations
          </option>
          <option value="calibrateFocusVcurve">
            Calibrate Focus V-curve
          </option>
          <option value="pointingRun">
            Pointing Run
          </option>
          <option value="runWithMaximCamera">
            Run w/Maxim Camera
          </option>
          <option value="runWithAscomCamera">
            Run w/Ascom Camera
          </option>
          <option value="runUsingAcp">
            Run Using ACP
          </option>
          <option value="stopUsingAcp">
            Stop Using ACP
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
      isScriptSettingsActive: false
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
      set (val) { this.$store.commit('selectedScript', val) }
    }
  }

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
