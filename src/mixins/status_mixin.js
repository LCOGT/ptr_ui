
import { mapGetters } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios'
import { getInstance } from '../auth/index' // get user object: getInstance().user


/**
 * 
 *  NOTE: 
 *  This mixin requires 'sitecode' to be defined by the parent component that
 *  imports the mixin. This should be changed eventually. 
 */

// Change empty strings to 'empty'. 
function emptyString(s) {
    return s == '' ? 'empty' : s;
}

export const status_mixin = {

    data() {
        return {

            deviceStatus: {},

            status_ws: '',

            local_timestamp: Date.now(),
            update_time_interval: '',

            display_colors: {
                "red": "orangered",
                "yellow": "yellow",
                "green": "greenyellow",
            }
        }
    },

    mounted() {

        // Keep an updated timestamp to calculate the status age
        this.update_time_interval = setInterval(() => this.local_timestamp = Date.now(), 1000)

        // Connect to websocket to get state of devices/weather
        let status_ws_url = 'wss://2q5zz6ppch.execute-api.us-east-1.amazonaws.com/dev'
        status_ws_url += `?site=${encodeURIComponent(this.sitecode)}`
        this.status_ws= new ReconnectingWebSocket(status_ws_url)
        this.status_ws.onmessage = (message) => {
        let data = JSON.parse(message.data);
            let statusType = data.statusType
            let status = data.status
            let status_timestamp = data.server_timestamp_ms

            status.server_timestamp_ms = data.server_timestamp_ms

            if (statusType == "deviceStatus"){
                this.deviceStatus = status
            }
        }
        
        // Load initial status
        this.getSiteDeviceStatus()
    },

    beforeDestroy() {
        clearInterval(this.update_time_interval)
    },


    methods: {

        // Changes the site that the status websocket recieves updates for.
        updateStatusSubscriptionSite(site) {
            this.status_ws.send(JSON.stringify({"action": "updateSubscriberSite", "site": site}))
        },

        async getSiteDeviceStatus() {
            let url = `https://status.photonranch.org/status/${this.sitecode}/device_status`
            let response = await axios.get(url)
            let status = response.data.Item.status
            status.server_timestamp_ms = response.data.Item.server_timestamp_ms
            this.deviceStatus = status

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
        parseTrueFalse(s) {
            if (undefined == s) { 
                return false; 
            }
            if (typeof s === "boolean") {
                return s
            }
            else if (s.toLowerCase()=="true") {return true}
            else if (s.toLowerCase()=="false") {return false}
            console.error("Could not parse true or false. Check for bad behavior.")
            console.log(s)
            return false
        },


    },

    watch: {
        site() {

            // Change status subscriptions to the new site
            this.updateStatusSubscriptionSite(this.sitecode)

            // Get status for the new site.
            this.getSiteDeviceStatus()
        }
    },

    computed: {

        // Control the status indicator dot in the title bar.
        isOnline() {
            // online is defined by status age under 5 minutes
            if (this.status_age < 300) {
                return true
            }
            else return false;
        },

        buildEmptyStatus() {
            let status = []
            status.push({
                "name": "status",
                "val": "not configured"
            })
            return status
        },

        buildWeatherStatus() {
            let status = []
            //status.push({"name": "Status Age", ...this.status_age_display})
            if (this.weather_ok.val != '-'){ status.push({"name": "Weather ok", ...this.weather_ok}) }
            if (this.open_ok.val != '-'){ status.push({"name": "Open Ok", ...this.open_ok}) }

            status.push({"name": "spacer", "val": "spacer"}) 

            if (this.enclosure_status != '-'){ status.push({"name": "Enclosure", "val": this.enclosure_status}) }
            if (this.sky_temp != '-'){ status.push({"name": "Sky Temp", "val": this.sky_temp}) }
            if (this.air_temp != '-'){ status.push({"name": "Air Temp", "val": this.air_temp}) }
            if (this.humidity != '-'){ status.push({"name": "Humidity", "val": this.humidity}) }
            if (this.dewpoint != '-'){ status.push({"name": "Dewpoint", "val": this.dewpoint}) }
            if (this.wind != '-'){ status.push({"name": "Wind", "val": this.wind}) }
            if (this.surface != '-'){ status.push({"name": "Surface", "val": this.surface}) }
            if (this.ambient != '-'){ status.push({"name": "Ambient", "val": this.ambient}) }
            if (this.meas_sky_mpsas != '-'){ status.push({"name": "Meas. mpsas", "val": this.meas_sky_mpsas}) }
            return status 
        },
        buildGeneralStatus() {
            return [
                {"name": "Status Age", ...this.status_age_display},
                
                {"name": "spacer", "val": "spacer"},

                {"name": "Enclosure", "val": this.enclosure_status},

                {"name": "spacer", "val": "spacer"},

                {"name": "Ra", "val": this.ra},
                {"name": "Dec", "val": this.dec},
                {"name": "Azimuth", "val": this.azimuth},
                {"name": "Altitude", "val": this.altitude},
                {"name": "Airmass", "val": this.airmass},
                {"name": "HA", "val": this.hour_angle},
            ]
        },
        buildFocusRotatorCameraStatus() {
            let status = [
                ...this.buildFocuserTabStatus,
                {"name": "spacer", "val": "spacer"},
                ...this.buildRotatorTabStatus,
                {"name": "spacer", "val": "spacer"},
                ...this.buildCameraTabStatus,
                {"name": "spacer", "val": "spacer"},
            ]
            return status
        },
        buildTargetPageStatus() {
            let status = []
            status.push({"name": "Ra", "val": this.ra})
            status.push({"name": "Dec", "val": this.dec})
            status.push({"name": "Azimuth", "val": this.azimuth})
            status.push({"name": "Altitude", "val": this.altitude})
            status.push({"name": "Airmass", "val": this.airmass})
            status.push({"name": "Activity", "val": this.mount_activity})
            status.push({"name": "Enclosure", "val": this.enclosure_status}) 
            return status
        },
        buildEnclosureTabStatus() {
            let status = []
            if (this.enclosure_mode != '-'){ status.push({"name": "Mode", "val": this.enclosure_mode}) }
            if (this.enclosure_status != '-'){ status.push({"name": "Enclosure", "val": this.enclosure_status}) }
            if (this.open_ok.val != '-'){ status.push({"name": "Open ok", ...this.open_ok}) }
            return status
        },
        buildTelescopeTabStatus1() {
            let status = []
            if (this.ra != '-') { status.push({"name": "Ra", "val": this.ra})}
            if (this.dec != '-') { status.push({"name": "Dec", "val": this.dec})}
            if (this.azimuth != '-') { status.push({"name": "Azimuth", "val": this.azimuth})}
            if (this.altitude != '-') { status.push({"name": "Altitude", "val": this.altitude})}
            if (this.refraction != '-') { status.push({"name": "Refr.", "val": this.refraction})}
            return status
        },
        buildTelescopeTabStatus2() {
            let status = []
            if (this.ha != '-') { status.push({"name": "HA", "val": this.hour_angle})}
            if (this.zenith_distance != '-') { status.push({"name": "Zenith", "val": this.zenith_distance})}
            if (this.airmass != '-') { status.push({"name": "Airmass", "val": this.airmass})}
            status.push({"name": "Activity", "val": this.mount_activity})
            return status
        },
        buildCameraTabStatus() {
            let status = []
            if (this.camera_status != '-') { status.push({"name": "Camera status", "val": this.camera_status})}
            if (this.filter_name != '-') { status.push({"name": "Filter", "val": this.filter_name})}
            if (this.filter_wheel_moving != '-') { status.push({"name": "Filter Wheel", "val": this.filter_wheel_moving})}
            return status
        },
        buildFocuserTabStatus() {
            let status = []
            if (this.focus_position != '-') { status.push({"name": "Focus", "val": this.focus_position})}
            if (this.focus_comp != '-') { status.push({"name": "Comp.", "val": this.focus_comp})}
            if (this.focus_filter_offset != '-') { status.push({"name": "Offset", "val": this.focus_filter_offset})}
            if (this.focus_temperature != '-') { status.push({"name": "Temp", "val": this.focus_temperature})}
            if (this.focus_moving != '-') { status.push({"name": "Status", "val": this.focus_moving})}
            return status
        },
        buildRotatorTabStatus() {
            let status = []
            if (this.rotator_moving != '-') { status.push({"name": "Rotator", "val": this.rotator_moving})}
            if (this.rotator_position != '-') { status.push({"name": "Position", "val": this.rotator_position })}
            return status
        },
        buildScreenTabStatus() {
            let status = []
            if (this.screen_status != '-') { status.push({"name": "Status", "val": this.screen_status})}
            if (this.screen_brightness != '-') { status.push({"name": "Brightness", "val": this.screen_bright_setting})}
            return status
        },
        buildSequencerTabStatus() {
            let status = []
            if (this.active_script != '-') { status.push({"name": "Script", "val": this.active_script})}
            if (this.sequencer_busy != '-') { status.push({"name": "Busy", "val": this.sequencer_busy})}
            return status
        },


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
            'weather',
        ]),

        status_age_display() {
            if (this.status_age < 60) { 
                return {
                    "val": this.status_age_seconds,
                    "color": this.display_colors.green,
                } 
            } else if (this.status_age < 300) { 
                return {
                    "val": this.status_age_minutes,
                    "color": this.display_colors.green,
                }
            } else if (this.status_age < 600) { 
                return {
                    "val": this.status_age_minutes,
                    "color": this.display_colors.yellow,
                }
            } else if (this.status_age < 3600) { 
                return {
                    "val": this.status_age_minutes,
                    "color": this.display_colors.red,
                }
            } else if (this.status_age < 86400) { 
                return {
                    "val": this.status_age_hours,
                    "color": this.display_colors.red,
                }
            } else if (this.status_age < 18000*86400 ) { 
                return {
                    "val": this.status_age_days,
                    "color": this.display_colors.red,
                }
            } else { 
                return {
                    "val": 'unavailable',
                    "color": this.display_colors.red,
                }
            }
        },
        status_age() {
            let status_timestamp = this.deviceStatus.server_timestamp_ms
            return parseFloat(((this.local_timestamp - status_timestamp)/1000).toFixed(1))
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

        /**
         * Enclosure status
         */
        enclosure_state() {
            try {
                return this.deviceStatus.enclosure[this.enclosure] || {}
            } catch { return {} }
        },
        enclosure_status() {
            return (this.enclosure_state.shutter_status || this.enclosure_state.roof_status || '-')
        },
        enclosure_mode() {
            return (this.enclosure_state.enclosure_mode || '-')
        },

        /**
         * Weather status
         */
        weather_state() {
            try {
                return this.deviceStatus.observing_conditions[this.weather] || {}
            } catch { return {} }
        },
        weather_ok() {
            let color = this.display_colors.red
            let val = this.weather_state.wx_ok || '-'
            if (val == "Yes") { color = this.display_colors.green }

            return {
                "val": val,
                "color": color
            }
        },
        open_ok() {
            let color = this.display_colors.red
            let val = this.weather_state.open_ok || '-'
            if (val == "Yes") { color = this.display_colors.green }

            return {
                "val": val,
                "color": color
            }
        },
        sky_temp() {
            return (this.weather_state.sky_temp_C || '-') + ' °C'
        },
        air_temp() {
            return (this.weather_state.temperature_C || '-') + ' °C'
        },
        humidity() {
            return (this.weather_state['humidity_%'] || '-') + ' %'
        },
        dewpoint() {
            return (this.weather_state.dewpoint_C || '-') + ' °C'
        },
        wind() {
            return (this.weather_state['wind_m/s'] || '-') + ' m/s'
        },
        surface() {
            return (this.weather_state.calc_HSI_lux || '-') + ' lux'
        },
        ambient() {
            return (this.weather_state.ambient_light || '-') 
        },
        meas_sky_mpsas() {
            return (this.weather_state.meas_sky_mpsas || '-')
        },


        /**
         * Mount state
         */
        mount_state() {
            try {
                return this.deviceStatus.mount[this.mount]
            } catch { return {} }
        },
        mount_is_slewing() {
            return (this.mount_state.is_slewing || '-')
        },
        mount_is_parked() {
            return (this.mount_state.is_parked || '-')
        },
        mount_is_tracking() {
            return (this.mount_state.is_tracking|| '-')
        },
        mount_activity() {
            let activity = "idle"

            if (!this.mount_state) {return "offline"}

            if (this.parseTrueFalse(this.mount_state.is_parked)) {
                activity = "parked"
            }
            else if (this.parseTrueFalse(this.mount_state.is_tracking)) {
                activity = "tracking"
            }
            else if (this.parseTrueFalse(this.mount_state.is_slewing)) {
                activity = "slewing"
            }
            return activity
        },


        /**
         * Telescope state
         */
        telescope_state() {
            try {
                return this.deviceStatus.telescope[this.telescope]
            } catch(error) { return {} }
        },
        ra() {
            if (this.telescope_state && 'right_ascension' in this.telescope_state) {
                return (parseFloat(this.telescope_state.right_ascension).toFixed(4) || '-')
            } else {
                return '-'
            }
        },
        dec() {
            if (this.telescope_state && 'declination' in this.telescope_state) {
                return (parseFloat(this.telescope_state.declination).toFixed(4) || '-')
            } else {
                return '-'
            }
        },
        azimuth() {
            if (this.telescope_state && 'azimuth' in this.telescope_state) {
                return this.telescope_state.azimuth
            } else {
                return '-'
            }
        },
        altitude() {
            if (this.telescope_state && 'altitude' in this.telescope_state) {
                return (this.telescope_state.altitude || '-')
            } else {
                return '-'
            }
        },
        sidereal_time() {
            if (this.telescope_state && 'sidereal_time' in this.telescope_state ){
                return (parseFloat(this.telescope_state.sidereal_time) || '-')
            } else {
                return '-'
            }
        },
        zenith_distance() {
            if (this.telescope_state && 'zenith_distance' in this.telescope_state ){
                return (this.telescope_state.zenith_distance || '-')
            } else {
                return '-'
            }
        },
        airmass() {
            if (this.telescope_state && 'airmass' in this.telescope_state ){
                return (this.telescope_state.airmass|| '-')
            } else {
                return '-'
            }
        },
        refraction() {
            if (this.telescope_state && 'refraction' in this.telescope_state ){
                return (this.telescope_state.refraction || '-')
            } else {
                return '-'
            }
        },
        hour_angle() {
            if (this.telescope_state 
                    && "right_ascension" in this.telescope_state 
                    && "sidereal_time" in this.telescope_state) {
                let ha = this.telescope_state.sidereal_time - this.telescope_state.right_ascension
                if (ha < -12) {
                    ha += 24 // hours, since we're in decimal
                }
                ha = ha.toFixed(3)
                if (ha > 0) {
                    ha = '+'+ha
                }
                return ha
            }
            else { return '-' }
        },




        /**
         * Camera state
         */
        camera_state() {
            try {
                return this.deviceStatus.camera[this.camera]
            } catch(error) { return {} }
        },
        camera_status() {
            try {
                return this.camera_state.status || '-'
            } catch(error) { return '-' }
        },




        /**
         * Filter Wheel state
         */
        filter_wheel_state () {
            try {
                return this.deviceStatus.filter_wheel[this.filter_wheel]
            } catch(error) { return {} }
        },
        filter_name() {
            if (this.filter_wheel_state && 'filter_name' in this.filter_wheel_state){
                return (this.filter_wheel_state.filter_name|| '-')
            } else {
                return '-'
            }
        },
        filter_wheel_moving() {
            if (this.filter_wheel_state && 'wheel_is_moving' in this.filter_wheel_state){
                return this.parseTrueFalse(this.filter_wheel_state.wheel_is_moving) ? "moving":"idle"
            } else {
                return '-'
            }
        },


        /**
         * Focuser state
         */
        focuser_state() {
            try {
                return this.deviceStatus.focuser[this.focuser]
            } catch(error) { return {} }
        },
        focus_position() {
            if (this.focuser_state && 'focus_position' in this.focuser_state){
                return this.focuser_state.focus_position + " μm"
            } else {
                return '-'
            }
        },
        focus_comp() {
            if (this.focuser_state && 'comp' in this.focuser_state){
                return String(this.focuser_state.comp) + " μm"
            } else {
                return '-'
            }
        },
        focus_filter_offset() {
            if (this.focuser_state && 'filter_offset' in this.focuser_state){
                return this.focuser_state.filter_offset + " μm"
            } else {
                return '-'
            }
        },
        focus_temperature() {
            if (this.focuser_state && 'focus_temperature' in this.focuser_state){
                return this.focuser_state.focus_temperature + " ℃"
            } else {
                return '-'
            }
        },
        focus_moving() {
            if (this.focuser_state && 'focus_moving' in this.focuser_state){
                return this.parseTrueFalse(this.focuser_state.focus_moving) ? "moving" : "idle"
            } else {
                return '-'
            }
        },

        /**
         * Rotator state
         */
        rotator_state() {
            try {
                return this.deviceStatus.rotator[this.rotator]
            } catch(error) { return {} }
        },
        rotator_position() {
            if (this.rotator_state && 'position_angle' in this.rotator_state){
                return this.rotator_state.position_angle + "°"
            } else {
                return '-'
            }
        },
        rotator_moving() {
            if (this.rotator_state && 'rotator_moving' in this.rotator_state){
                return this.parseTrueFalse(this.rotator_state.rotator_moving) ? "rotating" : "idle"
            } else {
                return '-'
            }
        },

        /**
         * Screen state
         */
        screen_state () {
            try {
                return this.deviceStatus.screen[this.screen]
            } catch(error) { return {} }
        },
        screen_status() {
            if (this.screen_state && 'dark_setting' in this.screen_state){
                return this.screen_state.dark_setting.split(' ')[2]
            } else {
                return '-'
            }
        },
        screen_bright_setting() {
            if (this.screen_state && 'bright_setting' in this.screen_state){
                return this.screen_state.bright_setting + ' %'
            } else {
                return '-'
            }
        },

        /**
         * Sequencer state
         */
        sequencer_state () {
            try {
                return this.deviceStatus.sequencer
            } catch(error) { return {} }
        },
        active_script() {
            if (this.sequencer_state && 'active_script' in this.sequencer_state){
                return this.sequencer_state.active_script
            } else {
                return '-'
            }
        },
        sequencer_busy() {
            if (this.sequencer_state && 'sequencer_busy' in this.sequencer_state){
                return this.sequencer_state.sequencer_busy
            } else {
                return '-'
            }
        },
    },


}