
import axios from 'axios'

// initial state
const state = {
  js9Ready: false,
  JS9_ID: 'myJS9',
  instanceIsVisible: false,
  js9_current_image: '',
  current_image_id: '',
  js9Width: '',
  js9Height: '',
  js9Zoom: '',
  crosshairActive: false
}

// getters
const getters = {
  JS9_ID: state => state.JS9_ID,
  instanceIsVisible: state => state.instanceIsVisible,
  js9_current_image: state => state.js9_current_image,
  current_image_id: state => state.current_image_id,
  js9Width: state => state.js9Width,
  js9Height: state => state.js9Height
}

// actions
const actions = {

  // Use this action to ensure js9 is ready to go
  // Either returns true, or waits for the event and then returns true.
  waitForJs9Ready ({ commit, state }) {
    return new Promise((resolve, reject) => {
      if (state.js9Ready) resolve(true)
      else if (JS9.readied) {
        commit('js9Ready', true)
        resolve(true)
      } else {
        $(document).on('JS9:ready', () => {
          commit('js9Ready', true)
          resolve(true)
        })
      }
    })
  },

  async loadImage ({ rootState, rootGetters, state, commit, dispatch }, { base_filename, site, zoom, flip }) {
    // Make sure js9 is ready to load an image
    await dispatch('waitForJs9Ready')

    // Make sure we have the required args
    if (!base_filename || !site) {
      console.warn('Did not load image in js9 due to bad parameters: ')
      console.warn({
        base_filename,
        site
      })

      // If the image is already loaded, do nothing
    } else if (base_filename == state.js9_current_image) {

      // Load the image
    } else {
      // This helper function returns only after the current image is loaded.
      function ensureImageLoaded () {
        return new Promise(function (resolve, reject) {
          (function waitForLoad () {
            if (JS9.GetLoadStatus() == 'complete') return resolve()
            setTimeout(waitForLoad, 300)
          })()
        })
      }

      // Get the url based on the image filename
      const apiName = rootState.api_endpoints.active_api
      const path = '/download'
      const body = {
        object_name: rootGetters['images/small_fits_filename']
      }
      const resp = await axios.post(apiName + path, body)
      const imageURL = resp.data

      // Download the image to the browser instance
      JS9.Load(imageURL, { scale: 'histeq' }, { display: state.JS9_ID })

      commit('js9_current_image', base_filename)

      // Once the image loads, upload the FITS file for server-side capabilities.
      // Wait a bit before checking so we don't get the 'complete' status from the prior image.
      setTimeout(function () {
        ensureImageLoaded().then(function () {
          // turn off the crosshair for new images
          commit('crosshairActive', false)
          // dispatch('crosshairOff')

          // upload to enable server side tasks
          // Skip for now since we don't use it and don't want to maintain server.
          // JS9.UploadFITSFile()

          console.warn('setting zoom level')
          // set zoom level
          if (zoom) JS9.SetZoom(zoom)
          if (flip) JS9.SetFlip(flip)
        })
      }, 500)
    }
  },

  crosshairOff ({ state, dispatch }) {
    if (JS9.GetImage(state.JS9_ID).params.crosshair) {
      JS9.Keyboard.Actions['toggle crosshair'](JS9.GetImage(state.JS9_ID))
    }
    // Secondary tasks: resizing and hiding the crosshair plots.
    dispatch('resizeForCrosshairs')
  },
  crosshairOn ({ state, dispatch }) {
    if (!JS9.GetImage(state.JS9_ID).params.crosshair) {
      JS9.Keyboard.Actions['toggle crosshair'](JS9.GetImage(state.JS9_ID))
    }
    // Secondary tasks: resizing and hiding the crosshair plots.
    dispatch('resizeForCrosshairs')
  },

  toggleCrosshair ({ state }) {
    const im = JS9.GetImage({ display: state.JS9_ID })
    JS9.Keyboard.Actions['toggle crosshair'](im)
  },

  async resizeForCrosshairs ({ dispatch, state }) {
    let imageWindow

    // Calculate the size we would need for resizing with and without the crosshair plots
    const withCrosshairs = document.getElementById('js9analysiswrapper').getBoundingClientRect()
    const noCrosshairs = document.getElementsByClassName('js9-grid')[0].getBoundingClientRect()

    // By default, resize to a full js9 instance
    imageWindow = noCrosshairs

    // If crosshairs are enabled, resize to allow for the crosshair plots
    if (JS9.GetImage({ display: state.JS9_ID }) &&
            JS9.GetImage({ display: state.JS9_ID }).params.crosshair) {
      imageWindow = withCrosshairs
    }

    const resize_opts = {
      id: 'myJS9',
      width: imageWindow.width,
      height: imageWindow.height
    }

    await dispatch('resizeDisplay', resize_opts)
  },

  async resizeDisplay ({ state, commit }, { id, width, height }) {
    // only resize if dimensions are different
    if (state.js9Width == width && state.js9Height == height) {

      // don't do anything if js9 is not loaded yet
    } else if (!JS9.GetLoadStatus()) {
      console.warn('js9 load status was false')
      console.warn(JS9.GetLoadStatus())
    } else {
      // we might want to adjust the zoom level when the window size changes.
      const zoom = JS9.GetZoom(id) // eslint-disable-line
      JS9.ResizeDisplay(id, width, height)
      commit('js9Width', width)
      commit('js9Height', height)
    }
  },

  zoom ({ commit }, zoomLevel) {
    JS9.SetZoom(zoomLevel)
    commit('js9Zoom', zoomLevel)
  }

}

// mutations
const mutations = {
  js9Ready (state, val) { state.js9Ready = val },
  JS9_ID (state, id) { state.JS9_ID = id },
  instanceIsVisible (state, vis) { state.instanceIsVisible = vis },
  js9_current_image (state, base_filename) { state.js9_current_image = base_filename },
  current_image_id (state, id) { state.current_image_id = id },
  js9Width (state, val) { state.js9Width = val },
  js9Height (state, val) { state.js9Height = val },
  js9Zoom (state, val) { state.js9ZOom = val },
  crosshairActive (state, val) { state.crosshairActive = val }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
