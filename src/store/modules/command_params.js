/**
 *  This module is responsible for tracking the state of fields holding parameters
 *  for commands (eg. exposure time).
 *  
 */

const state = {

    // Mount parameters
    mount_ra: '',
    mount_dec: '',
    mount_object: '',

    telescope_selection: 1, // 1: main telescope, 2: auxiliary telescope
    telescope_coordinate_frame: 'ICRS',

    // Subframe parameters
    subframeIsActive: false,
    subframeDefinedWithFile: '',

    camera_areas_selection: 'Full',
    camera_note: '',
    camera_exposure: '1',
    camera_count: 1, // numberinput form requires number, not string. converted to string in expose command.
    camera_area: null, 
    camera_bin: '', 
    camera_dither: 'off',
    camera_extract: 'on', // requested by Wayne for SEP related tests 20200413
    camera_image_type: 'light',

    camera_cooling: 'off',
    camera_temperature: -20,
    camera_de_ice_cooling: false,

    filter_wheel_options_selection: '',

    selector_position: 1, // the chosen inst. selector position.

    focuser_relative: '',
    focuser_absolute: '',

    rotator_relative: '',
    rotator_absolute: '',

    screen_brightness: 100,
}

const getters = {

    mount_ra: state => state.mount_ra,
    mount_dec: state => state.mount_dec,
    mount_object: state => state.mount_object,

    telescope_selection: state => state.telescope_selection,
    telescope_coordinate_frame: state => state.telescope_coordinate_frame,

    subframeIsActive: state => state.subframeIsActive,
    subframeDefinedWithFile: state => state.subframeDefinedWithFile,
    subframe_x0: state => state.subframe_x0,
    subframe_y0: state => state.subframe_y0,
    subframe_x1: state => state.subframe_x1,
    subframe_y1: state => state.subframe_y1,

    camera_areas_selection: state => state.camera_areas_selection, 
    camera_note: state => state.camera_note,
    camera_exposure: state => state.camera_exposure,
    camera_count: state => state.camera_count,
    camera_bin: state => state.camera_bin,
    camera_dither: state => state.camera_dither,
    camera_extract: state => state.camera_extract,
    camera_image_type: state => state.camera_image_type,

    camera_cooling: state => state.camera_cooling,
    camera_temperature: state => state.camera_temperature,
    camera_de_ice_cooling: state => state.camera_de_ice_cooling,

    filter_wheel_options_selection: state => state.filter_wheel_options_selection,

    selector_position: state => state.selector_position,

    focuser_relative: state => state.focuser_relative,
    focuser_absolute: state => state.focuser_absolute,

    rotator_relative: state => state.rotator_relative,
    rotator_absolute: state => state.rotator_absolute,

    screen_brightness: state => state.screen_brightness,

}

const mutations = {

    mount_ra(state, val) { state.mount_ra = val; },
    mount_dec(state, val) { state.mount_dec = val; },
    mount_object(state, val) { state.mount_object = val; },

    telescope_selection(state, val) { state.telescope_selection = val; },
    telescope_coordinate_frame (state, val) { state.telescope_coordinate_frame = val; },

    subframeIsActive (state, val) { state.subframeIsActive = val },
    subframeDefinedWithFile (state, val) { state.subframeDefinedWithFile = val },
    subframe_x0 (state, val) { state.subframe_x0 = val; },
    subframe_y0 (state, val) { state.subframe_y0 = val; },
    subframe_x1 (state, val) { state.subframe_x1 = val; },
    subframe_y1 (state, val) { state.subframe_y1 = val; },

    camera_areas_selection (state, val) { state.camera_areas_selection = val; },
    camera_note(state, val) { state.camera_note = val; },
    camera_exposure (state, val) { state.camera_exposure = val; },
    camera_count (state, val) { state.camera_count = val; },
    camera_bin (state, val) { state.camera_bin = val; },
    camera_dither (state, val) { state.camera_dither = val; },
    camera_extract (state, val) { state.camera_extract = val; },
    camera_image_type (state, val) { state.camera_image_type = val; },

    camera_cooling (state, val) { state.camera_cooling = val; },
    camera_temperature (state, val) { state.camera_temperature = val; },
    camera_de_ice_cooling (state, val) { state.camera_de_ice_cooling = val; },

    filter_wheel_options_selection(state, val) { state.filter_wheel_options_selection = val; },

    selector_position(state, val) {state.selector_position = val; },

    focuser_relative(state, val) { state.focuser_relative = val; },
    focuser_absolute(state, val) { state.focuser_absolute = val; },

    rotator_relative(state, val) { state.rotator_relative = val; },
    rotator_absolute(state, val) { state.rotator_absolute = val; },

    screen_brightness(state, val) { state.screen_brightness = val; },
}

const actions = {
    // This action does nothing. It exists for easy reference.
    empty({ commit }, payload) {
        console.log('action called from command_params')
        //console.log(payload)
        //commit('mutation_name', value)
    },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}