import { isItemStale, parseTrueFalse } from './status_utils'

function get_val(getters, key) {
  return getters.focuser_state[key]?.val ?? getters.focuser_state[key] ?? '-'
}
function get_timestamp(getters, key) {
  let timestamp_ms = getters.focuser_state[key]?.timestamp ?? 0
  let timestamp_s = timestamp_ms / 1000
  return timestamp_s
}

const focuser_state = (state, getters, rootState) => {
    return state.focuser[rootState.site_config.selected_focuser] ?? {}
}

const focus_position = (state, getters) => {
  let name = 'Focus Pos.'
  let val = get_val(getters, 'focus_position') + " μm" 
  let is_stale = isItemStale(getters, 'focuser_state', 'focus_position')
  return { name, val, is_stale }
}

const focus_comp = (state, getters) => {
  let name = 'Focus Comp.'
  let val = get_val(getters, 'comp') + " μm" 
  let is_stale = isItemStale(getters, 'focuser_state', 'comp')
  return { name, val, is_stale }
}

const focus_filter_offset = (state, getters) => {
  let name = 'Filter Offset'
  let val = get_val(getters, 'filter_offset') + " μm" 
  let is_stale = isItemStale(getters, 'focuser_state', 'filter_offset')
  return { name, val, is_stale }
}

const focus_temperature = (state, getters) => {
    let name = 'Focus Temp'
    let val = get_val(getters, 'focus_temperature') + " ℃" 
    let is_stale = isItemStale(getters, 'focuser_state', 'focus_temperature')
    return { name, val, is_stale }
}

const focus_moving = (state, getters) => {
  let name = 'Focus Moving'
  let val = get_val(getters, 'focus_moving')
  if (val != "-") {
    val = parseTrueFalse(val) ? "moving" : "idle"
  }
  let is_stale = isItemStale(getters, 'focuser_state', 'focus_moving')
  return { name, val, is_stale }
}

const focuser_message = (state, getters) => {
  let name = 'Focuser Message'
  let val = get_val(getters, 'message')
  let is_stale = isItemStale(getters, 'focuser_state', 'message')
  return { name, val, is_stale }
}

export default {
  focuser_state,
  focus_position,
  focus_comp,
  focus_filter_offset,
  focus_temperature,
  focus_moving,
  focuser_message,
}