import { parseTrueFalse } from './status_utils'

const rotator_state = (state, getters, rootState) => {
  return state.rotator[rootState.site_config.selected_rotator] ?? {}
}

const rotator_position = (state, getters) => {
  return getters.rotator_state.position_angle + "°" ?? '-'
}

const rotator_moving = (state, getters) => {
  if (typeof getters.rotator_state.rotator_moving === undefined) {
    return '-'
  }
  return parseTrueFalse(getters.rotator_state.rotator_moving) 
    ? "moving" 
    : "idle"
}

export default {
  rotator_state, 
  rotator_position, 
  rotator_moving,
}