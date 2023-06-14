
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
          v-model="selectedScript"
          value="none"
          size="is-small"
        >
          <option value="none">
            none
          </option>
          <option value="stopScript">
            Stop Script
          </option>
          <option
            v-for="script in scriptNames"
            :key="script.value"
            :value="script.value"
          >
            {{ script.name }}
          </option>
        </b-select>
        <p class="control">
          <button
            class="button is-small"
            :disabled="!selectedScriptHasSettings"
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

    <div
      v-if="showNotImplementedWarning"
      class="not-implemented-warning"
    >
      ⚠️  This script has not been implemented in the observatory yet ⚠️
    </div>

    <div v-if="isScriptSettingsActive">
      <script-settings
        :show="selectedScriptHasSettings"
        :script="selectedScript"
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
        @click="scriptRunCommand"
      >
        run script
      </b-button>
      <b-button
        class="button is-small"
        style="width: 35%; border-left: 1px solid #48c775;"
        @click="scriptStopCommand"
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
      ],

      // Display message for scripts that aren't implemented yet
      notImplementedScripts: [
        'takeLRGBStack',
        'takeO3HaS2N2Stack',
        'takeUGRIZSStack',
        'takePlanetStack',
        'takeLunarStack',
        'collectScreenFlats',
        'pointingRun'
      ]
    }
  },

  computed: {
    ...mapGetters('sitestatus', [
      'sequencer_message',
      'sequencer_state'
    ]),
    ...mapGetters('scriptSettings', [
      'selectedScriptHasSettings'
    ]),

    scriptNames () {
      const scripts = this.$store.state.scriptSettings.readableScriptNames
      const options = []
      Object.keys(scripts).forEach(key => {
        options.push({
          value: key,
          name: scripts[key]
        })
      })
      return options
    },
    sitecode () {
      return this.$route.params.sitecode
    },
    showNotImplementedWarning () {
      return this.notImplementedScripts.includes(this.selectedScript)
    },
    selectedScript: {
      get () { return this.$store.state.scriptSettings.selectedScript },
      set (val) {
        this.$store.commit('scriptSettings/selectedScript', val)

        // Auto hide or show settings
        this.isScriptSettingsActive = !this.hideSettingsOnLoad.includes(val)
      }
    }
  }

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";

.not-implemented-warning {
  margin-bottom: 0.5em;
  padding: 1em;
  font-weight: bold;
  text-align: center;
  border: 1px solid grey;
  // font for rendering emoji
  font-family: "Segoe UI Emoji",
               "Segoe UI Symbol",
               "Noto Color Emoji",
               "EmojiOne Color",
               "Android Emoji",
               sans-serif;
}
</style>
