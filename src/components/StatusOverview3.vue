<template>
    
    <div class="status-flex">
        <div class="status-entry">
            <div class="col">
                <div class="key">Status Age:</div>
                <div class="key">Enclosure:</div>
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
                <div class="val">{{enclosure_state.shutter_status}}</div>
            </div>
        </div>

        <div class="spacer"/>

        <div class="status-entry">
            <div class="col">
                <div class="key">LST:</div>
                <div class="key">UTC:</div>
                <div class="key">User:</div>
            </div>
            <div class="col">
                <div class="val">{{decimalToHHMMSS(lmst)}}</div>
                <div class="val">{{new Date().toUTCString().split(' ')[4]}}</div>
                <div class="val">--</div>
            </div>
        </div>

        <div class="spacer"/>

        <div class="status-entry">
            <div class="col">
                <div class="key">RA:</div>
                <div class="key">Dec:</div>
                <div class="key">Ha:</div>
                <div class="key">Alt:</div>
                <div class="key">Az:</div>
                <div class="key">Airmass:</div>
            </div>
            <div class="col">
                <div class="val">{{decimalToHHMMSS(telescope_state.right_ascension)}}</div>
                <div class="val">{{decimalToHHMMSS(telescope_state.declination)}}</div>
                <div class="val">{{decimalToHHMMSS(hour_angle)}}</div>
                <div class="val">{{telescope_state.altitude}}</div>
                <div class="val">{{telescope_state.azimuth}}</div>
                <div class="val">{{telescope_state.airmass}}</div>
            </div>
        </div>
        <!--pre>{{deviceStatus}}</pre-->

    </div>

</template>

<script>
import { mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
export default {
    props: ['config', 'deviceStatus', 'sitecode'],
    data () {
        return {
            // This is a setInterval object initialized in `created()`. 
            // Fetches status every few seconds.
            update_status_interval: 2000,
            local_timestamp: Date.now(),

            // Sidereal time
            lmst: '--',
            lmst_interval: '',
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

        // single status items
        mount_activity() {
            let activity = "idle"

            if (this.parseTrueFalse(this.mount_state.is_parked)) {
                activity = "parked"
            }
            else if (this.parseTrueFalse(this.mount_state.is_tracking)) {
                activity = "tracking"
            }
            else if (this.parsetrueFalse(this.mount_state.is_slewing)) {
                activity = "slewing"
            }
            return activity
        },
        hour_angle() {
            let ha = this.lmst - this.telescope_state.right_ascension
            if (ha < 0) {
                ha += 24 // hours, since we're in decimal
            }
            return ha
        },


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

</style>