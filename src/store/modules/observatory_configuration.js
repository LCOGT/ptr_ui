/**
 * @fileoverview This is the vuex store that maintains the state of devices
 * that are either available for selection or currently selected and active.
 */

import { API } from 'aws-amplify'

var state = {
    did_config_load_yet: false,
    is_site_selected: false,
    global_config: {},
    selected_site: '',
    selected_enclosure: '',
    selected_mount: '',
    selected_telescope: '',
    selected_rotator: '',
    selected_focuser: '',
    selected_filter_wheel: '',
    selected_camera: '',
    selected_screen: '',

    camera_areas_selection: '',
    filter_wheel_options_selection: '',
}

const getters = {
    available_sites: state => Object.keys(state.global_config),
    available_enclosures: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["enclosure"] || [])
            : []
    },
    available_mounts: state => {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["mount"] || []) 
            : []
    },
    available_telescopes: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["telescope"] || []) 
            : []
    },
    available_rotators: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["rotator"] || [])
            : []
    },
    available_focusers: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["focuser"] || [])
            : []
    },
    available_filter_wheels: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["filter_wheel"] || [])
            : []
    },
    available_cameras: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["camera"] || [])
            : []
    },
    available_screens: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["screen"] || [])
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
    screen: state => state.selected_screen,


    /* Getters for specific device attributes (implemented here as needed) */
    focuser_reference: state => {
        try {
            return (
                parseFloat(state
                .global_config[state.selected_site]
                .focuser[state.selected_focuser]
                .reference
                )
            )
        } catch {
            return ''
        }
    },
    focuser_min: state => {
        try {
            return (
                parseFloat(state
                .global_config[state.selected_site]
                .focuser[state.selected_focuser]
                .minimum
                )
            )
        } catch {
            return ''
        }
    },
    focuser_max: state => {
        try {
            return (
                parseFloat(state
                .global_config[state.selected_site]
                .focuser[state.selected_focuser]
                .maximum
                )
            )
        } catch {
            return ''
        }
    },
    focuser_step_size: state => {
        try {
            return (
                parseFloat(state
                    .global_config[state.selected_site]
                    .focuser[state.selected_focuser]
                    .step_size
                )
            )
        } catch {
            return 1.0
        }
    },



    rotator_min: state => {
        try {
            return (
                parseFloat(state
                .global_config[state.selected_site]
                .rotator[state.selected_rotator]
                .minimum
                )
            )
        } catch {
            return ''
        }
    },
    rotator_max: state => {
        try {
            return (
                parseFloat(state
                .global_config[state.selected_site]
                .rotator[state.selected_rotator]
                .maximum
                )
            )
        } catch {
            return ''
        }
    },
    rotator_step_size: state => {
        try {
            return (
                parseFloat(state
                    .global_config[state.selected_site]
                    .rotator[state.selected_rotator]
                    .step_size
                )
            )
        } catch {
            return 1.0
        }
    },



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
            return [[]]
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
    
    all_telescopes: state => state.global_config[state.selected_site]['telescope'],

    global_config: state => state.global_config,
    is_config_loaded: state => state.did_config_load_yet,
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

    set_default_active_devices({ commit, dispatch }, site) {
        if (site=="wmd") {
            commit('setActiveSite', site)
            commit('setActiveEnclosure', 'enclosure1')
            commit('setActiveMount', 'mount1')
            commit('setActiveTelescope', 'telescope1')
            //dispatch('setActiveTelescope', 'telescope1')
            commit('setActiveFilterWheel', 'filter_wheel1')
            commit('setActiveCamera', 'camera1')
            commit('setActiveFocuser', 'focuser1')
            commit('setActiveRotator', 'rotator1')
            commit('setActiveScreen', 'screen1')
        }
    },

    setActiveTelescope({ commit, getters, }, telescope_name) {
        commit('setActiveTelescope', telescope_name)

        let active_site = getters.site
        console.log('did config load')
        console.log(getters.is_config_loaded)
        let telescopes = getters.all_telescopes
        console.log('telescopes: ')
        console.log(telescopes)
        let telescope_config =telescopes[telescope_name]
        console.log('telescope_config: ')
        console.log(telescope_config)
        let rotator_name = telescope_config.rotator_name
        let camera_name = telescope_config.camera_name
        let screen_name = telescope_config.screen_name
        let focuser_name = telescope_config.focuser_name
        commit('setActiveCamera', camera_name)
        commit('setActiveFocuser', focuser_name)
        commit('setActiveRotator', rotator_name)
        commit('setActiveScreen', screen_name)

    }

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
    setActiveScreen(state, screen) { state.selected_screen = screen },

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