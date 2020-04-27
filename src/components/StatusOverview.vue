<template>
    
    <div class="columns component is-mobile" style="overflow-x: auto">
        <div class="column obsevatory-status" style="display:flex; flex-direction: column;">
            <div class="status-header">observatory - {{sitecode}}</div>
            <div class="status-entry">
                <div class="key">LST:</div>
                <div class="val">{{lmst}}</div>
            </div>
            <div class="status-entry">
                <div class="key">UTC:</div>
                <div class="val">{{new Date().toUTCString().split(' ')[4]}}</div>
            </div>
            <div class="status-entry">
                <div class="key">Enclosure:</div>
                <div class="val">{{enclosure_state.shutter_status}}</div>
            </div>
            <div class="status-entry">
                <div class="key">User:</div>
                <div class="val">--</div>
            </div>
        </div>
        <div class="column telescope-status">
            <div class="status-header">telescope</div>
            <div class="status-entry">
                <div class="key">RA:</div>
                <div class="val">{{(telescope_state.right_ascension)}}</div>
            </div>
            <div class="status-entry">
                <div class="key">Dec:</div>
                <div class="val">{{(telescope_state.declination)}}</div>
            </div>
            <div class="status-entry">
                <div class="key">Ha:</div>
                <div class="val">--</div>
            </div>
            <div class="status-entry">
                <div class="key">Alt:</div>
                <div class="val">{{telescope_state.altitude}}</div>
            </div>
            <div class="status-entry">
                <div class="key">Az:</div>
                <div class="val">{{telescope_state.azimuth}}</div>
            </div>
            <div class="status-entry">
                <div class="key">Airmass:</div>
                <div class="val">{{telescope_state.airmass}}</div>
            </div>
        </div>
        <div class="column camera-status">
            <div class="status-header">camera</div>
            <div class="status-entry">
                <div class="key">Binning:</div>
                <div class="val">--</div>
            </div>
            <div class="status-entry">
                <div class="key">Temp:</div>
                <div class="val">--</div>
            </div>
        </div>
        <div class="column activity-status">
            <div class="status-header">Activity</div>
            <div class="status-entry">
            <div class="key">Status Age:</div>
            <div class="val">
                <span v-if="status_age < 60" style="color: lightgreen;"> {{status_age_seconds}}</span>
                <span v-else-if="status_age < 600" style="color:yellow;">{{status_age_minutes}}</span>
                <span v-else-if="status_age < 3600" style="color:red;">{{status_age_minutes}}</span>
                <span v-else-if="status_age < 86400" style="color:red;">{{status_age_hours}}</span>
                <span v-else-if="status_age < 18000*86400" style="color:red;">{{status_age_days}}</span>
                <span v-else-if="status_age > 18000*86400" style="color:red;">unavailable</span>
            </div>
            </div>
            <div class="status-entry">
            <div class="key">Target:</div>
            <div class="val">--</div>
            </div>
            <div class="status-entry">
            <div class="key">Script:</div>
            <div class="val"> n/a </div>
            </div>
        </div>
    </div>

</template>

<script>
import { mapGetters } from 'vuex'
import helpers from '@/utils/helpers'
export default {
    props: ['deviceStatus', 'sitecode'],
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
        this.lmst_interval = setInterval(() => this.lmst = helpers.siderealTime(parseFloat(this.site_config(this.sitecode).longitude)), 1000)
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

        ...mapGetters('site_config', [
            'site_config',
            'enclosure',
            'mount',
            'telescope',
            'camera',
            'filter_wheel',
            'focuser',
            'rotator',
            'screen',
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
            let status_timestamp = this.deviceStatus.server_timestamp_ms
            return ((this.local_timestamp - status_timestamp)/1000).toFixed(1)
        },
    },



}

</script>

<style scoped>
.component {
    background-color: #1e2223;
}

.status-header {
  font-weight: bold;
  text-align: center;
  padding: 3px 0;
  margin-bottom: 5px;
  background-color: #283030;
}
.status-entry {
  display:flex;
}
.status-entry .key{
  text-align: right;
  padding-right: 10px;
  width: 50%;
  color:silver;
}
.status-entry .val{
  color: greenyellow;
  background-color: black;
  width: 50%;
  padding-left: 8px;
  margin-bottom: 3px;
}

</style>