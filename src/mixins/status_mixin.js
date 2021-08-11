
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
            //status.push({"name": "Status Age", ...this.status_age_display})
            if (this.weather_ok.val != '-'){ status.push({"name": "Weather ok", ...this.weather_ok}) }
            if (this.open_ok.val != '-'){ status.push({"name": "Open Ok", ...this.open_ok}) }

            status.push({"name": "spacer", "val": "spacer"}) 

            if (this.enclosure_mode != '-'){ status.push({"name": "Enc. Mode", "val": this.enclosure_mode}) }
            if (this.sky_temp != '-'){ status.push({"name": "Sky Temp", "val": this.sky_temp}) }
            if (this.air_temp != '-'){ status.push({"name": "Air Temp", "val": this.air_temp}) }
            if (this.humidity != '-'){ status.push({"name": "Humidity", "val": this.humidity}) }
            if (this.dewpoint != '-'){ status.push({"name": "Dewpoint", "val": this.dewpoint}) }
            if (this.wind != '-'){ status.push({"name": "Wind", "val": this.wind}) }
            if (this.surface != '-'){ status.push({"name": "Surface", "val": this.surface}) }
            if (this.ambient != '-'){ status.push({"name": "Ambient", "val": this.ambient}) }
            if (this.meas_sky_mpsas != '-'){ status.push({"name": "Meas. mpsas", "val": this.meas_sky_mpsas}) }
            if (this.calc_sky_mpsas != '-'){ status.push({"name": "Calc. mpsas", "val": this.calc_sky_mpsas}) }
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
        buildTelescopeTabStatus1Shorter() {
            let status = []
            if (this.ra != '-') { status.push({"name": "Ra", "val": this.ra})}
            if (this.dec != '-') { status.push({"name": "Dec", "val": this.dec})}
            if (this.azimuth != '-') { status.push({"name": "Az", "val": this.azimuth})}
            if (this.altitude != '-') { status.push({"name": "Alt", "val": this.altitude})}
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

        ...mapState('sitestatus', {
          "deviceStatus": status
        }),
        ...mapGetters('sitestatus', [

          'status_age',

          'enclosure_state', 
          'enclosure_status',
          'enclosure_mode',
          
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
