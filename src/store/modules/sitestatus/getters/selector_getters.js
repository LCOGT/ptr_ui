import { isItemStale } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val(getters, key) {
  return getters.selector_state[key]?.val ?? getters.selector_state[key] ?? '-'
}

const selector_state = (state, getters, rootState) => {
  return state.selector[rootState.site_config.selected_selector] ?? {}
}

const selector_camera = (state, getters) => {
  let name = 'Selector Camera'
  let val = get_val(getters, 'camera') 
  let is_stale = isItemStale(getters, 'selector_state', 'camera')
  return { name, val, is_stale }
}
const selector_guider  = (state, getters) => {
  let name = 'Selector Guider'
  let val = get_val(getters, 'guider') 
  let is_stale = isItemStale(getters, 'selector_state', 'guider')
  return { name, val, is_stale }
}
const selector_instrument = (state, getters) => {
  let name = 'Selector Instrument'
  let val = get_val(getters, 'instrument') 
  let is_stale = isItemStale(getters, 'selector_state', 'instrument')
  return { name, val, is_stale }
}
const selector_port = (state, getters) => {
  let name = 'Selector Port'
  let val = get_val(getters, 'port') 
  let is_stale = isItemStale(getters, 'selector_state', 'port')
  return { name, val, is_stale }
}

export default {
  selector_state,
	selector_camera,
	selector_guider,
	selector_instrument,
  selector_port,
}