<template>
    
    <div class="status-flex">

        <div class="status-entry">
            <div class="col">
                <div class="key">Status Age:</div>
                <div class="key">Weather ok:</div>
                <div class="key">Open Ok:</div>
            </div>
            <div class="col">
                <div class="val">
                    <span v-if="status_age < 60" style="color: lightgreen;"> {{status_age_seconds}}</span>
                    <span v-else-if="status_age < 600" style="color:yellow;">{{status_age_minutes}}</span>
                    <span v-else-if="status_age < 3600" style="color:red;">{{status_age_minutes}}</span>
                    <span v-else-if="status_age < 86400" style="color:red;">{{status_age_hours}}</span>
                    <span v-else-if="status_age < 18000*86400" style="color:red;">{{status_age_days}}</span>
                    <span v-else-if="status_age > 18000*86400" style="color:red;">unavailable</span>
                </div>
                <div class="val">{{weather_state.wx_ok || '-'}}</div>
                <div class="val">{{weather_state.open_ok || '-'}}</div>
            </div>
        </div>

        <div class="spacer"/>

        <div class="status-entry">
            <div class="col">
                <div class="key">Enclosure:</div>
                <div class="key">Sky Temp:</div>
                <div class="key">Air Temp:</div>
                <div class="key">Humidity:</div>
                <div class="key">Dewpoint:</div>
                <div class="key">Wind:</div>
                <div class="key">Airmass: </div>
                <div class="key">Brightness</div>
                <div class="key">Meas. mpsas:</div>
            </div>
            <div class="col">
                <div class="val">{{enclosure_state.shutter_status || '-'}}</div>
                <div class="val">{{weather_state.sky_temp_C || '-'}} &deg;C</div>
                <div class="val">{{weather_state.temperature_C || '-'}} &deg;C</div>
                <div class="val">{{weather_state['humidity_%'] || '-'}} %</div>
                <div class="val">{{weather_state.dewpoint_C || '-'}} &deg;C</div>
                <div class="val">{{weather_state['wind_m/s'] || '-'}} m/s</div>
                <div class="val">{{telescope_state.airmass || '-'}}</div>
                <div class="val">{{weather_state.brightness_hz || '-'}} hz</div>
                <div class="val">{{weather_state.meas_sky_mpsas || '-'}} hz</div>
            </div>
        </div>
        <div style="height:10px;"/>
        <div class="status-toggle-bar" @click="isWeatherStatusVisible = !isWeatherStatusVisible">complete status</div>
        <pre v-if="isWeatherStatusVisible">
          <simple-device-status :device_name="weather" device_type="Weather" :device_status="weather_state" />
        </pre>
        <!--pre>{{weather_state}}</pre-->
    </div>

</template>

