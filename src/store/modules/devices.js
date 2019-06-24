import { API } from 'aws-amplify'

const state = {

    gobal_config = '',

    active_site = '',
    active_mount = '',
    active_telescope = '',
    active_camera = '',
    active_filter = '',
    active_focuser = '',
    active_rotator = '',

}

const getters = {

    available_sites: state => Object.keys(state.global_config),




    },


const actions = {

    /**
     * This action gets the most recent config from AWS, which applies to all 
     * observatories in the network. 
     */
    update_config({ commit }) {
        let apiName = 'ptr-api';
        let path = '/all/config/';
        API.get(apiName, path).then(response => {
            commit('setGlobalConfig', response)
        }).catch(error => {
            console.log(error)
        });
    },

    },

const mutations = {

    setGlobalConfig(state, config) {
        state.global_config = config;
    }
}