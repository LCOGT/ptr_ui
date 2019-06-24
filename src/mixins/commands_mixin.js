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
            case 'filter':
            device = this.active_filter;
            break;
            case 'rotator':
            device = this.active_rotator;
            break;
            case 'focuser':
            device = this.active_focuser;
            break;
        }

        return {
            name: name,
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

        },
    },

    computed: {

        // Getters from the observatory vuex module. 
        // Observatory status is saved here.
        ...mapGetters('observatory', {
            all_mount_state: 'mount',
            all_camera_state: 'camera',
            all_filter_state: 'filter',
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
            'available_filters',
            'available_cameras',
            'global_config',
        ]),

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
        active_filter: {
            get() { return this.$store.getters['device_selection/filter'] },
            set(value) { this.$store.commit('device_selection/setActiveFilter', value) }
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
        filter_state: function() {
            try {
                return this.all_filter_state[this.active_filter]
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
                { time: this.cam_exposure },
                {
                repeat: this.cam_repeat,
                bin: this.cam_bin,
                filter: this.cam_filter,
                size: this.cam_area,
                }
            )
        },
        camera_cancel_command () {
            return this.base_command( 'camera', 'stop', 'cancel' )
        },
        mount_slew_command () {
            return this.base_command( 'mount', 'go', 'slew here',
                { ra: this.slew_ra, dec: this.slew_dec, }
            )
        },
        mount_slew_chart_command () {
            return this.base_command( 'mount', 'go', 'slew to chart position',
                { ra: this.chart_selectedRa, dec: this.chart_selectedDec, }
            )
        },
        mount_stop_command () {
            return this.base_command( 'mount', 'stop', 'cancel' )
        },
        mount_park_command () {
            return this.base_command( 'mount', 'park', 'park' )
        },
        mount_home_command () {
            return this.base_command( 'mount', 'home', 'home' )
        },
        mount_flat_command () {
            return this.base_command( 'mount', 'flat-panel', 'flats')
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
        focus_stop_command () {
            return this.base_command( 'focuser', 'stop', 'stop' )
        },
        filter_command () {
            return this.base_command( 'filter', 'set_name', 'apply',
                { filter_name: this.cam_filter },
            )
        },
        filter_home_command () {
            return this.base_command( 'filter', 'home', 'home' )
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