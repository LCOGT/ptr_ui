import { isItemStale, parseTrueFalse } from './status_utils'

function get_val (getters, key) {
  return getters.filter_wheel_state[key]?.val ?? '-'
}

const filter_wheel_state = (state, getters, rootState) => {
  return state.filter_wheel[rootState.site_config.selected_filter_wheel] ?? {}
}

const filter_name = (state, getters) => {
  const name = 'Filter'
  const val = get_val(getters, 'filter_name')
  const is_stale = isItemStale(getters, 'filter_wheel_state', 'filter_name')
  return { name, val, is_stale }
}

const filter_wheel_moving = (state, getters) => {
  const name = 'Filter Moving'
  let val = get_val(getters, 'wheel_is_moving')
  if (val != '-') {
    val = parseTrueFalse(val) ? 'moving' : 'idle'
  }
  const is_stale = isItemStale(getters, 'filter_wheel_state', 'wheel_is_moving')
  return { name, val, is_stale }
}

export default {
  filter_wheel_state,
  filter_wheel_moving,
  filter_name
}
