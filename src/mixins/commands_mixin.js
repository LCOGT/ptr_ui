/**
 * This mixin provides the computed objects needed to send commands. 
 * 
 * TODO: refactor into smaller modules.
 */

import { mapGetters } from 'vuex'
import { getInstance } from '../auth/index' // get user object: getInstance().user
import axios from 'axios'

// Change empty strings to 'empty'. 
function emptyString(s) {
    return s == '' ? 'empty' : s;
}

export const commands_mixin = {

    data() {
        return {

            // Camera Fields
            camera_image_type_options: [
                'light', 
                'experimental',
                'bias', 
                'dark', 
                'autofocus probe',
                'screen flat', 
                'sky flat', 
                'lamp flat', 
                'arc flat',
                'NeAr flat', 
                'ThAr flat', 
                'solar flat',
                'simulation',
            ],

            telescope_coordinate_frame_options: [
                'ICRS',
                'J2000',
                'JNOW', 
                'FK5',
                'B1950',
                'B1900',
                'Ecliptic',
                'Galactic',
            ],

        }
    },

    methods: {

        /**
         * This method is used in the 'computed' properties that are fed to
         * the CommandButton components. Whenever a command button is clicked, 
         * this method takes values from input fields and assembles everything 
         * needed by the commandbutton, including a well formed JSON command 
         * and where to send it. 
         * @param {string} device_type Used to create the JSON command.
         * @param {string} action The thing that the device should do.
         * @param {string} name The text on the button that sends the command.
         * @param {object} req_params Required parameters for the command.
         * @param {object} opt_params Optional parameters for the command. 
         */
        base_command(device_type, action, name, req_params, opt_params) {

            // Get the active device of the requested device type. 
            let device
            switch (device_type) {
                case 'enclosure': device = this.active_enclosure; break;
                case 'mount': device = this.active_mount; break;
                case 'camera': device = this.active_camera; break;
                case 'filter_wheel': device = this.active_filter_wheel; break;
                case 'rotator': device = this.active_rotator; break;
                case 'focuser': device = this.active_focuser; break;
                case 'screen': device = this.active_screen; break;
                case 'sequencer': device = this.active_sequencer; break;
            }

            let the_base_command = {
                name: name, // used for naming the button
                site: this.active_site,
                mount: this.active_mount,
                form: {
                    device: device_type,
                    instance: device,
                    user_name: this.username,
                    user_id: this.user_id,
                    timestamp: parseInt(Date.now() / 1000),
                    action: action,
                    required_params: req_params || {},
                    optional_params: {
                        instrument_selector_position: this.selector_position,
                        telescope_selection: this.telescope_selection,
                        ...(opt_params || {}),
                    }
                }
            }

            return the_base_command

        },

        script_run_command() {
            this.$store.dispatch('script_run_command')
        },
        script_stop_command() {
            this.$store.dispatch('script_stop_command')
        },
        focus_relative_command_args(microns) {
            return this.base_command( 'focuser', 'move_relative', 'focus',
                { position: microns.toString(), }
            )
        },
        focus_auto_command(num_focus_pts) {
            return this.base_command(
                'focuser',
                'autofocus',
                '',
                {
                    num_focus_pts: num_focus_pts,
                },
                {}
            )
        },
        mount_slew_clickposition_command(x, y, filename) {
            return this.base_command(
                'mount',
                'center_on_pixels',
                '',
                {
                    image_x: x,
                    image_y: y,
                    base_filename: filename
                },
                {}
            )
        },
        // Alternative to the command_button component
        async postCommand(formCreatorFunction, args) {

            const options = await this.getAuthHeader()
            let form = formCreatorFunction(...args).form
            const url = `${this.$store.state.dev.jobs_api}/newjob?site=${this.sitecode}`

            form.timestamp = parseInt(Date.now() / 1000)
            form.site = this.sitecode
            form.mount = this.active_mount

            console.log(form)
            axios.post(url,form, options).then(response => {
                console.log(response.data)
                this.$emit('jobPost', response.data)
            }).catch(e => {
                this.handleNotAuthorizedResponse(e)
            })
        },
        async getAuthHeader() {
            let token, configWithAuth;
            try {
                token = await this.$auth.getTokenSilently(); 
            } catch(err) {
                console.error(err)
                console.warn('Did not acquire the needed token. Stopping request.')
                
                // small popup notification
                this.$buefy.toast.open({
                    duration: 5000,
                    message: "Oops! You need to be logged in to do that.",
                    position: 'is-bottom',
                    type: 'is-danger' ,
                })
                //return {}
            }

            return {
                'headers': {
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${token}`
                }
            }
        },

        handleNotAuthorizedResponse(error) {
        if (error.response) {
            // Request made and server responded
            console.log("error message", error.response.data);
            console.log("error status", error.response.status);
            console.log("error headers", error.response.headers);
            // small popup notification describing error
            this.$buefy.toast.open({
            duration: 5000,
            message: `${error.response.status} error: ${error.response.data}`,
            position: 'is-bottom',
            type: 'is-danger' ,
            })
        } else if (error.request) {
            // The request was made but no response was received
            console.warn("The request was made but no response was received.")
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.warn("Something happened in setting up the request that triggered an error.")
            console.log('Error', error.message);
        }
        },

    },

    computed: {

        // Getters from the site_config vuex module.
        // Available devices and currently active devices are stored here.
        ...mapGetters('site_config', [
            'available_devices',
            'available_sites',

            // Device specific properties
            'focuser_reference',
            'focuser_min',
            'focuser_max',
            'focuser_step_size',

            'rotator_min',
            'rotator_max',
            'rotator_step_size',

            // These getters retrieve options in the commands 
            // (eg. what filters are available in the filter wheel)
            'camera_areas',
            'filter_wheel_options',
            'camera_bin_options',
            'camera_can_bin',

            'global_config',
        ]),

        // Getters for click coordinates on the sky chart.
        ...mapGetters('skyChart', {
            chart_selectedRa: 'selectedRa',
            chart_selectedDec: 'selectedDec',
        }),

        // User-supplied command parameters
        ...mapGetters('command_params', [
            'telescope_selection', 
            'telescope_coordinate_frame', 

            'subframeIsActive',
            'subframeDefinedWithFile',
            //'subframe_x0',
            //'subframe_y0',
            //'subframe_x1',
            //'subframe_y1',

            'camera_areas_selection',
            'camera_note',
            'camera_exposure',
            'camera_count',
            'camera_bin',
            'camera_dither',
            'camera_extract',
            'camera_image_type',

            'camera_cooling',
            'camera_temperature',
            'camera_de_ice_cooling',

            'filter_wheel_options_selection',
            
            'selector_position',

            'focuser_relative',
            'focuser_absolute',

            'rotator_relative',
            'rotator_absolute',

            'screen_brightness',
        ]),

        subframe_x0() { return this.$store.getters['drawshapes/subframeFromShape'].x0 },
        subframe_y0() { return this.$store.getters['drawshapes/subframeFromShape'].y0 },
        subframe_x1() { return this.$store.getters['drawshapes/subframeFromShape'].x1 },
        subframe_y1() { return this.$store.getters['drawshapes/subframeFromShape'].y1 },

        // Get username if user is logged in
        username() {
            if (getInstance().user) {
                return getInstance().user.name
            }
            else {
                return 'anonymous'
            }
        },
        user_id() {
            if (getInstance().user) {
                return getInstance().user.sub
            }
            else {
                return 'anonymous'
            }
        },

        // The `selected_${device}` computed properties are used for two way
        // binding between vuex (site_config module) and the device 
        // selection inputs. 
        active_site: {
            get() { return this.$store.getters['site_config/site'] },
            set(value) { this.$store.commit('site_config/setActiveSite', value) }
        },
        active_enclosure: {
            get() { return this.$store.getters['site_config/enclosure'] },
            set(value) { this.$store.commit('site_config/setActiveEnclosure', value) }
        },
        active_mount: {
            get() { return this.$store.getters['site_config/mount'] },
            set(value) { this.$store.commit('site_config/setActiveMount', value) }
        },
        active_telescope: {
            get() { return this.$store.getters['site_config/telescope'] },
            set(value) { this.$store.commit('site_config/setActiveTelescope', value) }
            //set(value) { this.$store.dispatch('site_config/setActiveTelescope', value) }
        },
        active_rotator: {
            get() { return this.$store.getters['site_config/rotator'] },
            set(value) { this.$store.commit('site_config/setActiveRotator', value) }
        },
        active_focuser: {
            get() { return this.$store.getters['site_config/focuser'] },
            set(value) { this.$store.commit('site_config/setActiveFocuser', value) }
        },
        active_filter_wheel: {
            get() { return this.$store.getters['site_config/filter_wheel'] },
            set(value) { this.$store.commit('site_config/setActiveFilterWheel', value) }
        },
        active_camera: {
            get() { return this.$store.getters['site_config/camera'] },
            set(value) { this.$store.commit('site_config/setActiveCamera', value) }
        },
        active_screen: {
            get() { return this.$store.getters['site_config/screen'] },
            set(value) { this.$store.commit('site_config/setActiveScreen', value) }
        },
        active_weather: {
            get() { return this.$store.getters['site_config/weather'] },
            set(value) { this.$store.commit('site_config/setActiveWeather', value) }
        },
        active_sequencer: {
            get() { return this.$store.getters['site_config/sequencer'] },
            set(value) { this.$store.commit('site_config/setActiveSequencer', value) }
        },
        active_selector: {
            get() { return "selector_not_from_config"},
            set(value) { return }
        },


        command_url: function () {
            return `/${this.active_site}/${this.active_mount}/command/`
        },

        /**
         * The following computed properties with name 
         * `${device_type}_${action}_command` are computed objects that are
         * consumed by CommandButton components. Using the 'base_command' 
         * method, they provide the required information like the JSON command
         * and url to send it.
         */
        camera_expose_command () {
            let req_params = {
                time: this.camera_exposure,
                image_type: this.camera_image_type,
            }
            let opt_params = {
                count: this.camera_count.toString(),
                bin: this.camera_bin,
                filter: this.filter_wheel_options_selection,
                area: this.camera_areas_selection,
                dither: this.camera_dither,
                extract: this.camera_extract,
                username: this.username, // from auth0
            }

            // Avoid empty strings (thanks, dynamodb)
            if (this.camear_note != '') {
                opt_params["hint"] = this.camera_note
            }

            // If active, add subframe parameters.
            // Also ignore if active but subframe params specify the whole image [(0,0),(1,1)] (the sum should == 2). 
            if (this.subframeIsActive && !(this.subframe_x0 + this.subframe_y0 
                    + this.subframe_x1 + this.subframe_y1 == 2)) {
                opt_params["subframe"] = {
                    "definedOnThisFile": this.subframeDefinedWithFile,
                    "x0": this.subframe_x0.toString(),
                    "y0": this.subframe_y0.toString(),
                    "x1": this.subframe_x1.toString(),
                    "y1": this.subframe_y1.toString(),
                }
            }
            return this.base_command( 'camera', 'expose', 'expose', 
                                       req_params, opt_params)
        },
        camera_cancel_command () {
            return this.base_command( 'camera', 'stop', 'cancel' )
        },
        camera_darkslide_open_command () {
            return this.base_command( 'camera', 'darkslide_open', 'open' )
        },
        camera_darkslide_close_command () {
            return this.base_command( 'camera', 'darkslide_close', 'close' )
        },
        enclosure_open_command () {
            return this.base_command( 'enclosure', 'open', 'Request Roof to Open')
        },
        enclosure_close_command () {
            return this.base_command( 'enclosure', 'close', 'Request Roof to Close')
        },
        enclosure_manual_command () {
            return this.base_command( 'enclosure', 'setManual', 'Set enclosure mode: manual',
                {},
                { username: this.username })
        },
        enclosure_auto_command () {
            return this.base_command( 'enclosure', 'setAuto', 'Set enclosure mode: auto',
                {},
                { username: this.username })
        },
        mount_slew_radec_command () {
            let ra = emptyString(this.mount_ra.toString())
            let dec = emptyString(this.mount_dec.toString())
            let obj = emptyString(this.mount_object.toString())
            return this.base_command( 'mount', 'go', 'slew to RA/Dec',
                { ra: ra, dec: dec, frame: this.telescope_coordinate_frame },
                { object: obj }
            )
        },
        mount_slew_azalt_command () {
            let az = emptyString(this.mount_ra.toString())
            let alt= emptyString(this.mount_dec.toString())
            let obj = emptyString(this.mount_object.toString())
            return this.base_command( 'mount', 'go', 'slew to az/alt',
                { az: az, alt: alt, frame: this.telescope_coordinate_frame },
                { object: obj }
            )
        },
        mount_slew_chart_command () {
            let ra = emptyString(this.chart_selectedRa.toString())
            let dec = emptyString(this.chart_selectedDec.toString())
            let obj = emptyString(this.mount_object.toString())
            return this.base_command( 'mount', 'go', 'slew to chart position',
                { ra: ra, dec: dec, },
                { object: obj, }
            )
        },
        mount_slew_near_tycho() {
            return this.base_command( 'mount', 'slew_to_near_tycho', 'nearby Tycho star' )
        },
        mount_stop_command () {
            return this.base_command( 'mount', 'stop', 'stop movement' )
        },
        mount_tracking_on_command() {
            return this.base_command( 'mount', 'set_tracking_on', 'Start Tracking' )
        },
        mount_tracking_off_command() {
            return this.base_command( 'mount', 'set_tracking_off', 'Stop Tracking' )
        },
        mount_park_command () {
            return this.base_command( 'mount', 'park', 'park' )
        },
        mount_home_command () {
            return this.base_command( 'mount', 'home', 'home' )
        },
        mount_screenflat_command () {
            return this.base_command( 'mount', 'screen_flat_position', 'screen flat position')
        },
        mount_skyflat_command () {
            return this.base_command( 'mount', 'sky_flat_position', 'sky flat position')
        },
        // TODO: replace raSidDec0 with a sensible name and provide coordinates from frontend.
        mount_raSidDec0_command () {
            return this.base_command( 'mount', 'ra=sid, dec=0', 'ra=sid, dec=0')
        },

        focus_relative_command () {
            let focus_relative = emptyString(this.focuser_relative.toString())
            return this.base_command( 'focuser', 'move_relative', 'focus',
                { position: focus_relative, }
            )
        },
        focus_absolute_command () {
            let focus_abs = emptyString(this.focuser_absolute.toString())
            return this.base_command( 'focuser', 'move_absolute', 'focus',
                { position: focus_abs, } 
            )
        },
        focus_home_command () {
                return this.base_command( 'focuser', 'home', 'home' )
        },
        focus_fine_command () {
            return this.base_command('focuser', 'fine_focus', 'fine focus' )
        },
        focus_vcurve_command () {
            return this.base_command('focuser', 'v_curve', 'Find Focus (v-curve)' )
        },
        focus_gotoreference_command () {
            return this.base_command('focuser', 'go_to_reference', 'go to reference' )
        },
        focus_gotocompensated_command () {
            return this.base_command('focuser', 'go_to_compensated', 'go to compensated' )
        },
        focus_saveasreference_command () {
            return this.base_command('focuser', 'save_as_reference', 'save as reference' )
        },
        focus_stop_command () {
            return this.base_command( 'focuser', 'stop', 'stop' )
        },

        filter_wheel_command () {
            return this.base_command( 'filter_wheel', 'set_name', 'apply',
                { filter_name: this.filter_wheel_options_selection},
            )
        },
        filter_wheel_home_command () {
            return this.base_command( 'filter_wheel', 'home', 'home' )
        },
        rotate_home_command () {
            return this.base_command( 'rotator', 'home', 'home' )
        },
        rotate_relative_command () {
            let rotate_relative = emptyString(this.rotator_relative.toString())
            return this.base_command( 'rotator', 'move_relative', 'rotate',
                { position: rotate_relative } 
            )
        },
        rotate_absolute_command () {
            let rotator_absolute = emptyString(this.rotator_absolute)
            return this.base_command( 'rotator', 'move_absolute', 'rotate',
                { position: (((parseFloat(rotator_absolute) % 360) + 360) % 360).toString() } // avoid negative results (since -5 % 360 = -5)
            )
        },
        screen_on_command () {
            let screen_brightness = emptyString(this.screen_brightness.toString())
            return this.base_command( 'screen', 'turn_on', 'on',
                { brightness:screen_brightness }
            )
        },
        screen_off_command() {
            return this.base_command( 'screen', 'turn_off', 'off' )
        },


    }
}