import { isItemStale, parseTrueFalse } from './status_utils'

// Handle status before and after the individual timestamp inclusion
function get_val (getters, key) {
  return getters.rotator_state[key]?.val ?? getters.rotator_state[key] ?? '-'
}

const rotator_state = (state, getters, rootState) => {
  return state.rotator[rootState.site_config.selected_rotator] ?? {}
}

const rotator_position = (state, getters) => {
  const name = 'Position Angle'
  const val = get_val(getters, 'position_angle') + '°'
  const is_stale = isItemStale(getters, 'rotator_state', 'position_angle')
  return { name, val, is_stale }
}

const rotator_moving = (state, getters) => {
  const name = 'Rotator Moving'
  let val = get_val(getters, 'rotator_moving')
  if (val != '-') {
    val = parseTrueFalse(val) ? 'moving' : 'idle'
  }
  const is_stale = isItemStale(getters, 'rotator_state', 'rotator_moving')
  return { name, val, is_stale }
}

export default {
  rotator_state,
  rotator_position,
  rotator_moving
}
