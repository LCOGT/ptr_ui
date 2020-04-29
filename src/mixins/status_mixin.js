
import { mapGetters } from 'vuex'
import ReconnectingWebSocket from 'reconnecting-websocket';
import axios from 'axios'
import { getInstance } from '../auth/index' // get user object: getInstance().user

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
        buildFakeStatus() {
            return [
                {"name": "enclosure", "val": "open"},
                {"name": "temp", "val": "5"},
                {"name": "spacer", "val": "spacer"},
                {"name": "wind", "val": "15m/s"},
                {"name": "age", "val": "seconds"},
                {"name": "age", "val": "seconds"},
            ]
        },

        buildWeatherStatus() {
            return [
                {"name": "Status Age", ...this.status_age_display},
                {"name": "Weather ok", "val": this.weather_ok},
                {"name": "Open Ok", "val": this.open_ok},

                {"name": "spacer", "val": "spacer"},

                {"name": "Enclosure", "val": this.enclosure_status},
                {"name": "Sky Temp", "val": this.sky_temp},
                {"name": "Air Temp", "val": this.air_temp},
                {"name": "Humidity", "val": this.humidity},
                {"name": "Dewpoint", "val": this.dewpoint},
                {"name": "Wind", "val": this.wind},
                {"name": "Surface", "val": this.surface},
                {"name": "Ambient", "val": this.ambient},
                {"name": "Meas. mpsas", "val": this.meas_sky_mpsas},
            ]
        },
        buildGeneralStatus() {
            return [
                {"name": "Status Age", ...this.status_age_display},
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


        ...mapGetters('site_config', [
            'site_config',
            'site',
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
                    "color": "lightgreen",
                }
            } else if (this.status_age < 600) { 
                return {
                    "val": this.status_age_minutes,
                    "color": "yellow",
                }
            } else if (this.status_age < 3600) { 
                return {
                    "val": this.status_age_minutes,
                    "color": "red",
                }
            } else if (this.status_age < 86400) { 
                return {
                    "val": this.status_age_hours,
                    "color": "red",
                }
            } else if (this.status_age < 18000*86400 ) { 
                return {
                    "val": this.status_age_days,
                    "color": "red",
                }
            } else { 
                return {
                    "val": 'unavailable',
                    "color": "red",
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

        /**
         * Weather status
         */
        weather_state() {
            try {
                return this.deviceStatus.observing_conditions[this.weather] || {}
            } catch { return {} }
        },
        weather_ok() {
            return (this.weather_state.wx_ok || '-')
        },
        open_ok() {
            return (this.weather_state.open_ok || '-')
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


        /**
         * Telescope state
         */
        telescope_state() {
            try {
                return this.deviceStatus.telescope[this.telescope]
            } catch(error) { return {} }
        },
        ra() {
            return (parseFloat(this.telescope_state.right_ascension).toFixed(4) || '-')
        },
        dec() {
            return (parseFloat(this.telescope_state.declination).toFixed(4) || '-')
        },
        azimuth() {
            return (this.telescope_state.azimuth || '-')
        },
        altitude() {
            return (this.telescope_state.altitude || '-')
        },
        sidereal_time() {
            return (parseFloat(this.telescope_state.sidereal_time) || '-')
        },
        zenith_distance() {
            return (this.telescope_state.zenith_distance || '-')
        },
        airmass() {
            return (this.telescope_state.airmass|| '-')
        },
        airmass() {
            return (this.telescope_state.airmass|| '-')
        },
        hour_angle() {
            let ha = this.telescope_state.sidereal_time - this.telescope_state.right_ascension
            if (ha < -12) {
                ha += 24 // hours, since we're in decimal
            }
            ha = ha.toFixed(3)
            if (ha > 0) {
                ha = '+'+ha
            }
            return ha
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
            return this.camera_state.status || '-'
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
    },


}