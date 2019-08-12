/**
 * @fileoverview This is the vuex store that maintains the state of devices
 * that are either available for selection or currently selected and active.
 */

import { API } from 'aws-amplify'

const state = {
    did_config_load_yet: false,
    is_site_selected: false,
    global_config: {"a":1,"b":2},
    selected_site: '',
    selected_enclosure: '',
    selected_mount: '',
    selected_telescope: '',
    selected_rotator: '',
    selected_focuser: '',
    selected_filter_wheel: '',
    selected_camera: '',

    camera_areas_selection: '',
    filter_wheel_options_selection: '',
}

const getters = {
    available_sites: state => Object.keys(state.global_config),
    available_enclosures: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["enclosure"] || {})
            : []
    },
    available_mounts: state => {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["mount"] || {}) 
            : []
    },
    available_telescopes: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["telescope"] || {}) 
            : []
    },
    available_rotators: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["rotator"] || {})
            : []
    },
    available_focusers: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["focuser"] || {})
            : []
    },
    available_filter_wheels: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["filter_wheel"] || {})
            : []
    },
    available_cameras: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["camera"] || {})
            : []
    },

    site: state => state.selected_site,
    enclosure: state => state.selected_enclosure,
    mount: state => state.selected_mount,
    telescope: state => state.selected_telescope,
    rotator: state => state.selected_rotator,
    focuser: state => state.selected_focuser,
    filter_wheel: state => state.selected_filter_wheel,
    camera: state => state.selected_camera,

    /* These getters are used to customize the control form fields. */
    // Available camera areas
    camera_areas: state => {
        try {
            return state.global_config[state.selected_site].camera[state.selected_camera].settings.area
        } catch {
            return []
        }
    },
    // Current selected camera area.
    camera_areas_selection: state => state.camera_areas_selection, 

    // Available filters
    filter_wheel_options: state => {
        try {
            let fwo = state.global_config[state.selected_site].filter_wheel[state.selected_filter_wheel].settings.filter_data;
            let num_filters = fwo.length;
            // Ignore the first element, which is really just the definitions of the items in the arrays representing each filter.j
            return fwo.slice(1, num_filters)
        } catch {
            return []
        }
    },
    // Currently selected filter
    filter_wheel_options_selection: state => state.filter_wheel_options_selection,

    // Does the camera bin or not? Returns string 'True' or 'False'.
    camera_can_bin: state => {
        try {
            return state.global_config[state.selected_site].camera[state.selected_camera].settings.can_bin
        } catch {
            return 'False'
        }
    },
    


    global_config: state => state.global_config,
    foo: () => "bar",
}

const actions = {

    /**
     * This action gets the most recent config from AWS, which applies to all 
     * observatories in the network. 
     */
    update_config({ commit, getters }) {
        let apiName = 'ptr-api';
        let path = '/all/config/';
        API.get(apiName, path).then(response => {

            // Save the config to this vuex module.
            commit('setGlobalConfig', response)

            // Set initial values in command fields
            let filterSelection= getters.filter_wheel_options[0][0]
            commit('setFilterSelection', filterSelection)

            let areaSelection = getters.camera_areas[0]
            commit('setCameraAreasSelection', areaSelection)

        }).catch(error => {
            console.log(error)
        });
    },
    set_default_filter_option({ commit, getters }) {
        commit('setFilterSelection', getters.filter_wheel_options[0])
    },


}

const mutations = {
    setGlobalConfig(state, config) { 
        state.global_config = config;
        state.did_config_load_yet = true;
    },

    setActiveSite(state, site) { state.selected_site = site; state.is_site_selected = true },
    setActiveEnclosure(state, enclosure) { state.selected_enclosure = enclosure },
    setActiveMount(state, mount) { state.selected_mount = mount },
    setActiveTelescope(state, telescope) { state.selected_telescope = telescope },
    setActiveRotator(state, rotator) { state.selected_rotator = rotator },
    setActiveFocuser(state, focuser) { state.selected_focuser = focuser },
    setActiveFilterWheel(state, filter_wheel) { state.selected_filter_wheel = filter_wheel },
    setActiveCamera(state, camera) { state.selected_camera = camera },

    setFilterSelection(state, filterSelection) { state.filter_wheel_options_selection = filterSelection },
    setCameraAreasSelection(state, areaSelection) { state.camera_areas_selection = areaSelection },
}

export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}