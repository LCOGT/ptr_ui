/**
 * @fileoverview This is the vuex store that maintains the state of devices
 * that are either available for selection or currently selected and active.
 */

//import { API } from 'aws-amplify'
import axios from 'axios'

var initial_state = function() {
    console.log('initializing site_config state')
    let apiName = this.$store.getters['dev/api'];
    let path = '/all/config/';
    let state = {
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
        selected_weather: '',

        camera_areas_selection: '',
        filter_wheel_options_selection: '',
    };
    //API.get(apiName, path).then(response => {
    axios.get(apiName+path).then(response => {
        console.log('about to fetch config from api')
        state.global_config = response.data;
        state.did_config_load_yet = true;
        state.is_site_selected = false;
    }).catch(error => {
        console.log(error)
    });
    console.log('initial config state: ')
    console.log(state)
    return state;
}

const state = {
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
    selected_weather:'',
    selected_sequencer:'',

}


const getters = {

    available_devices: 
        state => (deviceType, site) => {
            if(state.global_config && Object.keys(state.global_config).length != 0) {
                return Object.keys(state.global_config[site][deviceType])
            }
            else { return [] }
        },

    available_sites: state => Object.keys(state.global_config),

    // These are the active devices.
    site: state => state.selected_site,
    enclosure: state => state.selected_enclosure,
    mount: state => state.selected_mount,
    telescope: state => state.selected_telescope,
    rotator: state => state.selected_rotator,
    focuser: state => state.selected_focuser,
    filter_wheel: state => state.selected_filter_wheel,
    camera: state => state.selected_camera,
    screen: state => state.selected_screen,
    weather: state => state.selected_weather,
    sequencer: state => state.selected_sequencer,


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



    /* Site properties */
    site_latitude: state => {
        return (state.did_config_load_yet && state.is_site_selected)
        ? parseFloat(state.global_config[state.selected_site].latitude)
        : 0
    },
    site_longitude: state => {
        return (state.did_config_load_yet && state.is_site_selected)
        ? parseFloat(state.global_config[state.selected_site].longitude)
        : 0
    },

    timezone: state => {
        return (state.did_config_load_yet && state.is_site_selected)
        ? state.global_config[state.selected_site].TZ_database_name
        : "no timezone"
    },


    /* These getters are used to customize the control form fields. */
    // Available camera areas
    camera_areas: state => {
        try {
            return state.global_config[state.selected_site].camera[state.selected_camera].settings.areas_implemented
        } catch {
            return []
        }
    },

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

    camera_bin_options: state => {
        try {
            let bin_options = []
            let bins = state.global_config[state.selected_site].camera[state.selected_camera].settings.bin_modes
            for (let i=0; i<bins.length; i++) { bin_options.push(bins[i].join()) }
            return bin_options
        } catch {
            return [];
        }
    },

    // Does the camera bin or not? Returns string 'True' or 'False'.
    camera_can_bin: state => {
        try {
            // Check if the array is undefined or zero -> return false; else return true. 
            return (
                Array.isArray(state.global_config[state.selected_site].camera[state.selected_camera].settings.bin_modes)
                && (state.global_config[state.selected_site].camera[state.selected_camera].settings.bin_modes).length
            ) 
        } catch {
            return false
        }
    },

    
    all_telescopes: state => state.global_config[state.selected_site]['telescope'],

    global_config: state => state.global_config,
    site_config: state => sitecode => state.global_config[sitecode] || {},
}
const mutations = {
    setGlobalConfig(state, config) { 
        state.global_config = config;
        state.did_config_load_yet = true;
    },
    setActiveSite(state, site) { 
        state.selected_site = site; 
        state.is_site_selected = true 
    },
    setActiveEnclosure(state, enclosure) { state.selected_enclosure = enclosure },
    setActiveMount(state, mount) { state.selected_mount = mount },
    setActiveTelescope(state, telescope) { state.selected_telescope = telescope },
    setActiveRotator(state, rotator) { state.selected_rotator = rotator },
    setActiveFocuser(state, focuser) { state.selected_focuser = focuser },
    setActiveFilterWheel(state, filter_wheel) { state.selected_filter_wheel = filter_wheel },
    setActiveCamera(state, camera) { state.selected_camera = camera },
    setActiveScreen(state, screen) { state.selected_screen = screen },
    setActiveWeather(state, weather) { state.selected_weather = weather},
    setActiveSequencer(state, sequencer) { state.selected_sequencer = sequencer},

}

const actions = {

    /**
     * This action gets the most recent config from AWS, which applies to all 
     * observatories in the network. 
     */
    update_config({ commit, dispatch, rootState }) {
        let apiName = rootState.dev.active_api;
        let path = '/all/config/';
        return axios.get(apiName+path).then(response => {
            commit('setGlobalConfig', response.data)
        }).catch(error => {
            console.log(error)
        });
    },

    set_default_filter_option({ commit, getters }) {
        commit('command_params/filter_wheel_options_selection', 
                getters.filter_wheel_options[0],
                {root: true},
            )
    },

    set_default_active_devices({ state, commit, getters, rootGetters}, site) {
        let defaults = state.global_config[site].defaults

        commit('setActiveSite', site)
        commit('setActiveWeather', defaults.observing_conditions)
        commit('setActiveEnclosure', defaults.enclosure)
        commit('setActiveMount', defaults.mount)
        commit('setActiveTelescope', defaults.telescope)
        commit('setActiveCamera', defaults.camera)
        commit('setActiveFilterWheel', defaults.filter_wheel)
        commit('setActiveFocuser', defaults.focuser)
        commit('setActiveRotator', defaults.rotator)
        commit('setActiveSequencer', defaults.sequencer)
        commit('setActiveScreen', defaults.screen)

        // Set initial values in command fields
        if (rootGetters['command_params/filter_wheel_options_selection'] == '') {
            let filterSelection= getters.filter_wheel_options[0][0]
            commit('command_params/filter_wheel_options_selection', 
                    filterSelection,
                    {root: true},
                )
        }

        if (rootGetters['command_params/camera_areas_selection'] == '') {
            let areaSelection = getters.camera_areas[0]
            commit('command_params/camera_areas_selection', 
                    areaSelection,
                    {root: true},
                )
        }

        if (rootGetters['command_params/camera_bin'] == '' && getters.camera_can_bin) { 
            let bin_selection = getters.camera_bin_options[0]
            commit('command_params/camera_bin', 
                    bin_selection,
                    {root: true},
                )
        }
    },

    remove_active_site({commit}) {
        commit('setActiveSite','')
        commit('setActiveWeather', '')
        commit('setActiveEnclosure', '')
        commit('setActiveMount','')
        commit('setActiveTelescope','')
        commit('setActiveCamera', '')
        commit('setActiveFilterWheel', '')
        commit('setActiveFocuser', '')
        commit('setActiveRotator', '')
        commit('setActiveSequencer', '')
        commit('setActiveScreen', '')
    },


}



export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}