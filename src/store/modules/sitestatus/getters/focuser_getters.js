import { isItemStale, parseTrueFalse } from './status_utils'

function get_val (getters, key) {
  return getters.focuser_state[key]?.val ?? '-'
}

const focuser_state = (state, getters, rootState) => {
  return state.focuser[rootState.site_config.selected_focuser] ?? {}
}

const focus_position = (state, getters) => {
  const name = 'Focus Pos.'
  const val = get_val(getters, 'focus_position') + ' μm'
  const is_stale = isItemStale(getters, 'focuser_state', 'focus_position')
  return { name, val, is_stale }
}

const focus_comp = (state, getters) => {
  const name = 'Focus Comp.'
  const val = get_val(getters, 'comp') + ' μm'
  const is_stale = isItemStale(getters, 'focuser_state', 'comp')
  return { name, val, is_stale }
}

const focus_filter_offset = (state, getters) => {
  const name = 'Filter Offset'
  const val = get_val(getters, 'filter_offset') + ' μm'
  const is_stale = isItemStale(getters, 'focuser_state', 'filter_offset')
  return { name, val, is_stale }
}

const focus_temperature = (state, getters) => {
  const name = 'Focus Temp'
  const val = get_val(getters, 'focus_temperature') + ' ℃'
  const is_stale = isItemStale(getters, 'focuser_state', 'focus_temperature')
  return { name, val, is_stale }
}

const focus_moving = (state, getters) => {
  const name = 'Focus Moving'
  let val = get_val(getters, 'focus_moving')
  if (val != '-') {
    val = parseTrueFalse(val) ? 'moving' : 'idle'
  }
  const is_stale = isItemStale(getters, 'focuser_state', 'focus_moving')
  return { name, val, is_stale }
}

const focuser_message = (state, getters) => {
  const name = 'Focuser Message'
  const val = get_val(getters, 'message')
  const is_stale = isItemStale(getters, 'focuser_state', 'message')
  return { name, val, is_stale }
}

export default {
  focuser_state,
  focus_position,
  focus_comp,
  focus_filter_offset,
  focus_temperature,
  focus_moving,
  focuser_message
}
