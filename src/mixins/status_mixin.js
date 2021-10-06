
import { mapGetters, mapState } from 'vuex'
import { statusAgeDisplay } from '../store/modules/sitestatus/getters/status_utils'
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
        // online is defined by status age under 5 minutes
        isOnline() { return this.status_age < 300 },

        buildEmptyStatus() {
            let status = []
            status.push({
                "name": "status",
                "val": "not configured"
            })
            return status
        },

        // These are still status display items
        latest_status_age() {
            return statusAgeDisplay(this.status_age)
        },
        device_status_age() {
            return statusAgeDisplay(this.device_status_age, this.display_colors)
        },
        weather_status_age() {
            return statusAgeDisplay(this.wx_status_age, this.display_colors)
        },

        device_status_is_stale() {
            return this.device_status_age > 300
        },

        ...mapGetters('sitestatus', [
          'status_age',
          'wx_status_age',
          'device_status_age',
        ]),
    },

}
