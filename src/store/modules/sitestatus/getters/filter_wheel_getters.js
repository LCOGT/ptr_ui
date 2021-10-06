import { STALE_AGE_MS, parseTrueFalse } from './status_utils'

function get_val(getters, key) {
  return getters.filter_wheel_state[key]?.val ?? getters.filter_wheel_state[key] ?? '-'
}
function get_timestamp(getters, key) {
  let timestamp_ms = getters.filter_wheel_state[key]?.timestamp ?? 0
  let timestamp_s = timestamp_ms / 1000
  return timestamp_s
}

const filter_wheel_state = (state, getters, rootState) => {
  return state.filter_wheel[rootState.site_config.selected_filter_wheel] ?? {}
}

const filter_name = (state, getters) => {
  let name = 'Filter'
  let val = get_val(getters, 'filter_name')
  let is_stale = (getters.timestamp - get_timestamp(getters, 'filter_name')) > STALE_AGE_MS
  return { name, val, is_stale }
}

const filter_wheel_moving = (state, getters) => {
  let name = 'Filter Moving'
  let val = get_val(getters, 'filter_name')
  if (val != "-") {
    val = parseTrueFalse(val) ? "moving" : "idle"
  }
  let is_stale = (getters.timestamp - get_timestamp(getters, 'filter_name')) > STALE_AGE_MS
  return { name, val, is_stale }
}

export default {
  filter_wheel_state,
  filter_wheel_moving,
  filter_name,
}