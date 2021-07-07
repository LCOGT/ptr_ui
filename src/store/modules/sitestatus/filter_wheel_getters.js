import { parseTrueFalse } from './status_utils'

const filter_wheel_state = (state, getters, rootState) => {
  if (Object.keys(state.filter_wheel).includes(rootState.site_config.selected_filter_wheel)) {
    return state.filter_wheel[rootState.site_config.selected_filter_wheel]
  } else {
    return {}
  }
}

const filter_name = (state, getters) => {
  if (getters.filter_wheel_state && 'filter_name' in getters.filter_wheel_state) {
    return (getters.filter_wheel_state.filter_name || '-')
  } else {
    return '-'
  }
}

const filter_wheel_moving = (state, getters) => {
  if (getters.filter_wheel_state && 'wheel_is_moving' in getters.filter_wheel_state) {
    return parseTrueFalse(getters.filter_wheel_state.wheel_is_moving) ? "moving" : "idle"
  } else {
    return '-'
  }
}

export default {
  filter_wheel_state,
  filter_wheel_moving,
  filter_name,
}