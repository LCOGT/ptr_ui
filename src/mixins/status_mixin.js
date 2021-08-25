
import { mapGetters, mapState } from 'vuex'
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

function status_age_display(status_age, display_colors) {
    if (status_age < 60) {
        return {
            "val": status_age_seconds(status_age),
            "color": display_colors.green,
        }
    } else if (status_age< 300) {
        return {
            "val": status_age_minutes(status_age),
            "color": display_colors.green,
        }
    } else if (status_age < 600) {
        return {
            "val": status_age_minutes(status_age),
            "color": display_colors.yellow,
        }
    } else if (status_age < 3600) {
        return {
            "val": status_age_minutes(status_age),
            "color": display_colors.red,
        }
    } else if (status_age < 86400) {
        return {
            "val": status_age_hours(status_age),
            "color": display_colors.red,
        }
    } else if (status_age < 18000 * 86400) {
        return {
            "val": status_age_days(status_age),
            "color": display_colors.red,
        }
    } else {
        return {
            "val": 'na',
            "color": display_colors.red,
        }
    }
}
function status_age_days(timestamp_ms) {
    let timestring = ''
    let days = parseInt(timestamp_ms / 86400)
    let hours = parseInt((timestamp_ms % 86400) / 3600)
    timestring += days + 'd  '
    timestring += hours + 'h  '
    return timestring
}
function status_age_hours(timestamp_ms) {
    let timestring = ''
    let hours = parseInt(timestamp_ms / 3600)
    let minutes = parseInt((timestamp_ms % 3600) / 60)
    timestring += hours + 'h  '
    timestring += minutes + 'm  '
    return timestring
}
function status_age_minutes(timestamp_ms) {
    let timestring = ''
    let minutes = parseInt(timestamp_ms / 60)
    let seconds = parseInt(timestamp_ms % 60)
    timestring += minutes += 'm  '
    timestring += seconds += 's  '
    return timestring
}
function status_age_seconds(timestamp_ms) {
    return parseInt(timestamp_ms) + 's '
}

