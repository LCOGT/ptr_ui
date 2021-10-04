import { parseTrueFalse } from './status_utils'

const filter_wheel_state = (state, getters, rootState) => {
  return state.filter_wheel[rootState.site_config.selected_filter_wheel] ?? {}
}

const filter_name = (state, getters) => {
  return getters.filter_wheel_state.filter_name ?? '-'
}

const filter_wheel_moving = (state, getters) => {
  if (typeof getters.filter_wheel_state.wheel_is_moving === undefined) {
    return '-'
  }
  return parseTrueFalse(getters.filter_wheel_state.wheel_is_moving) 
    ? "moving" 
    : "idle"
}

export default {
  filter_wheel_state,
  filter_wheel_moving,
  filter_name,
}