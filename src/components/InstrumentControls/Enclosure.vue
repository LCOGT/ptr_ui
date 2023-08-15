<template>
  <div class="instrument-control-wrapper">
    <div
      v-if="enclosure_message.val !== '-'"
      class="val"
    >
      {{ enclosure_message.val }}
    </div>

    <status-column
      class="status-column"
      :status-list="buildEnclosureTabStatus"
      :is-offline="!site_is_online"
    />

    <div style="border-bottom: 0.5px solid grey; margin: 1em 0;" />

    <b-field grouped>
      <b-field
        v-if="userIsAdmin"
        label="Set Enclosure Mode"
        class="is-small"
        style="margin-bottom: 2em;"
      >
        <b-select
          v-model="selectedEnclosureMode"
          size="is-small"
        >
          <option value="automatic">
            Automatic
          </option>
          <option value="manual">
            Manual
          </option>
          <option value="shutdown">
            Shut down
          </option>
        </b-select>
        <p class="control">
          <CommandButton
            admin
            :data="setEnclosureMode"
            class="is-small"
          >apply</CommandButton>
        </p>
      </b-field>
    </b-field>

    <b-field
      v-if="userIsAdmin"
      label="Set Observing Mode"
      class="is-small"
      style="margin-bottom: 2em;"
    >
      <b-select
        v-model="selectedObservingMode"
        size="is-small"
      >
        <option value="active">
          Active
        </option>
        <option value="inactive">
          Inactive
        </option>
      </b-select>
      <p class="control">
        <CommandButton
          admin
          :data="setObservingMode"
          style="margin-bottom: 1em;"
          class="is-small"
        >
          apply
        </CommandButton>
      </p>
    </b-field>

    <b-field
      v-if="userIsAdmin"
      label="Local Weather Response"
      class="is-small"
      style="margin-bottom: 2em;"
    >
      <CommandButton
        admin
        class="button admin is-small"
        :data="enclosure_configure_weather_local_on"
      >On</CommandButton>
      <CommandButton
        admin
        class="button admin is-small"
        :data="enclosure_configure_weather_local_off"
      >Off</CommandButton>
    </b-field>
    <b-field
      v-if="userIsAdmin"
      label="OWM Weather Response"
      class="is-small"
      style="margin-bottom: 2em;"
    >
      <CommandButton
        admin
        class="button admin is-small"
        :data="enclosure_configure_weather_owm_on"
      >On</CommandButton>
      <CommandButton
        admin
        class="button admin is-small"
        :data="enclosure_configure_weather_owm_off"
      >Off</CommandButton>
    </b-field>
    <b-field
      v-if="userIsAdmin"
      label="Manually Force Roof State All Night:"
      class="is-small"
      style="margin-bottom: 2em;"
    >
      <CommandButton
        admin
        class="button admin is-small"
        :data="enclosure_configure_keep_roof_open"
      >Open</CommandButton>
      <CommandButton
        admin
        class="button admin is-small"
        :data="enclosure_configure_keep_roof_closed"
      >Closed</CommandButton>
    </b-field>
    <hr>
    <div>Weather Indicator Configuration</div>
    <br>
    <b-field horizontal label="">
      <b-field>
        <b-field label="setting" style="width: 80px;" />
        <p class="control">
          <b-field label="warning level" style="width: 110px;" />
        </p>
        <p class="control">
          <b-field label="danger level" style="width: 110px;" />
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="rain">
      <b-field>
        <b-select v-model="rainConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="rainWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="rainDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="humidity">
      <b-field>
        <b-select v-model="humidityConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="humidityWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="humidityDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="clouds">
      <b-field>
        <b-select v-model="cloudsConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="cloudsWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="cloudsDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="windspeed">
      <b-field>
        <b-select v-model="windspeedConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="windspeedWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="windspeedDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="lightning">
      <b-field>
        <b-select v-model="lightningConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="lightningWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="lightningDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="tempDew">
      <b-field>
        <b-select v-model="tempDewConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="tempDewWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="tempDewDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal label="skyTempLimit">
      <b-field>
        <b-select v-model="skyTempLimitConfigSetting">
          <option value="on">on</option>
          <option value="warn">warn</option>
          <option value="ignore">ignore</option>
        </b-select>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="skyTempLimitWarningLevel"/>
        </p>
        <p class="control">
          <b-input style="width: 110px;" type="number" min="0" max="100" v-model="skyTempLimitDangerLevel"/>
        </p>
      </b-field>
    </b-field>

    <b-field horizontal>
      <CommandButton
        admin
        class="is-small"
        :data="configureWeatherValues"
        style="width: 100%;"
      >Set Values</CommandButton>
    </b-field>

    <hr>

    <b-field grouped>
      <b-field>
        <CommandButton
          admin
          class="button admin is-small"
          :data="enclosure_simulate_weather_hold"
        />
      </b-field>
      <b-field>
        <CommandButton
          admin
          :data="enclosure_follow_owm_open_plan"
          class="is-small"
        />
      </b-field>
    </b-field>

    <b-field>
      <p class="control">
        <CommandButton
          admin
          :data="enclosure_open_command"
          class="is-small"
        />
      </p>
      <p class="control">
        <CommandButton
          admin
          :data="enclosure_close_command"
          class="is-small"
        />
      </p>
    </b-field>

    <b-field grouped label="Dome Settings">
      <b-field>
        <CommandButton
          :is-disabled="!enclosure_is_dome"
          admin
          :data="enclosure_home_dome_command"
          class="is-small"
        />
      </b-field>
      <b-field>
        <CommandButton
          admin
          :is-disabled="!enclosure_is_dome"
          :data="enclosure_track_telescope_command"
          class="is-small"
        />
        <p class="control">
          <CommandButton
            admin
            :is-disabled="!enclosure_is_dome"
            :data="enclosure_stop_tracking_telescope_command"
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
        :device_name="active_enclosure"
        device_type="enclosure"
        :device_status="enclosure_state"
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
  name: 'Enclosure',
  mixins: [commands_mixin, user_mixin],
  components: {
    CommandButton,
    StatusColumn,
    SimpleDeviceStatus
  },
  data () {
    return {
      isExpandedStatusVisible: false,
      selectedEnclosureMode: 'automatic',
      selectedObservingMode: 'active',

      rainConfigSetting: 'on',
      rainWarningLevel: 80,
      rainDangerLevel: 90,
      cloudsConfigSetting: 'on',
      cloudsWarningLevel: 80,
      cloudsDangerLevel: 90,
      humidityConfigSetting: 'on',
      humidityWarningLevel: 80,
      humidityDangerLevel: 90,
      windspeedConfigSetting: 'on',
      windspeedWarningLevel: 80,
      windspeedDangerLevel: 90,
      lightningConfigSetting: 'on',
      lightningWarningLevel: 80,
      lightningDangerLevel: 90,
      tempDewConfigSetting: 'on',
      tempDewWarningLevel: 80,
      tempDewDangerLevel: 90,
      skyTempLimitConfigSetting: 'on',
      skyTempLimitWarningLevel: 80,
      skyTempLimitDangerLevel: 90,
      lowestAmbientTemp: '',
      highestAmbientTemp: ''
    }
  },

  computed: {
    ...mapGetters('site_config', [
      'enclosure_is_dome',
      'wema_name'
    ]),
    ...mapGetters('sitestatus', [
      'site_is_online',
      'enclosure_state',
      'enclosure_message',
      'buildEnclosureTabStatus',
      'enclosure_mode'
    ]),

    setEnclosureMode () {
      return this.wema_base_command(
        'enclosure', // inst type
        'set_enclosure_mode', // action setAuto setManual setStayClosed
        '', // name (only used for rendering button names)
        { enclosure_mode: this.selectedEnclosureMode }
      )
    },
    setObservingMode () {
      const command_body = this.wema_base_command(
        'enclosure', // inst type
        'set_observing_mode', // action setObserving
        '', // name (only used for rendering button names)
        { observing_mode: this.selectedObservingMode } // reqired params
      )
      return command_body
    },
    enclosure_configure_weather_owm_on () {
      return this.wema_base_command('enclosure', 'configure_active_weather_report', '',
        {
          weather_type: 'owm',
          weather_type_value: 'on'
        }
      )
    },
    enclosure_configure_weather_owm_off () {
      return this.wema_base_command('enclosure', 'configure_active_weather_report', '',
        {
          weather_type: 'owm',
          weather_type_value: 'off'
        }
      )
    },
    enclosure_configure_weather_local_on () {
      return this.wema_base_command('enclosure', 'configure_active_weather_report', '',
        {
          weather_type: 'local',
          weather_type_value: 'on'
        }
      )
    },
    enclosure_configure_weather_local_off () {
      return this.wema_base_command('enclosure', 'configure_active_weather_report', '',
        {
          weather_type: 'local',
          weather_type_value: 'off'
        }
      )
    },
    enclosure_configure_keep_roof_open () {
      return this.wema_base_command('enclosure', 'keep_roof_open_all_night', '')
    },
    enclosure_configure_keep_roof_closed () {
      return this.wema_base_command('enclosure', 'keep_roof_closed_all_night', '')
    },
    enclosure_follow_owm_open_plan () {
      return this.wema_base_command('enclosure', 'open_no_earlier_than_owm_plan', 'Open no earlier than OWM plan')
    },
    enclosure_home_dome_command () {
      return this.wema_base_command('enclosure', 'home_dome', 'Home Dome')
    },

    configureWeatherValues () {
      const weatherVals = {
        rain: { status: this.rainConfigSetting, warning_level: this.rainWarningLevel, danger_level: this.rainDangerLevel },
        humidity: { status: this.humidityConfigSetting, warning_level: this.humidityWarningLevel, danger_level: this.humidityDangerLevel },
        clouds: { status: this.cloudsConfigSetting, warning_level: this.cloudsWarningLevel, danger_level: this.cloudsDangerLevel },
        windspeed: { status: this.windspeedConfigSetting, warning_level: this.windspeedWarningLevel, danger_level: this.windspeedDangerLevel },
        lightning: { status: this.lightningConfigSetting, warning_level: this.lightningWarningLevel, danger_level: this.lightningDangerLevel },
        tempDew: { status: this.tempDewConfigSetting, warning_level: this.tempDewWarningLevel, danger_level: this.tempDewDangerLevel },
        skyTempLimit: { status: this.skyTempLimitConfigSetting, warning_level: this.skyTempLimitWarningLevel, danger_level: this.skyTempLimitDangerLevel }
      }
      const base_command = this.base_command('enclosure', 'set_weather_values', '', {
        weather_values: weatherVals
      })
      base_command.site = this.wema_name
      return base_command
    }
  }

}
</script>

<style scoped lang="scss">
@import "./instrument_controls_common.scss";

.is-admin {
    background-color: rgba(68, 0, 255, 0.164);
    border-color: rgba(76, 0, 255, 0.541);
}
</style>
