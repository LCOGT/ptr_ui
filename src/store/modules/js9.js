
import { API } from 'aws-amplify'


// initial state
const state = {
    JS9_ID: 'myJS9',
    instanceIsVisible: false,
    js9_current_image: '',
    current_image_id: '',
    js9Width: '',
    js9Height: '',
}

// getters
const getters = {
    JS9_ID: state => state.JS9_ID,
    instanceIsVisible: state => state.instanceIsVisible,
    js9_current_image: state => state.js9_current_image,
    current_image_id: state => state.current_image_id,
    js9Width: state => state.js9Width,
    js9Height: state => state.js9Height,
}

// actions
const actions = {

    loadImage({ rootState, state, commit }, { base_filename, site }) {

        // only load if it's not currently loaded.
        if (base_filename == state.js9_current_image) {
            return;
        } else {
            let apiName = rootState.dev.active_api;
            let path = `/fits13_url/${site}/${base_filename}/`;

            // This helper function returns only after the current image is loaded.
            function ensureImageLoaded() {
                return new Promise(function (resolve, reject) {
                    (function waitForLoad(){
                        if (JS9.GetLoadStatus() == "complete") return resolve();
                        setTimeout(waitForLoad, 300);
                    })();
                });
            }

            function uploadWhenReady() {
                console.log()
            }
            
            API.get(apiName, path).then(response => {

                // Download the image to the browser instance
                JS9.Load(response, {scale: "histeq"}, {display: state.JS9_ID})

                commit('js9_current_image', base_filename)
                console.log(base_filename)

                // Once the image loads, upload the FITS file for server-side capabilities.
                // Wait a bit before checking so we don't get the 'complete' status from the prior image.
                setTimeout(function(){
                    ensureImageLoaded().then(function(){
                    console.log(JS9.GetLoadStatus())
                        JS9.UploadFITSFile()
                    })
                }, 500)
            }).catch(error => {
                console.log(error)
            });
        }
    },

    resizeDisplay({ state, commit }, { id, width, height }) {
        // only resize if dimensions are different
        if (state.js9Width==width && state.js9Height==height) {
            return;
        } else {
            // we might later want to adjust the zoom level when the window size changes. 
            let zoom = JS9.GetZoom(id)
            JS9.ResizeDisplay(id, width, height)
            commit('js9Width', width)
            commit('js9Height', height)
        }
    },
}

// mutations
const mutations = {
    JS9_ID(state, id) { state.JS9_ID = id },
    instanceIsVisible(state, vis) { state.instanceIsVisible = vis },
    js9_current_image(state, base_filename ) { state.js9_current_image = base_filename },
    current_image_id(state, id) { state.current_image_id = id},
    js9Width(state,val) { state.js9Width = val },
    js9Height(state,val) { state.js9Height = val },
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}