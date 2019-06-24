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
    selected_filter: '',
    selected_camera: '',
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
    available_filters: state =>  {
        return (state.did_config_load_yet && state.is_site_selected)
            ? Object.keys(state.global_config[state.selected_site]["filter"] || {})
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
    filter: state => state.selected_filter,
    camera: state => state.selected_camera,

    camera_areas: state => {
        try {
            return state.global_config[state.selected_site].camera[state.selected_camera].settings.area
        } catch {
            return []
        }
    },


    global_config: state => state.global_config,
}

const actions = {

    /**
     * This action gets the most recent config from AWS, which applies to all 
     * observatories in the network. 
     */
    update_config({ commit }) {
        let apiName = 'ptr-api';
        let path = '/all/config/';
        API.get(apiName, path).then(response => {
            // Save the config to this vuex module.
            commit('setGlobalConfig', response)
        }).catch(error => {
            console.log(error)
        });
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
    setActiveFilter(state, filter) { state.selected_filter = filter },
    setActiveCamera(state, camera) { state.selected_camera = camera },
}

export default {
    namespaced: true,
    state, 
    getters,
    actions,
    mutations,
}