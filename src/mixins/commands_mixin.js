/**
 * This mixin provides the computed objects needed to send commands. 
 */

import { mapGetters } from 'vuex'

export const commands_mixin = {

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
                case 'mount':
                device = this.active_mount;
                break;
                case 'camera': 
                device = this.active_camera;
                break;
                case 'filter_wheel':
                device = this.active_filter_wheel;
                break;
                case 'rotator':
                device = this.active_rotator;
                break;
                case 'focuser':
                device = this.active_focuser;
                break;
            }

            let the_base_command = {
                name: name, // used for naming the button
                url: `/${this.active_site}/${this.active_mount}/command/`,
                site: this.active_site,
                mount: this.active_mount,
                http_method: 'POST',
                form: {
                    device: device,
                    type: device_type,
                    timestamp: parseInt(Date.now() / 1000),
                    action: action,
                    required_params: req_params || {},
                    optional_params: opt_params || {},
                }
            }

            return the_base_command

        },
    },

    computed: {

        // Getters from the observatory vuex module. 
        // Observatory status is saved here.
        ...mapGetters('observatory', {
            all_mount_state: 'mount',
            all_camera_state: 'camera',
            all_filter_wheel_state: 'filter_wheel',
            all_focuser_state: 'focuser',
            all_rotator_state: 'rotator',
        }),

        // Getters from the device_selection vuex module.
        // Available devices and currently active devices are stored here.
        ...mapGetters('device_selection', [
            'available_sites',
            'available_enclosures',
            'available_mounts',
            'available_telescopes',
            'available_rotators',
            'available_focusers',
            'available_filter_wheels',
            'available_cameras',

            // These getters retrieve options in the commands 
            // (eg. what filters are available in the filter wheel)
            'camera_areas',
            'filter_wheel_options',
            'camera_can_bin',

            'global_config',
        ]),

        // Getters for click coordinates on the sky chart.
        ...mapGetters('skyChart', {
            chart_selectedRa: 'selectedRa',
            chart_selectedDec: 'selectedDec',
        }),

        /**
         * The `..._selection` computed properties are used for two way
         * binding between vuex stored state and selections in the command
         * fields.
         */
        // v-model for the filter currently selected
        filter_wheel_options_selection: {
            get() { return this.$store.getters['device_selection/filter_wheel_options_selection'] },
            set(val) { this.$store.commit('device_selection/setFilterSelection', val) }
        },
        // v-model for the camera area selection
        camera_areas_selection: {
            get() { return this.$store.getters['device_selection/camera_areas_selection'] },
            set(val) {this.$store.commit('device_selection/setCameraAreasSelection', val)}
        },


        // The `selected_${device}` computed properties are used for two way
        // binding between vuex (device_selection module) and the device 
        // selection inputs. 
        active_site: {
            get() { return this.$store.getters['device_selection/site'] },
            set(value) { this.$store.commit('device_selection/setActiveSite', value) }
        },
        active_enclosure: {
            get() { return this.$store.getters['device_selection/enclosure'] },
            set(value) { this.$store.commit('device_selection/setActiveEnclosure', value) }
        },
        active_mount: {
            get() { return this.$store.getters['device_selection/mount'] },
            set(value) { this.$store.commit('device_selection/setActiveMount', value) }
        },
        active_telescope: {
            get() { return this.$store.getters['device_selection/telescope'] },
            set(value) { this.$store.commit('device_selection/setActiveTelescope', value) }
        },
        active_rotator: {
            get() { return this.$store.getters['device_selection/rotator'] },
            set(value) { this.$store.commit('device_selection/setActiveRotator', value) }
        },
        active_focuser: {
            get() { return this.$store.getters['device_selection/focuser'] },
            set(value) { this.$store.commit('device_selection/setActiveFocuser', value) }
        },
        active_filter_wheel: {
            get() { return this.$store.getters['device_selection/filter_wheel'] },
            set(value) { this.$store.commit('device_selection/setActiveFilterWheel', value) }
        },
        active_camera: {
            get() { return this.$store.getters['device_selection/camera'] },
            set(value) { this.$store.commit('device_selection/setActiveCamera', value) }
        },

        // Since the vuex observatory getters return state for all devices of
        // a type together, we need to request the specific device from that 
        // collective state. These properties do that, and handle an undefined 
        // key by returning an empty list.
        mount_state: function() {
            try {
                return this.all_mount_state[this.active_mount]
            } catch { return [] }
        },
        camera_state: function() {
            try {
                return this.all_camera_state[this.active_camera]
            } catch(error) { return [] }
        },
        filter_wheel_state: function() {
            try {
                return this.all_filter_wheel_state[this.active_filter_wheel]
            } catch(error) { return [] }
        },
        focuser_state: function() {
            try {
                return this.all_focuser_state[this.active_focuser]
            } catch(error) { return [] }
        },
        rotator_state: function() {
            try {
                return this.all_rotator_state[this.active_rotator]
            } catch(error) { return [] }
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
            return this.base_command( 'camera', 'expose', 'expose',
                { 
                    time: this.cam_exposure,
                    image_type: this.cam_image_type,
                },
                {
                    repeat: this.cam_repeat,
                    bin: this.cam_bin,
                    filter: this.filter_wheel_options_selection,
                    size: this.camera_areas_selection,
                    dither: this.cam_dither,
                    scripts: this.cam_scripts,
                }
            )
        },
        camera_cancel_command () {
            return this.base_command( 'camera', 'stop', 'cancel' )
        },
        mount_slew_command () {
            return this.base_command( 'mount', 'go', 'slew to coordinates',
                { ra: this.slew_ra, dec: this.slew_dec, }
            )
        },
        mount_slew_chart_command () {
            return this.base_command( 'mount', 'go', 'slew to chart position',
                { ra: this.chart_selectedRa, dec: this.chart_selectedDec, }
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
                { position: this.focus_relative, }
            )
        },
        focus_absolute_command () {
            return this.base_command( 'focuser', 'move_absolute', 'focus',
                { position: this.focus_absolute, }
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
                { position: this.rotate_relative } 
            )
        },
        rotate_absolute_command () {
            return this.base_command( 'rotator', 'move_absolute', 'rotate',
                { position: this.rotate_absolute } 
            )
        },
        }
}