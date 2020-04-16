/**
 * This mixin provides the computed objects needed to send commands. 
 * 
 * TODO: refactor into smaller modules.
 */

import { mapGetters } from 'vuex'
import { getInstance } from '../auth/index' // get user object: getInstance().user


export const commands_mixin = {

    data() {
        return {

            // Camera Fields
            camera_image_type_options: [
                'light', 
                'quick',
                'toss', 
                'bias', 
                'dark', 
                'screen flat', 
                'sky flat', 
                'lamp flat', 
                'arc flat',
                'NeAr flat', 
                'ThAr flat', 
                'solar flat',
                'experimental',
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
         * @param {object} req_params Required parameters for the command. See 
         *  command_syntax_doc.js for details.
         * @param {object} opt_params Optional parameters for the command. See 
         *  command_syntax_doc.js for details.
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
                case 'sequencer': device = 'sequencer'; break;
            }

            let the_base_command = {
                name: name, // used for naming the button
                url: `/${this.active_site}/${this.active_mount}/command/`,
                site: this.active_site,
                mount: this.active_mount,
                http_method: 'POST',
                form: {
                    device: device_type,
                    instance: device,
                    timestamp: parseInt(Date.now() / 1000),
                    action: action,
                    required_params: req_params || {},
                    optional_params: opt_params || {},
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

    },

    computed: {

        // Getters from the observatory_configuration vuex module.
        // Available devices and currently active devices are stored here.
        ...mapGetters('observatory_configuration', [
            'available_sites',
            'available_enclosures',
            'available_mounts',
            'available_telescopes',
            'available_rotators',
            'available_focusers',
            'available_filter_wheels',
            'available_cameras',
            'available_screens',

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
            'subframeIsActive',
            'subframeDefinedWithFile',
            'subframe_x0',
            'subframe_y0',
            'subframe_x1',
            'subframe_y1',

            'camera_areas_selection',
            'camera_hint',
            'camera_exposure',
            'camera_count',
            'camera_bin',
            'camera_dither',
            'camera_extract',
            'camera_image_type',

            'filter_wheel_options_selection',

            'focuser_relative',
            'focuser_absolute',

            'rotator_relative',
            'rotator_absolute',

            'screen_brightness',
        ]),

        // Get username if user is logged in
        username() {
            if (getInstance().user) {
                return getInstance().user.name
            }
            else {
                return 'anonymous'
            }
        },

        // The `selected_${device}` computed properties are used for two way
        // binding between vuex (observatory_configuration module) and the device 
        // selection inputs. 
        active_site: {
            get() { return this.$store.getters['observatory_configuration/site'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveSite', value) }
        },
        active_enclosure: {
            get() { return this.$store.getters['observatory_configuration/enclosure'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveEnclosure', value) }
        },
        active_mount: {
            get() { return this.$store.getters['observatory_configuration/mount'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveMount', value) }
        },
        active_telescope: {
            get() { return this.$store.getters['observatory_configuration/telescope'] },
            //set(value) { this.$store.commit('observatory_configuration/setActiveTelescope', value) }
            set(value) { this.$store.dispatch('observatory_configuration/setActiveTelescope', value) }
        },
        active_rotator: {
            get() { return this.$store.getters['observatory_configuration/rotator'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveRotator', value) }
        },
        active_focuser: {
            get() { return this.$store.getters['observatory_configuration/focuser'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveFocuser', value) }
        },
        active_filter_wheel: {
            get() { return this.$store.getters['observatory_configuration/filter_wheel'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveFilterWheel', value) }
        },
        active_camera: {
            get() { return this.$store.getters['observatory_configuration/camera'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveCamera', value) }
        },
        active_screen: {
            get() { return this.$store.getters['observatory_configuration/screen'] },
            set(value) { this.$store.commit('observatory_configuration/setActiveScreen', value) }
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
                size: this.camera_areas_selection,
                dither: this.camera_dither,
                extract: this.camera_extract,
                size: this.camera_areas_selection,
                username: this.username, // from auth0
            }

            // Avoid empty strings (thanks, dynamodb)
            if (this.camera_hint != '') {
                opt_params["hint"] = this.camera_hint
            }

            // If active, add subframe parameters.
            // Also ignore if active but subframe parameters specify the whole image [(0,0),(1,1)] (the sum should == 2). 
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
        enclosure_open_command () {
            return this.base_command( 'enclosure', 'open', 'Request Roof to Open')
        },
        enclosure_close_command () {
            return this.base_command( 'enclosure', 'close', 'Request Roof to Close')
        },
        mount_slew_command () {
            return this.base_command( 'mount', 'go', 'slew to coordinates',
                { ra: this.mount_ra.toString(), dec: this.mount_dec.toString(), },
                { object: this.mount_object }
            )
        },
        mount_slew_chart_command () {
            return this.base_command( 'mount', 'go', 'slew to chart position',
                { ra: this.chart_selectedRa.toString(), dec: this.chart_selectedDec.toString(), },
                { object: this.mount_object }
            )
        },
        mount_stop_command () {
            return this.base_command( 'mount', 'stop', 'stop movement' )
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
            return this.base_command( 'focuser', 'move_relative', 'focus',
                { position: this.focuser_relative.toString(), }
            )
        },
        focus_absolute_command () {
            return this.base_command( 'focuser', 'move_absolute', 'focus',
                { position:(this.focuser_absolute).toString() } 
            )
        },
        focus_auto_command () {
            return this.base_command( 'focuser', 'auto', 'autofocus' )
        },
        focus_home_command () {
                return this.base_command( 'focuser', 'home', 'home' )
        },
        focus_fine_command () {
            return this.base_command('focuser', 'fine_focus', 'fine focus' )
        },
        focus_vcurve_command () {
            return this.base_command('focuser', 'v_curve', 'v-curve focus' )
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
            return this.base_command( 'rotator', 'move_relative', 'rotate',
                { position: this.rotator_relative.toString() } 
            )
        },
        rotate_absolute_command () {
            return this.base_command( 'rotator', 'move_absolute', 'rotate',
                { position: (((parseFloat(this.rotator_absolute) % 360) + 360) % 360).toString() } // avoid negative results (since -5 % 360 = -5)
            )
        },
        screen_on_command () {
            return this.base_command( 'screen', 'turn_on', 'on',
                { brightness: this.screen_brightness.toString() }
            )
        },
        screen_off_command() {
            return this.base_command( 'screen', 'turn_off', 'off' )
        },


    }
}