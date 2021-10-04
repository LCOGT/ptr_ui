

const selector_state = (state, getters, rootState) => {
  return state.selector[rootState.site_config.selected_selector] ?? {}
}

const selector_camera = (state, getters) => {
  return getters.selector_state.camera ?? '-'
}
const selector_guider  = (state, getters) => {
  return getters.selector_state.guider ?? '-'
}
const selector_instrument = (state, getters) => {
  return getters.selector_state.instrument ?? '-'
}
const selector_port = (state, getters) => {
  return getters.selector_state.port ?? '-'
}

export default {
  selector_state,
	selector_camera,
	selector_guider,
	selector_instrument,
  selector_port,
}