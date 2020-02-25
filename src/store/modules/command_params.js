/**
 *  This module is responsible for tracking the state of fields holding parameters
 *  for commands (eg. exposure time).
 *  
 */

const state = {

    // Mount parameters
    mount_ra: '',
    mount_dec: '',

    // Subframe parameters
    subframeIsActive: true,
    subframeDefinedWithFile: '',
    subframe_x0: 0,
    subframe_y0: 0,
    subframe_x1: 1,
    subframe_y1: 1,

    camera_areas_selection: '',
    camera_hint: '',
    camera_exposure: '1',
    camera_count: 1, // numberinput form requires number, not string. converted to string in expose command.
    camera_area: null, 
    camera_bin: '', 
    camera_dither: 'off',
    camera_image_type: 'light',

    filter_wheel_options_selection: '',

    focuser_relative: '',
    focuser_absolute: '',

    rotator_relative: '',
    rotator_absolute: '',

    screen_brightness: 100,
}

const getters = {

    mount_ra: state => state.mount_ra,
    mount_dec: state => state.mount_dec,

    subframeIsActive: state => state.subframeIsActive,
    subframeDefinedWithFile: state => state.subframeDefinedWithFile,
    subframe_x0: state => state.subframe_x0,
    subframe_y0: state => state.subframe_y0,
    subframe_x1: state => state.subframe_x1,
    subframe_y1: state => state.subframe_y1,

    camera_areas_selection: state => state.camera_areas_selection, 
    camera_hint: state => state.camera_hint,
    camera_exposure: state => state.camera_exposure,
    camera_count: state => state.camera_count,
    camera_bin: state => state.camera_bin,
    camera_dither: state => state.camera_dither,
    camera_image_type: state => state.camera_image_type,

    filter_wheel_options_selection: state => state.filter_wheel_options_selection,

    focuser_relative: state => state.focuser_relative,
    focuser_absolute: state => state.focuser_absolute,

    rotator_relative: state => state.rotator_relative,
    rotator_absolute: state => state.rotator_absolute,

    screen_brightness: state => state.screen_brightness,

}

const actions = {
    // This action does nothing. It exists for easy reference.
    empty({ commit }, payload) {
        console.log('action called from command_params')
        //console.log(payload)
        //commit('mutation_name', value)
    },
}

const mutations = {

    mount_ra(state, val) { state.mount_ra = val; },
    mount_dec(state, val) { state.mount_dec = val; },

    subframeIsActive (state, val) { state.subframeIsActive = val },
    subframeDefinedWithFile (state, val) { state.subframeDefinedWithFile = val },
    subframe_x0 (state, val) { state.subframe_x0 = val; },
    subframe_y0 (state, val) { state.subframe_y0 = val; },
    subframe_x1 (state, val) { state.subframe_x1 = val; },
    subframe_y1 (state, val) { state.subframe_y1 = val; },

    camera_areas_selection (state, val) { state.camera_areas_selection = val; },
    camera_hint (state, val) { state.camera_hint = val; },
    camera_exposure (state, val) { state.camera_exposure = val; },
    camera_count (state, val) { state.camera_count = val; },
    camera_bin (state, val) { state.camera_bin = val; },
    camera_dither (state, val) { state.camera_dither = val; },
    camera_image_type (state, val) { state.camera_image_type = val; },

    filter_wheel_options_selection(state, val) { state.filter_wheel_options_selection = val; },

    focuser_relative(state, val) { state.focuser_relative = val; },
    focuser_absolute(state, val) { state.focuser_absolute = val; },

    rotator_relative(state, val) { state.rotator_relative = val; },
    rotator_absolute(state, val) { state.rotator_absolute = val; },

    screen_brightness(state, val) { state.screen_brightness = val; },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations,
}