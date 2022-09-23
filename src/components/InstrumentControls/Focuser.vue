
<template>
  <div class="instrument-control-wrapper">
    <div
      v-if="focuser_message.val != '-'"
      class="val"
    >
      {{ focuser_message.val }}
    </div>
    <status-column
      class="status-column"
      :status-list="buildFocuserTabStatus"
      :is-offline="!site_is_online"
    />

    <div style="border-bottom: 0.5px solid grey; margin: 1em 0;" />

    <b-dropdown
      aria-role="list"
      style="width: 100%; margin-bottom: 1em;"
    >
      <button
        slot="trigger"
        class="button is-small"
        style="width: 100%;"
      >
        <span>Focus Action...</span>
        <b-icon icon="menu-down" />
      </button>
      <b-dropdown-item>
        <button
          class="button dropdown-button-command is-small"
          @click="postCommand(focus_auto_command,[3])"
        >
          Quick Autofocus (3 points)
        </button>
      </b-dropdown-item>
      <b-dropdown-item>
        <button
          class="button dropdown-button-command is-small"
          @click="postCommand(focus_auto_command,[5])"
        >
          Fine Autofocus (5 points)
        </button>
      </b-dropdown-item>
      <template
        v-for="(command, idx) in [
          focus_home_command,
          focus_gotoreference_command,
          focus_gotocompensated_command,
          focus_saveasreference_command,
          focus_vcurve_command,
        ]"
      >
        <b-dropdown-item
          :key="idx"
          aria-role="listitem"
        >
          <command-button
            :data="command"
            class="dropdown-button-command is-small"
          />
        </b-dropdown-item>
      </template>
    </b-dropdown>
    <br>

    <b-field label="Relative">
      <b-field>
        <b-input
          v-model="focuser_relative"
          expanded
          name="subject"
          size="is-small"
          type="number"
          :step="focuser_step_size"
          autocomplete="off"
        />
        <p class="control">
          <command-button
            :data="focus_relative_command"
            class="is-small"
            @jobPost="focuserJobPost"
          />
        </p> <br>
      </b-field>
    </b-field>
    <b-field>
      <template v-for="(focus_val, idx) in ['-300', '-100', '-30', '+30', '+100', '+300']">
        <p
          :key="idx"
          class="control"
        >
          <button
            class="button is-small"
            @click="postCommand(focus_relative_command_args, [focus_val])"
          >
            {{ focus_val }}
          </button>
        </p>
      </template>
    </b-field>

    <br>

    <b-field label="Absolute">
      <b-field>
        <b-input
          v-model="focuser_absolute"
          expanded
          name="subject"
          size="is-small"
          type="number"
          :step="focuser_step_size"
          :min="focuser_min"
          :max="focuser_max"
          autocomplete="off"
        />
        <p class="control">
          <command-button
            :data="focus_absolute_command"
            class="is-small"
          />
        </p>
      </b-field>
    </b-field>

    <br>

    <div
      class="status-toggle-bar"
      @click="isExpandedStatusVisible= !isExpandedStatusVisible"
    >
      {{ isExpandedStatusVisible ? 'collapse status' : 'expand status' }}
    </div>

    <pre v-if="isExpandedStatusVisible">
      <simple-device-status
        :device_name="active_focuser"
        device_type="Focuser"
        :device_status="focuser_state"
/>
    </pre>
  </div>
</template>

<script>
import { commands_mixin } from '../../mixins/commands_mixin'
import { user_mixin } from '../../mixins/user_mixin'

import CommandButton from '@/components/FormElements/CommandButton'
import StatusColumn from '@/components/status/StatusColumn'
import SimpleDeviceStatus from '@/components/status/SimpleDeviceStatus'

import { mapGetters } from 'vuex'

export default {
  name: 'Focuser',
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton,
    StatusColumn,
    SimpleDeviceStatus
  },
  data () {
    return {
      isExpandedStatusVisible: false,

      focuserStatus: 'nothing yet',
      focuserJobs: {}
    }
  },

  methods: {
    focuserJobPost (data) {
      console.log('focuser job post: ', data)
    }
  },

  computed: {
    ...mapGetters('site_config', [
      'focuser_reference',
      'focuser_min',
      'focuser_max',
      'focuser_step_size',

      'rotator_min',
      'rotator_max',
      'rotator_step_size'
    ]),

    ...mapGetters('sitestatus', [
      'site_is_online',
      'buildFocuserTabStatus',
      'focuser_message',
      'focuser_state'
    ]),

    sitecode () {
      return this.$route.params.sitecode
    },
    focuser_relative: {
      get () { return this.$store.getters['command_params/focuser_relative'] },
      set (val) { this.$store.commit('command_params/focuser_relative', val) }
    },
    focuser_absolute: {
      get () { return this.$store.getters['command_params/focuser_absolute'] },
      set (val) { this.$store.commit('command_params/focuser_absolute', val) }
    }
  }

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";
</style>