export const status_mixin = {

    data() {
        return {

            display_colors: {
                "red": "orangered",
                "yellow": "yellow",
                "green": "greenyellow",
            }
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

            status.push({"name": "Wx Status Age", ...status_age_display(this.wx_status_age, this.display_colors)})

            status.push({"name": "spacer", "val": "spacer"}) 

            if (this.weather_ok.val != '-'){ status.push({"name": "Weather ok", ...this.weather_ok, is_stale: this.wx_is_stale}) }
            if (this.open_ok.val != '-'){ status.push({"name": "Open Ok", ...this.open_ok, is_stale: this.wx_is_stale}) }

            status.push({"name": "spacer", "val": "spacer"}) 

            if (this.enclosure_mode != '-'){ status.push({"name": "Enc. Mode", "val": this.enclosure_mode, is_stale: this.wx_is_stale}) }
            if (this.sky_temp != '-'){ status.push({"name": "Sky Temp", "val": this.sky_temp, is_stale: this.wx_is_stale}) }
            if (this.air_temp != '-'){ status.push({"name": "Air Temp", "val": this.air_temp, is_stale: this.wx_is_stale}) }
            if (this.humidity != '-'){ status.push({"name": "Humidity", "val": this.humidity, is_stale: this.wx_is_stale}) }
            if (this.dewpoint != '-'){ status.push({"name": "Dewpoint", "val": this.dewpoint, is_stale: this.wx_is_stale}) }
            if (this.wind != '-'){ status.push({"name": "Wind", "val": this.wind, is_stale: this.wx_is_stale }) }
            if (this.surface != '-'){ status.push({"name": "Surface", "val": this.surface, is_stale: this.wx_is_stale }) }
            if (this.ambient != '-'){ status.push({"name": "Ambient", "val": this.ambient, is_stale: this.wx_is_stale }) }
            if (this.meas_sky_mpsas != '-'){ status.push({"name": "Meas. mpsas", "val": this.meas_sky_mpsas, is_stale: this.wx_is_stale }) }
            if (this.calc_sky_mpsas != '-'){ status.push({"name": "Calc. mpsas", "val": this.calc_sky_mpsas, is_stale: this.wx_is_stale }) }
            return status 
        },
        buildGeneralStatus() {
            let general_status = [
                {"name": "Status Age", ...status_age_display(this.device_status_age, this.display_colors)},
                
                {"name": "spacer", "val": "spacer"},

                {"name": "Enclosure", "val": this.enclosure_status, is_stale: this.wx_is_stale },

                {"name": "spacer", "val": "spacer"},

                {"name": "Dome Az", "val": this.dome_azimuth, is_stale: this.wx_is_stale  },
                {"name": "Dome Slewing", "val": this.dome_slewing, is_stale: this.wx_is_stale  },
                {"name": "Dome Synced", "val": this.enclosure_synchronized, is_stale: this.wx_is_stale },

                {"name": "spacer", "val": "spacer"},

                {"name": "Ra", "val": this.ra, is_stale: this.device_status_is_stale},
                {"name": "Dec", "val": this.dec, is_stale: this.device_status_is_stale},
                {"name": "Azimuth", "val": this.azimuth, is_stale: this.device_status_is_stale},
                {"name": "Altitude", "val": this.altitude, is_stale: this.device_status_is_stale},
                {"name": "Airmass", "val": this.airmass, is_stale: this.device_status_is_stale},
                {"name": "HA", "val": this.hour_angle, is_stale: this.device_status_is_stale},
            ]
            if (!this.enclosure_synchronized) { general_status.pop(6)}
            return general_status
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
        buildExpandedTelescopeStatus() {
            let status = []
            status.push({name: ""})
        },
        buildTargetPageStatus() {
            let status = []
            status.push({"name": "Ra", "val": this.ra, is_stale: this.device_status_is_stale})
            status.push({"name": "Dec", "val": this.dec, is_stale: this.device_status_is_stale})
            status.push({"name": "Azimuth", "val": this.azimuth, is_stale: this.device_status_is_stale})
            status.push({"name": "Altitude", "val": this.altitude, is_stale: this.device_status_is_stale})
            status.push({"name": "Airmass", "val": this.airmass, is_stale: this.device_status_is_stale})
            status.push({"name": "Activity", "val": this.mount_activity, is_stale: this.device_status_is_stale})
            status.push({"name": "Enclosure", "val": this.enclosure_status}) 
            return status
        },
        buildEnclosureTabStatus() {
            let status = []
            if (this.enclosure_mode != '-'){ status.push({"name": "Mode", "val": this.enclosure_mode, is_stale: this.wx_is_stale }) }
            if (this.enclosure_status != '-'){ status.push({"name": "Enclosure", "val": this.enclosure_status, is_stale: this.wx_is_stale }) }
            if (this.open_ok.val != '-'){ status.push({"name": "Open ok", ...this.open_ok, is_stale: this.wx_is_stale }) }
            return status
        },
        buildTelescopeTabStatus1() {
            let status = []
            if (this.ra != '-') { status.push({"name": "Ra", "val": this.ra, is_stale: this.device_status_is_stale})}
            if (this.dec != '-') { status.push({"name": "Dec", "val": this.dec, is_stale: this.device_status_is_stale})}
            if (this.azimuth != '-') { status.push({"name": "Azimuth", "val": this.azimuth, is_stale: this.device_status_is_stale})}
            if (this.altitude != '-') { status.push({"name": "Altitude", "val": this.altitude, is_stale: this.device_status_is_stale})}
            if (this.refraction != '-') { status.push({"name": "Refr.", "val": this.refraction, is_stale: this.device_status_is_stale})}
            return status
        },
        buildTelescopeTabStatus1Shorter() {
            let status = []
            if (this.ra != '-') { status.push({"name": "Ra", "val": this.ra, is_stale: this.device_status_is_stale})}
            if (this.dec != '-') { status.push({"name": "Dec", "val": this.dec, is_stale: this.device_status_is_stale})}
            if (this.azimuth != '-') { status.push({"name": "Az", "val": this.azimuth, is_stale: this.device_status_is_stale})}
            if (this.altitude != '-') { status.push({"name": "Alt", "val": this.altitude, is_stale: this.device_status_is_stale})}
            if (this.refraction != '-') { status.push({"name": "Refr.", "val": this.refraction, is_stale: this.device_status_is_stale})}
            return status
        },
        buildTelescopeTabStatus2() {
            let status = []
            if (this.ha != '-') { status.push({"name": "HA", "val": this.hour_angle, is_stale: this.device_status_is_stale})}
            if (this.zenith_distance != '-') { status.push({"name": "Zenith", "val": this.zenith_distance, is_stale: this.device_status_is_stale})}
            if (this.airmass != '-') { status.push({"name": "Airmass", "val": this.airmass, is_stale: this.device_status_is_stale})}
            status.push({"name": "Activity", "val": this.mount_activity, is_stale: this.device_status_is_stale})
            return status
        },
        buildCameraTabStatus() {
            let status = []
            if (this.camera_status != '-') { status.push({"name": "Camera status", "val": this.camera_status, is_stale: this.device_status_is_stale})}
            if (this.filter_name != '-') { status.push({"name": "Filter", "val": this.filter_name, is_stale: this.device_status_is_stale})}
            if (this.filter_wheel_moving != '-') { status.push({"name": "Filter Wheel", "val": this.filter_wheel_moving, is_stale: this.device_status_is_stale})}
            return status
        },
        buildFocuserTabStatus() {
            let status = []
            if (this.focus_position != '-') { status.push({"name": "Focus", "val": this.focus_position, is_stale: this.device_status_is_stale})}
            if (this.focus_comp != '-') { status.push({"name": "Comp.", "val": this.focus_comp, is_stale: this.device_status_is_stale})}
            if (this.focus_filter_offset != '-') { status.push({"name": "Offset", "val": this.focus_filter_offset, is_stale: this.device_status_is_stale})}
            if (this.focus_temperature != '-') { status.push({"name": "Temp", "val": this.focus_temperature, is_stale: this.device_status_is_stale})}
            if (this.focus_moving != '-') { status.push({"name": "Status", "val": this.focus_moving, is_stale: this.device_status_is_stale})}
            return status
        },
        buildRotatorTabStatus() {
            let status = []
            if (this.rotator_moving != '-') { status.push({"name": "Rotator", "val": this.rotator_moving, is_stale: this.device_status_is_stale})}
            if (this.rotator_position != '-') { status.push({"name": "Position", "val": this.rotator_position, is_stale: this.device_status_is_stale })}
            return status
        },
        buildScreenTabStatus() {
            let status = []
            if (this.screen_status != '-') { status.push({"name": "Status", "val": this.screen_status, is_stale: this.device_status_is_stale})}
            if (this.screen_brightness != '-') { status.push({"name": "Brightness", "val": this.screen_bright_setting, is_stale: this.device_status_is_stale})}
            return status
        },
        buildSequencerTabStatus() {
            let status = []
            if (this.active_script != '-') { status.push({"name": "Script", "val": this.active_script, is_stale: this.device_status_is_stale})}
            if (this.sequencer_busy != '-') { status.push({"name": "Busy", "val": this.sequencer_busy, is_stale: this.device_status_is_stale})}
            return status
        },

        // These are still status display items
        latest_status_age() {
            return status_age_display(this.status_age, this.display_colors)
        },
        device_status_age() {
            return status_age_display(this.device_status_age, this.display_colors)
        },
        weather_status_age() {
            return status_age_display(this.wx_status_age, this.display_colors)
        },

        // These are booleans denoting whether the status age is older than 5 minutes
        wx_is_stale() {
            return this.wx_status_age > 300
        },
        device_status_is_stale() {
            return this.device_status_age > 300
        },

        ...mapState('sitestatus', {
          "deviceStatus": status
        }),
        ...mapGetters('sitestatus', [

          'status_age',
          'wx_status_age',
          'device_status_age',

          'enclosure_state', 
          'enclosure_status',
          'enclosure_mode',
          'dome_azimuth',
          'dome_slewing',
          'enclosure_synchronized',
          
          'weather_state',
          'weather_ok',
          'open_ok',
          'sky_temp',
          'air_temp',
          'humidity',
          'dewpoint',
          'wind',
          'surface',
          'ambient',
          'meas_sky_mpsas',
          'calc_sky_mpsas',
          'wx_hold',
          'hold_duration',

          'mount_state',
          'mount_is_slewing',
          'mount_is_parked',
          'mount_is_tracking',
          'mount_activity',

          'telescope_state',
          'ra',
          'dec',
          'azimuth',
          'altitude',
          'sidereal_time',
          'zenith_distance',
          'airmass',
          'refraction',
          'hour_angle',

          'camera_state',
          'camera_status',

          'filter_wheel_state',
          'filter_wheel_moving',
          'filter_name',

          'focuser_state',
          'focus_position',
          'focus_comp',
          'focus_filter_offset',
          'focus_temperature',
          'focus_moving',

          'rotator_state',
          'rotator_position',
          'rotator_moving',

          'screen_state',
          'screen_status',
          'screen_bright_setting',

          'sequencer_state',
          'active_script',
          'sequencer_busy',

        ]),
    },

}
