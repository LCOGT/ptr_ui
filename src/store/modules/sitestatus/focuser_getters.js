import { parseTrueFalse } from './status_utils'

const focuser_state = (state, getters, rootState) => {
  if (Object.keys(state.focuser).includes(rootState.site_config.selected_focuser)) {
    return state.focuser[rootState.site_config.selected_focuser]
  } else {
    return {}
  }
}

const focus_position = (state, getters) => {
    if (getters.focuser_state && 'focus_position' in getters.focuser_state){
        return getters.focuser_state.focus_position + " μm"
    } else {
        return '-'
    }
}

const focus_comp = (state, getters) => {
    if (getters.focuser_state && 'comp' in getters.focuser_state){
        return String(getters.focuser_state.comp) + " μm"
    } else {
        return '-'
    }
}

const focus_filter_offset = (state, getters) => {
    if (getters.focuser_state && 'filter_offset' in getters.focuser_state){
        return getters.focuser_state.filter_offset + " μm"
    } else {
        return '-'
    }
}

const focus_temperature = (state, getters) => {
    if (getters.focuser_state && 'focus_temperature' in getters.focuser_state){
        return getters.focuser_state.focus_temperature + " ℃"
    } else {
        return '-'
    }
}

const focus_moving = (state, getters) => {
    if (getters.focuser_state && 'focus_moving' in getters.focuser_state){
        return parseTrueFalse(getters.focuser_state.focus_moving) ? "moving" : "idle"
    } else {
        return '-'
    }
}

export default {
  focuser_state,
  focus_position,
  focus_comp,
  focus_filter_offset,
  focus_temperature,
  focus_moving,
}