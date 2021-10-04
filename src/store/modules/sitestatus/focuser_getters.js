import { parseTrueFalse } from './status_utils'

const focuser_state = (state, getters, rootState) => {
    return state.focuser[rootState.site_config.selected_focuser] ?? {}
}

const focus_position = (state, getters) => {
    return getters.focuser_state.focus_position + " μm" ?? '-'
}

const focus_comp = (state, getters) => {
    return String(getters.focuser_state.comp) + " μm" ?? '-'
}

const focus_filter_offset = (state, getters) => {
    return getters.focuser_state.filter_offset + " μm" ?? '-'
}

const focus_temperature = (state, getters) => {
    return getters.focuser_state.focus_temperature + " ℃" ?? '-'
}

const focus_moving = (state, getters) => {
  if (typeof getters.focuser_state.focus_moving === undefined) {
    return '-'
  }
  return parseTrueFalse(getters.focuser_state.focus_moving) 
    ? "moving" 
    : "idle"
}

export default {
  focuser_state,
  focus_position,
  focus_comp,
  focus_filter_offset,
  focus_temperature,
  focus_moving,
}