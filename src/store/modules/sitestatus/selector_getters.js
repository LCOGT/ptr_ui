

const selector_state = (state, getters, rootState) => {
  if (Object.keys(state.selector).includes(rootState.site_config.selected_selector)) {
    return state.selector[rootState.site_config.selected_selector]
  } else {
    return {}
  }
}

const selector_camera = (state, getters) => {
  if (getters.selector_state && 'camera' in getters.selector_state) {
    return getters.selector_state.camera
  } else {
    return '-'
  }
}
const selector_guider  = (state, getters) => {
  if (getters.selector_state && 'guider' in getters.selector_state) {
    return getters.selector_state.guider
  } else {
    return '-'
  }
}
const selector_instrument = (state, getters) => {
  if (getters.selector_state && 'instrument' in getters.selector_state) {
    return getters.selector_state.instrument
  } else {
    return '-'
  }
}
const selector_port = (state, getters) => {
  if (getters.selector_state && 'port' in getters.selector_state) {
    return getters.selector_state.port
  } else {
    return '-'
  }
}

export default {
  selector_state,
	selector_camera,
	selector_guider,
	selector_instrument,
  selector_port,
}