<script>
import { mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
import SimpleDeviceStatus from '@/components/SimpleDeviceStatus'
export default {
    props: ['config', 'deviceStatus', 'sitecode'],
    components: {
        SimpleDeviceStatus,
    },
    data () {
        return {
            // This is a setInterval object initialized in `created()`. 
            // Fetches status every few seconds.
            update_status_interval: 2000,
            local_timestamp: Date.now(),

            // Sidereal time
            lmst: '--',
            lmst_interval: '',

            isWeatherStatusVisible: false,
        }
    },
    mounted() {
        // This interval is stopped in the `beforeDestroy` lifecycle hook.
        this.update_time_interval = setInterval(this.update_time, 1000)
        this.lmst_interval = setInterval(() => this.lmst = helpers.siderealTime(parseFloat(this.config.longitude)), 1000)
    },
    beforeDestroy() {
        clearInterval(this.update_time_interval)
        clearInterval(this.lmst_interval)
    },
    methods: {

        focuserJobPost(data) {
            console.log('focuser job post: ',data)
            let statusItem = {
                "status": data.statusId.split("#")[0],
                "deviceType": data.deviceType,
            }
            this.focuserJobs[data.ulid] = statusItem
        },

        update_time() {
            this.local_timestamp= Date.now()
        },

        decimalToHHMMSS(time) {
            // prevent return value of NaN:NaN:NaN
            if (typeof parseFloat(time) != "number") {return '--:--:--'}

            // -1.00 should translate to -01:00:00
            let negative = false;
            if (parseFloat(time) < 0) { negative = true }
            time = Math.abs(time)

            let hhmmss = ''
            let h, m, s;
            h = parseInt(time)
            m = parseInt(60 * (time - h))
            s = parseInt(3600 * (time - h) % 60)
            if (h<10) { h = '0'+h}
            if (m<10) { m = '0'+m}
            if (s<10) { s = '0'+s}
            if (negative) {h = '-'+h}
            hhmmss = `${h}:${m}:${s}`
            return hhmmss
        },




    },
    computed: {

        ...mapGetters('observatory_configuration', [
            'enclosure',
            'mount',
            'telescope',
            'camera',
            'filter_wheel',
            'focuser',
            'rotator',
            'screen',
            'weather',
        ]),

        status_age_days() {
            let timestring = ''
            let days = parseInt(this.status_age / 86400)
            let hours = parseInt((this.status_age % 86400) / 3600)
            timestring += days + 'd  ' 
            timestring += hours + 'h  '
            return timestring
        },
        status_age_hours() {
            let timestring = ''
            let hours = parseInt(this.status_age / 3600)
            let minutes = parseInt((this.status_age % 3600) / 60)
            timestring += hours + 'h  ' 
            timestring += minutes + 'm  '
            return timestring
        },
        status_age_minutes() {
            let timestring = ''
            let minutes = parseInt(this.status_age / 60)
            let seconds = parseInt(this.status_age % 60)
            timestring += minutes += 'm  '
            timestring += seconds += 's  '
            return timestring
        },
        status_age_seconds() {
            return parseInt(this.status_age) + 's '
        },
        enclosure_state() {
            try {
                return this.deviceStatus.enclosure[this.enclosure]
            } catch { return {} }
        },
        weather_state() {
            try {
                return this.deviceStatus.observing_conditions[this.weather]
            } catch { return {} }
        },
        mount_state() {
            try {
                return this.deviceStatus.mount[this.mount]
            } catch { return {} }
        },
        telescope_state() {
            try {
                return this.deviceStatus.telescope[this.telescope]
            } catch(error) { return {} }
        },
        camera_state() {
            try {
                return this.deviceStatus.camera[this.camera]
            } catch(error) { console.log(error); return {} }
        },
        filter_wheel_state () {
            try {
                return this.deviceStatus.filter_wheel[this.filter_wheel]
            } catch(error) { return {} }
        },
        focuser_state() {
            try {
                return this.deviceStatus.focuser[this.focuser]
            } catch(error) { return {} }
        },
        rotator_state() {
            try {
                return this.deviceStatus.rotator[this.rotator]
            } catch(error) { return {} }
        },
        screen_state () {
            try {
                return this.deviceStatus.screen[this.screen]
            } catch(error) { return {} }
        },
        sequencer_state () {
            try {
                return this.deviceStatus.sequencer
            } catch(error) { return {} }
        },
        status_age() {
            let status_timestamp = this.deviceStatus.timestamp
            return (this.local_timestamp/1000 - status_timestamp).toFixed(1)
        },
    },



}

</script>

<style scoped>
.status-flex {
    padding: 0px 0;
    background-color: #1e2223;
    display:flex;
    flex-direction:column;
    flex-wrap:nowrap;
    z-index:10;
    font-family: "Helvetica";
}
.status-entry {
  display:flex;
  flex-direction:row;
  flex-wrap:wrap;
  padding: 0 0px;
  width: 100%;
}
.col {
    flex-direction: column;
    width: 50%;
}
.status-entry .key {
  color:silver;
  padding: 0 8px;
  white-space: nowrap;
  margin-bottom: 3px;
  text-align: right;
  flex-grow:1;
}
.status-entry .val{
  color: greenyellow;
  background-color: black;
  padding: 0 8px;
  margin-bottom: 3px;
  white-space: nowrap;
  flex-grow:1;
}

.spacer {
    height:10px;
}

/* This is for the expandable complete weather status */
.status-toggle-bar {
  height: 1.5em;
  background-color:#161a1a;
  text-align: center;
}
.status-toggle-bar:hover {
  cursor: pointer;
}

</style>